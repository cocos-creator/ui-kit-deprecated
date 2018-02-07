import cc from 'engine-3d';
import ButtonComponent from './button-component';
const { vec3, quat } = cc.math;

/**
 * !#zh 拖动方向
 * 横向
 * @enum horizontal
 * 纵向
 * @enum vertical
 */

export default class ScrollBar extends ButtonComponent {
  constructor() {
    super();
    this._handle = null;
    this._direction = 'horizontal';
    this._reverse = false;
    this._scrollAnchor = 0.0;// [0,1]
    this._value = 0.0;// [0,1]
    this._limitValue = 1.0;
    this._scrollView = null;

    this._handleContainer = null;
    this._handleWidget = null;
    this._containerWidget = null;
    this._dragging = false;
    this._realScrollAnchor = 0.0;
    this._startPos = vec3.create();
    this._offset = vec3.create();
    this._dirOffset = vec3.create();
    this._dragArea = null;

    this._onMouseEnter = function (e) {
      super._onMouseEnter(e);
    }.bind(this);

    this._onMouseLeave = function (e) {
      super._onMouseLeave(e);
    }.bind(this);

    this._onHandleDown = (e) => {
      if (e.button === 'left') {
        super._onMouseDown(e);
        this._startPos = vec3.new(e.mouseX, e.mouseY, 0);
        this._dragging = true;
        this._offset = vec3.create();
      }
    }

    this._onContainerDown = (e) => {
      if (e.button === 'left') {
        if (!this._dragging) {
          super._onMouseDown(e);
          this._clkBar(vec3.new(e.mouseX, e.mouseY, 0));
        }
      }
    }

    this._onMouseMove = function (e) {
      if (e.button === 0) {
        e.stop();
        if (this._dragging) {
          this._updateValue(vec3.new(e.mouseX, e.mouseY, 0));
        }
      }
    }.bind(this);

    this._onMouseUp = function (e) {
      super._onMouseUp(e);
      if (e.button === 'left') {
        this._dragging = false;
      }
    }.bind(this);

    // touch events
    this._onHandleTouchStart = (e) => {
      e.stop();
      this._startPos = vec3.new(e.x, e.y, 0);
      this._dragging = true;
      this._offset = vec3.create();
    }

    this._onContainerTouchStart = (e) => {
      this._clkBar(vec3.new(e.x, e.y, 0));
    }

    this._onTouchMove = (e) => {
      if (this._dragging) {
        e.stop();
        this._updateValue(vec3.new(e.x, e.y, 0));
      }
    }

    this._onTouchEnd = (e) => {
      e.stop();
      this._dragging = false;
    }
  }

  onEnable() {
    this._handle.on('mousedown', this._onHandleDown);
    this._handle.on('mousemove', this._onMouseMove);
    this._handle.on('mouseup', this._onMouseUp);
    this._handle.on('mouseenter', this._onMouseEnter);
    this._handle.on('mouseleave', this._onMouseLeave);
    this._handleContainer.on('mousedown', this._onContainerDown);
    this._handleContainer.on('mousemove', this._onMouseMove);
    this._handleContainer.on('mouseup', this._onMouseMove);
    this._handleContainer.on('mouseenter', this._onMouseEnter);
    this._handleContainer.on('mouseleave', this._onMouseLeave);
    this._dragArea.on('mousemove', this._onMouseMove);
    this._dragArea.on('mouseup', this._onMouseUp);

    this._handle.on('touchstart', this._onHandleTouchStart);
    this._handle.on('touchmove', this._onTouchMove);
    this._handle.on('touchend', this._onTouchEnd);
    this._handleContainer.on('touchstart', this._onContainerTouchStart);
    this._handleContainer.on('touchmove', this._onTouchMove);
    this._handleContainer.on('touchend', this._onTouchEnd);
    this._dragArea.on('touchmove', this._onTouchMove);
    this._dragArea.on('touchend', this._onTouchEnd);
  }

  onDisable() {
    this._handle.off('mousedown', this._onHandleDown);
    this._handle.off('mousemove', this._onMouseMove);
    this._handle.off('mouseup', this._onMouseUp);
    this._handle.off('mouseenter', this._onMouseEnter);
    this._handle.off('mouseleave', this._onMouseLeave);
    this._handleContainer.off('mousedown', this._onContainerDown);
    this._handleContainer.off('mousemove', this._onMouseMove);
    this._handleContainer.off('mouseup', this._onMouseUp);
    this._handleContainer.off('mouseenter', this._onMouseEnter);
    this._handleContainer.off('mouseleave', this._onMouseLeave);
    this._dragArea.off('mousemove', this._onMouseMove);
    this._dragArea.off('mouseup', this._onMouseUp);

    this._handle.off('touchstart', this._onHandleTouchStart);
    this._handle.off('touchmove', this._onTouchMove);
    this._handle.off('touchend', this._onTouchEnd);
    this._handleContainer.off('touchstart', this._onContainerTouchStart);
    this._handleContainer.off('touchmove', this._onTouchMove);
    this._handleContainer.off('touchend', this._onTouchEnd);
    this._dragArea.off('touchmove', this._onTouchMove);
    this._dragArea.off('touchend', this._onTouchEnd);
  }

  set dragArea(val) {
    this._dragArea = val;
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
    this._value = Math.round(parseFloat(this._value) * 100) / 100;
    return this._value;
  }

  set value(val) {
    this._value = cc.math.clamp01(val);
    this._updateHandle();
  }

  get scrollAnchor() {
    this._scrollAnchor = Math.round(parseFloat(this._scrollAnchor) * 100) / 100;
    return this._scrollAnchor;
  }

  set scrollAnchor(val) {
    this._scrollAnchor = cc.math.clamp01(val);
    this._realScrollAnchor = this._reverse ? 1 - this._scrollAnchor : this._scrollAnchor;
    this._updateHandle();
    this.dispatch('change');
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

  _updateValue(movePos) {
    if (!this._handle || this._value <= 0.0001) {
      return;
    }

    let ratio = this._getRatio();
    let tempOffset = vec3.create();
    vec3.copy(tempOffset, this._offset);
    let rect = this._containerWidget._rect;
    let mouse = vec3.new(movePos.x, movePos.y, 0);
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

  _clkBar(movePos) {
    if (!this._handle) {
      return;
    }

    let wpos = vec3.create();
    this._handle.getWorldPos(wpos);
    let mouse = vec3.new(movePos.x, movePos.y, 0);
    let offset = vec3.create();
    vec3.subtract(offset, mouse, wpos);

    let value = 0.0;
    if (this._direction === 'horizontal') {
      let left = this._handleWidget.anchorLeft;
      if (offset.x > 0) {
        value = left + this._value + this._value > 1 ? 1 - left - this._value : this._value;
      } else {
        value = -(left - this._value < 0 ? left : this._value);
      }

      this._realScrollAnchor = (this._handleWidget.anchorLeft + value) / (1 - this._value);
    } else {
      let bottom = this._handleWidget.anchorBottom;
      if (offset.y > 0) {
        value = bottom + this._value + this._value > 1 ? 1 - bottom - this._value : this._value;
      } else {
        value = -(bottom - this._value < 0 ? bottom : this._value);
      }

      this._realScrollAnchor = (this._handleWidget.anchorBottom + value) / (1 - this._value);
    }

    this.scrollAnchor = this._reverse ? 1 - this._realScrollAnchor : this._realScrollAnchor;
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
}