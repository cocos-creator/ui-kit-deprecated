import cc from 'engine-3d';
import UIElement from './ui-element-component';
const { vec2, vec3, mat4, quat, color4 } = cc.math;

export default class SliderComponent extends UIElement {
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

    this._direction = 'horizontal';
    this._progress = 0.0;
    this._calMinValue = 0.0;
    this._calMaxValue = 1.0;
    this._minValue = 0.0;
    this._maxValue = 0.0;
    this._handle = null;
    this._handleContainer = null;
    this._fill = null;
    this._fillContainer = null;
    this._sliderBg = null;

    // private
    this._highlighting = false;
    this._pressing = false;
    this._widget = null;
    this._bgImage = null;

    this._handleContainerWidget = null;
    this._handleWidget = null;
    this._fillContainerWidget = null;
    this._fillWidget = null;
    this._dragging = false;
    this._lastAxis = 'horizontal';
    this._startMousePos = vec3.create();
    this._normalizedValue = 0.0;// range[0,1]
    this._reverse = false;
    this._fingerId = -1;

    // mouse events
    this._onHandleMouseDown = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (e.button === 'left') {
        this._onMouseDown(e);
        this._updateDrag(vec3.new(e.mouseX, e.mouseY, 0));
        this._startMousePos = vec3.new(e.mouseX, e.mouseY, 0);
        this._dragging = true;
      }
    };

    this._onContainerMouseDown = (e) => {
      if (e.button === 'left') {
        this._onMouseDown(e);
        this._updateDrag(vec3.new(e.mouseX, e.mouseY, 0));
        this._dragging = true;
      }
    };

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

    this._onMouseMove = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (e.button === 0) {
        e.stop();

        if (this._dragging) {
          this._updateDrag(vec3.new(e.mouseX, e.mouseY, 0));
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
      this._updateDrag(vec3.new(e.x, e.y, 0));
      this._startMousePos = vec3.new(e.x, e.y, 0);
      this._dragging = true;
    };

    this._onContainerTouchStart = (e) => {
      if (this._enabled === false) {
        return;
      }

      if (this._fingerId !== -1) {
        return;
      }

      this._onTouchStart(e);
      this._updateDrag(vec3.new(e.x, e.y, 0));
      this._dragging = true;
    };

    this._onTouchMove = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();
      if (e.id === this._fingerId) {
        if (this._dragging) {
          this._updateDrag(vec3.new(e.x, e.y, 0));
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
    this._entity.once('ready', () => {
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

  _registerHandleEvent() {
    this._handle.on('mousedown', this._onHandleMouseDown);
    this._handle.on('mousemove', this._onMouseMove);
    this._handle.on('mouseup', this._onMouseUp);
    this._handle.on('mouseenter', this._onMouseEnter);
    this._handle.on('mouseleave', this._onMouseLeave);

    this._handle.on('touchstart', this._onHandleTouchStart);
    this._handle.on('touchmove', this._onTouchMove);
    this._handle.on('touchend', this._onTouchEnd);
  }

  _unregisterHandleEvent() {
    this._handle.off('mousedown', this._onHandleMouseDown);
    this._handle.off('mousemove', this._onMouseMove);
    this._handle.off('mouseup', this._onMouseUp);
    this._handle.off('mouseenter', this._onMouseEnter);
    this._handle.off('mouseleave', this._onMouseLeave);

    this._handle.off('touchstart', this._onHandleTouchStart);
    this._handle.off('touchmove', this._onTouchMove);
    this._handle.offon('touchend', this._onTouchEnd);
  }

  _registerHandleContainerEvent() {
    this._handleContainer.on('mousedown', this._onContainerMouseDown);
    this._handleContainer.on('mouseup', this._onMouseUp);
    this._handleContainer.on('mouseenter', this._onMouseEnter);
    this._handleContainer.on('mouseleave', this._onMouseLeave);

    this._handleContainer.on('touchstart', this._onContainerTouchStart);
    this._handleContainer.on('touchend', this._onTouchEnd);
  }

  _unregisterHandleContainerEvent() {
    this._handleContainer.off('mousedown', this._onContainerMouseDown);
    this._handleContainer.off('mouseup', this._onMouseUp);
    this._handleContainer.off('mouseenter', this._onMouseEnter);
    this._handleContainer.off('mouseleave', this._onMouseLeave);

    this._handleContainer.off('touchstart', this._onContainerTouchStart);
    this._handleContainer.off('touchend', this._onTouchEnd);
  }

  _set(value) {
    let num = cc.math.clamp(value, this._calMinValue, this._calMaxValue);
    if (this._progress != num) {
      this._progress = num;
      this.dispatch('valueChanged');
    }
  }

  _getReverseValue() {
    return this._maxValue < this._minValue;
  }

  _getSize() {
    return this._calMaxValue - this._calMinValue;
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

  _getRectPos(ratio) {
    let wpos = vec3.create();
    this._handleContainer.getWorldPos(wpos);
    let rect = this._handleContainerWidget._rect;
    let realX = 0.0, realY = 0.0;
    if (this._direction === 'horizontal') {
      realX = wpos.x - (rect.w * this._handleContainerWidget.pivotX * ratio.x) + (rect.h * this._handleContainerWidget.pivotY * ratio.y);
      realY = wpos.y - (rect.w * this._handleContainerWidget.pivotX * ratio.y) - (rect.h * this._handleContainerWidget.pivotY * ratio.x);
    } else {
      realX = wpos.x + (rect.h * this._handleContainerWidget.pivotY * -ratio.x) - (rect.w * this._handleContainerWidget.pivotX * ratio.y);
      realY = wpos.y - (rect.h * this._handleContainerWidget.pivotY * ratio.y) - (rect.w * this._handleContainerWidget.pivotX * -ratio.x);
    }

    return vec3.new(realX, realY, 0);
  }

  _updateDrag(mousePos) {
    if (!this._handle) {
      return;
    }

    this._updateWidget();
    let value = 0.0;
    let wpos = vec3.create();
    let rect = this._handleContainerWidget._rect;
    let offsetMouse = vec3.create();
    let offsetSlider = vec3.create();

    let ratio = this._getRatio();
    let target = vec3.new(mousePos.x, mousePos.y, 0);
    // NOTE:Maybe will change to lpos,require support of rotation transformation
    this._handleContainer.getWorldPos(wpos);
    let min = this._getRectPos(ratio);
    let sqrt = 0.0;
    if (this._direction === 'horizontal') {
      vec3.subtract(offsetMouse, target, min);
      offsetSlider = vec3.new(rect.w * ratio.x, rect.w * ratio.y, 0);
      value = vec3.dot(offsetSlider, vec3.new(offsetMouse.x, offsetMouse.y, 0));
      sqrt = Math.sqrt(Math.pow(rect.w * ratio.x, 2) + Math.pow(rect.w * ratio.y, 2));
      value = ((value / sqrt) / rect.w).toFixed(2);
    } else {
      vec3.subtract(offsetMouse, target, min);
      offsetSlider = vec3.new(rect.h * ratio.x, rect.h * ratio.y, 0);
      value = vec3.dot(offsetSlider, vec3.new(offsetMouse.x, offsetMouse.y, 0));
      sqrt = Math.sqrt(Math.pow(rect.h * ratio.y, 2) + Math.pow(rect.h * ratio.x, 2));
      value = ((value / sqrt) / rect.h).toFixed(2);
    }

    this._normalizedValue = value = cc.math.clamp(value, 0, 1);
    value = !this._getReverseValue() ? value * this._getSize() : (1 - value) * this._getSize();
    value += this._calMinValue;
    this._updateVisuals();
    this._set(value, true);
  }

  _updateWidget() {
    if (this._handle) {
      this._handleContainerWidget = this._handleContainer.getComp('Widget');
      this._handleWidget = this._handle.getComp('Widget');
    }

    if (this._fill) {
      this._fillContainerWidget = this._fillContainer.getComp('Widget');
      this._fillWidget = this._fill.getComp('Widget');
    }
  }

  _updateVisuals() {
    if (!this._fill || !this._handle) {
      return;
    }

    let min = [0, 0];
    let max = [1, 1];
    let dirValue = this._direction === 'horizontal' ? 0 : 1;
    min[dirValue] = this._normalizedValue;
    max[dirValue] = this._normalizedValue;
    this._handleWidget.setAnchors(min[0], min[1], max[0], max[1]);

    min = [0, 0];
    max = [1, 1];
    let sprite = this._fill.getComp('Image');
    // NOTE:need to verify
    if (sprite.type === 'filled') {
      sprite.filledStart = this._normalizedValue;
    } else if (this._reverse) {
      min[dirValue] = this._normalizedValue;
    } else {
      max[dirValue] = this._normalizedValue;
    }

    this._fillWidget.setAnchors(min[0], min[1], max[0], max[1]);
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

SliderComponent.events = {
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

SliderComponent.schema = {
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
      this._updateVisuals();
    }
  },

  fill: {
    type: 'object',
    default: null,
    set(val) {
      if (this._fill === val) {
        return;
      }

      this._fill = val;
      this._fillContainer = this._fill.parent;
      this._updateWidget();
      this._updateVisuals();
    }
  },

  direction: {
    type: 'enums',
    default: 'horizontal',
    options: ['horizontal', 'vertical'],
    set(val) {
      if (this._direction === val) {
        return;
      }

      this._direction = val;
      this._lastAxis = this._direction;
    }
  },

  progress: {
    type: 'number',
    default: 0.0,
    set(val) {
      this._set(val, false);
    }
  },

  minValue: {
    type: 'number',
    default: 0.0,
    set(val) {
      if (this._minValue === val) {
        return;
      }

      this._minValue = val;
      this._calMinValue = val;
      if (this._minValue > this._maxValue) {
        this._calMinValue = this._maxValue;
        this._calMaxValue = this._minValue;
      }
    }
  },

  maxValue: {
    type: 'number',
    default: 1.0,
    set(val) {
      if (this._maxValue === val) {
        return;
      }

      this._maxValue = val;
      this._calMaxValue = val;
      if (this._minValue > this._maxValue) {
        this._calMinValue = this._maxValue;
        this._calMaxValue = this._minValue;
      }
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
    options: ['none', 'color', 'sprite'],
  }
}