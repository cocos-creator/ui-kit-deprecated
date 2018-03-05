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
    this._fingerId = -1;

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
    this._widget.focusable = true;

    if (this._background) {
      this._bgImage = this._background.getComp('Image');
    } else {
      this._bgImage = this._entity.getComp('Image');
    }
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

  _onTouchEnd(e) {
    if (this._enabled === false) {
      return;
    }

    e.stop();
    if (e.id !== this._fingerId) {
      return;
    }

    this._fingerId = -1;
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
  'touchenter': '_onTouchEnter',
  'touchleave': '_onTouchLeave',
  'touchstart': '_onTouchStart',
  'touchend': '_onTouchEnd'
};

ButtonComponent.schema = {
  transitionColors: {
    type: 'object',
    default: {
      normal: color4.create(),
      highlight: color4.create(),
      pressed: color4.create(),
      disabled: color4.create(),
    },
    get() {
      return this._transitionColors;
    }
  },

  transitionSprites: {
    type: 'object',
    default: {
      normal: null,
      highlight: null,
      pressed: null,
      disabled: null
    },
    get() {
      return this._transitionSprites;
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
    },
    get() {
      return this._background;
    }
  },

  transition: {
    type: 'enums',
    default: 'none',
    options: ['none', 'color', 'sprite'],
    set(val) {
      if (this._transition !== val) {
        this._transition = val;
      }
    },
    get() {
      return this._transition;
    }
  }
}
