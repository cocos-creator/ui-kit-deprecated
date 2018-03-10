import cc from 'engine-3d';
import Bounds from './bound';
import UIElement from './ui-element-component';
const { vec2, vec3, mat4 } = cc.math;

export default class ScrollViewComponent extends UIElement {
  constructor() {
    super();
    // properties
    this._viewPort = null;
    this._vScroll = null;
    this._hScroll = null;
    this._horizontal = true;
    this._vertical = true;
    this._movementType = 'clamped';
    this._elastic = 0.1;

    // private
    this._widget = null;
    this._viewBound = null;
    this._contentBound = null;
    this._viewWidget = null;
    this._contentWidget = null;
    this._dragging = false;
    this._content = null;
    this._startPos = vec3.create();
    this._startOffset = vec3.create();
    this._outOffset = vec3.create();
    this._fingerId = -1;

    this._onMouseDown = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();
      this._getBound();
      this._startPos = vec3.new(e.mouseX, e.mouseY);
      this._startOffset = vec3.new(this._contentWidget.offsetX, this._contentWidget.offsetY, 0);
      this._dragging = true;
    };

    this._onMouseUp = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();
      this._dragging = false;
    };

    this._onMouseMove = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();
      this._update();
      if (this._dragging) {
        this._onDrag(this._startPos, vec2.new(e.mouseX, e.mouseY));
      }

      //NOTE:need to auto update
      this._lateUpdate();
    };

    // touch events
    this._onContentTouchStart = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();

      if (this._fingerId !== -1) {
        return;
      }

      this._fingerId = e.id;
      this._getBound();
      this._startPos = vec3.new(e.x, e.y);
      this._startOffset = vec3.new(this._contentWidget.offsetX, this._contentWidget.offsetY, 0);
      this._dragging = true;
    };

    this._onTouchMove = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();
      this._update();
      if (e.id === this._fingerId) {
        if (this._dragging) {
          this._onDrag(this._startPos, vec2.new(e.x, e.y));
        }
      }
      //NOTE:need to auto update
      this._lateUpdate();
    };

    this._onTouchEnd = (e) => {
      if (this._enabled === false) {
        return;
      }

      e.stop();

      if (e.id !== this._fingerId) {
        return;
      }

      this._fingerId = -1;
      this._dragging = false;
    };

    this._updateScrollView = (e) => {
      if (e.component._dragging === false) {
        return;
      }
      let offset = 0.00, moveOffset = 0.00;
      this._getBound();
      if (e.component.direction === 'horizontal') {
        if (this._hScroll) {
          offset = this._contentBound.size.x - this._viewBound.size.x;
          offset = this._viewBound.min.x - this._hScroll.value * offset;
          moveOffset = this._contentWidget.offsetX - this._contentBound.min.x + offset;
          if (Math.abs(this._contentWidget.offsetX - moveOffset) > 0.01) {
            this._contentWidget.offsetX = moveOffset;
          }
        }
      } else {
        if (this._vScroll) {
          offset = this._contentBound.size.y - this._viewBound.size.y;
          offset = this._viewBound.max.y + this._vScroll.value * offset;
          moveOffset = this._contentWidget.offsetY - this._contentBound.max.y + offset;
          if (Math.abs(this._contentWidget.offsetY - moveOffset) > 0.01) {
            this._contentWidget.offsetY = moveOffset;
          }
        }
      }
    };
  }

  onInit() {
    this._widget = this._entity.getComp('Widget');

    // TODO: need to the function of auto update
    let dragArea = this._widget.system._screens[0]._entity;   
    dragArea.on('mousemove', this._onMouseMove);
    dragArea.on('mouseup', this._onMouseUp);

    dragArea.on('touchmove', this._onTouchMove);
    dragArea.on('touchend', this._onTouchEnd);
  }

  _registerContent() {
    this._content.on('mousedown', this._onMouseDown);
    this._content.on('mousemove', this._onMouseMove);
    this._content.on('mouseup', this._onMouseUp);

    this._content.on('touchstart', this._onContentTouchStart);
    this._content.on('touchmove', this._onTouchMove);
    this._content.on('touchend', this._onTouchEnd);
  }
  
  _unregisterContent() {
    this._content.off('mousedown', this._onMouseDown);
    this._content.off('mousemove', this._onMouseMove);
    this._content.off('mouseup', this._onMouseUp);

    this._content.off('touchstart', this._onContentTouchStart);
    this._content.off('touchmove', this._onTouchMove);
    this._content.off('touchend', this._onTouchEnd);
  }

  _updateWidgetData() {
    this._contentWidget = this._content.getComp('Widget');
    this._viewWidget = this._viewPort.getComp('Widget');
  }

  _update() {
    this._getBound();
  }

  _onDrag(start, target) {
    let offset = { x: target.x - start.x, y: target.y - start.y, z: 0 };
    let delta = { x: 0, y: 0 };
    if (this._horizontal) {
      delta.x = (offset.x + this._startOffset.x - this._contentWidget.offsetX);
      this._contentWidget.offsetX = offset.x + this._startOffset.x;
    }

    if (this._vertical) {
      delta.y = (offset.y + this._startOffset.y - this._contentWidget.offsetY);
      this._contentWidget.offsetY = offset.y + this._startOffset.y;
    }

    this._getOutOffset(vec3.new(delta.x, delta.y, 0));
    let rubberValue = 0;
    if (this._movementType === 'elastic') {
      if (this._outOffset.x !== 0) {
        // rubberValue = (1 - 1 / (Math.abs(this._outOffset.x) * 0.55 / this._viewBound.size.x + 1)) * this._viewBound.size.x * (this._outOffset.x < 0 ? -1 : 1);
        rubberValue = (this._outOffset.x < 0 ? -1 : 1) * Math.abs(this._outOffset.x) * 0.75;
        this._contentWidget.offsetX = this._contentWidget.offsetX + rubberValue;
      }

      if (this._outOffset.y !== 0) {
        rubberValue = (this._outOffset.y < 0 ? -1 : 1) * Math.abs(this._outOffset.y) * 0.75;
        this._contentWidget.offsetY = this._contentWidget.offsetY + rubberValue;
      }
    } else if (this._movementType === 'clamped') {
      this._contentWidget.offsetX += this._outOffset.x;
      this._contentWidget.offsetY += this._outOffset.y;
      this._outOffset = vec3.new(0, 0, 0);
    }

    this._updateScrollBar();
  }

  _lateUpdate() {
    this._getOutOffset(vec3.create());
    if (!this._dragging) {
      let v = { x: this._outOffset.x, y: this._outOffset.y, z: 0 };
      if (!vec3.equals(this._outOffset, vec3.create())) {
        if (v.x !== 0) {
          if (this._movementType === 'elastic') {
            this._contentWidget.offsetX = this._smoothBack(this._contentWidget.offsetX, this._contentWidget.offsetX + v.x);
          } else if (this._movementType === 'clamped') {
            this._contentWidget.offsetX = this._contentWidget.offsetX + v.x;
          }
        }

        if (v.y !== 0) {
          if (this._movementType === 'elastic') {
              this._contentWidget.offsetY = this._smoothBack(this._contentWidget.offsetY, this._contentWidget.offsetY + v.y);
          } else if (this._movementType === 'clamped') {
            this._contentWidget.offsetY = this._contentWidget.offsetY + v.y;
          }
        }

        if (this._movementType === 'clamped') {
          this._outOffset = vec3.create();
         }

        this._updateScrollBar();
      }
    }
  }

  _smoothBack(current, target, velocity) {
    let deltaTime = 0.2;
    let smoothTime = Math.max(0.0001, this._elastic);
    let num = 2 / smoothTime;
    let num2 = num * deltaTime;
    let num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
    let num4 = current - target;
    let num5 = target;
    let num6 = 100 * smoothTime;
    num4 = cc.math.clamp(num4, -num6, num6);
    target = current - num4;
    let num7 = (+ num * num4) * deltaTime;
    let num8 = target + (num4 + num7) * num3;
    if (num5 - current > 0 === num8 > num5)
    {
      num8 = num5;
      velocity = (num8 - num5) / deltaTime;
    }

    num8 = Math.round(num8 * 100) / 100;

    return num8;
  }

  _getOutOffset(delta) {
    let outOffset = { x: 0, y: 0, z: 0 };
    if (this._movementType === 'unrestricted') {
      return this._outOffset = vec3.create();
    } else {
      let min = { x: this._contentBound.min.x + delta.x, y: this._contentBound.min.y + delta.y };
      let max = { x: this._contentBound.max.x + delta.x, y: this._contentBound.max.y + delta.y };
      if (this._viewBound.min.x < min.x) {
        outOffset.x = this._viewBound.min.x - min.x;
      } else if (this._viewBound.max.x > max.x) {
        outOffset.x = this._viewBound.max.x - max.x;
      }
      outOffset.x = Math.round(outOffset.x * 100) / 100;

      if (this._viewBound.min.y < min.y) {
        outOffset.y = this._viewBound.min.y - min.y;
      } else if (this._viewBound.max.y > max.y) {
        outOffset.y = this._viewBound.max.y - max.y;
      }

      this._contentBound.setMinMax(min, max);
      this._outOffset = vec3.new(outOffset.x, outOffset.y, 0);
    }
  }

  _getBound() {
    if (!this._content) {
      console.warn('There are not a content');
      return new Bounds(vec3.create(), vec3.create());
    }

    this._viewBound = new Bounds(vec3.create(), vec3.new(this._viewWidget._rect.w, this._viewWidget._rect.h, 0));

    let corner = [];
    this._contentWidget = this._content.getComp('Widget');
    this._viewWidget = this._viewPort.getComp('Widget');
    let lpos = this._content.lpos;
    corner[0] = vec3.new(lpos.x - this._contentWidget.width * this._contentWidget.pivotX, lpos.y + this._contentWidget.height * (1 - this._contentWidget.pivotY), 0.0);
    corner[1] = vec3.new(lpos.x - this._contentWidget.width * this._contentWidget.pivotX, lpos.y - this._contentWidget.height * this._contentWidget.pivotY, 0.0);
    corner[2] = vec3.new(lpos.x + this._contentWidget.width * (1 - this._contentWidget.pivotX), lpos.y - this._contentWidget.height * this._contentWidget.pivotY, 0.0);
    corner[3] = vec3.new(lpos.x + this._contentWidget.width * (1 - this._contentWidget.pivotX), lpos.y + this._contentWidget.height * (1 - this._contentWidget.pivotY), 0.0);
    //TODO:need rotation matrix later

    let min = vec3.new(3.40E+38, 3.40E+38, 3.40E+38);
    let max = vec3.new(-3.40E+38, -3.40E+38, -3.40E+38);
    for (let i = 0; i < 4; i++) {
      vec3.min(min, min, corner[i]);
      vec3.max(max, max, corner[i]);
    }

    this._contentBound = new Bounds(min, vec3.create());
    this._contentBound.encapsulate(max);

    let sizeOffset = vec3.create();
    vec3.subtract(sizeOffset, this._viewBound.size, this._contentBound.size);
    let tempMin = { x: min.x, y: min.y, z: min.z };
    let tempMax = { x: max.x, y: max.y, z: max.z };
    if (sizeOffset.x > 0) {
      tempMin.x -= this._contentWidget.pivotX * sizeOffset.x;
      tempMax.x += (1 - this._contentWidget.pivotX) * sizeOffset.x;
    }

    if (sizeOffset.y > 0) {
      tempMin.y -= this._contentWidget.pivotY * sizeOffset.y;
      tempMax.y += (1 - this._contentWidget.pivotY) * sizeOffset.y;
    }

    min = vec3.new(tempMin.x, tempMin.y, tempMin.z);
    max = vec3.new(tempMax.x, tempMax.y, tempMax.z);
    this._contentBound.setMinMax(min, max);

    let state = this._viewWidget._rect.w > this._contentWidget._rect.w ? false : true;
    if (this._hScroll) {
      let hScrollWidget = this._hScroll._entity.getComp('Widget');
      if (this._hScroll._entity.enabled !== state) {
        this._hScroll._entity.enabled = state;
        this._viewWidget.marginBottom = state ? hScrollWidget._rect.h : 0;
        if (this._vScroll) {
          let vScrollWidget = this._vScroll._entity.getComp('Widget');
          vScrollWidget.marginBottom = state ? hScrollWidget._rect.h : 0;
        }
      }
    }

    state = this._viewWidget._rect.h > this._contentWidget._rect.h ? false : true;
    if (this._vScroll) {
      let vScrollWidget = this._vScroll._entity.getComp('Widget');
      if (this._vScroll._entity.enabled !== state) {
        this._vScroll._entity.enabled = state;
        this._viewWidget.marginRight = state ? vScrollWidget._rect.w : 0;
        if (this._hScroll) {
          let hScrollWidget = this._hScroll._entity.getComp('Widget');
          hScrollWidget.marginRight = state ? vScrollWidget._rect.w : 0;
        }
      }
    }
  }

  _updateScrollBar() {
    if (this._hScroll) {
      if (this._contentBound.size.x > this._viewBound.size.y) {
        this._hScroll.size = cc.math.clamp01((this._viewBound.size.x - Math.abs(this._outOffset.x)) / this._contentBound.size.x);
        let scrollAnchor = (this._viewBound.min.x - this._contentBound.min.x) / (this._contentBound.size.x - this._viewBound.size.x);
        this._hScroll.value = scrollAnchor;
      } else {
        this._hScroll.size = 1;
        this._hScroll.value = 0;
      }
    }

    if (this._vScroll) {
      if (this._contentBound.size.y > this._viewBound.size.y) {
        this._vScroll.size = cc.math.clamp01((this._viewBound.size.y - Math.abs(this._outOffset.y)) / this._contentBound.size.y);
        let scrollAnchor = -(this._viewBound.max.y - this._contentBound.max.y) / (this._contentBound.size.y - this._viewBound.size.y);
        this._vScroll.value = scrollAnchor;
      } else {
        this._vScroll.size = 1;
        this._vScroll.value = 0;
      }
    }
  }
}

