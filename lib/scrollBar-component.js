import cc from 'engine-3d';
import ButtonComponent from './button-component';
const { vec3, quat } = cc.math;

/**
 * !#zh 拖动方向
 * 横向
 * @enum horizontal
 * 纵向
 * @enum vertical
 *
 * !#zh 滚动条类型
 * 滚动条
 * @enum scroll-bar-none
 * 进度条
 * @enum scroll-bar-progress
 */

export default class ScrollBar extends ButtonComponent {
  constructor() {
    super();
    this._handle = null;
    this._direction = 'horizontal';
    this._barType = 'scroll-bar-none';
    this._reverse = false;
    this._scrollAnchor = 0.0;// [0,1]
    this._value = 0.0;// [0,1]
    this._limitValue = 1.0;
    this._scrollView = null;

    this._dragArea = null;
    this._handleContainer = null;
    this._handleWidget = null;
    this._containerWidget = null;
    this._dragging = false;
    this._realScrollAnchor = 0.0;
    this._startPos = vec3.create();
    this._offset = vec3.create();
    this._dirOffset = vec3.create();
    this._valueChangedListeners = [];

    this._onHandleDown = (evt) => {
      if (evt && evt.button === 'left') {
        this._startPos = vec3.new(evt.mouseX, evt.mouseY, 0);
        this._dragging = true;
        this._offset = vec3.create();
      }
    }

    this._onHandleUp = (evt) => {
      if (evt && evt.button === 'left') {
        this._dragging = false;
      }
    }

    this._onContainerDown = (evt) => {
      if (evt && evt.button === 'left') {
        if (!this._dragging) {
          this._clkBar(evt);
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
    if (this._interactable) {
      this._handle.on('mousedown', this._onHandleDown);
      this._handle.on('mouseup', this._onHandleUp);
      this._handleContainer.on('mousedown', this._onContainerDown);
      this._handleContainer.on('mouseup', this._onContainerUp);
      this._dragArea.on('mousemove', this._onMouseMove);
      this._dragArea.on('mouseup', this._onMouseUp);
    }
  }

  onDisable() {
    this._handle.off('mousedown', this._onHandleDown);
    this._handle.off('mouseup', this._onHandleUp);
    this._handleContainer.off('mousedown', this._onContainerDown);
    this._handleContainer.off('mouseup', this._onContainerUp);
    this._dragArea.off('mousemove', this._onMouseMove);
    this._dragArea.off('mouseup', this._onMouseUp);
  }

  // temp function
  set dragArea(area) {
    this._dragArea = area;
  }

  get scrollView() {
    return this._scrollView;
  }

  set scrollView(val) {
    this._scrollView = val;
  }

  get handle() {
    return this._handle;
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
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = cc.math.clamp01(val);
    this._updateHandle();
  }

  get scrollAnchor() {
    return this._scrollAnchor;
  }

  set scrollAnchor(val) {
    val = Math.round(parseFloat(val) * 100) / 100;
    this._scrollAnchor = cc.math.clamp01(val);
    this._realScrollAnchor = this._reverse ? 1 - this._scrollAnchor : this._scrollAnchor;
    this._updateHandle();
    this._emitEventValueChange();
  }

  get barType() {
    return this._barType;
  }

  set barType(val) {
    this._barType = val;
  }

  set limitValue(val) {
    this._limitValue = val;
  }

  get progress() {
    return this._progressPr() * this._limitValue;
  }

  get progressPr() {
    if (this._direction === 'horizontal') {
      return this._handleWidget.anchorRight - this._handleWidget.anchorLeft;
    } else {
      return this._handleWidget.anchorTop - this._handleWidget.anchorBottom;
    }
  }

  set reverse(val) {
    this._reverse = val;
    this.scrollAnchor = 0;
  }

  _updateWidget() {
    this._handleWidget = this._handle.getComp('Widget');
    this._containerWidget = this._handleContainer.getComp('Widget');
  }

  _updateValue(evt) {
    if (!this._handle || this._value <= 0.0001) {
      return;
    }

    if (this._barType !== 'scroll-bar-none') {
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
    let value = 0.0;
    value = vec3.dot(this._dirOffset, tempOffset);
    value = vec3.dot(this._dirOffset, tempOffset) / Math.sqrt(Math.pow(this._dirOffset.x, 2) + Math.pow(this._dirOffset.y, 2));
    value = this._direction === 'horizontal' ? value / rect.w : value / rect.h;
    if (this._direction === 'horizontal') {
      if (value > 0) {
        if (this._handleWidget.anchorRight + value > 1) {
          value = 1 - this._handleWidget.anchorRight;
        }
      } else {
        if (this._handleWidget.anchorLeft + value < 0) {
          value = -this._handleWidget.anchorLeft;
        }
      }

      this._realScrollAnchor = (this._handleWidget.anchorLeft + value) / (1 - this._value);
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

      this._realScrollAnchor = (this._handleWidget.anchorBottom + value) / (1 - this._value);
    }

    this.scrollAnchor = this._reverse ? 1 - this._realScrollAnchor : this._realScrollAnchor;
    this._updateScrollView();
  }

  _clkBar(evt) {
    if (!this._handle) {
      return;
    }

    if (this._barType !== 'scroll-bar-none') {
      return;
    }

    let wpos = vec3.create();
    this._handle.getWorldPos(wpos);
    let mouse = vec3.new(evt.mouseX, evt.mouseY, 0);
    let offset = vec3.create();
    vec3.subtract(offset, mouse, wpos);

    let value = 0.0;
    if (this._direction === 'horizontal') {
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
    }
    this.scrollAnchor = this._scrollAnchor + value;
    this._updateScrollView();
  }

  _getRatio() {
    let wrot = quat.create();
    this._handleContainer.getWorldRot(wrot);
    let ratio = { x: 0, y: 0 };
    let v = this._direction === 'horizontal' ? vec3.new(0, 1, 0) : vec3.new(-1, 0, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.x = v.x;
    v = this._direction === 'horizontal' ? vec3.new(1, 0, 0) : vec3.new(0, 1, 0);
    vec3.transformQuat(v, v, wrot);
    ratio.y = v.y;
    return vec3.new(v.x, v.y, 0);
  }

  _updateHandle() {
    let min = { 0: 0, 1: 0 };
    let max = { 0: 1, 1: 1 };
    let num = this._realScrollAnchor * (1 - this._value);
    num = Math.round(parseFloat(num) * 100) / 100;
    let dirValue = this._direction === 'horizontal' ? 0 : 1;
    min[dirValue] = num;
    max[dirValue] = num + this._value;

    this._handleWidget.setAnchors(min[0], min[1], max[0], max[1]);
  }

  _updateScrollView() {
    if (this._scrollView) {
      this._scrollView.scrollBarUpdate(this._direction);
    }
  }

  _emitEventValueChange() {
    // todo: this may change later
    for (let i = 0; i < this._valueChangedListeners.length; i++) {
      this._valueChangedListeners[i](this);
    }
  }
}