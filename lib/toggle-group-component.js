import cc from 'engine-3d';

export default class ToggleGroupComponent extends cc.WidgetComponent {
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
        this._activeItem._setToggle(true);
      }
    }
  }

  _addToggleItem(item) {
    if (this._toggleItems.indexOf(item) === -1) {
      this._toggleItems.push(item);
      if (this._activeItem === null) {
        if (item.toggled) {
          this._activeItem = item;
        }
      } else {
        item._setToggle(false);
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

  _validateToggle(item, check) {
    let pos = this._toggleItems.indexOf(item);
    if (pos === -1) {
      console.warn('toggle item not exists in toggle groups');
      return true;
    } else {
      if (check === true) {
        if (this._activeItem !== item) {
          this._activeItem && this._activeItem._setToggle(false);
          this._activeItem = item;
          return true;
        }
      } else {
        if(this._allowSwitchOff) {
          this._activeItem = null;
          return true;
        } else {
          return false;
        }
      }
    }
  }

  _onItemToggleChanged(item) {
    return;
    // let pos = this._toggleItems.indexOf(item);
    // if (pos === -1) {
    //   console.warn('toggle item not exists in toggle groups');
    // } else {
    //   if (item.toggled && this._activeItem !== item && this._activeItem !== null) {
    //     this._activeItem._setToggle(false);
    //     this._activeItem = item;
    //   }
    //   if(!item.toggled && this._activeItem === item) {
    //     this._activeItem = null;
    //   }
    // }
  }

  set allowSwitchOff(val) {
    this._allowSwitchOff = !!val;
  }

  get allowSwitchOff() {
    return this._allowSwitchOff;
  }
}