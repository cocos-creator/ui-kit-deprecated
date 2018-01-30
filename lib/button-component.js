import cc from 'engine-3d';

const { color4 } = cc.math;
export default class ButtonComponent extends cc.ScriptComponent {
  constructor() {
    super();
    this._state = 'button-state-normal';
    this._mouseInBtn = false;
    this._transition = 'button-transition-none';
    this._tintColors = {};
    this._transitionSprites = {};
    this._transitionAnimation = null;
    this._targetSpriteComp = null;
    this._interactable = true;

    // init tint color
    this._tintColors['button-state-normal'] = color4.create();
    this._tintColors['button-state-highlight'] = color4.create();
    this._tintColors['button-state-pressed'] = color4.create();
    this._tintColors['button-state-disabled'] = color4.create();

    // init transition sprites
    this._transitionSprites['button-state-normal'] = null;
    this._transitionSprites['button-state-highlight'] = null;
    this._transitionSprites['button-state-pressed'] = null;
    this._transitionSprites['button-state-disabled'] = null;
    // todo: this may change later
    this._clickListeners = [];
    this._btnMsgStatus = false;

    this._onMouseEnter = (evt) => {
      this._mouseInBtn = true;
      this._setButtonState('button-state-highlight');
    };

    this._onMouseLeave = (evt) => {
      this._mouseInBtn = false;
      this._setButtonState('button-state-normal');
    };

    this._onMouseDown = (evt) => {
      if (evt && evt.button === 'left') {
        this._setButtonState('button-state-pressed');
      }
    };

    this._onMouseUp = (evt) => {
      if (evt && evt.button === 'left') {
        if (this._mouseInBtn === true) {
          this.onButtonClicked();
        }
        this._setButtonState('button-state-normal');
      }
    };
  }

  onInit() {
    // set default button state
    this._setButtonState(0);
  }

  onDestroy() {
    this._setButtonMsg(false);
  }

  setTargetSprite(spriteComp) {
    this._targetSpriteComp = spriteComp;
    this._transitionSprites['button-state-normal'] = spriteComp.sprite;
    // refresh state
    if (this._transition === 'button-transition-color-tint') {
      this._setButtonState(this._state);
    }
  }

  setTransition(transition) {
    if (this._transition !== transition) {
      this._transition = transition;
      // refresh state
      this._setButtonState(this._state);
    }
  }

  setTransitionColor(tintColor, state) {
    color4.copy(this._tintColors[state], tintColor);
    //refresh state
    if (this._transition === 'button-transition-color-tint') {
      this._setButtonState(this._state);
    }
  }

  setTransitionSprite(sprite, state) {
    this._transitionSprites[state] = sprite;
    //refresh state
    if (this._transition === 'button-transition-sprite-swap') {
      this._setButtonState(this._state);
    }
  }

  setInteractable(interactable) {
    if (this._interactable !== interactable) {
      this._interactable = interactable;
      if (this.enabled) {
        this._setButtonState(interactable ? 'button-state-normal' : 'button-state-disabled');
        this._setButtonMsg(this._interactable);
      }
    }
  }

  _setButtonMsg(isON) {
    let newStatus = isON;
    if (this._btnMsgStatus !== newStatus) {
      this._btnMsgStatus = newStatus;
      if (isON) {
        this._entity.on('mousedown', this._onMouseDown);
        this._entity.on('mouseup', this._onMouseUp);
        this._entity.on('mouseenter', this._onMouseEnter);
        this._entity.on('mouseleave', this._onMouseLeave);
      } else {
        this._entity.off('mousedown', this._onMouseDown);
        this._entity.off('mouseup', this._onMouseUp);
        this._entity.off('mouseenter', this._onMouseEnter);
        this._entity.off('mouseleave', this._onMouseLeave);
      }
    }
  }

  _setButtonState(state) {
    if (this._state !== state) {
      this._state = state;
      if (this._targetSpriteComp && this._transition !== 'button-transition-none') {
        if (this._transition === 'button-transition-color-tint') {
          this._targetSpriteComp.color = this._tintColors[state];
        } else if (this._transition === 'button-transition-sprite-swap') {
          this._transitionSprites.sprite = this._transitionSprites[state];
        } else {
          // todo: not implemented
          console.warn('Button transition animation is not implemented');
        }
      }
    }
  }

  onButtonClicked() {
    // todo: this may change later
    for (let i = 0; i < this._clickListeners.length; ++i) {
      this._clickListeners[i](this);
    }
  }

  // reset state when enabled or disabled
  onEnable() {
    this._setButtonMsg(this._interactable);
  }

  onDisable() {
    this._setButtonMsg(false);
  }
}