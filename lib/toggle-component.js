import ButtonComponent from './button-component';

export default class ToggleComponent extends ButtonComponent {
  constructor() {
    super();

    this._checkerImage = null;

    this._checked = true;
    this._checker = null;
  }

  onInit() {
    super.onInit();

    if (this._checker) {
      this._checkerImage = this._checker.getComp('Image');
      this._checkerImage.enabled = this._checked;
    }
  }

  set checker(val) {
    if (this._checker !== val) {
      this._checker = val;
      this._checkerImage = this._checker.getComp('Image');
      this._checkerImage.enabled = this._checked;
    }
  }
  get checker() {
    return this._checker;
  }

  set checked(val) {
    if (this._checked !== val) {
      this._checked = val;

      if (this._checkerImage) {
        this._checkerImage.enabled = this._checked;
      }
    }
  }
  get checked() {
    return this._checked;
  }

  _onMouseUp(e) {
    if (this._enabled === false) {
      return;
    }

    let widgetSys = this._widget.system;
    if (e.button === 'left') {
      e.stop();

      if (widgetSys.focusedEntity !== this._entity) {
        return;
      }

      this.checked = !this.checked;
      this.dispatch('change');

      this._pressing = false;
      this._updateState();
    }
  }
}