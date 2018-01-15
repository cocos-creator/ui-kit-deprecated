(() => {
  const { cc, app, uikit } = window;
  const { quat,color4 } = cc.math;

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let rotation = quat.create();
  // quat.fromEuler(rotation, 0, 0, 60);

  let tempEnt = app.createEntity('temp');
  tempEnt.setParent(screen);
  let tempWidget = tempEnt.addComp('Widget');
  tempWidget.width = 960;
  tempWidget.height = 640;

  let sliderBg = app.createEntity('bg');
  sliderBg.setParent(tempEnt);
  let bgWidget = sliderBg.addComp('Widget');
  bgWidget.width = 300;
  bgWidget.height = 20;
  // bgWidget.setPivot(0, 0);
  sliderBg.setWorldRot(rotation);
  let bgSprite = sliderBg.addComp('Image');
  bgSprite.color = color4.new(1, 1, 1, 1);

  let handleArea = app.createEntity('handleArea');
  handleArea.setParent(tempEnt);
  let haWidget = handleArea.addComp('Widget');
  haWidget.width = 300;
  haWidget.height = 40;
  // haWidget.setPivot(0, 0);
  handleArea.setWorldRot(rotation);

  let sliderHandle = app.createEntity('handle');
  sliderHandle.setParent(handleArea);
  let handleWidget = sliderHandle.addComp('Widget');
  handleWidget.width = 20;
  handleWidget.height = 40;
  let handleSprite = sliderHandle.addComp('Image');
  handleSprite.color = color4.new(1, 0, 1, 1);

  let sliderEnt = app.createEntity('slider');
  sliderEnt.setParent(screen);
  let sliderWidget = sliderEnt.addComp('Widget');
  sliderWidget.width = 2000;
  sliderWidget.height = 2000;
  let sliderComp = sliderEnt.addComp('Slider');

  sliderComp._init(sliderHandle, handleArea, sliderBg);
  // sliderComp.direction = uikit.VERTICAL;
  // sliderComp.minValue = 100;
  // sliderComp.maxValue = 50;
  window.g_testSlider = sliderEnt;
})();