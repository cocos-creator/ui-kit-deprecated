import cc from 'engine-3d';
import UIElement from './ui-element-component';

const { vec3, quat,color4 } = cc.math;

export default class ScrollBarComponent extends UIElement {
  constructor() {
    super();
    // properties
    this._state = 'none';
    this._transition = 'none';
    this._background = null;

    this._transitionColors = {
      normal: color4.create(),
      highlight: color4.create(),
      pressed: color4.create(),
      disabled: color4.create(),
    };
    this._transitionSprites = {
      normal: null,
      highlight: null,
      pressed: null,
      disabled: null,
    };

    this._handle = null;
    this._direction = 'horizontal';
    this._reverse = false;
    this._value = 0.0;// [0,1]
    this._size = 0.0;// [0,1]

    // private
    this._highlighting = false;
    this._pressing = false;
    this._widget = null;
    this._bgImage = null;

    this._handleContainer = null;
    this._handleWidget = null;
    this._containerWidget = null;
    this._dragging = false;
    this._normalizeValue = 0.0;
    this._startPos = vec3.create();
    this._offset = vec3.create();
    this._dirOffset = vec3.create();
    this._fingerId = -1;

    this._onMouseEnter = (e) => {
      if (this._enabled === false) {
        return;
      }

      let widgetSys = this._widget.system;
      this._highlighting = true;

      if (
        widgetSys.focusedEntity === this._entity &&
        e.buttons & 1 !== 0
      ) {
        this._pressing = true;
      }

      this._updateState();
    };

    this._onMouseLeave = (e) => {
      if (this._enabled === false) {
        return;
      }

      let widgetSys = this._widget.system;

      this._pressing = false;
      if (
        widgetSys.focusedEntity &&
        widgetSys.focusedEntity === this._entity
      ) {
        this._highlighting = true;
      } else {
        this._highlighting = false;
      }

      this._updateState();
    };

    this._onHandleDown = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (e.button === 'left') {
        this._onMouseDown(e);
        this._startPos = vec3.new(e.mouseX, e.mouseY, 0);
        this._dragging = true;
        this._offset = vec3.create();
      }
    };

