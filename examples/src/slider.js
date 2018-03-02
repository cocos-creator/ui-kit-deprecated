(() => {
  const { cc, app, uikit } = window;
  const { vec3, quat, color4 } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let direction = 'horizontal';
  let rotation = quat.create();
  // quat.fromEuler(rotation, 0, 0, 60);

  let sliderEnt = app.createEntity('slider');
  sliderEnt.setParent(screen);
  let sliderWidget = sliderEnt.addComp('Widget');
  if (direction === 'horizontal') {
    sliderWidget.width = 500;
    sliderWidget.height = 100;
  } else {
    sliderWidget.width = 100;
    sliderWidget.height = 500;
  }
  sliderEnt.setWorldRot(rotation);
  let sliderComp = sliderEnt.addComp('Slider');
  sliderComp.direction = direction;

  let sliderBg = app.createEntity('bg');
  sliderBg.setParent(sliderEnt);
  let bgSprite = sliderBg.addComp('Image');
  bgSprite.color = color4.new(1, 1, 1, 1);
  bgSprite.setAnchors(0, 0, 1, 1);
  // bgSprite.setPivot(0, 0);

  let fillArea = app.createEntity('fillArea');
  fillArea.setParent(sliderEnt);
  let faWidget = fillArea.addComp('Widget');
  faWidget.setAnchors(0, 0, 1, 1);

  let fill = app.createEntity('fill');
  fill.setParent(fillArea);
  let fillSprite = fill.addComp('Image');
  fillSprite.color = color4.new(1, 0, 0, 1);
  fillSprite.width = 0;
  fillSprite.height = 0;
  if (direction === 'horizontal') {
    fillSprite.setAnchors(0, 0, 0, 1);
  } else {
    fillSprite.setAnchors(0, 0, 1, 0);
  }

  let handleArea = app.createEntity('handleArea');
  handleArea.setParent(sliderEnt);
  let haWidget = handleArea.addComp('Widget');
  haWidget.setAnchors(0, 0, 1, 1);
  // haWidget.setPivot(0, 0);

  let handle = app.createEntity('handle');
  handle.setParent(handleArea);
  let handleSprite = handle.addComp('Image');
  if (direction === 'horizontal') {
    handleSprite.width = 80;
    handleSprite.height = 120;
    handleSprite.setAnchors(0, 0, 0, 1);
    handleSprite.marginTop = -10;
    handleSprite.marginBottom = -10;
  } else {
    handleSprite.width = 120;
    handleSprite.height = 80;
    handleSprite.setAnchors(0, 0, 1, 0);
    handleSprite.marginLeft = -10;
    handleSprite.marginRight = -10;
  }
  sliderComp.background = handle;
  sliderComp.transition = 'color';
  sliderComp.transitionColors.normal = color4.new(0, 1, 1, 1);
  sliderComp.transitionColors.highlight = color4.new(1, 1, 0, 1);
  sliderComp.transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
  sliderComp.transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
  sliderComp._updateState();

  sliderComp.handle = handle;
  sliderComp.fill = fill;
  // sliderComp.minValue = 100;
  // sliderComp.maxValue = 50;
  window.g_testSlider = sliderEnt;
})();