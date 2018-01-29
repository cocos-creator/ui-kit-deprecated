import cc from 'engine-3d';
import enums from './enums';
const { vec2,vec3,mat4,quat } = cc.math;

export default class SliderComponent extends cc.ScriptComponent {
  constructor() {
    super();
    this._direction = enums.HORIZONTAL;
    this._progress = 0.0;
    this._minValue = 0.0;
    this._maxValue = 1.0;
    this._showMinValue = 0.0;
    this._showMaxValue = 0.0;
    this._handle = null;
    this._handleContainer = null;
    this._sliderBg = null;
    this._onSliderEvents = [];

    this._widget = null;
    this._handleWidget = null;
    this._dragging = false;
    this._lastAxis = enums.HORIZONTAL;
    this._startMousePos = vec3.create();
    this._normalizedValue = 0.0;// range[0,1]
    this._reverse = false;

    this._onMouseDown = (evt) => {
      this._updateDrag(evt);
      this._startMousePos = vec3.new(evt.mouseX, evt.mouseY, 0);
      this._dragging = true;
    }

    this._onMouseUp = (evt) => {
      this._dragging = false;
    }

    this._onMouseMove = (evt) => {
      // When moving up, it's added value, and when draging up, it's a minus
      if (this._dragging) {
        this._updateDrag(evt);
      }
    }
  }

  onEnable() {
    this._entity.on('mousedown', this._onMouseDown);
    this._entity.on('mouseup', this._onMouseUp);
    this._entity.on('mousemove', this._onMouseMove);
  }

  onDisable() {
    this._entity.off('mousedown', this._onMouseDown);
    this._entity.off('mouseup', this._onMouseUp);
    this._entity.off('mousemove', this._onMouseMove);
  }

  _init(handle, handleContainer, bg) {
    this._handle = handle;
    this._handleContainer = handleContainer;
    this._sliderBg = bg;
    this._lastAxis = this._direction;
  }

  _set(value,sendCallBack) {
    let num = cc.math.clamp(value, this._minValue, this._maxValue);
    if (this._progress != num) {
      this._progress = num;
      if (sendCallBack) {
        this._emitSliderEvent();
      }
    }
  }

  get direction() {
    return this._direction;
  }

  set direction(dir) {
    this._direction = dir;
    this._repaint();
    this._lastAxis = this._direction;
  }

  get progress() {
    return this._progress;
  }

  set progress(val) {
    this._set(val, false);
  }

  get minValue() {
    return this._showMinValue;
  }

  set minValue(val) {
    this._showMinValue = val;
    this._minValue = val;
    if (this._showMinValue > this._showMaxValue) {
      this._minValue = this._showMaxValue;
      this._maxValue = this._showMinValue;
    }
  }

  get maxValue() {
    return this._showMaxValue;
  }

  set maxValue(val) {
    this._showMaxValue = val;
    this._maxValue = val;
    if (this._showMinValue > this._showMaxValue) {
      this._minValue = this._showMaxValue;
      this._maxValue = this._showMinValue;
    }
  }

  _getReverseValue() {
    // return this._direction === enums.RIGHTTOLEFT || this._direction === enums.TOPTOBOTTOM;
    return this._showMaxValue < this._showMinValue;
  }

  _getSize() {
    return this._maxValue - this._minValue;
  }

