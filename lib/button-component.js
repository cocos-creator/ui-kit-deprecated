import cc from 'engine-3d';
import UIElement from './ui-element-component';

const { color4 } = cc.math;

export default class ButtonComponent extends UIElement {
  constructor() {
    super();

    // private
    this._highlighting = false;
    this._pressing = false;
    this._image = null;
    this._widget = null;

    // properties
    this._state = 'none';
    this._transition = 'none';
    this._target = null;

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
  }

  onInit() {
    this._widget = this._entity.getComp('Widget');

    if (this._target) {
      this._image = this._target.getComp('Image');
    }
  }

  get transitionColors() {
    return this._transitionColors;
  }

  get transitionSprites() {
    return this._transitionSprites;
  }

  get target() {
    return this._target;
  }
  set target(val) {
    if (this._target !== val) {
      this._target = val;
      this._image = this._target.getComp('Image');
    }
  }

  /**
   * 'none', 'color', 'sprite'
   */
  get transition() {
    return this._transition;
  }
  set transition(val) {
    if (this._transition !== val) {
      this._transition = val;
    }
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

    if (this._image === null) {
      return;
    }

    if (this._transition === 'none') {
      return;
    }

    this._state = state;

    if (this._transition === 'color') {
      this._image.color = this._transitionColors[state];
    } else if (this._transition === 'sprite') {
      this._image.sprite = this._transitionSprites[state];
    } else {
      // todo: not implemented
      console.warn('Button transition animation is not implemented');
    }
  }

  _onMouseEnter(e) {
    if (this._enabled === false) {
      return;
    }

    let widgetSys = this._widget.system;
    e.stop();
    this._highlighting = true;

    if (
      widgetSys.focusedEntity === this._entity &&
      e.buttons & 1 !== 0
    ) {
      this._pressing = true;
    }

    this._updateState();
  }

  _onMouseLeave(e) {
    if (this._enabled === false) {
      return;
    }

    let widgetSys = this._widget.system;
    e.stop();

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
  }

  _onMouseDown(e) {
    if (this._enabled === false) {
      return;
    }

    if (e.button === 'left') {
      e.stop();

      this._pressing = true;
      this._updateState();
    }
  }

  _onMouseUp(e) {
    if (this._enabled === false) {
      return;
    }

    let widgetSys = this._widget.system;
    if (e.button === 'left') {
      e.stop();

      if (widgetSys.focusedEntity !== this._entity) {
        return;
      }

      this._pressing = false;
      this._updateState();

      this._entity.emit('clicked');
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

    this._highlighting = false;
    this._updateState();
  }
}

ButtonComponent.events = {
  'mouseenter': '_onMouseEnter',
  'mouseleave': '_onMouseLeave',
  'mousedown': '_onMouseDown',
  'mouseup': '_onMouseUp',
  'focus': '_onFocus',
  'blur': '_onBlur',
};