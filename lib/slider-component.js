import cc from 'engine-3d';
import enums from './enums';
const { vec3 } = cc.math;

export default class SliderComponent extends cc.ScriptComponent {
  constructor() {
    super();
    this._direction = enums.HORIZONTAL;
    this._dragging = false;
    this._dragEvt = false;
    this._progress = 0.1;
    this._handle = null;
    this._bg = null;
    this._onSliderEvents = [];
    this._lastMousePos;

    this._onMouseDown = (evt) => {
      let wpos = vec3.create();
      this._handle.getWorldPos(wpos);
      if (this._direction === enums.HORIZONTAL) {
        let diff = evt.mouseX - wpos.x;
        this._handleSliderLogic(diff);
        this._lastMousePos = evt.mouseX;
      } else {
        let diff = evt.mouseY - wpos.y;
        this._handleSliderLogic(diff);
        this._lastMousePos = evt.mouseY;
      }
      this._dragging = true;
    }

    this._onMouseUp = (evt) => {
      this._dragging = false;
    }

    this._onMouseMove = (evt) => {
      // When moving up, it's added value, and when draging up, it's a minus
      if (this._dragging) {
        if (this._direction === enums.HORIZONTAL) {
          let wpos = vec3.create();
          this._handle.getWorldPos(wpos);
          let diff = evt.mouseX - this._lastMousePos;
          this._handleSliderLogic(diff);
          this._lastMousePos = evt.mouseX;
        } else {
          let wpos = vec3.create();
          this._handle.getWorldPos(wpos);
          let diff = this._lastMousePos - evt.mouseY;
          this._handleSliderLogic(diff);
          this._lastMousePos = evt.mouseY;
        }
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

  init(handle,bg) {
    this._handle = handle;
    this._bg = bg;
    // range:[0, 1, 0.5]
    this.setProgress(this._progress);
  }

  setDirection(dir) {
    this._direction = dir;
  }

  setProgress(progress) {
    this._progress = progress;
    this._updateHandlePos(this._progress);
    this._emitSliderEvent();
  }

  _handleSliderLogic(value) {
    if (!this._handle || !value) {
      return;
    }
    let progress;

    let widget = this._bg.getComp('Widget');
    let wpos = vec3.create();
    this._bg.getWorldPos(wpos);

    if (this._direction === enums.HORIZONTAL) {
      let min = wpos.x - widget.pivotX * widget.width;
      let max = min + widget.width;

      this._handle.getWorldPos(wpos);
      let currValue = wpos.x + value - min;
      if (currValue < 0) {
        currValue = 0;
        value = min - wpos.x;
      } else if (currValue - widget.width > 0) {
        currValue = widget.width;
        value = max - wpos.x;
      }

      progress = (currValue / widget.width).toFixed(2);
    } else {
      let min = wpos.y - widget.pivotY * widget.height;
      let max = min + widget.height;

      this._handle.getWorldPos(wpos);
      let currValue = wpos.y + value - min;
      if (currValue < 0) {
        currValue = 0;
        value = min - wpos.y;
      } else if (currValue - widget.height > 0) {
        currValue = widget.height;
        value = max - wpos.y;
      }

      progress = (currValue / widget.height).toFixed(2);
    }

    this.setProgress(progress);
  }

  _updateHandlePos(progress) {
    let widget = this._bg.getComp('Widget');
    let handleWidget = this._handle.getComp('Widget');
    let wpos = vec3.create();
    this._handle.getWorldPos(wpos);

    if (this._direction === enums.HORIZONTAL) {
      handleWidget.offsetX = (progress - 0.5) * widget.width;
    } else {
      handleWidget.offsetY = (progress - 0.5) * widget.height;
    }
  }

  _emitSliderEvent() {
     // todo: this may change later
    for (let i = 0; i < this._onSliderEvents.length; i++) {
      this._onSliderEvents[i](this);
     }
  }
}