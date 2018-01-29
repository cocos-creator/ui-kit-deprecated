(() => {
  const { cc, uikit, app } = window;
  const { color4,quat } = cc.math;

  let screen = app.createEntity('screen');
  screen.addComp('Screen');
  screen.addComp('Widget');

  let rot = quat.create();
  quat.fromEuler(rot, 0, 0, 30);

  let dragArea = app.createEntity('dragArea');
  dragArea.setParent(screen);
  let dragWidget = dragArea.addComp('Widget');
  dragWidget.width = 2000;
  dragWidget.height = 2000;

  let ent = app.createEntity('ent');
  ent.setParent(screen);
  // ent.setWorldRot(rot);
  let bgWidget = ent.addComp('Widget');
  bgWidget.width = 300;
  bgWidget.height = 20;
  let bgSprite = ent.addComp('Image');
  bgSprite.color = color4.new(1, 1, 1, 1, );
  let scrollBar = ent.addComp('ScrollBar');

  let area = app.createEntity('area');
  area.setParent(ent);
  let areaWidget = area.addComp('Widget');
  areaWidget.width = 300;
  areaWidget.height = 20;
  areaWidget.setAnchors(0, 0, 1, 1);

  let handle = app.createEntity('handle');
  handle.setParent(area);
  let handleWidget = handle.addComp('Widget');
  handleWidget.width = 20;
  handleWidget.height = 20;
  let handleSprite = handle.addComp('Image');
  handleSprite.color = color4.new(0, 1, 1, 1);

  scrollBar.dragArea = dragArea;
  scrollBar.handle = handle;
  // scrollBar.direction = uikit.VERTICAL;
  // scrollBar.reverse = true;
  // scrollBar.scrollPos = 0.3;
  scrollBar.value = 0.3;
})();