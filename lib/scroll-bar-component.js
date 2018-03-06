import cc from 'engine-3d';
import ButtonComponent from './button-component';
const { vec3, quat } = cc.math;

export default class ScrollBarComponent extends ButtonComponent {
  constructor() {
    super();
    this._handle = null;
    this._direction = 'horizontal';
    this._reverse = false;
    this._value = 0.0;// [0,1]
    this._size = 0.0;// [0,1]

    this._handleContainer = null;
    this._handleWidget = null;
    this._containerWidget = null;
    this._dragging = false;
    this._normalizeValue = 0.0;
    this._startPos = vec3.create();
    this._offset = vec3.create();
    this._dirOffset = vec3.create();

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
      if (e.button === 'left') {
        super._onMouseUp(e);
        this._dragging = false;
      }
    }.bind(this);

    // touch events
    this._onHandleTouchStart = (e) => {
      if (this._fingerId !== -1) {
        return;
      }

      super._onTouchStart(e);
      this._startPos = vec3.new(e.x, e.y, 0);
      this._dragging = true;
      this._offset = vec3.create();
    }

    this._onContainerTouchStart = (e) => {
      if (this._fingerId !== -1) {
        return;
      }

      super._onTouchStart(e);
      this._clkBar(vec3.new(e.x, e.y, 0));
    }

    this._onTouchMove = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();
      if (e.id === this._fingerId) {
        if (this._dragging) {
          this._updateValue(vec3.new(e.x, e.y, 0));
        }
      }
    }

    this._onTouchEnd = (e) => {
      if (e.id !== this._fingerId) {
        return;
      }

      super._onTouchEnd(e);
      this._fingerId = -1;
      this._dragging = false;
    }
  }

  onEnable() {
    let dragArea = this._widget.system._screens[0]._entity;
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
    dragArea.on('mousemove', this._onMouseMove);
    dragArea.on('mouseup', this._onMouseUp);

    this._handle.on('touchstart', this._onHandleTouchStart);
    this._handle.on('touchmove', this._onTouchMove);
    this._handle.on('touchend', this._onTouchEnd);
    this._handleContainer.on('touchstart', this._onContainerTouchStart);
    this._handleContainer.on('touchmove', this._onTouchMove);
    this._handleContainer.on('touchend', this._onTouchEnd);
    dragArea.on('touchmove', this._onTouchMove);
    dragArea.on('touchend', this._onTouchEnd);
  }

  onDisable() {
    let dragArea = this._widget.system._screens[0]._entity;
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
    dragArea.off('mousemove', this._onMouseMove);
    dragArea.off('mouseup', this._onMouseUp);

    this._handle.off('touchstart', this._onHandleTouchStart);
    this._handle.off('touchmove', this._onTouchMove);
    this._handle.off('touchend', this._onTouchEnd);
    this._handleContainer.off('touchstart', this._onContainerTouchStart);
    this._handleContainer.off('touchmove', this._onTouchMove);
    this._handleContainer.off('touchend', this._onTouchEnd);
    dragArea.off('touchmove', this._onTouchMove);
    dragArea.off('touchend', this._onTouchEnd);
  }

  _updateWidget() {
    this._handleWidget = this._handle.getComp('Widget');
    this._containerWidget = this._handleContainer.getComp('Widget');
  }

  _updateValue(movePos) {
    if (!this._handle || this._size <= 0.0001) {
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

      this._normalizeValue = (this._handleWidget.anchorLeft + value) / (1 - this._size);
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

      this._normalizeValue = (this._handleWidget.anchorBottom + value) / (1 - this._size);
    }

    this.value = this._reverse ? 1 - this._normalizeValue : this._normalizeValue;
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
        value = left + this._size + this._size > 1 ? 1 - left - this._size : this._size;
      } else {
        value = -(left - this._size < 0 ? left : this._size);
      }

      this._normalizeValue = (this._handleWidget.anchorLeft + value) / (1 - this._size);
    } else {
      let bottom = this._handleWidget.anchorBottom;
      if (offset.y > 0) {
        value = bottom + this._size + this._size > 1 ? 1 - bottom - this._size : this._size;
      } else {
        value = -(bottom - this._size < 0 ? bottom : this._size);
      }

      this._normalizeValue = (this._handleWidget.anchorBottom + value) / (1 - this._size);
    }

    this.value = this._reverse ? 1 - this._normalizeValue : this._normalizeValue;
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
    let num = this._normalizeValue * (1 - this._size);
    num = Math.round(parseFloat(num) * 100) / 100;
    let dirValue = this._direction === 'horizontal' ? 0 : 1;
    min[dirValue] = num;
    max[dirValue] = num + this._size;

    this._handleWidget.setAnchors(min[0], min[1], max[0], max[1]);
  }
}

ScrollBarComponent.schema = {
  handle: {
    type: 'object',
    default: null,
    set(val) {
      this._handle = val;
      this._handleContainer = this._handle.parent;
      this._updateWidget();
    }
  },

  direction: {
    type: 'enums',
    default: 'horizontal',
    options: ['horizontal', 'vertical'],
    set(val) {
      if (val === this._direction) {
        return;
      }

      this._direction = val;
    }
  },

  size: {
    type: 'number',
    default: 0.0,
    set(val) {
      if (this._size === val) {
        return;
      }

      this._size = cc.math.clamp01(val);
      this._updateHandle();
    },
    get() {
      this._size = Math.round(parseFloat(this._size) * 100) / 100;
      return this._size;
    }
  },

  value: {
    type: 'number',
    default: 0.0,
    set(val) {
      if (this._value === val) {
        return;
      }

      this._value = cc.math.clamp01(val);
      this._normalizeValue = this._reverse ? 1 - this._value : this._value;
      this._updateHandle();
      this.dispatch('valueChanged');
    },
    get() {
      this._value = Math.round(parseFloat(this._value) * 100) / 100;
      return this._value;
    }
  },

  reverse: {
    type: 'boolean',
    default: false,
    set(val) {
      if (this._reverse === val) {
        return;
      }

      this._reverse = val;
      this.value = 0;
    }
  }
}