  _getRatio() {
    let wrot = quat.create();
    this._handleContainer.getWorldRot(wrot);
    let ratio = { x: 0, y: 0 };
    let v = vec3.new(0, 1, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.x = v.x;
    v = vec3.new(1, 0, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.y = v.y;
    return vec3.new(v.x, v.y, 0);
  }

  _getRectPos(ratio) {
    let wpos = vec3.create();
    this._handleContainer.getWorldPos(wpos);
    let rect = this._widget._rect;
    let realX = 0.0, realY = 0.0;
    if (this._direction === enums.HORIZONTAL) {
      realX = wpos.x - (rect.w * this._widget.pivotX * ratio.x) + (rect.h * this._widget.pivotY * ratio.y);
      realY = wpos.y - (rect.w * this._widget.pivotX * ratio.y) - (rect.h * this._widget.pivotY * ratio.x);
    } else {
      realX = wpos.x + (rect.h * this._widget.pivotY * ratio.y) - (rect.w * this._widget.pivotX * ratio.x);
      realY = wpos.y - (rect.h * this._widget.pivotY * ratio.x) - (rect.w * this._widget.pivotX * ratio.y);
    }

    return vec3.new(realX, realY, 0);
   }

  _updateDrag(evt) {
    if (!this._handle) {
      return;
    }

    this._widget = this._handleContainer.getComp('Widget');
    this._handleWidget = this._handle.getComp('Widget');

    let value = 0.0;
    let wpos = vec3.create();
    let rect = this._widget._rect;
    let offsetMouse = vec3.create();
    let offsetSlider = vec3.create();

    let ratio = this._getRatio();
    let target = vec3.new(evt.mouseX, evt.mouseY, 0);
    if (this._dragging) {
      let diff = this._startMousePos.y - evt.mouseY;
      target = vec3.new(evt.mouseX, this._startMousePos.y + diff, 0);
    }
    // NOTE:Maybe will change to lpos,require support of rotation transformation
    this._handleContainer.getWorldPos(wpos);
    let min = this._getRectPos(ratio);
    // the same line with min
    let max = vec3.create();
    let sqrt = 0.0;
    if (this._direction === enums.HORIZONTAL) {
      max = vec3.new(min.x + rect.w * ratio.x, min.y + rect.w * ratio.y, 0);
      vec3.subtract(offsetMouse, target, min);
      vec3.subtract(offsetSlider, max, min);
      value = vec3.dot(offsetSlider, vec3.new(offsetMouse.x, offsetMouse.y, 0));
      sqrt = Math.sqrt(Math.pow(rect.w * ratio.x, 2) + Math.pow(rect.w * ratio.y, 2));
      value =((value / sqrt) / rect.w).toFixed(2);
    } else {
      max = vec3.new(min.x - rect.h * ratio.y, min.y + rect.h * ratio.x, 0);
      vec3.subtract(offsetMouse, target, min);
      vec3.subtract(offsetSlider, max, min);
      value = vec3.dot(offsetSlider, vec3.new(offsetMouse.x, offsetMouse.y, 0));
      sqrt = Math.sqrt(Math.pow(rect.h * ratio.y, 2) + Math.pow(rect.h * ratio.x, 2));
      value = ((value / sqrt) / rect.h).toFixed(2);
     }

    this._normalizedValue = cc.math.clamp(value, 0, 1);
    value = !this._getReverseValue() ? value * this._getSize() : (1 - value) * this._getSize();
    value += this._minValue;
    value = cc.math.clamp(value, this._minValue, this._maxValue);

    this._updateVisuals();
    this._set(value, true);
  }

  _repaint() {
    this._widget = this._handleContainer.getComp('Widget');
    this._handleWidget = this._handle.getComp('Widget');
    let bgWidget = this._sliderBg.getComp('Widget');
    let containerSize = { width: this._widget.width, height: this._widget.height };
    let handleSize = { width: this._handleWidget.width, height: this._handleWidget.height };
    let bgSize = { width: bgWidget.width, height: bgWidget.height };
    if (this._direction != this._lastAxis) {
      let c = containerSize.height;
      containerSize.height = containerSize.width;
      containerSize.width = c;
      let h = handleSize.height;
      handleSize.height = handleSize.width;
      handleSize.width = h;
      let b = bgSize.height;
      bgSize.height = bgSize.width;
      bgSize.width = b;
    }

    this._widget.width = containerSize.width;
    this._widget.height = containerSize.height;
    this._handleWidget.width = handleSize.width;
    this._handleWidget.height = handleSize.height;
    bgWidget.width = bgSize.width;
    bgWidget.height = bgSize.height;

    this._normalizedValue = !this._getReverseValue() ? this._normalizedValue : 1 - this._normalizedValue;

    this._updateVisuals();
  }

  _updateVisuals() {
    let min = [0, 0];
    let max = [1, 1];
    min[this._direction] = this._normalizedValue;
    max[this._direction] = this._normalizedValue;
    this._handleWidget.setAnchors(min[0], min[1], max[0], max[1]);
  }

  _emitSliderEvent() {
     // todo: this may change later
    for (let i = 0; i < this._onSliderEvents.length; i++) {
      this._onSliderEvents[i](this);
     }
  }
}