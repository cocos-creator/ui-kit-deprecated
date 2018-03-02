import cc from 'engine-3d';
import UIElement from './ui-element-component';

export default class ToggleGroupComponent extends UIElement {
  constructor() {
    super();
    this._allowSwitchOff = false;
    this._toggleItems = [];
    // only one toggled item is allowed
    this._activeItem = null;
  }

  start() {

  }

  destroy() {
    this._toggleItems.length = 0;
    this._activeItem = null;
  }

  update() {
    if (!this._allowSwitchOff && this._activeItem === null) {
      if (this._toggleItems.length > 0) {
        this._activeItem = this._toggleItems[0];
        this._activeItem.checked = true;
      }
    }
  }

  _addToggleItem(item) {
    if (this._toggleItems.indexOf(item) === -1) {
      this._toggleItems.push(item);
      if (this._activeItem === null) {
        if (item.checked) {
          this._activeItem = item;
        }
      } else {
        item.checked = false;
      }
    } else {
      console.warn('toggle item already added into toggle groups');
    }
  }

  _removeToggleItem(item) {
    let pos = this._toggleItems.indexOf(item);
    if (pos === -1) {
      console.warn('toggle item not exists in toggle groups');
    } else {
      if (this._activeItem === item) {
        this._activeItem = null;
      }
      this._toggleItems.splice(pos, 1);
    }
  }

  _updateCheck(item, check) {
    let pos = this._toggleItems.indexOf(item);
    if (pos === -1) {
      console.warn('toggle item not exists in toggle groups');
      return true;
    } else {
      if (check === true) {
        if (this._activeItem !== item) {
          if (this._activeItem) {
            this._activeItem.checked = false;
          }
          this._activeItem = item;
          this._activeItem.checked = true;
          this.dispatch('valueChanged');
        }
      } else {
        if (this._allowSwitchOff) {
          this._activeItem.checked = false;
          this._activeItem = null;
          this.dispatch('valueChanged');
        }
      }
    }
  }
}

ToggleGroupComponent.schema = {
  allowSwitchOff: {
    type: 'boolean',
    default: false,
    set(val) {
      this._allowSwitchOff = !!val;
    },
    get() {
      return this._allowSwitchOff;
    }
  }
}