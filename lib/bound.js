import cc from 'engine-3d';
const { vec3 } = cc.math;

export default class Bounds {
  constructor(center, size) {
    this._center = vec3.create();
    vec3.copy(this._center, center);
    this._extents = vec3.create();
    vec3.mul(this._extents,size, vec3.new(0.5, 0.5, 0.5));
    this._size = vec3.create();
    this._min = vec3.create();
    this._max = vec3.create();
  }

  set center(val) {
    this._center = val;
  }

  get center() {
    return this._center;
  }

  set size(val) {
    vec3.mul(this._extents, val, vec3.new(0.5, 0.5, 0.5));
  }

  get size() {
    let value = vec3.create();
    vec3.mul(value, this._extents, vec3.new(2, 2, 2));
    return value;
  }

  set min(val) {
    this.setMinMax(val, this._max);
  }

  get min() {
    let value = vec3.create();
    vec3.subtract(value, this._center, this._extents);
    return value;
  }

  set max(val) {
    this.setMinMax(this._min, val);
  }

  get max() {
    let value = vec3.create();
    vec3.add(value, this._center, this._extents);
    return value;
  }

  setMinMax(min, max) {
    let value = vec3.create();
    vec3.subtract(value, max, min);
    vec3.mul(value, value, vec3.new(0.5, 0.5, 0.5));
    vec3.set(this._extents, value.x, value.y, value.z);
    vec3.add(this._center, min, this._extents);
  }

  encapsulate(point) {
    let min = vec3.create(), max = vec3.create();
    vec3.min(min, this.min, point);
    vec3.max(max, this.max, point);
    this.setMinMax(min, max);
  }
}
