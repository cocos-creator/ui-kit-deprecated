import cc from 'engine-3d';
import enums from './enums';
import ButtonComponent from './button-component';
const { vec3,quat } = cc.math;

export default class ScrollBar extends ButtonComponent {
  constructor() {
    super();
    this._handle = null;
    this._direction = enums.HORIZONTAL;
    this._reverse = false;
    this._scrollPos = 0.0;// [0,1]
    this._value = 0.2;// [0,1]
    this._limitValue = 1.0;

    this._dragArea = null;
    this._handleContainer = null;
    this._handleWidget = null;
    this._containerWidget = null;
    this._dragging = false;
    this._startPos = vec3.create();
    this._offset = vec3.create();
    this._dirOffset = vec3.create();
    this._scrollBarListerners = [];

    this._onHandleDown = (evt) => {
      if (evt && evt.button === 'left') {
        this._startPos = vec3.new(evt.mouseX, evt.mouseY, 0);
        this._dragging = true;
      }
    }

    this._onHandleMove = (evt) => {
      if (evt && evt.button === 0) {
        if (this._dragging) {
          this._updateValue(evt);
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
        if (!this._dragging) {
          console.log('clk bar');
          this._clkBar(evt);
        }
      }
    }

    this._onContainerMove = (evt) => {
      // evt.button === 0???
      if (evt && evt.button === 0) {
        if (this._dragging) {
          this._updateValue(evt);
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
          this._updateValue(evt);
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
    this._calculate();
    if (this._interactable) {
      this._handle.on('mousedown', this._onHandleDown);
      this._handle.on('mousemove', this._onHandleMove);
      this._handle.on('mouseup', this._onHandleUp);
      this._handleContainer.on('mousedown', this._onContainerDown);
      this._handleContainer.on('mousemove', this._onContainerMove);
      this._handleContainer.on('mouseup', this._onContainerUp);
      this._dragArea.on('mousemove', this._onMouseMove);
      this._dragArea.on('mouseup', this._onMouseUp);
    }
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

  // temp function
  set dragArea(area) {
    this._dragArea = area;
   }

  set handle(handle) {
    this._handle = handle;
    this._handleContainer = this._handle.parent;
    this._updateWidget();
   }

  get direction() {
    return this._direction;
  }

  set direction(dir) {
    if (dir === this._direction) {
      return;
    }

    this._direction = dir;
    this._repaint();
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    cc.math.clamp01(this._value);
    this._calculate();
  }

  get scrollPos() {
    return this._scrollPos;
  }

  set scrollPos(val) {
    this._scrollPos = val;
    cc.math.clamp01(this._scrollPos);
    this._calculate();
  }

  set limitValue(val) {
    this._limitValue = val;
  }

  get progress() {
    return this._progressPr() * this._limitValue;
  }

  get progressPr() {
    if (this._direction === enums.HORIZONTAL) {
      return this._handleWidget.anchorRight - this._handleWidget.anchorLeft;
    } else {
      return this._handleWidget.anchorTop - this._handleWidget.anchorBottom;
    }
  }

  set reverse(val) {
    this._reverse = val;
    this.scrollPos = !this._reverse ? 0 : 1;
  }

  _updateWidget() {
    this._handleWidget = this._handle.getComp('Widget');
    this._containerWidget = this._handleContainer.getComp('Widget');
  }

  _updateValue(evt) {
    if (!this._handle || this._value <= 0.0001) {
      return;
    }

    let ratio = this._getRatio();
    let tempOffset = vec3.create();
    vec3.copy(tempOffset, this._offset);

    let rect = this._containerWidget._rect;
    let mouse = vec3.new(evt.mouseX, evt.mouseY, 0);
    vec3.subtract(this._offset, mouse, this._startPos);
    vec3.subtract(tempOffset, this._offset, tempOffset);
    this._dirOffset = vec3.new(rect.w * ratio.x, rect.h * ratio.y, 0);
    let value = vec3.dot(this._dirOffset, tempOffset);
    value = vec3.dot(this._dirOffset, tempOffset) / Math.sqrt(Math.pow(this._dirOffset.x, 2) + Math.pow(this._dirOffset.y, 2));
    value = this._direction === enums.HORIZONTAL ? value / rect.w : value / rect.h;
    if (this._direction === enums.HORIZONTAL) {
      if (value > 0) {
        if (this._handleWidget.anchorRight + value > 1) {
          value = 1 - this._handleWidget.anchorRight;
        }
      } else {
        if (this._handleWidget.anchorLeft + value < 0) {
          value = -this._handleWidget.anchorLeft;
        }
      }
    } else {
      if (value > 0) {
        if (this._handleWidget.anchorTop + value > 1) {
          value = 1 - this._handleWidget.anchorTop;
        }
      } else {
        if (this._handleWidget.anchorBottom + value < 0) {
          value = -this._handleWidget.anchorBottom;
        }
      }
    }

    this.scrollPos = this._scrollPos + value;
  }

  _clkBar(evt) {
    if (!this._handle || this._value <= 0.0001) {
      return;
    }

    let wpos = vec3.create();
    this._handle.getWorldPos(wpos);
    let mouse = vec3.new(evt.mouseX, evt.mouseY, 0);
    let offset = vec3.create();
    vec3.subtract(offset, mouse, wpos);

    let value = 0.0;
    if (this._direction === enums.HORIZONTAL) {
      let x = 0.0;
      if (offset.x > 0) {
        x = 1 - this._handleWidget.anchorRight;
        if (x > this._value) {
          value = this._value;
        } else {
          value = x;
        }
      } else {
        x = this._handleWidget.anchorLeft;
        if (x > this._value) {
          value = -this._value;
        } else {
          value = -x;
        }
      }
      // this._handleWidget.anchorLeft += value;
      // this._handleWidget.anchorRight += value;
    } else {
      let y = 0.0;
      if (offset.y > 0) {
        y = 1 - this._handleWidget.anchorTop;
        if (y > this._value) {
          value = this._value;
        } else {
          value = y;
        }
      } else {
        y = this._handleWidget.anchorBottom;
        if (y > this._value) {
          value = -this._value;
        } else {
          value = -y;
        }
      }
      // this._handleWidget.anchorBottom += value;
      // this._handleWidget.anchorTop += value;
    }
    this.scrollPos = this._scrollPos + value;
  }

  _repaint() {
    this._updateWidget();
    let widget = this._entity.getComp('Widget');
    let y = widget.height;
    widget.height = widget.width;
    widget.width = y;
    y = this._handleWidget.height;
    this._handleWidget.height = this._handleWidget.width;
    this._handleWidget.width = y;
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

  _calculate() {
    let min = { 0: 0, 1: 0 };
    let max = { 0: 1, 1: 1 };
    let num = this._scrollPos * (1 - this._value);
    if (this._reverse) {
      min[this._direction] = 1 - num - this._value;
      max[this._direction] = 1 - num;
    } else {
      min[this._direction] = num;
      max[this._direction] = num + this._value;
    }

    this._handleWidget.setAnchors(min[0], min[1], max[0], max[1]);
   }
}