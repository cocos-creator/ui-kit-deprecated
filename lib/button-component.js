import cc from 'engine-3d';
import enums from './enums';

const { color4 } = cc.math;
export default class ButtonComponent extends cc.ScriptComponent {
  constructor() {
    super();
    this._state = enums.BUTTON_STATE_NORMAL;
    this._mouseInBtn = false;
    this._transition = enums.BUTTON_TRANSITION_NONE;
    this._tintColors = {};
    this._transitionSprites = {};
    this._transitionAnimation = null;
    this._targetSpriteComp = null;
    this._interactable = true;

    // init tint color
    this._tintColors[enums.BUTTON_STATE_NORMAL] = color4.create();
    this._tintColors[enums.BUTTON_STATE_HIGHLIGHT] = color4.create();
    this._tintColors[enums.BUTTON_STATE_PRESSED] = color4.create();
    this._tintColors[enums.BUTTON_STATE_DISABLED] = color4.create();

    // init transition sprites
    this._transitionSprites[enums.BUTTON_STATE_NORMAL] = null;
    this._transitionSprites[enums.BUTTON_STATE_HIGHLIGHT] = null;
    this._transitionSprites[enums.BUTTON_STATE_PRESSED] = null;
    this._transitionSprites[enums.BUTTON_STATE_DISABLED] = null;
    // todo: this may change later
    this._clickListeners = [];

    this._onMouseEnter = (evt) => {
      this._mouseInBtn = true;
      this._setButtonState(enums.BUTTON_STATE_HIGHLIGHT);
      console.log('Mouse enterd');
    };

    this._onMouseLeave = (evt) => {
      this._mouseInBtn = false;
      this._setButtonState(enums.BUTTON_STATE_NORMAL);
      console.log('Mouse leaved');
    };

    this._onMouseDown = (evt) => {
      if (evt && evt.button === 'left') {
        this._setButtonState(enums.BUTTON_STATE_PRESSED);
        console.log('Mouse pressed');
      }
    };

    this._onMouseUp = (evt) => {
      if (evt && evt.button === 'left') {
        if (this._mouseInBtn === true) {
          // todo: this may change later
          for (let i = 0; i < this._clickListeners.length; ++i) {
            this._clickListeners[i](evt);
          }
        }
        console.log('Mouse released');
        this._setButtonState(enums.BUTTON_STATE_NORMAL);
      }
    };
  }

  start() {
    // turn on event dispatcher
    this._entity.on('mousedown', this._onMouseDown);
    this._entity.on('mouseup', this._onMouseUp);
    this._entity.on('mouseenter', this._onMouseEnter);
    this._entity.on('mouseleave', this._onMouseLeave);

    // set default button state
    this._setButtonState(0);
  }

  destroy() {
    this._entity.off('mousedown', this._onMouseDown);
    this._entity.off('mouseup', this._onMouseUp);
    this._entity.off('mouseenter', this._onMouseEnter);
    this._entity.off('mouseleave', this._onMouseLeave);
  }

  setTargetSprite(spriteComp) {
    this._targetSpriteComp = spriteComp;
    this._transitionSprites[enums.BUTTON_STATE_NORMAL] = spriteComp.sprite;
    // refresh state
    if (this._transition === enums.BUTTON_TRANSITION_COLOR_TINT) {
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
    if (this._transition === enums.BUTTON_TRANSITION_COLOR_TINT) {
      this._setButtonState(this._state);
    }
  }

  setTransitionSprite(sprite, state) {
    this._transitionSprites[state] = sprite;
    //refresh state
    if (this._transition === enums.BUTTON_TRANSITION_SPRITE_SWAP) {
      this._setButtonState(this._state);
    }
  }

  setInteractable(interactable) {
    if (this._interactable !== interactable) {
      this._interactable = interactable;
      this._setButtonState(interactable ? enums.BUTTON_STATE_NORMAL : enums.BUTTON_STATE_DISABLED);

      if (interactable) {
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
      if (this._targetSpriteComp && this._transition !== enums.BUTTON_TRANSITION_NONE) {
        if (this._transition === enums.BUTTON_TRANSITION_COLOR_TINT) {
          this._targetSpriteComp.color = this._tintColors[state];
        } else if (this._transition === enums.BUTTON_TRANSITION_SPRITE_SWAP) {
          this._transitionSprites.sprite = this._transitionSprites[state];
        } else {
          // todo: not implemented
          console.warn('Button transition animation is not implemented');
        }
      }
    }
  }

  // reset state when enabled or disabled
  onEnable() {
    this._setButtonState(enums.BUTTON_STATE_NORMAL);
  }

  onDisable() {
    this._setButtonState(enums.BUTTON_STATE_NORMAL);
  }
}