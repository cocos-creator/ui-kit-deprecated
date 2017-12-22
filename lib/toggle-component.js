
import ButtonComponent from './button-component';
export default class ToggleComponent extends ButtonComponent {
  constructor() {
    super();
    this._isToggled = true;
    this._checkMark = null;
  }

  start() {
    super.start();
    this._clickListeners.push(() => {
      this.isToggled = !this._isToggled;
    })
  }

  destroy() {
    this._clickListeners.length = 0;
    super.destroy();
  }

  setCheckMark(graphic) {
    this._checkMark = graphic;
  }

  set isToggled(val) {
    const toggled = !!val;
    if (this._isToggled !== toggled) {
      this._isToggled = toggled;
      this._checkMark.enabled = toggled;
      this.onToggleChanged(toggled);
    }
  }

  get isToggled() {
    return this._isToggled;
  }

  onToggleChanged(toggle) {
    console.warn(`Toggle is ${toggle}`);
  }
}