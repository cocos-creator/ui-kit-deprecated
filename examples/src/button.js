(() => {
  const app = window.app;
  const cc = window.cc;
  const { uikit } = cc;
  const { color4 } = cc.math;
  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let entity = app.createEntity('button');
  entity.setParent(screen);
  let widget = entity.addComp('Widget');
  widget.widget = 128;
  widget.height = 63;
  widget.setAnchors(0.5, 0.5, 0.5, 0.5);
  let spriteCmp = entity.addComp('Sprite');

  let btn = entity.addComp('Button');
  btn.setTargetSprite(spriteCmp);
  btn.setTransition(uikit.enums.BUTTON_TRANSITION_COLOR_TINT);
  btn.setTransitionColor(color4.new(1, 0, 0, 1), uikit.enums.BUTTON_STATE_HIGHLIGHT);
  btn.setTransitionColor(color4.new(1, 1, 0, 1), uikit.enums.BUTTON_STATE_PRESSED);
  btn.setTransitionColor(color4.new(1, 0, 1, 1), uikit.enums.BUTTON_STATE_DISABLED);
  window.g_testBtn = btn;
})();