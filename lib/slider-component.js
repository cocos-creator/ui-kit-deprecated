import cc from 'engine-3d';
import enums from './enums';
import ButtonComponent from './button-component';
const { vec2,vec3,mat4,quat } = cc.math;

export default class SliderComponent extends ButtonComponent {
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
    this._fill = null;
    this._fillContainer = null;
    this._sliderBg = null;
    this._onSliderEvents = [];

    this._dragArea = null;
    this._handleContainerWidget = null;
    this._handleWidget = null;
    this._fillContainerWidget = null;
    this._fillWidget = null;
    this._dragging = false;
    this._lastAxis = enums.HORIZONTAL;
    this._startMousePos = vec3.create();
    this._normalizedValue = 0.0;// range[0,1]
    this._reverse = false;

    this._onHandleDown = (evt) => {
      if (evt && evt.button === 'left') {
        this._updateDrag(evt);
        this._startMousePos = vec3.new(evt.mouseX, evt.mouseY, 0);
        this._dragging = true;
      }
    }

    this._onHandleMove = (evt) => {
      if (evt && evt.button === 0) {
        if (this._dragging) {
          this._updateDrag(evt);
        }
      }
    }

    this._onHandleUp = (evt) => {
      // evt.button === 'left'???
      if (evt && evt.button === 'left') {
        this._dragging = false;
      }
    }

    this._onContainerDown = (evt) => {
      if (evt && evt.button === 'left') {
        this._updateDrag(evt);
      }
    }

    this._onContainerMove = (evt) => {
      if (evt && evt.button === 0) {
        if (this._dragging) {
          this._updateDrag(evt);
        }
      }
     }

    this._onContainerUp = (evt) => {
      if (evt && evt.button === 'left') {
        this._dragging = false;
      }
    }

    this._onMouseMove = (evt) => {
      if (evt && evt.button === 0) {
        if (this._dragging) {
          this._updateDrag(evt);
        }
      }
    }

