import cc from 'engine-3d';
import UIElement from './ui-element-component';

const { vec3, quat,color4 } = cc.math;

export default class ScrollBarComponent extends UIElement {
  constructor() {
    super();
    this._state = 'none';
    this._highlighting = false;
    this._pressing = false;
    this._widget = null;
    this._bgImage = null;

    this._handleWidget = null;
    this._calculateWidget = null;
    this._dragging = false;
    this._normalizeValue = 0.0;
    this._startPos = vec3.create();
    this._offsetValue = 0.0;
    this._fingerId = -1;
    this._ratio = 0.0;
    this._calRectPos = vec3.create();

    this._onMouseEnter = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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

    this._onMouseDown = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
        this._startPos = vec3.new(e.mouseX, e.mouseY, 0);
        this._offsetValue = 0.0;
        if (e.target !== this._handle) {
          if (!this._dragging) {
            this._clkBar(this._startPos);
          }
        }

        this._dragging = true;
      }
    }

    this._onMouseMove = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
    this._onTouchStart = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
        return;
      }

      e.stop();
      if (this._fingerId !== -1) {
        return;
      }

      this._fingerId = e.id;
      this._pressing = true;
      this._updateState();
      this._startPos = vec3.new(e.x, e.y, 0);
      this._offsetValue = 0.0;
      if (e.target !== this._handle) {
        if (!this._dragging) {
          this._clkBar(vec3.new(e.x, e.y, 0));
        }
      }

      this._dragging = true;
    }

    this._onTouchMove = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
    this._entity.once('ready', () => {
      this._widget = this._entity.getComp('Widget');
      this._widget.focusable = true;
      if (this._background) {
        this._bgImage = this._background.getComp('Image');
      } else {
        this._bgImage = this._entity.getComp('Image');
      }

      this._calculateWidget = this._handle.parent.getComp('Widget');
      this._ratio = this._getRatio();
      this._normalizeValue = this._reverse ? 1 - this._value : this._value;
      this._updateHandle();

      let dragArea = this._widget.system._screens[0]._entity;
      dragArea.on('mousemove', this._onMouseMove);
      dragArea.on('mouseup', this._onMouseUp);
      dragArea.on('touchmove', this._onTouchMove);
      dragArea.on('touchend', this._onTouchEnd);
    });
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

  _updateValue(movePos) {
    if (!this._handle) {
      return;
    }

    let offset = vec3.create();
    let deltaValue = 0.0;
    let value = 0.0;
    let dirOffset = vec3.create();;
    let mouse = vec3.new(movePos.x, movePos.y, 0);
    this._calRectPos = this._getWposRect();
    let anchorStart = this._direction === 'horizontal' ? this._handleWidget.anchorLeft : this._handleWidget.anchorBottom;
    let rect = this._calculateWidget._rect;
    dirOffset = vec3.new(rect.w * this._ratio.x, rect.h * this._ratio.y, 0);
    vec3.subtract(offset, mouse, this._startPos);
    value = vec3.dot(dirOffset, offset) / Math.sqrt(Math.pow(dirOffset.x, 2) + Math.pow(dirOffset.y, 2));
    value = this._direction === 'horizontal' ? value / rect.w : value / rect.h;
    deltaValue = value - this._offsetValue;
    this._offsetValue = value;
    if (deltaValue > 0) {
      if (anchorStart + deltaValue + this._size > 1) {
        deltaValue = 1 - this._size - anchorStart;
      }
    } else {
      if (anchorStart - deltaValue < 0) {
        deltaValue = -anchorStart;
      }
    }

    this._normalizeValue = (anchorStart + deltaValue) / (1 - this._size);
    this.value = this._reverse ? 1 - this._normalizeValue : this._normalizeValue;
  }

  _clkBar(movePos) {
    if (!this._handle) {
      return;
    }

    let value = 0.0;
    let sqrt = 0.0;
    let a = vec3.create();
    let length = this._direction === 'horizontal' ? this._calculateWidget._rect.w : this._calculateWidget._rect.h;
    this._calRectPos = this._getWposRect();
    vec3.subtract(a, vec3.new(movePos.x, movePos.y, 0), this._calRectPos);
    value = vec3.dot(vec3.new(length * this._ratio.x, length * this._ratio.y, 0), a);
    sqrt = Math.sqrt(Math.pow(length * this._ratio.x, 2) + Math.pow(length * this._ratio.y, 2));
    this._normalizeValue = cc.math.clamp01(((value / sqrt) / length), 0, 1);
    this.value = this._reverse ? 1 - this._normalizeValue : this._normalizeValue;
  }

  _getRatio() {
    // TODO: support screen point is converted to the difference between the specified rect later
    let wrot = quat.create();
    this._calculateWidget.entity.getWorldRot(wrot);
    let ratio = { x: 0, y: 0 };
    let v = this._direction === 'horizontal' ? vec3.new(0, 1, 0) : vec3.new(-1, 0, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.x = v.x;
    v = this._direction === 'horizontal' ? vec3.new(1, 0, 0) : vec3.new(0, 1, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.y = v.y;
    return vec3.new(v.x, v.y, 0);
  }

  _getWposRect() {
    //NOTE: maybe there will be a local point where the local point is converted to another point.
    let wpos = vec3.create();
    this._calculateWidget.entity.getWorldPos(wpos);
    let rect = this._calculateWidget._rect;
    let realX = 0.0, realY = 0.0;
    // get world rect pos
    if (this._direction === 'horizontal') {
      realX = wpos.x - (rect.w * this._calculateWidget.pivotX * this._ratio.x) + (rect.h * this._calculateWidget.pivotY * this._ratio.y);
      realY = wpos.y - (rect.w * this._calculateWidget.pivotX * this._ratio.y) - (rect.h * this._calculateWidget.pivotY * this._ratio.x);
    } else {
      realX = wpos.x + (rect.h * this._calculateWidget.pivotY * -this._ratio.x) - (rect.w * this._calculateWidget.pivotX * this._ratio.y);
      realY = wpos.y - (rect.h * this._calculateWidget.pivotY * this._ratio.y) - (rect.w * this._calculateWidget.pivotX * -this._ratio.x);
    }

    return vec3.new(realX, realY, 0);
  }

  _updateHandle() {
    if (!this._handleWidget) {
      this._handleWidget = this._handle.getComp('Widget');
    } else {
      if (this._handleWidget._entity !== this._handle) {
        this._handleWidget = this._handle.getComp('Widget');
      }
    }

    let min = { 0: 0, 1: 0 };
    let max = { 0: 1, 1: 1 };
    let num = this._normalizeValue * (1 - this._size);
    num = Math.round(parseFloat(num) * 100) / 100;
    let dirValue = this._direction === 'horizontal' ? 0 : 1;
    min[dirValue] = num;
    max[dirValue] = num + this._size;

    this._handleWidget.setAnchors(min[0], min[1], max[0], max[1]);
  }

  _onFocus() {
    if (this._enabled === false || this._entity.enabledInHierarchy === false) {
      return;
    }

    this._highlighting = true;
    this._updateState();
  }

  _onBlur() {
    if (this._enabled === false || this._entity.enabledInHierarchy === false) {
      return;
    }

    this._fingerId = -1;
    this._highlighting = false;
    this._updateState();
  }

  _onTouchEnter(e) {
    if (this._enabled === false || this._entity.enabledInHierarchy === false) {
      return;
    }

    if (this._fingerId !== -1 && this._fingerId === e.id) {
      e.stop();
      this._pressing = true;
      this._updateState();
    }
  }

  _onTouchLeave(e) {
    if (this._enabled === false || this._entity.enabledInHierarchy === false) {
      return;
    }

    if (this._fingerId !== -1 && this._fingerId === e.id) {
      e.stop();
      this._pressing = false;
      this._updateState();
    }
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

  handle: {
    type: 'object',
    default: null,
    parse(app, value, propInfo, entities) {
      if (entities) {
        if (propInfo.type === 'object' && value) {
          let entIdx = value.indexOf('e');
          if (entIdx !== -1) {
            value = value.split('e').join('');
          }

          entIdx = parseInt(value);
          return entities[entIdx];
        }
      }

      return value;
    },
    set(val) {
      if (this._handle === val) {
        return;
      }

      this._handle = val;
      this._calculateWidget = this._handle.parent.getComp('Widget');
      this._ratio = this._getRatio();
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
    parse(app, value, propInfo, entities) {
      if (entities) {
        if (propInfo.type === 'object' && value) {
          let entIdx = value.indexOf('e');
          if (entIdx !== -1) {
            value = value.split('e').join('');
          }

          entIdx = parseInt(value);
          return entities[entIdx];
        }
      }

      return value;
    },
    set(val) {
      if (this._background === val) {
        return;
      }

      this._background = val;
      if (this._background) {
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