import UIElement from './ui-element-component';

export default class ToggleGroupComponent extends UIElement {
  constructor() {
    super();

    this._toggleItems = [];
    // only one toggled item is allowed
    this._activeItem = null;
  }

  _addItem(item) {
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

  _removeItem(item) {
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

  _updateCheck(item) {
    let pos = this._toggleItems.indexOf(item);
    if (pos === -1) {
      console.warn('toggle item not exists in toggle groups');
      return true;
    } else {
      if (this._activeItem !== item) {
        if (this._activeItem) {
          this._activeItem.checked = false;
        }
        this._activeItem = item;
      } else {
        if (!this._allowSwitchOff) {
          if (!this._activeItem.checked) {
            this._activeItem.checked = true;
          }
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
      this._allowSwitchOff = val;
    }
  }
};