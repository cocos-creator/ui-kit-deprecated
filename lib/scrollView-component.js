import cc from 'engine-3d';
import enums from './enums';
import Bounds from './bound';
const { vec2, vec3, mat4 } = cc.math;

export default class ScrollViewComponent extends cc.ScriptComponent {
  constructor() {
    super();
    this._viewPort = null;
    this._content = null;
    this._horizontal = true;
    this._vertical = true;
    this._movementType = enums.CLAMPED;
    this._viewBound = null;
    this._contentBound = null;
    this._viewWidget = null;
    this._contentWidget = null;

    this._velocity = vec3.create();
    this._dragging = false;
    this._startPos = vec3.create();
    this._startOffset = vec3.create();
    this._outOffset = vec3.create();

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
    this._entity.on('mousedown', this._onMouseDown);
    this._entity.on('mouseup', this._onMouseUp);
    this._entity.on('mousemove', this._onMouseMove);
    this._getBound();
  }

  onDisable() {
    this._entity.off('mousedown', this._onMouseDown);
    this._entity.off('mouseup', this._onMouseUp);
    this._entity.off('mousemove', this._onMouseMove);
  }

  set horizontal(val) {
    this._horizontal = val;
  }

  set vertical(val) {
    this._vertical = val;
  }

  set content(cont) {
    this._content = cont;
    this._contentWidget = this._content.getComp('Widget');
  }

  get content() {
    return this._content;
  }

  set viewPort(view) {
    this._viewPort = view;
    this._viewWidget = this._viewPort.getComp('Widget');
  }

  get viewPort() {
    return this._viewPort;
  }

  set movementType(type) {
    this._movementType = type;
  }

  get movementType() {
    return this._movementType;
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
    // NOTE:y will add in down of direction when dragging
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
    if (!vec3.equals(this._velocity, vec3.create())) {
      this._velocity = vec3.create();
     }
  }

  _lateUpdate() {
    this._getOutOffset(vec3.create());
    if (this._dragging) {
      // out
      if (this._movementType === enums.CLAMPED) {
        this._contentWidget.offsetX += this._outOffset.x;
        this._contentWidget.offsetY += this._outOffset.y;
      }
    } else {
      // back
      let v = { x: this._outOffset.x, y: this._outOffset.y, z: 0 };
      if (!vec3.equals(this._velocity, vec3.create())) {
        this._contentWidget.offsetX += this._velocity.x > this._outOffset.x ? this._outOffset.x : this._velocity.x;
        this._contentWidget.offsetY += this._velocity.y > this._outOffset.y ? this._outOffset.y : this._velocity.y;
        this._getOutOffset(vec3.create());
        if (this._outOffset.x <= 0.0001 && this._outOffset.y <= 0.0001) {
          this._velocity = vec3.create();
        }
      } else {
        //TODO:5 will be replaced back time
        if (this._outOffset.x > 0) {
          v.x = this._outOffset.x / 5;
        }

        if (this._outOffset.y > 0) {
          v.y = this._outOffset.y / 5;
        }
        this._velocity = vec3.new(v.x, v.y, v.z);
      }
    }
  }

  _getOutOffset(delta) {
    let outOffset = { x: 0, y: 0, z: 0 };
    if (this._movementType === enums.UNRESTRICTED) {
      return this._outOffset = vec3.create();
    } else {
      let min = { x: this._contentBound.min.x + delta.x, y: this._contentBound.min.y + delta.y };
      let max = { x: this._contentBound.max.x + delta.x, y: this._contentBound.max.y + delta.y };
      if (this._viewBound.min.x < min.x) {
        outOffset.x = this._viewBound.min.x - min.x;
      } else if (this._viewBound.max.x > max.x) {
        outOffset.x = this._viewBound.max.x - max.x;
      }

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

    this._viewBound = new Bounds(vec3.create(), vec3.new(this._viewWidget.width, this._viewWidget.height, 0));

    let corner = [];
    this._contentWidget = this._content.getComp('Widget');
    this._viewWidget = this._viewPort.getComp('Widget');
    let lpos = this._content.lpos;
    corner[0] = vec3.new(lpos.x - this._contentWidget.width * this._contentWidget.pivotX, lpos.y + this._contentWidget.height * (1 - this._contentWidget.pivotY), 0.0);
    corner[1] = vec3.new(lpos.x - this._contentWidget.width * this._contentWidget.pivotX, lpos.y - this._contentWidget.height * this._contentWidget.pivotY, 0.0);
    corner[2] = vec3.new(lpos.x + this._contentWidget.width * (1 - this._contentWidget.pivotX), lpos.y - this._contentWidget.height * this._contentWidget.pivotY, 0.0);
    corner[3] = vec3.new(lpos.x + this._contentWidget.width * (1 - this._contentWidget.pivotX), lpos.y + this._contentWidget.height * (1 - this._contentWidget.pivotY), 0.0);
    //TODO:need rotation matrix later

    let min = vec3.new(3.40282347E+38, 3.40282347E+38, 3.40282347E+38);
    let max = vec3.new(-3.40282347E+38, -3.40282347E+38, -3.40282347E+38);
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
}