    this._onMouseUp = (evt) => {
      if (evt && evt.button === 'left') {
        this._dragging = false;
      }
    }
  }

  onEnable() {
    this._handle.on('mousedown', this._onHandleDown);
    this._handle.on('mousemove', this._onHandleMove);
    this._handle.on('mouseup', this._onHandleUp);
    this._handleContainer.on('mousedown', this._onContainerDown);
    this._handleContainer.on('mousemove', this._onContainerMove);
    this._handleContainer.on('mouseup', this._onContainerUp);
    this._dragArea.on('mousemove', this._onMouseMove);
    this._dragArea.on('mouseup', this._onMouseUp);
  }

  onDisable() {
    this._handle.off('mousedown', this._onHandleDown);
    this._handle.off('mousemove', this._onHandleMove);
    this._handle.off('mouseup', this._onHandleUp);
    this._handleContainer.off('mousedown', this._onContainerDown);
    this._handleContainer.off('mousemove', this._onContainerMove);
    this._handleContainer.off('mouseup', this._onContainerUp);
    this._dragArea.off('mousemove', this._onMouseMove);
    this._dragArea.off('mouseup', this._onMouseUp);
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

  set dragArea(val) {
    this._dragArea = val;
  }

  set handle(val) {
    this._handle = val;
    this._handleContainer = this._handle.parent;
    this._updateWidget();
    this._updateVisuals();
  }

  set fill(val) {
    this._fill = val;
    this._fillContainer = this._fill.parent;
    this._updateWidget();
    this._updateVisuals();
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
    let v = this._direction === enums.HORIZONTAL ? vec3.new(0, 1, 0) : vec3.new(-1, 0, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.x = v.x;
    v = this._direction === enums.HORIZONTAL ? vec3.new(1, 0, 0) : vec3.new(0, 1, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.y = v.y;
    return vec3.new(v.x, v.y, 0);
  }

  _getRectPos(ratio) {
    let wpos = vec3.create();
    this._handleContainer.getWorldPos(wpos);
    let rect = this._handleContainerWidget._rect;
    let realX = 0.0, realY = 0.0;
    if (this._direction === enums.HORIZONTAL) {
      realX = wpos.x - (rect.w * this._handleContainerWidget.pivotX * ratio.x) + (rect.h * this._handleContainerWidget.pivotY * ratio.y);
      realY = wpos.y - (rect.w * this._handleContainerWidget.pivotX * ratio.y) - (rect.h * this._handleContainerWidget.pivotY * ratio.x);
    } else {
      realX = wpos.x + (rect.h * this._handleContainerWidget.pivotY * -ratio.x) - (rect.w * this._handleContainerWidget.pivotX * ratio.y);
      realY = wpos.y - (rect.h * this._handleContainerWidget.pivotY * ratio.y) - (rect.w * this._handleContainerWidget.pivotX * -ratio.x);
    }

    return vec3.new(realX, realY, 0);
   }

  _updateDrag(evt) {
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
    let target = vec3.new(evt.mouseX, evt.mouseY, 0);
    // NOTE:Maybe will change to lpos,require support of rotation transformation
    this._handleContainer.getWorldPos(wpos);
    let min = this._getRectPos(ratio);
    let sqrt = 0.0;
    if (this._direction === enums.HORIZONTAL) {
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
    value += this._minValue;
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

  _repaint() {
    let widget = this._entity.getComp('Widget');
    let widgetSize = { width: widget.width, height: widget.height };
    let handleSize = { width: this._handleWidget.width, height: this._handleWidget.height };
    if (this._direction != this._lastAxis) {
      let w = widgetSize.height;
      widgetSize.height = widgetSize.width;
      widgetSize.width = w;
      let h = handleSize.height;
      handleSize.height = handleSize.width;
      handleSize.width = h;

      let a = 0.0, b = 0.0;
      if (this._lastAxis === enums.HORIZONTAL) {
        this._fillWidget.setAnchors(0, 0, 0, 1);
        this._handleWidget.setAnchors(0, 0, 0, 1);
        a = this._handleWidget.marginLeft;
        b = this._handleWidget.marginRight;
        this._handleWidget.marginLeft = this._handleWidget.marginBottom;
        this._handleWidget.marginRight = this._handleWidget.marginTop;
        this._handleWidget.marginBottom = a;
        this._handleWidget.marginTop = b;
      } else {
        this._fillWidget.setAnchors(0, 0, 1, 0);
        this._handleWidget.setAnchors(0, 0, 1, 0);
        a = this._handleWidget.marginBottom;
        b = this._handleWidget.marginTop;
        this._handleWidget.marginBottom = this._handleWidget.marginLeft;
        this._handleWidget.marginTop = this._handleWidget.marginRight;
        this._handleWidget.marginLeft = a;
        this._handleWidget.marginRight = b;
      }
    }

    widget.setSize(widgetSize.width, widgetSize.height);
    this._handleWidget.setSize(handleSize.width, handleSize.height);
    this._normalizedValue = !this._getReverseValue() ? 0 : 1;
    this._updateVisuals();
  }

  _updateVisuals() {
    if (!this._fill || !this._handle) {
      return;
    }

    let min = [0, 0];
    let max = [1, 1];
    min[this._direction] = this._normalizedValue;
    max[this._direction] = this._normalizedValue;
    this._handleWidget.setAnchors(min[0], min[1], max[0], max[1]);

    min = [0, 0];
    max = [1, 1];
    let sprite = this._fill.getComp('Image');
    // NOTE:need to verify
    if (sprite.type === 'filled') {
      sprite.filledStart = this._normalizedValue;
    } else if (this._reverse) {
      min[this._direction] = this._normalizedValue;
    } else {
      max[this._direction] = this._normalizedValue;
    }

    this._fillWidget.setAnchors(min[0], min[1], max[0], max[1]);
  }

  _emitSliderEvent() {
     // todo: this may change later
    for (let i = 0; i < this._onSliderEvents.length; i++) {
      this._onSliderEvents[i](this);
     }
  }
}