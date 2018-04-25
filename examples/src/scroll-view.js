(() => {
  const { cc, app, uikit } = window;
  const { vec3,color4 } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  let entity = app.createEntity('scrollView');
  entity.setParent(screen);
  let scrollSprite = entity.addComp('Image');
  scrollSprite._color = color4.new(1, 1, 1, 1);
  scrollSprite._width = 220;
  scrollSprite._height = 220;
  let scrollView = entity.addComp('ScrollView');

  let view = app.createEntity('view');
  view.setParent(entity);
  let viewSprite = view.addComp('Image');
  viewSprite._color = color4.new(1, 0, 1, 1);
  viewSprite._width = 200;
  viewSprite._height = 200;
  viewSprite.setAnchors(0, 0, 1, 1);
  viewSprite._marginRight = 20;
  viewSprite._marginBottom = 20;
  // let viewMask = view.addComp('Mask');

  let content = app.createEntity('content');
  content.setParent(view);
  let contentSprite = content.addComp('Image');
  contentSprite._color = color4.new(0.8, 0.8, 0.8, 1);
  contentSprite._width = 300;
  contentSprite._height = 400;
  contentSprite.setPivot(1, 1);

  let temp = app.createEntity('temp');
  temp.setParent(content);
  let tempSprite = temp.addComp('Image');
  tempSprite._color = color4.new(1, 1, 0, 1);
  tempSprite._width = 50;
  tempSprite._height = 50;

  let vScrollBarEnt = app.createEntity('vScrollBar');
  vScrollBarEnt.setParent(entity);
  // ent.setWorldRot(rot);
  let vScrollBarSprite = vScrollBarEnt.addComp('Image');
  vScrollBarSprite._color = color4.new(1, 1, 1, 1);
  vScrollBarSprite._width = 20;
  vScrollBarSprite._height = 200;
  vScrollBarSprite.setAnchors(1, 0, 1, 1);
  vScrollBarSprite._offsetX = -10;
  vScrollBarSprite._marginBottom = 20;
  let vScrollBar = vScrollBarEnt.addComp('ScrollBar');

  let vScrollBarArea = app.createEntity('vScrollBarArea');
  vScrollBarArea.setParent(vScrollBarEnt);
  let vScrollBarAreaWidget = vScrollBarArea.addComp('Widget');
  vScrollBarAreaWidget._width = 20;
  vScrollBarAreaWidget._height = 200;
  vScrollBarAreaWidget._marginTop = 10;
  vScrollBarAreaWidget._marginBottom = 10;
  vScrollBarAreaWidget.setAnchors(0, 0, 1, 1);

  let vScrollBarHandle = app.createEntity('vScrollBarHandle');
  vScrollBarHandle.setParent(vScrollBarArea);
  let vScrollBarHandleSprite = vScrollBarHandle.addComp('Image');
  vScrollBarHandleSprite._width = 20;
  vScrollBarHandleSprite._height = 20;
  vScrollBarHandleSprite._marginTop = -10;
  vScrollBarHandleSprite._marginBottom = -10;

  vScrollBar._background = vScrollBarHandle;
  vScrollBar._transition = 'color';
  vScrollBar._transitionColors.normal = color4.new(0, 1, 1, 1);
  vScrollBar._transitionColors.highlight = color4.new(1, 1, 0, 1);
  vScrollBar._transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
  vScrollBar._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
  vScrollBar._updateState();

  vScrollBar._dragArea = screen;
  vScrollBar._handle = vScrollBarHandle;
  vScrollBar._direction = 'vertical';
  vScrollBar._reverse = true;
  // vScrollBar.scrollPos = 0.3;

  let hScrollBarEnt = app.createEntity('hScrollBar');
  hScrollBarEnt.setParent(entity);
  // ent.setWorldRot(rot);
  let hScrollBarSprite = hScrollBarEnt.addComp('Image');
  hScrollBarSprite._color = color4.new(1, 1, 1, 1);
  hScrollBarSprite._width = 200;
  hScrollBarSprite._height = 20;
  hScrollBarSprite.setAnchors(0, 0, 1, 0);
  hScrollBarSprite._offsetY = 10;
  hScrollBarSprite._marginRight = 20;
  let hScrollBar = hScrollBarEnt.addComp('ScrollBar');

  let hScrollBarArea = app.createEntity('hScrollBarArea');
  hScrollBarArea.setParent(hScrollBarEnt);
  let hScrollBarAreaWidget = hScrollBarArea.addComp('Widget');
  hScrollBarAreaWidget._width = 200;
  hScrollBarAreaWidget._height = 20;
  hScrollBarAreaWidget._marginLeft = 10;
  hScrollBarAreaWidget._marginRight = 10;
  hScrollBarAreaWidget.setAnchors(0, 0, 1, 1);

  let hScrollBarHandle = app.createEntity('hScrollBarHandle');
  hScrollBarHandle.setParent(hScrollBarArea);
  let hScrollBarHandleSprite = hScrollBarHandle.addComp('Image');
  hScrollBarHandleSprite.color = color4.new(0, 1, 1, 1);
  hScrollBarHandleSprite.width = 20;
  hScrollBarHandleSprite.height = 20;
  hScrollBarHandleSprite.marginLeft = -10;
  hScrollBarHandleSprite.marginRight = -10;
  hScrollBar._background = hScrollBarHandle;
  hScrollBar._transition = 'color';
  hScrollBar._transitionColors.normal = color4.new(0, 1, 1, 1);
  hScrollBar._transitionColors.highlight = color4.new(1, 1, 0, 1);
  hScrollBar._transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
  hScrollBar._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
  hScrollBar._updateState();

  hScrollBar._dragArea = screen;
  hScrollBar._handle = hScrollBarHandle;
  hScrollBar._direction = 'horizontal';
  // hScrollBar.reverse = true;
  // hScrollBar.scrollPos = 0.3;

  scrollView._content = content;
  scrollView._viewPort = view;
  scrollView._movementType = 'elastic';
  // scrollView.vertical = false;
  // scrollView.horizontal = false;
  scrollView._vScrollBar = vScrollBar;
  scrollView._hScrollBar = hScrollBar;
})();