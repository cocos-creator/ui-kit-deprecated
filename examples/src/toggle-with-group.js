(() => {
  const app = window.app;
  const cc = window.cc;
  const { ui } = cc;
  const { color4 } = cc.math;
  let screenEntity = app.createEntity('screen');
  let screen = screenEntity.addComp('Screen');
  screenEntity.addComp('Widget');

  function addToggle(x, y, parent) {
    let entity = app.createEntity('back');
    entity.setParent(parent);
    let widget = entity.addComp('Widget');
    widget.width = 128;
    widget.height = 128;
    widget.offsetX = x;
    widget.offsetY = y;
    widget.setAnchors(0.5, 0.5, 0.5, 0.5);
    let spriteCmp = entity.addComp('Image');

    let e2 = app.createEntity('checkMark');
    e2.setParent(parent);
    let w2 = e2.addComp('Widget');
    w2.width = 96;
    w2.height = 96;
    w2.offsetX = x;
    w2.offsetY = y;
    w2.setAnchors(0.5, 0.5, 0.5, 0.5);
    let sprite2 = e2.addComp('Image');
    sprite2.color = color4.new(1, 0, 0, 1);

    let e3 = app.createEntity('toggle');
    e3.setParent(parent);
    let w3 = e3.addComp('Widget');
    w3.width = 128;
    w3.height = 128;
    w3.offsetX = x;
    w3.offsetY = y;
    w3.setAnchors(0.5, 0.5, 0.5, 0.5);
    let toggleCmp = e3.addComp('Toggle');
    toggleCmp.setTargetSprite(spriteCmp);
    toggleCmp.setCheckMark(sprite2);

    //set toggle group

    let toggleGroup = parent.getComp('ToggleGroup');
    if (toggleGroup) {
      toggleCmp.toggleGroup = toggleGroup;
    }

  }

  let toggleEntity = app.createEntity('toggle-group');
  toggleEntity.setParent(screenEntity);
  let rectTM = toggleEntity.addComp('Widget');
  rectTM.width = screen._width;
  rectTM.height = screen._height;
  rectTM.setAnchors(0.5, 0.5, 0.5, 0.5);
  toggleEntity.addComp('ToggleGroup').allowSwitchOff = true;
  // let dumySprite = toggleEntity.addComp('Sprite');
  addToggle(-150, 0, toggleEntity);
  addToggle(0, 0, toggleEntity);
  addToggle(150, 0, toggleEntity);

})();