(() => {
  const app = window.app;
  const cc = window.cc;
  const { ui } = cc;
  const { color4 } = cc.math;
  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let entity = app.createEntity('back');
  entity.setParent(screen);
  let widget = entity.addComp('Widget');
  widget.width = 128;
  widget.height = 128;
  widget.setAnchors(0.5, 0.5, 0.5, 0.5);
  let spriteCmp = entity.addComp('Sprite');

  let e2 = app.createEntity('checkMark');
  e2.setParent(screen);
  let w2 = e2.addComp('Widget');
  w2.width = 96;
  w2.height = 96;
  w2.setAnchors(0.5, 0.5, 0.5, 0.5);
  let sprite2 = e2.addComp('Sprite');
  sprite2.color = color4.new(1, 0, 0, 1);

  let e3 = app.createEntity('toggle');
  e3.setParent(screen);
  let w3 = e3.addComp('Widget');
  w3.width = 128;
  w3.height = 128;
  w3.setAnchors(0.5, 0.5, 0.5, 0.5);
  let toggleCmp = e3.addComp('Toggle');
  toggleCmp.setTargetSprite(spriteCmp);
  toggleCmp.setCheckMark(sprite2);

  window.g_testToggle = toggleCmp;

})();