(() => {
  const { cc, app, uikit } = window;
  const { quat,color4 } = cc.math;

  let screen = app.createEntity('screen');
  screen.addComp('Screen');
  screen.addComp('Widget');

  let rotation = quat.create();
  // quat.fromEuler(rotation, 0, 0, 60);

  let dragArea = app.createEntity('area');
  dragArea.setParent(screen);
  let areaWidget = dragArea.addComp('Widget');
  areaWidget.width = 960;
  areaWidget.height = 640;

  let sliderEnt = app.createEntity('slider');
  sliderEnt.setParent(screen);
  let sliderWidget = sliderEnt.addComp('Widget');
  sliderWidget.width = 300;
  sliderWidget.height = 20;
  sliderEnt.setWorldRot(rotation);
  let sliderComp = sliderEnt.addComp('Slider');

  let tempEnt = app.createEntity('temp');
  tempEnt.setParent(screen);
  let tempWidget = tempEnt.addComp('Widget');
  tempWidget.width = 960;
  tempWidget.height = 640;

  let sliderBg = app.createEntity('bg');
  sliderBg.setParent(sliderEnt);
  let bgWidget = sliderBg.addComp('Widget');
  bgWidget.setAnchors(0, 0, 1, 1);
  // bgWidget.setPivot(0, 0);
  let bgSprite = sliderBg.addComp('Image');
  bgSprite.color = color4.new(1, 1, 1, 1);

  let fillArea = app.createEntity('fillArea');
  fillArea.setParent(sliderEnt);
  let faWidget = fillArea.addComp('Widget');
  faWidget.setAnchors(0, 0, 1, 1);

  let fill = app.createEntity('fill');
  fill.setParent(fillArea);
  let fillWidget = fill.addComp('Widget');
  fillWidget.width = 0;
  fillWidget.height = 0;
  fillWidget.setAnchors(0, 0, 0, 1);
  let fillSprite = fill.addComp('Image');
  fillSprite.color = color4.new(1, 0, 0, 1);

  let handleArea = app.createEntity('handleArea');
  handleArea.setParent(sliderEnt);
  let haWidget = handleArea.addComp('Widget');
  haWidget.setAnchors(0, 0, 1, 1);
  // haWidget.setPivot(0, 0);

  let handle = app.createEntity('handle');
  handle.setParent(handleArea);
  let handleWidget = handle.addComp('Widget');
  handleWidget.width = 20;
  handleWidget.height = 40;
  handleWidget.setAnchors(0, 0, 0, 1);
  handleWidget.marginTop = -10;
  handleWidget.marginBottom = -10;
  let handleSprite = handle.addComp('Image');
  handleSprite.color = color4.new(1, 0, 1, 1);

  sliderComp.dragArea = dragArea;
  sliderComp.handle = handle;
  sliderComp.fill = fill;
  // sliderComp.direction = uikit.VERTICAL;
  // sliderComp.minValue = 100;
  // sliderComp.maxValue = 50;
  window.g_testSlider = sliderEnt;
})();