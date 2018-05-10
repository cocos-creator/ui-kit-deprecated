import cc from 'engine-3d';
import Bounds from './bound';
import UIElement from './ui-element-component';
const { vec2, vec3, mat4 } = cc.math;

export default class ScrollViewComponent extends UIElement {
  constructor() {
    super();
    this._widget = null;
    this._viewBound = null;
    this._contentBound = null;
    this._dragging = false;
    this._startPos = vec3.create();
    this._startOffset = vec3.create();
    this._outOffset = vec3.create();
    this._fingerId = -1;

    this._onMouseDown = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
        return;
      }

      e.stop();
      this._getBound();
      this._startPos = vec3.new(e.mouseX, e.mouseY);
      this._startOffset = this._getCalculateOffset();
      this._dragging = true;
    };

    this._onMouseUp = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
        return;
      }

      e.stop();
      this._dragging = false;
    };

    this._onMouseMove = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
    this._onTouchMove = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
        return;
      }

      e.stop();

      if (this._fingerId !== -1) {
        return;
      }

      this._fingerId = e.id;
      this._getBound();
      this._startPos = vec3.new(e.x, e.y);
      this._startOffset = this._getCalculateOffset();
      this._dragging = true;
    };

    this._onTouchMove = (e) => {
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
      if (this._enabled === false || this._entity.enabledInHierarchy === false) {
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
      let calOffset = this._getCalculateOffset();
      if (e.component.direction === 'horizontal') {
        if (this._hScrollBar) {
          offset = this._contentBound.size.x - this._viewBound.size.x;
          offset = this._viewBound.min.x - this._hScrollBar.value * offset;
          moveOffset = calOffset.x - this._contentBound.min.x + offset;
          if (Math.abs(calOffset.x - moveOffset) > 0.01) {
            this._setHorizontalOffset(moveOffset);
          }
        }
      } else {
        if (this._vScrollBar) {
          offset = this._contentBound.size.y - this._viewBound.size.y;
          offset = this._viewBound.max.y + this._vScrollBar.value * offset;
          moveOffset = calOffset.y - this._contentBound.max.y + offset;
          if (Math.abs(calOffset.y - moveOffset) > 0.01) {
            this._setVerticalOffset(moveOffset);
          }
        }
      }
    };
  }

  onInit() {
    this._entity.once('ready', () => {
      this._widget = this._entity.getComp('Widget');
      if (this._vScrollBar) {
        this._vScrollBar._reverse = true;
        this._vScrollBar._entity.on('valueChanged', this._updateScrollView);
      }

      if (this._hScrollBar) {
        this._hScrollBar._entity.on('valueChanged', this._updateScrollView);
      }

      // TODO: need to the function of auto update
      let dragArea = this._widget.system._screens[0]._entity;
      dragArea.on('mousemove', this._onMouseMove);
      dragArea.on('mouseup', this._onMouseUp);

      dragArea.on('touchmove', this._onTouchMove);
      dragArea.on('touchend', this._onTouchEnd);
    });
  }

  onDestroy() {
    this._vScrollBar._entity.off('valueChanged', this._updateScrollView);
    this._hScrollBar._entity.off('valueChanged', this._updateScrollView);
  }

  _update() {
    this._getBound();
    // adjust the size of the scrollbar according to the size of viewbound and contentbound.
    this._adjustScrollBar();
    this._updateScrollBar();
  }

  _onDrag(start, target) {
    let offset = { x: target.x - start.x, y: target.y - start.y, z: 0 };
    let delta = { x: 0, y: 0, z: 0 };
    let current = { x: 0, y: 0 };
    let calOffset = this._getCalculateOffset();
    if (this._horizontal) {
      current.x = offset.x + this._startOffset.x;
      delta.x = current.x - calOffset.x;
    }

    if (this._vertical) {
      current.y = offset.y + this._startOffset.y;
      delta.y =  current.y - calOffset.y;
    }

    this._getOutOffset(vec3.new(delta.x, delta.y, 0));
    current.x += this._outOffset.x;
    current.y += this._outOffset.y;
    if (this._movementType === 'elastic') {
      let rubberValue = 0;
      delta = { x: 0, y: 0 };
      if (this._outOffset.x !== 0) {
        // rubberValue = (1 - 1 / (Math.abs(this._outOffset.x) * 0.55 / this._viewBound.size.x + 1)) * this._viewBound.size.x * (this._outOffset.x < 0 ? -1 : 1);
        rubberValue = (this._outOffset.x < 0 ? -1 : 1) * Math.abs(this._outOffset.x) * 0.55;
        current.x -= rubberValue;
        delta.x = rubberValue - this._outOffset.x;
      }

      if (this._outOffset.y !== 0) {
        rubberValue = (this._outOffset.y < 0 ? -1 : 1) * Math.abs(this._outOffset.y) * 0.55;
        current.y -= rubberValue;
        delta.y = rubberValue - this._outOffset.y;
      }

      if (delta.x !== 0 || delta.y !== 0) {
        this._getOutOffset(vec3.new(delta.x, delta.y, 0));
      }
    }

    this._setHorizontalOffset(current.x);
    this._setVerticalOffset(current.y);
    this._getBound();
    this._updateScrollBar();
  }

  _lateUpdate() {
    this._getOutOffset(vec3.create());
    if (!this._dragging) {
      let v = { x: this._outOffset.x, y: this._outOffset.y, z: 0 };
      if (!vec3.equals(this._outOffset, vec3.create())) {
        let calOffset = this._getCalculateOffset();
        if (v.x !== 0) {
          if (this._movementType === 'elastic') {
            this._setHorizontalOffset(this._smoothBack(calOffset.x, calOffset.x + v.x));
          } else if (this._movementType === 'clamped') {
            this._setHorizontalOffset(calOffset.x + v.x);
          }
        }

        if (v.y !== 0) {
          if (this._movementType === 'elastic') {
            this._setVerticalOffset(this._smoothBack(calOffset.y, calOffset.y + v.y));
          } else if (this._movementType === 'clamped') {
            this._setVerticalOffset(calOffset.y + v.y);
          }
        }

        if (this._movementType === 'clamped') {
          this._outOffset = vec3.create();
        }

        this._updateScrollBar();
      }
    }
  }

  _smoothBack(current, target) {
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
    if (num5 - current > 0 === num8 > num5) {
      num8 = num5;
    }

    num8 = Math.round(num8 * 100) / 100;

    return num8;
  }

  _getOutOffset(delta) {
    let outOffset = { x: 0, y: 0, z: 0 };
    if (this._movementType === 'unrestricted') {
      this._outOffset = vec3.create();
    } else {
      let min = { x: this._contentBound.min.x + delta.x, y: this._contentBound.min.y + delta.y };
      let max = { x: this._contentBound.max.x + delta.x, y: this._contentBound.max.y + delta.y };
      if (this._horizontal) {
        if (this._viewBound.min.x < min.x) {
          outOffset.x = this._viewBound.min.x - min.x;
        } else if (this._viewBound.max.x > max.x) {
          outOffset.x = this._viewBound.max.x - max.x;
        }
        outOffset.x = Math.round(outOffset.x * 100) / 100;
      }

      if (this._vertical) {
        if (this._viewBound.min.y < min.y) {
          outOffset.y = this._viewBound.min.y - min.y;
        } else if (this._viewBound.max.y > max.y) {
          outOffset.y = this._viewBound.max.y - max.y;
        }
        outOffset.y = Math.round(outOffset.y * 100) / 100;
      }

      this._contentBound.setMinMax(vec3.new(min.x, min.y, 0), vec3.new(max.x, max.y, 0));
      this._outOffset = vec3.new(outOffset.x, outOffset.y, 0);
    }
  }

  _getBound() {
    if (!this._content) {
      console.warn('There are not a content');
      return new Bounds(vec3.create(), vec3.create());
    }

    let viewRect = this._viewPort._rect;
    this._viewBound = new Bounds(vec3.new(viewRect.x + viewRect.w / 2, viewRect.y + viewRect.h / 2), vec3.new(viewRect.w, viewRect.h, 0));
    let temp = [];
    let lcorner = [];

    let lpos = this._content._entity.lpos;
     //TODO:need rotation matrix later
    lcorner[1] = vec3.new(lpos.x + this._content._rect.x, lpos.y + this._content._rect.y, 0);
    lcorner[0] = vec3.new(lcorner[1].x, lcorner[1].y + this._content._rect.h, 0);
    lcorner[2] = vec3.new(lcorner[1].x + this._content._rect.w, lcorner[1].y, 0);
    lcorner[3] = vec3.new(lcorner[1].x + this._content._rect.w, lcorner[1].y + this._content._rect.h, 0);

    let min = vec3.new(3.40E+38, 3.40E+38, 3.40E+38);
    let max = vec3.new(-3.40E+38, -3.40E+38, -3.40E+38);
    for (let i = 0; i < 4; i++) {
      vec3.min(min, min, lcorner[i]);
      vec3.max(max, max, lcorner[i]);
    }

    this._contentBound = new Bounds(min, vec3.create());
    this._contentBound.encapsulate(max);

    let sizeOffset = vec3.create();
    vec3.subtract(sizeOffset, this._viewBound.size, this._contentBound.size);
    let tempMin = { x: min.x, y: min.y, z: min.z };
    let tempMax = { x: max.x, y: max.y, z: max.z };
    // scrolling is not allowed when content size < view size
    // the direction of the content boundary should be expanded through pivot.
    if (sizeOffset.x > 0) {
      tempMin.x -= this._content.pivotX * sizeOffset.x;
      tempMax.x += (1 - this._content.pivotX) * sizeOffset.x;
    }

    if (sizeOffset.y > 0) {
      tempMin.y -= this._content.pivotY * sizeOffset.y;
      tempMax.y += (1 - this._content.pivotY) * sizeOffset.y;
    }

    min = vec3.new(tempMin.x, tempMin.y, tempMin.z);
    max = vec3.new(tempMax.x, tempMax.y, tempMax.z);
    this._contentBound.setMinMax(min, max);
  }


  _setHorizontalOffset(val) {
    if (this._content.anchorLeft === this._content.anchorRight) {
      this._content.offsetX = val;
    } else {
      this._content.marginRight += this._content.marginLeft - val;
      this._content.marginLeft = val;
    }
  }

  _setVerticalOffset(val) {
    if (this._content.anchorBottom === this._content.anchorTop) {
      this._content.offsetY = val;
    } else {
      this._content.marginTop += this._content.marginBottom - val;
      this._content.marginBottom = val;
    }
  }

  _getCalculateOffset() {
    let offset = { x: 0, y: 0 };
    if (this._content.anchorLeft === this._content.anchorRight) {
      offset.x = this._content.offsetX;
    } else {
      offset.x = this._content.marginLeft;
    }

    if (this._content.anchorBottom === this._content.anchorTop) {
      offset.y = this._content.offsetY;
    } else {
      offset.y = this._content.marginBottom;
    }

    return vec3.new(offset.x, offset.y, 0);
  }

  _adjustScrollBar() {
    let state = this._viewPort._rect.w >= this._content._rect.w ? false : true;
    if (this._hScrollBar) {
      let hScrollWidget = this._hScrollBar._entity.getComp('Widget');
      if (this._hScrollBar._entity.enabled !== state) {
        this._hScrollBar._entity.enabled = state;
        this._viewPort.marginBottom = state ? hScrollWidget._rect.h : 0;
        if (this._vScrollBar) {
          let vScrollWidget = this._vScrollBar._entity.getComp('Widget');
          vScrollWidget.marginBottom = state ? hScrollWidget._rect.h : 0;
        }
      }
    }

    state = this._viewPort._rect.h >= this._content._rect.h ? false : true;
    if (this._vScrollBar) {
      let vScrollWidget = this._vScrollBar._entity.getComp('Widget');
      if (this._vScrollBar._entity.enabled !== state) {
        this._vScrollBar._entity.enabled = state;
        this._viewPort.marginRight = state ? vScrollWidget._rect.w : 0;
        if (this._hScrollBar) {
          let hScrollWidget = this._hScrollBar._entity.getComp('Widget');
          hScrollWidget.marginRight = state ? vScrollWidget._rect.w : 0;
        }
      }
    }
   }

  _updateScrollBar() {
    if (this._hScrollBar) {
      if (this._contentBound.size.x > this._viewBound.size.y) {
        this._hScrollBar.size = cc.math.clamp01(this._viewBound.size.x / (this._contentBound.size.x + Math.abs(this._outOffset.x)));
        let scrollAnchor = (this._viewBound.min.x - this._contentBound.min.x) / (this._contentBound.size.x - this._viewBound.size.x);
        this._hScrollBar.value = scrollAnchor;
      } else {
        this._hScrollBar.size = 1;
        this._hScrollBar.value = 0;
      }
    }

    if (this._vScrollBar) {
      if (this._contentBound.size.y > this._viewBound.size.y) {
        this._vScrollBar.size = cc.math.clamp01(this._viewBound.size.y / (this._contentBound.size.y + Math.abs(this._outOffset.y)));
        let scrollAnchor = -(this._viewBound.max.y - this._contentBound.max.y) / (this._contentBound.size.y - this._viewBound.size.y);
        this._vScrollBar.value = scrollAnchor;
      } else {
        this._vScrollBar.size = 1;
        this._vScrollBar.value = 0;
      }
    }
  }
}

