import cc from 'engine-3d';
import UIElement from './ui-element-component';

const { color4 } = cc.math;

export default class ButtonComponent extends UIElement {
  constructor() {
    super();

    // private
    this._highlighting = false;
    this._pressing = false;
    this._widget = null;
    this._bgImage = null;

    // properties
    this._state = 'none';
    this._transition = 'none';
    this._background = null;
    this._screen = null;
    this._touchFingerId = -1;

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

    this._onTouchScreenMove = function (e) {
      if (this._entity._enabled === false) {
        return;
      }

      e.stop();
      if (this._pressing === false) {
        return;
      }

      if (e.id !== this._touchFingerId) {
        return;
      }

      this._pressing = false;
      this._updateState();
    }.bind(this);

    this._onTouchScreenEnd = function (e) {
      if (this._entity._enabled === false) {
        return;
      }

      e.stop();
      if (this._touchFingerId === e.id) {
        this._touchFingerId = -1;
      }
    }.bind(this);
  }

  onInit() {
    this._widget = this._entity.getComp('Widget');
    this._widget.focusable = true;

    if (this._background) {
      this._bgImage = this._background.getComp('Image');
    } else {
      this._bgImage = this._entity.getComp('Image');
    }
  }

  onEnable(){
    this._screen.on('touchmove', this._onTouchScreenMove);
    this._screen.on('touchend', this._onTouchScreenEnd);
  }

  onDisable(){
    this._screen.off('touchmove', this._onTouchScreenMove);
    this._screen.off('touchend', this._onTouchScreenEnd);
  }

  onDestroy() {
    this._widget.focusable = false;
  }

  set screen(val){
    this._screen=val;
  }

  get transitionColors() {
    return this._transitionColors;
  }

  get transitionSprites() {
    return this._transitionSprites;
  }

  get background() {
    return this._background;
  }
  set background(val) {
    if (this._background !== val) {
      this._background = val;
      this._bgImage = this._background.getComp('Image');
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

  _onMouseEnter(e) {
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
  }

  _onMouseLeave() {
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

      this.dispatch('clicked');
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

  _onTouchStart(e) {
    if (this._enabled === false) {
      return;
    }

    e.stop();

    if (this._touchFingerId !== -1) {
      return;
    }

    this._touchFingerId = e.id;
    this._pressing = true;
    this._updateState();
  }

  _onTouchMove(e){
    if (this._enabled === false) {
      return;
    }

    e.stop();

    if (e.id === this._touchFingerId) {
      let widgetSys = this._widget.system;
      if (widgetSys.focusedEntity !== this._entity) {
        return;
      }

      this._pressing = true;
      this._updateState();
    }
  }

  _onTouchEnd(e) {
    if (this._enabled === false) {
      return;
    }

    e.stop();

    if (e.id !== this._touchFingerId) {
      return;
    }

    this._touchFingerId = -1;
    let widgetSys = this._widget.system;
    if (widgetSys.focusedEntity !== this._entity) {
      return;
    }

    this._pressing = false;
    this._updateState();

    this.dispatch('clicked');
  }
}

ButtonComponent.events = {
  'mouseenter': '_onMouseEnter',
  'mouseleave': '_onMouseLeave',
  'mousedown': '_onMouseDown',
  'mouseup': '_onMouseUp',
  'focus': '_onFocus',
  'blur': '_onBlur',
  'touchstart': '_onTouchStart',
  'touchmove': '_onTouchMove',
  'touchend': '_onTouchEnd'
};