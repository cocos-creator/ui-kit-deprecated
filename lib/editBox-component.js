import cc from 'engine-3d';
import ButtonComponent from './button-component';
const { color4, vec3 } = cc.math;
const { Input } = cc;

export default class EditBoxComponent extends ButtonComponent {
  constructor() {
    super();
    this._textComp = null;
    this._placeHolder = null;
    this._text = '';
    this._lineType = 'single-line';
    this._contentType = 'standard';
    this._maxLength = 0;

    this._activeDom = null;
    this._inputText = '';
    this._editMode = false;

    // mouse events
    this._onOtherAreaDown = (evt) => {
      if (this._editMode) {
        this._editMode = false;
        this._activeDom.style.display = 'none';
        this._dealText(this._text);
        this._textComp.enabled = true;
        this._updatePlaceHolder(true);
      }
    }

    this._onOtherAreaMove = (e) => {
      this._flushDom();
    }

    this._onMouseEnter = function (e) {
      super._onMouseEnter(e);
    }.bind(this);

    this._onMouseLeave = function (e) {
      super._onMouseLeave(e);
    }.bind(this);

    this._onMouseDown = (e) => {
      super._onMouseDown(e);
    }

    this._onMouseUp = function (e) {
      super._onMouseUp(e);
      if (this._enabled === false) {
        return;
      }

      let widgetSys = this._widget.system;
      if (e.button === 'left') {
        if (widgetSys.focusedEntity !== this._entity) {
          return;
        }

        this._onClk();
      }
    }.bind(this);

    this.contentType = this._contentType;
    this._createDom('input');

    // touch events
    this._onTouchScreenEnd = function (e) {
      if (this._entity._enabled === false) {
        return;
      }

      e.stop();
      if (this._fingerId === e.id) {
        this._fingerId = -1;
      }

      if (this._editMode) {
        this._editMode = false;
        this._activeDom.style.display = 'none';
        this._dealText(this._text);
        this._textComp.enabled = true;
        this._updatePlaceHolder(true);
        this._activeDom.blur();
      }
    }.bind(this);

    this._onTouchEnd = function (e) {
      if (this._enabled === false) {
        return;
      }

      super._onTouchEnd(e);
      if (this._fingerId !== -1) {
        return;
      }

      let widgetSys = this._widget.system;
      if (widgetSys.focusedEntity !== this._entity) {
        return;
      }

      this._onClk();
    }.bind(this);
  }

  onEnable() {
    super.onEnable();
    let otherArea = this._widget.system._screens[0]._entity;
    this._textComp._entity.on('mouseenter', this._onMouseEnter);
    this._textComp._entity.on('mouseleave', this._onMouseLeave);
    this._textComp._entity.on('mousedown', this._onMouseDown);
    this._textComp._entity.on('mouseup', this._onMouseUp);
    this._placeHolder._entity.on('mouseenter', this._onMouseEnter);
    this._placeHolder._entity.on('mouseleave', this._onMouseLeave);
    otherArea.on('mousedown', this._onOtherAreaDown);
    otherArea.on('mousemove', this._onOtherAreaMove);

    this._textComp._entity.on('touchend', this._onTouchEnd);
    this._entity.on('touchend', this._onTouchEnd);
  }

  onDisable() {
    super.onDisable();
    let otherArea = this._widget.system._screens[0]._entity;
    this._textComp._entity.off('mouseenter', this._onMouseEnter);
    this._textComp._entity.off('mouseleave', this._onMouseLeave);
    this._textComp._entity.off('mousedown', this._onMouseDown);
    this._textComp._entity.off('mouseup', this._onMouseUp);
    this._placeHolder._entity.off('mouseenter', this._onMouseEnter);
    this._placeHolder._entity.off('mouseleave', this._onMouseLeave);
    otherArea.off('mousedown', this._onOtherAreaDown);
    otherArea.off('mousemove', this._onOtherAreaMove);

    this._textComp._entity.off('touchend', this._onTouchEnd);
    this._entity.off('touchend', this._onTouchEnd);
  }

  _registerEvent() {
    this._activeDom.addEventListener('input', function (evt) {
      this._text = this._activeDom.value;
      this.dispatch('change');
    }.bind(this), false);

    this._activeDom.addEventListener('keypress', function (evt) {
      if (evt.keyCode === 13) {
        this._onOtherAreaDown(null);
        this.dispatch('submit');
      }
    }.bind(this), false);
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
    this._updatePlaceHolder(false);
    this._flushDom();
  }

  _dealText(val) {
    this._text = '';
    if (this._lineType === 'single-line') {
      this._text = this._text.replace('\n', '');
    }

    let num = this._maxLength <= 0 ? val.length : Math.min(val.length, this._maxLength);
    for (let i = 0; i < num; ++i) {
      let result = this._checkChar(val[i], this._text.length, this._text);
      if (result !== '\0') {
        this._text += result;
      }
    }

    this._textComp.text = this._text;

    if (this._maxLength > 0 && this._text.length > this._maxLength) {
      this._text = this._text.substring(0, this._maxLength);
    }

    let text = this._text;
    if (this._contentType === 'password') {
      text = this._text.replace(new RegExp('.+?', 'g'), 'V');
    }

    this._textComp.text = text;
  }