ScrollViewComponent.schema = {
  horizontal: {
    type: 'boolean',
    default: true,
  },

  vertical: {
    type: 'boolean',
    default: true,
  },

  content: {
    type: 'object',
    default: null,
    set(val) {
      if (this._content === val) {
        return;
      }

      if (this._content) { 
        this._unregisterContent();
      }

      this._content = val;
      if (!this._content) {
        console.warn('Content cannot be null');
      } else {
        this._registerContent();
      }

      this._contentWidget = this._content.getComp('Widget');
    }
  },

  viewPort: {
    type: 'object',
    default: null,
    set(val) {
      if (this._viewPort === val) {
        return;
      }

      this._viewPort = val;
      if (!this._viewPort) {
        console.warn('ViewPort cannot be null');
      }

      this._viewWidget = this._viewPort.getComp('Widget');
    }
  },

  movementType: {
    type: 'enums',
    default: 'clamped',
    options: ['unrestricted', 'elastic', 'clamped'],
  },

  elastic: {
    type: 'number',
    default: 0.1,
  },

  vScroll: {
    type: 'object',
    default: null,
    set(val) {
      if (this._vScroll && this._vScroll._entity === val) {
        return;
      }

      if (this._vScroll) {
        this._vScroll._entity.off('valueChanged', this._updateScrollView);
      }

      this._vScroll = val.getComp('ScrollBar');
      if (this._vScroll) {
        this._vScroll._entity.on('valueChanged', this._updateScrollView);
      }

      this._vScroll.reverse = true;
    }
  },

  hScroll: {
    type: 'object',
    default: null,
    set(val) {
      if (this._hScroll && this._hScroll._entity === val) {
        return;
      }

      if (this._hScroll) {
        this._hScroll._entity.off('valueChanged', this._updateScrollView);
      }

      this._hScroll = val.getComp('ScrollBar');
      if (this._hScroll) {
        this._hScroll._entity.on('valueChanged', this._updateScrollView);
      }
    }
  }
}