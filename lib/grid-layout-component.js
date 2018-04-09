import cc from 'engine-3d';

export default class GridLayoutComponent extends cc.ScriptComponent {
  constructor() {
    super();
    // private
    this._widget = null;
    this._row = 1;
    this._col = 0;
    this._calculateRow = 1;
    this._calculateCol = 1;
  }

  onInit() {
    this._entity.once('ready', () => {
      this._widget = this._entity.getComp('Widget');
      this._updateLayout();
    });
  }

  /**
   * @param {number} w
   * @param {number} h
   */
  setCellSize(w, h) {
    this._cellWidth = w;
    this._cellHeight = h;
    this._updateLayout();
  }

   /**
   * @param {number} x
   * @param {number} y
   */
  setPivot(x, y) {
    x = x.toFixed(1);
    y = y.toFixed(1);
    if (x % 0.5 !== 0) {
      this._pivotX = 0;
    } else {
      this._pivotX = x;
    }

    if (y % 0.5 !== 0) {
      this._pivotY = 0;
    } else {
      this._pivotY = y;
    }

    this._updateLayout();
  }

  _updateLayout() {
    if (!this._widget) {
      return;
    }

    let length = this._entity.children.length;
    if (length <= 0) {
      return;
    }

    this._calculateRow = 1;
    this._calculateCol = 1;
    if (this._axis === 'horizontal') {
      if (this._col > 0) {
        this._row = Math.ceil(length / this._col);
      } else {
        this._col = length;
        this._row = 1;
      }
    } else {
      if (this._row > 0) {
        this._col = Math.ceil(length / this._row);
      } else {
        this._row = length;
        this._col = 1;
      }
    }

    if (length > 0) {
      // use axis and limit to determine the row and col obtain the size of the bounding box.
      // use pivot to set the alignment of the bounding box. (0.5, 0.5) corresponds to the center of the bounding box.
      // the starting position is obtained by calculating the upper left corner of the bounding box.
      let startX = -this._cellWidth * this._col * this._pivotX;
      let startY = this._cellHeight * this._row * (1 - this._pivotY);
      for (let i = 0; i < length; ++i) {
        let child = this._entity.children[i];
        if (!child.enabled) {
          continue;
        }

        let widget = child.getComp('Widget');
        widget.setAnchors(this._pivotX, this._pivotY, this._pivotX, this._pivotY);

        if (this._axis === 'horizontal') {
          if (this._calculateCol > this._col) {
            this._calculateCol = 1;
            this._calculateRow++;
          }

          widget.offsetX = startX + this._cellWidth * (this._calculateCol - 1) + widget.pivotX * widget.width;
          widget.offsetY = startY - (this._cellHeight * (this._calculateRow - 1) + widget.pivotY * widget.height);
          this._calculateCol++;
        } else {
          if (this._calculateRow > this._row) {
            this._calculateRow = 1;
            this._calculateCol++;
          }

          widget.offsetX = startX + this._cellWidth * (this._calculateCol - 1) + widget.pivotX * widget.width;
          widget.offsetY = startY - (this._cellHeight * (this._calculateRow - 1) + widget.pivotY * widget.height);
          this._calculateRow++;
        }
      }
    }
  }
}

GridLayoutComponent.schema = {
  cellWidth: {
    type: 'number',
    default: 100,
    set(val) {
      if (this._cellWidth === val) {
        return;
      }

      this._cellWidth = val;
      this._updateLayout();
    }
  },

  cellHeight: {
    type: 'number',
    defaul: 100,
    set(val) {
      if (this._cellHeight === val) {
        return;
      }

      this._cellHeight = val;
      this._updateLayout();
    }
  },

  pivotX: {
    type: 'number',
    default: 0,
    options: [0, 0.5, 1],
    set(val) {
      val = val.toFixed(1);
      if (this._pivotX === val) {
        return;
      }

      this._pivotX = val % 0.5 !== 0 ? 0 : val;
      this._updateLayout();
    }
  },

  pivotY: {
    type: 'number',
    default: 1,
    options: [0, 0.5, 1],
    set(val) {
      val = val.toFixed(1);
      if (this._pivotY === val) {
        return;
      }

      this._pivotY = val % 0.5 !== 0 ? 0 : val;
      this._updateLayout();
    }
  },

  axis: {
    type: 'string',
    default: 'horizontal',
    options: ['horizontal', 'vertical'],
    set(val) {
      if (this._axis === val) {
        return;
      }

      this._axis = val;
      if (this._axis === 'horizontal') {
        this._row = 1;
        this._col = 0;
      } else {
        this._row = 0;
        this._col = 1;
      }

      this._updateLayout();
    }
  },

  limit: {
    type: 'number',
    default: 0,
    set(val) {
      if (this._axis === 'horizontal') {
        if (this._col === val) {
          return;
        }

        this._col = val;
      } else {
        if (this._row === val) {
          return;
        }

        this._row = val;
      }

      this._updateLayout();
    }
  }
}