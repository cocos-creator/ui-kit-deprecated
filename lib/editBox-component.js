import cc from 'engine-3d';
import enums from './enums';
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
    this._valueChangedListeners = [];

    this._activeDom = null;
    this._inputText = '';
    this._allowInput = false;
    this._otherArea = null;

    this._onMouseDown = (evt) => {
      if (!this._allowInput) {
        this._allowInput = true;
        this._activeDom.style.display = 'block';
        this._activeDom.value = this._text;
        this._textComp.enabled = false;
        this._updatePlaceHolder(false);
        this._flushDom();
      }
    }

    this._onOtherAreaDown = (evt) => {
      if (this._allowInput) {
        this._allowInput = false;
        this._activeDom.style.display = 'none';
        this._dealText(this._text);
        this._textComp.enabled = true;
        this._updatePlaceHolder(true);
      }
    }

    this._onOtherAreaMove = (evt) => {
      this._flushDom();
    }

    this.contentType = this._contentType;
    this._createDom('input');

    // TODO:keyboard enter
  }

  onEnable() {
    super.onEnable();
    if (this._interactable) {
      this._otherArea.on('mousedown', this._onOtherAreaDown);
      this._otherArea.on('mousemove', this._onOtherAreaMove);
    }
  }

  onDisable() {
    super.onDisable();
    this._otherArea.off('mousedown', this._onOtherAreaDown);
    this._otherArea.off('mousemove', this._onOtherAreaMove);
  }

  _registerEvent() {
    this._activeDom.addEventListener('input', function (evt) {
      this._text = this._activeDom.value;
      this._valueChangedListeners();
    }.bind(this), false);
  }

  set otherArea(val) {
    this._otherArea = val;
  }

  set textComp(val) {
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

  set placeHolder(val) {
    this._placeHolder = val;
  }

  get text() {
    return this._text;
  }

  set text(val) {
    val = !val ? '' : val;
    if (this._text === val) {
      return;
    }

    this._dealText(val);
    this._updatePlaceHolder(true);
  }

  set contentType(val) {
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

  set lineType(val) {
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

  get maxLength() {
    return this._maxLength;
  }

  set maxLength(val) {
    this._maxLength = val;
    this._activeDom.maxLength = this._maxLength;
    this._dealText(this._text);
  }

  _emitEventValueChange() {
    for (let i = 0; i < this._valueChangedListeners.length; ++i) {
      this._valueChangedListeners[i](this);
    }
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