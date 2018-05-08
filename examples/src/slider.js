(() => {
  const { cc, app, uikit } = window;
  const { vec3, quat, color4 } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let rotation = quat.create();
  // quat.fromEuler(rotation, 0, 0, 60);
  // toggle horizontal
  {
    let sliderEnt = app.createEntity('slider');
    sliderEnt.setParent(screen);
    let sliderWidget = sliderEnt.addComp('Widget');
    sliderWidget._width = 350;
    sliderWidget._height = 80;
    sliderWidget.setOffset(-100, 0);
    sliderEnt.setWorldRot(rotation);
    let sliderComp = sliderEnt.addComp('Slider');
    sliderComp._direction = 'horizontal';

    let sliderBg = app.createEntity('bg');
    sliderBg.setParent(sliderEnt);
    let bgSprite = sliderBg.addComp('Image');
    bgSprite._color = color4.new(1, 1, 1, 1);
    bgSprite.setAnchors(0, 0, 1, 1);
    // bgSprite.setPivot(0, 0);

    let fillArea = app.createEntity('fillArea');
    fillArea.setParent(sliderEnt);
    let faWidget = fillArea.addComp('Widget');
    faWidget.setAnchors(0, 0, 1, 1);

    let fill = app.createEntity('fill');
    fill.setParent(fillArea);
    let fillSprite = fill.addComp('Image');
    fillSprite._color = color4.new(1, 0, 0, 1);
    fillSprite._width = 0;
    fillSprite._height = 0;
    fillSprite.setAnchors(0, 0, 0, 1);

    let handleArea = app.createEntity('handleArea');
    handleArea.setParent(sliderEnt);
    let haWidget = handleArea.addComp('Widget');
    haWidget.setAnchors(0, 0, 1, 1);
    // haWidget.setPivot(0, 0);

    let handle = app.createEntity('handle');
    handle.setParent(handleArea);
    let handleSprite = handle.addComp('Image');
    handleSprite._color = color4.new(0, 1, 1, 1);
    handleSprite._width = 50;
    handleSprite._height = 80;
    handleSprite.setAnchors(0, 0, 0, 1);
    handleSprite._marginTop = -10;
    handleSprite._marginBottom = -10;
    sliderComp._background = handle;
    sliderComp._transition = 'color';
    sliderComp._transitionColors.normal = color4.new(0, 1, 1, 1);
    sliderComp._transitionColors.highlight = color4.new(1, 1, 0, 1);
    sliderComp._transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    sliderComp._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
    sliderComp._updateState();

    sliderComp._handle = handle;
    sliderComp._fill = fill;
  }

  // toggle vertical
  {
    let sliderEnt = app.createEntity('slider');
    sliderEnt.setParent(screen);
    let sliderWidget = sliderEnt.addComp('Widget');
    sliderWidget._width = 80;
    sliderWidget._height = 350;
    sliderWidget.setOffset(200, 0);
    sliderEnt.setWorldRot(rotation);
    let sliderComp = sliderEnt.addComp('Slider');
    sliderComp._direction = 'vertical';

    let sliderBg = app.createEntity('bg');
    sliderBg.setParent(sliderEnt);
    let bgSprite = sliderBg.addComp('Image');
    bgSprite._color = color4.new(1, 1, 1, 1);
    bgSprite.setAnchors(0, 0, 1, 1);
    // bgSprite.setPivot(0, 0);

    let fillArea = app.createEntity('fillArea');
    fillArea.setParent(sliderEnt);
    let faWidget = fillArea.addComp('Widget');
    faWidget.setAnchors(0, 0, 1, 1);

    let fill = app.createEntity('fill');
    fill.setParent(fillArea);
    let fillSprite = fill.addComp('Image');
    fillSprite._color = color4.new(1, 0, 0, 1);
    fillSprite._width = 0;
    fillSprite._height = 0;
    fillSprite.setAnchors(0, 0, 1, 0);

    let handleArea = app.createEntity('handleArea');
    handleArea.setParent(sliderEnt);
    let haWidget = handleArea.addComp('Widget');
    haWidget.setAnchors(0, 0, 1, 1);
    // haWidget.setPivot(0, 0);

    let handle = app.createEntity('handle');
    handle.setParent(handleArea);
    let handleSprite = handle.addComp('Image');
    handleSprite._color = color4.new(0, 1, 1, 1);
    handleSprite._width = 80;
    handleSprite._height = 50;
    handleSprite.setAnchors(0, 0, 1, 0);
    handleSprite._marginLeft = -10;
    handleSprite._marginRight = -10;

    sliderComp._background = handle;
    sliderComp._transition = 'color';
    sliderComp._transitionColors.normal = color4.new(0, 1, 1, 1);
    sliderComp._transitionColors.highlight = color4.new(1, 1, 0, 1);
    sliderComp._transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    sliderComp._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
    sliderComp._updateState();

    sliderComp._handle = handle;
    sliderComp._fill = fill;
    sliderComp._reverse = true;
    sliderComp._progress = 0.3;
  }
})();