    this._onContainerDown = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (e.button === 'left') {
        if (!this._dragging) {
          this._onMouseDown(e);
          this._clkBar(vec3.new(e.mouseX, e.mouseY, 0));
        }
      }
    };

    this._onMouseMove = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (e.button === 0) {
        e.stop();
        if (this._dragging) {
          this._updateValue(vec3.new(e.mouseX, e.mouseY, 0));
        }
      }
    };

    this._onMouseUp = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (e.button === 'left') {
        e.stop();

        this._dragging = false;
        this._pressing = false;
        this._updateState();
      }
    };

    // touch events
    this._onHandleTouchStart = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (this._fingerId !== -1) {
        return;
      }

      this._onTouchStart(e);
      this._startPos = vec3.new(e.x, e.y, 0);
      this._dragging = true;
      this._offset = vec3.create();
    };

    this._onContainerTouchStart = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (this._fingerId !== -1) {
        return;
      }

      this._onTouchStart(e);
      this._clkBar(vec3.new(e.x, e.y, 0));
    };

    this._onTouchMove = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();
      if (e.id === this._fingerId) {
        if (this._dragging) {
          this._updateValue(vec3.new(e.x, e.y, 0));
        }
      }
    };

    this._onTouchEnd = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();
      if (e.id !== this._fingerId) {
        return;
      }

      this._dragging = false;
      this._fingerId = -1;
      this._pressing = false;
      this._updateState();
    };
  }

  onInit() {
    this._widget = this._entity.getComp('Widget');
    this._widget.focusable = true;
    if (this._background) {
      this._bgImage = this._background.getComp('Image');
    } else {
      this._bgImage = this._entity.getComp('Image');
    }

    let dragArea = this._widget.system._screens[0]._entity;
    dragArea.on('mousemove', this._onMouseMove);
    dragArea.on('mouseup', this._onMouseUp);
    dragArea.on('touchmove', this._onTouchMove);
    dragArea.on('touchend', this._onTouchEnd);
  }

  onDestroy() {
    this._widget.focusable = false;
  }

  _updateState() {
    let state = 'normal';

    if (this._pressing) {
      state = 'pressed';
    } else if (this._highlighting) {
      state = 'highlight';
    }

    if (this._state === state) {
      return;
    }

    let oldState = this._state;
    this._state = state;

    this.dispatch('transition', {
      detail: {
        oldState,
        newState: this._state
      }
    });

    if (this._bgImage === null) {
      return;
    }

    if (this._transition === 'none') {
      return;
    }

    if (this._transition === 'color') {
      this._bgImage.color = this._transitionColors[state];
    } else if (this._transition === 'sprite') {
      this._bgImage.sprite = this._transitionSprites[state];
    } else {
      // todo: not implemented
      console.warn('Button transition animation is not implemented');
    }
  }

  _registerHandleEvent() {
    this._handle.on('mousedown', this._onHandleDown);
    this._handle.on('mousemove', this._onMouseMove);
    this._handle.on('mouseup', this._onMouseUp);
    this._handle.on('mouseenter', this._onMouseEnter);
    this._handle.on('mouseleave', this._onMouseLeave);

    this._handle.on('touchstart', this._onHandleTouchStart);
    this._handle.on('touchmove', this._onTouchMove);
    this._handle.on('touchend', this._onTouchEnd);
  }

  _unregisterHandleEvent() {
    this._handle.off('mousedown', this._onHandleDown);
    this._handle.off('mousemove', this._onMouseMove);
    this._handle.off('mouseup', this._onMouseUp);
    this._handle.off('mouseenter', this._onMouseEnter);
    this._handle.off('mouseleave', this._onMouseLeave);

    this._handle.off('touchstart', this._onHandleTouchStart);
    this._handle.off('touchmove', this._onTouchMove);
    this._handle.off('touchend', this._onTouchEnd);
  }

  _registerHandleContainerEvent() {
    this._handleContainer.on('mousedown', this._onContainerDown);
    this._handleContainer.on('mousemove', this._onMouseMove);
    this._handleContainer.on('mouseup', this._onMouseMove);
    this._handleContainer.on('mouseenter', this._onMouseEnter);
    this._handleContainer.on('mouseleave', this._onMouseLeave);

    this._handleContainer.on('touchstart', this._onContainerTouchStart);
    this._handleContainer.on('touchmove', this._onTouchMove);
    this._handleContainer.on('touchend', this._onTouchEnd);
  }

  _unregisterHandleContainerEvent() {
    this._handleContainer.off('mousedown', this._onContainerDown);
    this._handleContainer.off('mousemove', this._onMouseMove);
    this._handleContainer.off('mouseup', this._onMouseMove);
    this._handleContainer.off('mouseenter', this._onMouseEnter);
    this._handleContainer.off('mouseleave', this._onMouseLeave);

    this._handleContainer.off('touchstart', this._onContainerTouchStart);
    this._handleContainer.off('touchmove', this._onTouchMove);
    this._handleContainer.off('touchend', this._onTouchEnd);
  }

  _updateWidget() {
    this._handleWidget = this._handle.getComp('Widget');
    this._containerWidget = this._handleContainer.getComp('Widget');
  }

  _updateValue(movePos) {
    if (!this._handle || this._size <= 0.0001) {
      return;
    }

    let ratio = this._getRatio();
    let tempOffset = vec3.create();
    vec3.copy(tempOffset, this._offset);
    let rect = this._containerWidget._rect;
    let mouse = vec3.new(movePos.x, movePos.y, 0);
    vec3.subtract(this._offset, mouse, this._startPos);
    vec3.subtract(tempOffset, this._offset, tempOffset);
    this._dirOffset = vec3.new(rect.w * ratio.x, rect.h * ratio.y, 0);
    let value = 0.0;
    value = vec3.dot(this._dirOffset, tempOffset);
    value = vec3.dot(this._dirOffset, tempOffset) / Math.sqrt(Math.pow(this._dirOffset.x, 2) + Math.pow(this._dirOffset.y, 2));
    value = this._direction === 'horizontal' ? value / rect.w : value / rect.h;
    if (this._direction === 'horizontal') {
      if (value > 0) {
        if (this._handleWidget.anchorRight + value > 1) {
          value = 1 - this._handleWidget.anchorRight;
        }
      } else {
        if (this._handleWidget.anchorLeft + value < 0) {
          value = -this._handleWidget.anchorLeft;
        }
      }

      this._normalizeValue = (this._handleWidget.anchorLeft + value) / (1 - this._size);
    } else {
      if (value > 0) {
        if (this._handleWidget.anchorTop + value > 1) {
          value = 1 - this._handleWidget.anchorTop;
        }
      } else {
        if (this._handleWidget.anchorBottom + value < 0) {
          value = -this._handleWidget.anchorBottom;
        }
      }

      this._normalizeValue = (this._handleWidget.anchorBottom + value) / (1 - this._size);
    }

    this.value = this._reverse ? 1 - this._normalizeValue : this._normalizeValue;
  }

  _clkBar(movePos) {
    if (!this._handle) {
      return;
    }

    let wpos = vec3.create();
    this._handle.getWorldPos(wpos);
    let mouse = vec3.new(movePos.x, movePos.y, 0);
    let offset = vec3.create();
    vec3.subtract(offset, mouse, wpos);

    let value = 0.0;
    if (this._direction === 'horizontal') {
      let left = this._handleWidget.anchorLeft;
      if (offset.x > 0) {
        value = left + this._size + this._size > 1 ? 1 - left - this._size : this._size;
      } else {
        value = -(left - this._size < 0 ? left : this._size);
      }

      this._normalizeValue = (this._handleWidget.anchorLeft + value) / (1 - this._size);
    } else {
      let bottom = this._handleWidget.anchorBottom;
      if (offset.y > 0) {
        value = bottom + this._size + this._size > 1 ? 1 - bottom - this._size : this._size;
      } else {
        value = -(bottom - this._size < 0 ? bottom : this._size);
      }

      this._normalizeValue = (this._handleWidget.anchorBottom + value) / (1 - this._size);
    }

    this.value = this._reverse ? 1 - this._normalizeValue : this._normalizeValue;
  }

  _getRatio() {
    let wrot = quat.create();
    this._handleContainer.getWorldRot(wrot);
    let ratio = { x: 0, y: 0 };
    let v = this._direction === 'horizontal' ? vec3.new(0, 1, 0) : vec3.new(-1, 0, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.x = v.x;
    v = this._direction === 'horizontal' ? vec3.new(1, 0, 0) : vec3.new(0, 1, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.y = v.y;
    return vec3.new(v.x, v.y, 0);
  }

  _updateHandle() {
    let min = { 0: 0, 1: 0 };
    let max = { 0: 1, 1: 1 };
    let num = this._normalizeValue * (1 - this._size);
    num = Math.round(parseFloat(num) * 100) / 100;
    let dirValue = this._direction === 'horizontal' ? 0 : 1;
    min[dirValue] = num;
    max[dirValue] = num + this._size;

    this._handleWidget.setAnchors(min[0], min[1], max[0], max[1]);
  }

  _onMouseDown(e) {
    if (this._enabled === false) {
      return;
    }

    let widgetSys = this._widget.system;
    if (e.button === 'left') {
      e.stop();

      if (widgetSys.focusedEntity !== this._entity) {
        return;
      }

      this._pressing = true;
      this._updateState();
    }
  }

  _onFocus() {
    if (this._enabled === false) {
      return;
    }

    this._highlighting = true;
    this._updateState();
  }

  _onBlur() {
    if (this._enabled === false) {
      return;
    }

    this._fingerId = -1;
    this._highlighting = false;
    this._updateState();
  }

  _onTouchEnter(e) {
    if (this._enabled === false) {
      return;
    }

    if (this._fingerId !== -1 && this._fingerId === e.id) {
      e.stop();
      this._pressing = true;
      this._updateState();
    }
  }

  _onTouchLeave(e) {
    if (this._enabled === false) {
      return;
    }

    if (this._fingerId !== -1 && this._fingerId === e.id) {
      e.stop();
      this._pressing = false;
      this._updateState();
    }
  }

  _onTouchStart(e) {
    if (this._enabled === false) {
      return;
    }

    e.stop();
    if (this._fingerId !== -1) {
      return;
    }

    this._fingerId = e.id;
    this._pressing = true;
    this._updateState();
  }
}

ScrollBarComponent.events = {
  'mouseenter': '_onMouseEnter',
  'mouseleave': '_onMouseLeave',
  'mousedown': '_onMouseDown',
  'mouseup': '_onMouseUp',
  'focus': '_onFocus',
  'blur': '_onBlur',
  'touchenter': '_onTouchEnter',
  'touchleave': '_onTouchLeave',
  'touchstart': '_onTouchStart',
  'touchend': '_onTouchEnd'
};

ScrollBarComponent.schema = {
  handle: {
    type: 'object',
    default: null,
    set(val) {
      if (this._handle === val) {
        return;
      }

      if (this._handle) {
        this._unregisterHandleEvent();
      }

      if (this._handleContainer) {
        this._unregisterHandleContainerEvent();
      }

      this._handle = val;
      this._handleContainer = this._handle.parent;
      this._registerHandleEvent();
      this._registerHandleContainerEvent();
      this._updateWidget();
    }
  },

  direction: {
    type: 'enums',
    default: 'horizontal',
    options: ['horizontal', 'vertical'],
    set(val) {
      if (val === this._direction) {
        return;
      }

      this._direction = val;
    }
  },

  size: {
    type: 'number',
    default: 0.0,
    set(val) {
      if (this._size === val) {
        return;
      }

      this._size = cc.math.clamp01(val);
      this._updateHandle();
    },
    get() {
      this._size = Math.round(parseFloat(this._size) * 100) / 100;
      return this._size;
    }
  },

  value: {
    type: 'number',
    default: 0.0,
    set(val) {
      if (this._value === val) {
        return;
      }

      this._value = cc.math.clamp01(val);
      this._normalizeValue = this._reverse ? 1 - this._value : this._value;
      this._updateHandle();
      this.dispatch('valueChanged');
    },
    get() {
      this._value = Math.round(parseFloat(this._value) * 100) / 100;
      return this._value;
    }
  },

  reverse: {
    type: 'boolean',
    default: false,
    set(val) {
      if (this._reverse === val) {
        return;
      }

      this._reverse = val;
      this.value = 0;
    }
  },

  transitionColors: {
    type: 'object',
    default: {
      normal: color4.create(),
      highlight: color4.create(),
      pressed: color4.create(),
      disabled: color4.create(),
    }
  },

  transitionSprites: {
    type: 'object',
    default: {
      normal: null,
      highlight: null,
      pressed: null,
      disabled: null
    }
  },

  background: {
    type: 'object',
    default: null,
    set(val) {
      if (this._background !== val) {
        this._background = val;
        this._bgImage = this._background.getComp('Image');
      }
    }
  },

  transition: {
    type: 'enums',
    default: 'none',
    options: ['none', 'color', 'sprite']
  }
}