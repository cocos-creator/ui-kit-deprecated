import cc from 'engine-3d';

export default class TableLayoutComponent extends cc.ScriptComponent {
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

  /**
  * @param {number} x
  * @param {number} y
  */
  setSpacing(x, y) {
    this._spacingX = x;
    this._spacingY = y;
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
      let totalWidth = 0.0, totalHeight = 0.0, width = 0.0, height = 0.0, delta = 0.0;
      // widthArr according col, heightArr according row
      let widthArr = [], heightArr = [];
      for (let i = 0; i < length; i++) {
        let child = this._entity.children[i];
        if (!child.enabled) {
          continue;
        }

        let widget = child.getComp('Widget');
        width += widget.width;
        if (widget.height > delta) {
          delta = widget.height;
          heightArr[this._calculateRow - 1] = delta;
        }

        if (widthArr[this._calculateCol - 1] === undefined || widget.width > widthArr[this._calculateCol - 1]) {
          widthArr[this._calculateCol - 1] = widget.width;
        }

        this._calculateCol++;
        if (this._calculateCol > this._col) {
          this._calculateCol = 1;
          this._calculateRow++;
          delta = 0;
        }
      }
      // for irregular alignment, the size of the bounding box is also given priority.
      totalWidth = widthArr.reduce((value, curr) => {
        return value + curr;
      }, 0);

      totalHeight = heightArr.reduce((value, curr) => {
        return value + curr;
      }, 0);

      // use axis and limit to determine the row and col obtain the size of the bounding box.
      // use pivot to set the alignment of the bounding box. (0.5, 0.5) corresponds to the center of the bounding box.
      // the starting position is obtained by calculating the upper left corner of the bounding box.
      this._calculateRow = 1;
      this._calculateCol = 1;
      delta = 0;
      let startX = -(totalWidth + (this._col - 1) * this._spacingX) * this._pivotX;
      let startY = (totalHeight + (this._row - 1) * this._spacingY) * (1 - this._pivotY);
      width = startX;
      height = startY;
      for (let i = 0; i < length; ++i) {
        let child = this._entity.children[i];
        if (!child.enabled) {
          continue;
        }

        let widget= child.getComp('Widget');
        widget.setAnchors(this._pivotX, this._pivotY, this._pivotX, this._pivotY);
        if (this._axis === 'horizontal') {
          if (this._calculateCol > this._col) {
            this._calculateCol = 1;
            this._calculateRow++;
            width = startX;
            height -= (delta + this._spacingY);
          }

          widget.offsetX = width + widget.pivotX * widget.width;
          widget.offsetY = height - widget.pivotY * widget.height;
          width += widthArr[this._calculateCol - 1] + this._spacingX;
          if (widget.height > delta) {
            delta = widget.height;
          }

          this._calculateCol++;
        } else {
          if (this._calculateRow > this._row) {
            this._calculateRow = 1;
            this._calculateCol++;
            height = startY;
            width += delta + this._spacingX;
          }

          widget.offsetX = width + widget.pivotX * widget.width;
          widget.offsetY = height - widget.pivotY * widget.height;
          height -= heightArr[this._calculateRow - 1] + this._spacingY;
          if (widget.width > delta) {
            delta = widget.width;
          }

          this._calculateRow++;
        }
      }
    }
  }
}

GridLayoutComponent.schema = {
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

  spacingX: {
    type: 'number',
    defaul: 0,
    set(val) {
      if (this._spacingX === val) {
        return;
      }

      this._spacingX = val;
      this._updateLayout();
    }
  },

  spacingY: {
    type: 'number',
    defaul: 0,
    set(val) {
      if (this._spacingY === val) {
        return;
      }

      this._spacingY = val;
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