  _updatePlaceHolder(val) {
    if (this._text.length <= 0 && val) {
      this._placeHolder.entity.enabled = true;
    } else {
      this._placeHolder.entity.enabled = false;
    }
  }

  _checkChar(c, index, text) {
    let result = '';
    let isMatch = false;
    if (this._contentType === 'int-number' || this._contentType === 'decimal-number') {
      isMatch = new RegExp('[0-9]').test(c);
      if (isMatch) {
        return result;
      }

      if (c === '-') {
        if (this._text.length <= 0) {
          result = x;
          return result;
        }
      }

      if (c === '.' && this._contentType === 'decimal-number' && this._text.indexOf('.') < 0) {
        result = c;
        return result;
      }
    } else if (this._contentType === 'char-number') {
      isMatch = new RegExp('[0-9a-zA-Z]').test(c);
      if (isMatch) {
        result = c;
        return result;
      }
    } else if (this._contentType === 'caps-all') {
      result = c.toUpperCase();
      return c;
    } else if (this._contentType === 'name') {
      isMatch = new RegExp('[a-zA-Z]').test(c);
      if (isMatch) {
        isMatch = new RegExp('[a-z]').test(c);
        if (isMatch) {
          if (index === 0 || text[index - 1] === ' ') {
            result = c.toUpperCase();
            return result;
          }
        } else {
          if (index > 0 && text[index - 1] !== ' ') {
            result = c.toLowerCase();
            return result;
          }
        }
        result = c;
      } else {
        if (c === ' ') {
          result = c;
          return result;
        }
      }
    } else if (this._contentType === 'email') {
      isMatch = new RegExp('[0-9a-zA-Z]').test(c);
      if (isMatch) {
        result = c;
        return result;
      }

      if (c === '@' && this._text.indexOf('@') === -1) {
        result = c;
        return result;
      }

      let str = '!#$%&\'*+-/=?^_`{}|~';
      if (str.indexOf(c) !== -1) {
        result = c;
        return result;
      }

      if (c === '.') {
        let last = text[cc.math.clamp(index, 0, text.length)];
        if (last !== '.') {
          result = c;
          return result;
        }
      }
    } else {
      result = c;
    }

    return result;
  }

  _createDom(type) {
    if (this._activeDom) {
      let lastType = this._activeDom.type === 'textarea' ? 'textarea' : 'input';
      if (lastType === type) {
        return;
      }
      document.body.removeChild(this._activeDom);
    }

    this._activeDom = document.createElement(type);
    document.body.appendChild(this._activeDom);
    if (this._activeDom.type !== 'textarea') {
      this._activeDom.type = "text";
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
    let align = '';
    let type = this._activeDom.type === 'textarea' ? 'textarea' : 'input';

    if (this._textComp.align.indexOf('left') !== -1) {
      align = 'left';
    } else if (this._textComp.align.indexOf('center') !== -1) {
      align = 'center';
    } else {
      align = 'right';
    }

    let textAlign = '';
    if (type === 'textarea') {
      textAlign = 'top-' + align;
    } else {
      textAlign = 'middle-' + align;
    }

    if (this._textComp.align !== textAlign) {
      this._textComp.align = textAlign;
    }

    this._activeDom.style.textAlign = align;
    this._activeDom.maxLength = this._maxLength;
    this._activeDom.style.width = (widget._rect.w - padding - 2) + "px";
    this._activeDom.style.height = (widget._rect.h - padding - 2) + "px";
    this._activeDom.style.top = top + "px";
    this._activeDom.style.left = left + "px";
  }
}

EditBoxComponent.schema = {
  textComp: {
    type: 'object',
    default: null,
    set(val) {
      this._textComp = val;
      let type = this._activeDom.type === 'textarea' ? 'textarea' : 'input';
      let align = '';
      if (this._textComp.align.indexOf('left') !== -1) {
        align = 'left';
      } else if (this._textComp.align.indexOf('center') !== -1) {
        align = 'center';
      } else {
        align = 'right';
      }
      align = type === 'input' ? 'middle-' + align : 'top-' + align;
      if (this._textComp.align !== align) {
        this._textComp.align = align;
      }
      this._activeDom.style.fontSize = this._textComp.fontSize + 'px';
    }
  },

  placeHolder: {
    type: 'object',
    default: null,
    set(val) {
      this._placeHolder = val;
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
      this._updatePlaceHolder(true);
    },
    get() {
      return this._text;
    }
  },

  contentType: {
    type: 'enums',
    default: 'standard',
    options: ['standard', 'int-number', 'decimal-number', 'char-number', 'caps-all', 'name', 'email', 'password'],
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

  maxLength: {
    type: 'int',
    default: 0,
    set(val) {
      this._maxLength = val;
      this._activeDom.maxLength = this._maxLength;
      this._dealText(this._text);
    },
    get() {
      return this._maxLength;
    }
  }
}