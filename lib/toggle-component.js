import cc from 'engine-3d';
import ButtonComponent from './button-component';

export default class ToggleComponent extends ButtonComponent {
  constructor() {
    super();

    this._checkerImage = null;
    this._toggleGroup = null;

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

  _onTouchEnd(e) {
    if (this._enabled === false) {
      return;
    }

    if (e.id !== this._fingerId) {
      return;
    }

    this._fingerId = -1;
    let widgetSys = this._widget.system;
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

ToggleComponent.schema = {
  checker: {
    type: 'object',
    default: null,
    set(val) {
      if (this._checker !== val) {
        this._checker = val;
        this._checkerImage = this._checker.getComp('Image');
        this._checkerImage.enabled = this._checked;
      }
    },
    get() {
      return this._checker;
    }
  },

  checked: {
    type: 'boolean',
    default: true,
    set(val) {
      if (this._checked !== val) {
        this._checked = val;

        if (this._checkerImage) {
          this._checkerImage.enabled = this._checked;
        }

        if (this._toggleGroup) {
          this._toggleGroup._updateCheck(this, val);
        }
      }
    },
    get() {
      return this._checked;
    }
  },

  toggleGroup: {
    type: 'object',
    default: null,
    set(val) {
      this._toggleGroup = val;
      this._toggleGroup._addToggleItem(this);
    }
  }
}