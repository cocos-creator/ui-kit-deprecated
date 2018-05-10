import cc from 'engine-3d';
import UIElement from './ui-element-component';
const { color4, vec3 } = cc.math;

export default class EditBoxComponent extends UIElement {
  constructor() {
    super();
    this._state = 'none';
    this._highlighting = false;
    this._pressing = false;
    this._widget = null;
    this._activeDom = null;
    this._inputText = '';
    this._editMode = false;

    // mouse events
    this._onOtherAreaMove = (e) => {
      if (this._pressing) {
        this._flushDom();
      }
    }

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
      }
    };

    this._onMouseUp = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
        return;
      }

      if (e.button === 'left') {
        e.stop();

        this._pressing = false;
        this._updateState();
        this._onClk();
      }
    };

    this._onInput = (e) => {
      this._text = this._activeDom.value;
      this.dispatch('change');
    };

    this._onReturnKey = (e) => {
      if (e.keyCode === 13) {
        if (this._returnKeyType === 'new-line') {
          if (this._lineType === 'multi-line') {
            this._text += '\n';
          }
        } else {
          this._endInput();
          if (this._returnKeyType === 'submit') {
            this.dispatch('submit');
          }
        }
      }
    };

    // touch events
    this._onTouchEnd = (e)=> {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
        return;
      }

      e.stop();

      this._pressing = false;
      this._updateState();

      this._onClk();
    };
  }

  onInit() {
    this._entity.once('ready', () => {
      this._widget = this._entity.getComp('Widget');
      this._widget.focusable = true;
      if (!this._background) {
        this._background = this._entity.getComp('Image');
      }

      this._dealText(this._text);
      if (this._lineType === 'multi-line') {
        this._createDom('textarea');
      } else {
        this._createDom('input');
      }

      let otherArea = this._widget.system._screens[0]._entity;
      otherArea.on('mousemove', this._onOtherAreaMove);

      this._entity.on('touchend', this._onTouchEnd);
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

    if (this._background === null) {
      return;
    }

    if (this._transition === 'none') {
      return;
    }

    if (this._transition === 'color') {
      this._background.color = this._transitionColors[state];
    } else if (this._transition === 'sprite') {
      this._background.sprite = this._transitionSprites[state];
    } else {
      // todo: not implemented
      console.warn('Button transition animation is not implemented');
    }
  }

  _registerEvent() {
    this._activeDom.addEventListener('input', this._onInput);
    this._activeDom.addEventListener('keypress', this._onReturnKey);
  }

  _unregisterEvent() {
    this._activeDom.removeEventListener('input', this._onInput);
    this._activeDom.removeEventListener('keypress', this._onReturnKey);
  }

  _onClk() {
    if (!this._editMode) {
      this._editMode = true;
      this._activeDom.style.display = 'block';
      this._activeDom.value = this._text;
      this._textComp.enabled = false;
      // TODO:settimeout to auto active keyboard failed,need to active manual operation
      this._startFocus();
    }
  }

  _startFocus() {
    this._activeDom.focus();
    this._flushDom();
  }

  _dealText(val) {
    this._text = '';
    if (this._lineType === 'single-line') {
      val = val.replace('\n', '');
    }

    let num = Math.min(val.length, this._maxLength);
    for (let i = 0; i < num; ++i) {
      let result = this._checkChar(val[i], this._text.length, this._text);
      if (result.length > 0) {
        this._text += result;
      }
    }

    this._switchTextState();
    let text = this._text;
    if (this._contentType === 'password') {
      text = this._text.replace(new RegExp('.+?', 'g'), 'V');
    }

    this._textComp.text = text.length > 0 ? text : this.defaultText;
  }

  _switchTextState() {
    // the prompt is translucent when there is no text.
    let textCompColor = this._textComp.color;
    if (this._text.length <= 0) {
      this._textComp.color = color4.new(textCompColor.r, textCompColor.g, textCompColor.b, 0.5);
    } else {
      this._textComp.color = color4.new(textCompColor.r, textCompColor.g, textCompColor.b, 1);
    }
  }

  _checkChar(c, index, text) {
    let isMatch = false;

    if (this._contentType === 'standard') {
      return c;
    }

    if (this._contentType === 'int-number' || this._contentType === 'decimal-number') {
      isMatch = new RegExp('[0-9]').test(c);
      if (isMatch) {
        return c;
      }

      if (c === '-') {
        if (index === 0) {
          return c;
        }
      }

      if (c === '.' && this._contentType === 'decimal-number' && this._text.indexOf('.') < 0) {
        return c;
      }
    } else if (this._contentType === 'alpha-number') {
      isMatch = new RegExp('[0-9a-zA-Z]').test(c);
      if (isMatch) {
        return c;
      }
    } else if (this._contentType === 'caps-all') {
      return c.toUpperCase();
    } else if (this._contentType === 'name') {
      isMatch = new RegExp('[a-zA-Z]').test(c);
      if (isMatch) {
        isMatch = new RegExp('[a-z]').test(c);
        if (isMatch) {
          if (index === 0 || text[index - 1] === ' ') {
            return c.toUpperCase();
          }
        } else {
          if (index > 0 && text[index - 1] !== ' ') {
            return c.toLowerCase();
          }
        }
        return c;
      } else {
        if (c === ' ' && index > 0) {
          if (text[index - 1] !== ' ') {
            return c;
          }
        }
      }
    } else if (this._contentType === 'email') {
      isMatch = new RegExp('[0-9a-zA-Z]').test(c);
      if (isMatch) {
        return c;
      }

      if (c === '@' && this._text.indexOf('@') === -1) {
        return c;
      }

      let str = '!#$%&\'*+-/=?^_`{}|~';
      if (str.indexOf(c) !== -1) {
        return c;
      }

      if (c === '.') {
        if (index > 0 && text[index - 1] !== '.') {
          return c;
        }
      }
    } else {
      return c;
    }

    return '';
  }

  _endInput() {
    if (this._editMode) {
      this._editMode = false;
      this._activeDom.style.display = 'none';
      this._dealText(this._text);
      this._textComp.enabled = true;
      if (this._text.length <= 0) {
        this._textComp.text = this.defaultText;
      }
      this._switchTextState();
      this._activeDom.blur();
    }
  }

  _createDom(type) {
    if (this._activeDom) {
      this._unregisterEvent();
      document.body.removeChild(this._activeDom);
    }

    this._activeDom = document.createElement(type);
    document.body.appendChild(this._activeDom);
    if (this._activeDom.type !== 'textarea') {
      this._activeDom.type = this._contentType === 'password' ? 'password' : 'text';
    }
    this._activeDom.style.background = "transparent";
    this._activeDom.style.position = "absolute";
    this._activeDom.style.padding = '2px';
    this._activeDom.style.fontSize = this._textComp !== null ? this._textComp.fontSize + "px" : "10px";
    this._activeDom.style.display = 'none';
    if (this._activeDom.type === 'textarea') {
      this._activeDom.style.active = 0;
      this._activeDom.style.overflowY = "scroll";
      this._activeDom.style.resize = 'none';
    }

    this._activeDom.maxLength = this._maxLength;
    this._registerEvent();
  }

  _flushDom() {
    if (this._textComp === null || this._activeDom.style.display === 'none') {
      return;
    }

    let canvas = this._app._canvas;
    let widget = this._textComp.entity.getComp('Widget');
    let corner = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
    widget.getWorldCorners(corner[0], corner[1], corner[2], corner[3]);
    let padding = 4;
    let left = corner[0].x + padding;
    let top = canvas.height - corner[0].y + padding;
    let align = this._textComp.align;
    let type = this._activeDom.type === 'textarea' ? 'textarea' : 'input';
    align = align.indexOf('left') !== -1 ? 'left' : align.indexOf('center') !== -1 ? 'center' : 'right';
    this._activeDom.style.textAlign = align;
    this._activeDom.maxLength = this._maxLength;
    this._activeDom.style.width = (widget._rect.w - padding - 2) + "px";
    this._activeDom.style.height = (widget._rect.h - padding - 2) + "px";
    this._activeDom.style.top = top + "px";
    this._activeDom.style.left = left + "px";
  }

  _onFocus() {
    if (this._enabled === false || this._entity.enabledInHierarchy === false) {
      return;
    }

    this._highlighting = true;
    this._updateState();
  }

  _onBlur() {
    if (this._entity.enabledInHierarchy === false) {
      return;
    }

    this._fingerId = -1;
    this._highlighting = false;
    this._updateState();
    this._endInput();
  }

  _onTouchEnter(e) {
    if (this._enabled === false || this._entity.enabledInHierarchy === false) {
      return;
    }

    if (this._fingerId === e.id) {
      e.stop();
      this._pressing = true;
      this._updateState();
    }
  }

  _onTouchLeave(e) {
    if (this._enabled === false || this._entity.enabledInHierarchy === false) {
      return;
    }

    e.stop();
    this._pressing = false;
    this._updateState();
  }

  _onTouchStart(e) {
    if (this._enabled === false || this._entity.enabledInHierarchy === false) {
      return;
    }

    e.stop();

    this._fingerId = e.id;
    this._pressing = true;
    this._updateState();
  }
}

EditBoxComponent.events = {
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

EditBoxComponent.schema = {
  defaultText: {
    type: 'string',
    default: ''
  },

  textComp: {
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
          return entities[entIdx].getComp('Text');
        }
      }

      return value;
    },
    set(val) {
      if (this._textComp === val) {
        return;
      }

      this._textComp = val;
      if (!this._textComp) {
        console.warn('Text component cannot be null');
      }

      this._activeDom.style.fontSize = this._textComp.fontSize + 'px';
      this._textComp.text = this._defaultText;
      this._switchTextState();
    }
  },

  text: {
    type: 'string',
    default: '',
    set(val) {
      val = !val ? '' : val;
      if (this._text === val) {
        return;
      }

      this._dealText(val);
    }
  },

  contentType: {
    type: 'enums',
    default: 'standard',
    options: ['standard', 'int-number', 'decimal-number', 'alpha-number', 'caps-all', 'name', 'email', 'password'],
    set(val) {
      if (this._contentType === val) {
        return;
      }

      this._contentType = val;
      if (this._contentType === 'password') {
        this._activeDom.type = 'password';
        this.lineType = 'single-line';
      } else if (this._contentType === 'email') {
        this._activeDom.type = 'email';
        this.lineType = 'single-line';
      } else {
        this._activeDom.type = 'text';
        this.lineType = this._lineType;
      }

      this._dealText(this._text);
    }
  },

  lineType: {
    type: 'enums',
    default: 'single-line',
    options: ['single-line', 'multi-line'],
    set(val) {
      if (this._lineType === val) {
        return;
      }

      if (this._contentType === 'standard') {
        this._lineType = val;
      } else {
        this._lineType = 'single-line';
      }

      if (this._lineType === 'multi-line') {
        this._createDom('textarea');
      } else {
        this._createDom('input');
      }
    }
  },

  returnKeyType: {
    type: 'string',
    default: 'none',
    options: ['none', 'submit', 'new-line']
  },

  maxLength: {
    type: 'int',
    default: 2147483647,
    set(val) {
      if (this._maxLength === val) {
        return;
      }

      this._maxLength = val;
      if (this._maxLength <= 0) {
        this._maxLength = 2147483647;
      }

      this._activeDom.maxLength = this._maxLength;
      this._dealText(this._text);
    }
  },

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
    parse(app, value, propInfo, entities) {
      if (entities) {
        if (propInfo.type === 'object' && value) {
          let entIdx = value.indexOf('e');
          if (entIdx !== -1) {
            value = value.split('e').join('');
          }

          entIdx = parseInt(value);
          return entities[entIdx].getComp('Image');
        }
      }

      return value;
    },
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