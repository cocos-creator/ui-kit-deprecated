import cc from 'engine-3d.js';
import ButtonComponent from './button-component';
export default class ToggleComponent extends ButtonComponent {
  constructor() {
    super();
    this._toggled = true;
    this._checkMark = null;
    this._toggleGroup = null;
  }

  start() {
    super.start();
    this._clickListeners.push(() => {
      this.toggle();
    })
  }

  set toggleGroup(val) {
    if(this._toggleGroup === val) {
      return;
    }
    if(this._toggleGroup && this.enabled) {
      this._toggleGroup._removeToggleItem(this);
    }
    this._toggleGroup = val;
    if (this._toggleGroup && this.enabled) {
      this._toggleGroup._addToggleItem(this);
    }
  }

  get toggleGroup() {
    return this._toggleGroup;
  }

  destroy() {
    this._clickListeners.length = 0;
    super.destroy();
  }

  setCheckMark(graphic) {
    this._checkMark = graphic;
    this._updateCheckMark();
  }

  _updateCheckMark() {
    if (this._checkMark) {
      this._checkMark.enabled = this._toggled;
    }
  }

  // it may fail due to toggle group
  toggle() {
    if (this._toggled) {
      this.uncheck();
    } else {
      this.check();
    }
  }

  // it may fail due to toggle group
  check() {
    //do validate
    if (this._toggleGroup && !this._toggleGroup._validateToggle(this, true)) {
      return;
    }
    this._setToggle(true);
    this._notifyToggleGroup();
  }

  // it may fail due to toggle group
  uncheck() {
    //do validate
    if (this._toggleGroup && !this._toggleGroup._validateToggle(this, false)) {
      return;
    }

    this._setToggle(false);
    this._notifyToggleGroup();
  }

  // should not be called outside, maybe called by toggle group
  _setToggle(val) {
    const toggled = !!val;
    if (this._toggled !== toggled) {
      //todo add toggle group here
      this._toggled = toggled;
      this._updateCheckMark();
      this.onToggleChanged(toggled);
    }
  }

  get toggled() {
    return this._toggled;
  }

  _notifyToggleGroup() {
    if (this._toggleGroup) {
      this._toggleGroup._onItemToggleChanged(this);
    }
  }

  // callback
  onToggleChanged(toggle) {
    console.warn(`Toggle is ${toggle}`);
  }

  onEnable() {
    super.onEnable();
    if (this._toggleGroup) {
      this._toggleGroup._addToggleItem(this);
    }
  }

  onDisable() {
    if (this._toggleGroup) {
      this._toggleGroup._removeToggleItem(this);
    }
    super.onDisable();
  }
}