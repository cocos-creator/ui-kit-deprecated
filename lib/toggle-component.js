import cc from 'engine-3d';
import ButtonComponent from './button-component';

const { color4 } = cc.math;

export default class ToggleComponent extends ButtonComponent {
  constructor() {
    super();

    this._checked = true;
    this._checkerImage = true;
  }

  set checked(val) {
    if (this._checked !== val) {
      this._checked = val;
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

      this._pressing = false;
      this._updateState();

      this._entity.emit('change');
    }
  }
}