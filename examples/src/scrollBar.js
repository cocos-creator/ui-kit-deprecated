(() => {
  const { cc, uikit, app } = window;
  const { color4, quat, vec3 } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let rot = quat.create();
  quat.fromEuler(rot, 0, 0, 30);

  // horizontal
  {
    let ent = app.createEntity('ent');
    ent.setParent(screen);
    // ent.setWorldRot(rot);
    let bgSprite = ent.addComp('Image');
    bgSprite.color = color4.new(1, 1, 1, 1);
    bgSprite.setOffset(-150, 0);
    bgSprite.width = 320;
    bgSprite.height = 60;
    let scrollBar = ent.addComp('ScrollBar');

    let area = app.createEntity('area');
    area.setParent(ent);
    let areaWidget = area.addComp('Widget');
    areaWidget.width = 320;
    areaWidget.height = 60;
    areaWidget.marginLeft = 10;
    areaWidget.marginRight = 10;
    areaWidget.setAnchors(0, 0, 1, 1);

    let handle = app.createEntity('handle');
    handle.setParent(area);
    let handleSprite = handle.addComp('Image');
    handleSprite.width = 20;
    handleSprite.height = 60;
    handleSprite.marginLeft = -10;
    handleSprite.marginRight = -10;
    scrollBar.background = handle;
    scrollBar.transition = 'color';
    scrollBar.transitionColors.normal = color4.new(0, 1, 1, 1);
    scrollBar.transitionColors.highlight = color4.new(1, 1, 0, 1);
    scrollBar.transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    scrollBar.transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
    scrollBar._updateState();

    scrollBar.handle = handle;
    scrollBar.size = 0.1;
  }

  // vertical reverse
  {
    let ent = app.createEntity('ent');
    ent.setParent(screen);
    // ent.setWorldRot(rot);
    let bgSprite = ent.addComp('Image');
    bgSprite.color = color4.new(1, 1, 1, 1);
    bgSprite.width = 60;
    bgSprite.height = 320;
    bgSprite.setOffset(200, 0);
    let scrollBar = ent.addComp('ScrollBar');

    let area = app.createEntity('area');
    area.setParent(ent);
    let areaWidget = area.addComp('Widget');
    areaWidget.width = 60;
    areaWidget.height = 320;
    areaWidget.marginTop = 10;
    areaWidget.marginBottom = 10;
    areaWidget.setAnchors(0, 0, 1, 1);

    let handle = app.createEntity('handle');
    handle.setParent(area);
    let handleSprite = handle.addComp('Image');
    handleSprite.width = 60;
    handleSprite.height = 20;
    handleSprite.marginTop = -10;
    handleSprite.marginBottom = -10;
    scrollBar.background = handle;
    scrollBar.transition = 'color';
    scrollBar.transitionColors.normal = color4.new(0, 1, 1, 1);
    scrollBar.transitionColors.highlight = color4.new(1, 1, 0, 1);
    scrollBar.transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    scrollBar.transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
    scrollBar._updateState();

    scrollBar.handle = handle;
    scrollBar.direction = 'vertical';
    scrollBar.reverse = true;
    scrollBar.size = 0.1;
  }
})();