(() => {
  const { cc, app, uikit } = window;
  const { color4 } = cc.math;

  let screen = app.createEntity('screen');
  screen.addComp('Screen');
  screen.addComp('Widget');

  let entity = app.createEntity('sprite');
  entity.setParent(screen);
  let widget = entity.addComp('Widget');
  widget.width = 128;
  widget.height = 128;
  widget.setAnchors(0.5, 0.5, 0.5, 0.5);
  let spriteCmp = entity.addComp('Image');

  let e2 = app.createEntity('button');
  e2.setParent(screen);
  let w2 = e2.addComp('Widget');
  w2.width = 128;
  w2.height = 128;
  w2.setAnchors(0.5, 0.5, 0.5, 0.5);
  // let btn = e2.addComp('ui.Button');
  let btn = e2.addComp('Button');
  btn.setTargetSprite(spriteCmp);
  btn.setTransition(uikit.BUTTON_TRANSITION_COLOR_TINT);
  btn.setTransitionColor(color4.new(1, 0, 0, 1), uikit.BUTTON_STATE_HIGHLIGHT);
  btn.setTransitionColor(color4.new(1, 1, 0, 1), uikit.BUTTON_STATE_PRESSED);
  btn.setTransitionColor(color4.new(1, 0, 1, 1), uikit.BUTTON_STATE_DISABLED);
  window.g_testBtn = btn;
})();