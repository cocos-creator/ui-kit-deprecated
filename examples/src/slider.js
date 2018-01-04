(() => {
  const { cc, app, uikit } = window;
  const { color4 } = cc.math;

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let sliderBg = app.createEntity('bg');
  sliderBg.setParent(screen);
  let bgWidget = sliderBg.addComp('Widget');
  bgWidget.width = 300;
  bgWidget.height = 40;
  let bgSprite = sliderBg.addComp('Sprite');
  bgSprite.color = color4.new(1, 1, 1, 1);

  let sliderHandle = app.createEntity('handle');
  sliderHandle.setParent(screen);
  let handleWidget = sliderHandle.addComp('Widget');
  handleWidget.width = 20;
  handleWidget.height = 50;
  let handleSprite = sliderHandle.addComp('Sprite');
  handleSprite.color = color4.new(1, 0, 1, 1);

  let sliderEnt = app.createEntity('slider');
  sliderEnt.setParent(screen);
  let sliderWidget = sliderEnt.addComp('Widget');
  sliderWidget.width = 960;
  sliderWidget.height = 640;
  let sliderComp = sliderEnt.addComp('Slider');
  // sliderComp.setDirection(uikit.VERTICAL);

  sliderComp.init(sliderHandle, sliderBg);
  window.g_testSlider = sliderEnt;
})();