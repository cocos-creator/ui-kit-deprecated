(() => {
  const { cc, app } = window;
  const { color4 } = cc.math;

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let entity = app.createEntity('sprite');
  entity.setParent(screen);
  let spriteCmp = entity.addComp('Image');
  spriteCmp.width = 128;
  spriteCmp.height = 128;
  spriteCmp.setAnchors(0.5, 0.5, 0.5, 0.5);

  let e2 = app.createEntity('button');
  e2.setParent(screen);
  let btnWidget = e2.addComp('Widget');
  btnWidget.width = 128;
  btnWidget.height = 128;
  btnWidget.setAnchors(0.5, 0.5, 0.5, 0.5);
  let btn = e2.addComp('Button');
  // let btn = e2.addComp('ui.Button');
  btn.setTargetSprite(spriteCmp);
  btn.setTransition('button-transition-color-tint');
  btn.setTransitionColor(color4.new(1, 0, 0, 1), 'button-state-highlight');
  btn.setTransitionColor(color4.new(1, 1, 0, 1), 'button-state-pressed');
  btn.setTransitionColor(color4.new(1, 0, 1, 1), 'button-state-disabled');
  window.g_testBtn = btn;
})();