(() => {
  const app = window.app;
  const cc = window.cc;
  const { ui } = cc;
  const { color4 } = cc.math;
  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let entity = app.createEntity('back');
  entity.setParent(screen);
  let spriteCmp = entity.addComp('Image');
  spriteCmp.width = 128;
  spriteCmp.height = 128;
  spriteCmp.setAnchors(0.5, 0.5, 0.5, 0.5);

  let e2 = app.createEntity('checkMark');
  e2.setParent(screen);
  let sprite2 = e2.addComp('Image');
  sprite2.color = color4.new(1, 0, 0, 1);
  sprite2.width = 96;
  sprite2.height = 96;
  sprite2.setAnchors(0.5, 0.5, 0.5, 0.5);

  let e3 = app.createEntity('toggle');
  e3.setParent(screen);
  let toggleWidget = e3.addComp('Widget');
  toggleWidget.width = 128;
  toggleWidget.height = 128;
  toggleWidget.setAnchors(0.5, 0.5, 0.5, 0.5);
  let toggleCmp = e3.addComp('Toggle');
  toggleCmp.setTargetSprite(spriteCmp);
  toggleCmp.setCheckMark(sprite2);

  window.g_testToggle = toggleCmp;

})();