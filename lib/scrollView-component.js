import cc from 'engine-3d';
import Bounds from './bound';
const { vec2, vec3, mat4 } = cc.math;

/**
 * !#zh 滚动视图类型
 * 无限制
 * @enum unrestricted
 * 紧贴
 * @enum clamped
 * 回弹
 * @enum elastic
 */

export default class ScrollViewComponent extends cc.ScriptComponent {
  constructor() {
    super();
    this._viewPort = null;
    this._content = null;
    this._vScroll = null;
    this._hScroll = null;
    this._horizontal = true;
    this._vertical = true;
    this._movementType = 'clamped';
    this._viewBound = null;
    this._contentBound = null;
    this._viewWidget = null;
    this._contentWidget = null;
    this._elastic = 0.1;

    this._dragging = false;
    this._startPos = vec3.create();
    this._startOffset = vec3.create();
    this._outOffset = vec3.create();
    this._moveArea = null;

    this._scrollEvent = [];

    this._onMouseDown = (evt) => {
      this._getBound();
      this._startPos = vec3.new(evt.mouseX, evt.mouseY);
      this._startOffset = vec3.new(this._contentWidget.offsetX, this._contentWidget.offsetY, 0);
      this._dragging = true;
    };

    this._onMouseUp = (evt) => {
      this._dragging = false;
    };

    this._onMouseMove = (evt) => {
      this._update();
      if (this._dragging) {
        this._onDrag(this._startPos, vec2.new(evt.mouseX, evt.mouseY));
      }

      this._lateUpdate();
    };
  }

  onEnable() {
    this._content.on('mousedown', this._onMouseDown);
    this._moveArea.on('mousemove', this._onMouseMove);
    this._moveArea.on('mouseup', this._onMouseUp);
  }

  onDisable() {
    this._content.off('mousedown', this._onMouseDown);
    this._moveArea.off('mousemove', this._onMouseMove);
    this._moveArea.off('mouseup', this._onMouseUp);
  }

  set moveArea(val) {
    this._moveArea = val;
  }

  set horizontal(val) {
    this._horizontal = val;
  }

  set vertical(val) {
    this._vertical = val;
  }

  get content() {
    return this._content;
  }

  set content(cont) {
    this._content = cont;
    this._contentWidget = this._content.getComp('Widget');
  }

  get viewPort() {
    return this._viewPort;
  }

  set viewPort(view) {
    this._viewPort = view;
    this._viewWidget = this._viewPort.getComp('Widget');
  }

  get movementType() {
    return this._movementType;
  }

  get vScroll() {
    return this._vScroll;
  }

  set vScroll(val) {
    this._vScroll = val;
    this._vScroll.reverse = true;
  }

  get hScroll() {
    return this._hScroll;
  }

  set hScroll(val) {
    this._hScroll = val;
  }

  set movementType(type) {
    this._movementType = type;
  }

  set velocity(val) {
    this._velocity = val;
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
        rubberValue = (1 - 1 / (Math.abs(this._outOffset.x) * 0.55 / this._viewBound.size.x + 1)) * this._viewBound.size.x * (this._outOffset.x < 0 ? -1 : 1);
        this._contentWidget.offsetX = this._contentWidget.offsetX + rubberValue;
      }

      if (this._outOffset.y !== 0) {
        rubberValue = (1 - 1 / (Math.abs(this._outOffset.y) * 0.55 / this._viewBound.size.y + 1)) * this._viewBound.size.y * (this._outOffset.y < 0 ? -1 : 1);
        this._contentWidget.offsetY = this._contentWidget.offsetY + rubberValue;
      }
    } else if (this._movementType === 'clamped') {
      this._contentWidget.offsetX += this._outOffset.x;
      this._contentWidget.offsetY += this._outOffset.y;
    }
    this._updateScrollBar();
  }

  _lateUpdate() {
    this._getOutOffset(vec3.create());
    if (!this._dragging) {
      let v = { x: this._outOffset.x, y: this._outOffset.y, z: 0 };
      if (!vec3.equals(this._outOffset, vec3.create())) {
        this._updateScrollBar();
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
      outOffset.y = Math.round(outOffset.y * 100) / 100;

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
  }

  _updateScrollBar() {
    if (this._hScroll) {
      if (this._contentBound.size.x > this._viewBound.size.y) {
        this._hScroll.value = cc.math.clamp01((this._viewBound.size.x - Math.abs(this._outOffset.x)) / this._contentBound.size.x);
        let scrollAnchor = (this._viewBound.min.x - this._contentBound.min.x) / (this._contentBound.size.x - this._viewBound.size.x);
        this._hScroll.scrollAnchor = scrollAnchor;
      } else {
        this._hScroll.value = 1;
        this._hScroll.scrollAnchor = 0;
      }
    }

    if (this._vScroll) {
      if (this._contentBound.size.y > this._viewBound.size.y) {
        this._vScroll.value = cc.math.clamp01((this._viewBound.size.y - Math.abs(this._outOffset.y)) / this._contentBound.size.y);
        let value = -(this._viewBound.max.y - this._contentBound.max.y) / (this._contentBound.size.y - this._viewBound.size.y);
        value = Math.round(value * 100) / 100;
        let scrollAnchor = -(this._viewBound.max.y - this._contentBound.max.y) / (this._contentBound.size.y - this._viewBound.size.y);
        this._vScroll.scrollAnchor = scrollAnchor;
      } else {
        this._vScroll.value = 1;
        this._vScroll.scrollAnchor = 0;
      }
    }
  }

  scrollBarUpdate(dir) {
    let offset = 0.00, moveOffset = 0.00;
    if (dir === 'horizontal') {
      offset = this._contentBound.size.x - this._viewBound.size.x;
      offset = this._viewBound.min.x - this._hScroll.scrollAnchor * offset;
      moveOffset = this._content.lpos.x - this._contentBound.min.x + offset;
      if (Math.abs(this._content.lpos.x - moveOffset) > 0.01) {
        this._contentWidget.offsetX = moveOffset;
      }
    } else {
      offset = this._contentBound.size.y - this._viewBound.size.y;
      offset = this._viewBound.max.y + this._vScroll.scrollAnchor * offset;
      moveOffset = this._content.lpos.y - this._contentBound.max.y + offset;
      if (Math.abs(this._content.lpos.y - moveOffset) > 0.01) {
        this._contentWidget.offsetY = moveOffset;
      }
    }
  }
}