ScrollViewComponent.events = {
  'mousedown': '_onMouseDown',
  'mousemove': '_onMouseMove',
  'mouseup': '_onMouseUp',
  'touchstart': '_onTouchStart',
  'touchmove': '_onTouchMove',
  'touchend': '_onTouchEnd'
};

ScrollViewComponent.schema = {
  horizontal: {
    type: 'boolean',
    default: true,
  },

  vertical: {
    type: 'boolean',
    default: true,
  },

  viewPort: {
    type: 'object',
    default: null,
    parse(app, value, propInfo, entities) {
      if (entities) {
        if (propInfo.type === 'object' && value) {
          let entIdx = value.indexOf('e');
          if (entIdx !== -1) {
            value = value.split('e').join('');
          }

          entIdx = parseInt(value);
          return entities[entIdx].getComp('Widget');
        }
      }

      return value;
    },
    set(val) {
      if (this._viewPort === val) {
        return;
      }

      this._viewPort = val;
      if (!this._viewPort) {
        console.warn('ViewPort cannot be null');
      }
    }
  },

  content: {
    type: 'object',
    default: null,
    parse(app, value, propInfo, entities) {
      if (entities) {
        if (propInfo.type === 'object' && value) {
          let entIdx = value.indexOf('e');
          if (entIdx !== -1) {
            value = value.split('e').join('');
          }

          entIdx = parseInt(value);
          return entities[entIdx].getComp('Widget');
        }
      }

      return value;
    },
    set(val) {
      if (this._content === val) {
        return;
      }

      this._content = val;
      if (!this._content) {
        console.warn('Content cannot be null');
      }
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

  vScrollBar: {
    type: 'object',
    default: null,
    parse(app, value, propInfo, entities) {
      if (entities) {
        if (propInfo.type === 'object' && value) {
          let entIdx = value.indexOf('e');
          if (entIdx !== -1) {
            value = value.split('e').join('');
          }

          entIdx = parseInt(value);
          return entities[entIdx].getComp('ScrollBar');
        }
      }

      return value;
    },
    set(val) {
      if (this._vScrollBar === val) {
        return;
      }

      if (this._vScrollBar) {
        this._vScrollBar._entity.off('valueChanged', this._updateScrollView);
      }

      this._vScrollBar = val;
      if (this._vScrollBar) {
        this._vScrollBar._entity.on('valueChanged', this._updateScrollView);
      }

      this._vScrollBar.reverse = true;
    }
  },

  hScrollBar: {
    type: 'object',
    default: null,
    parse(app, value, propInfo, entities) {
      if (entities) {
        if (propInfo.type === 'object' && value) {
          let entIdx = value.indexOf('e');
          if (entIdx !== -1) {
            value = value.split('e').join('');
          }

          entIdx = parseInt(value);
          return entities[entIdx].getComp('ScrollBar');
        }
      }

      return value;
    },
    set(val) {
      if (this._hScrollBar === val) {
        return;
      }

      if (this._hScrollBar) {
        this._hScrollBar._entity.off('valueChanged', this._updateScrollView);
      }

      this._hScrollBar = val;
      if (this._hScrollBar) {
        this._hScrollBar._entity.on('valueChanged', this._updateScrollView);
      }
    }
  }
}