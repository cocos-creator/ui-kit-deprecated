(() => {
  const { cc, app, uikit } = window;
  const { color4 } = cc.math;

  let screen = app.createEntity('screen')
  screen.addComp('Screen');

  let entity = app.createEntity('scrollView');
  entity.setParent(screen);
  // let scrollWidget = entity.addComp('Widget');
  let scrollSprite = entity.addComp('Image');
  scrollSprite.color = color4.new(1, 1, 1, 1);
  scrollSprite.width = 200;
  scrollSprite.height = 200;
  let scrollView = entity.addComp('ScrollView');
  scrollView.movementType = 'elastic';
  // scrollView.vertical = false;

  let vScrollBarEnt = app.createEntity('vScrollBar');
  vScrollBarEnt.setParent(entity);
  // ent.setWorldRot(rot);
  let vScrollBarSprite = vScrollBarEnt.addComp('Image');
  vScrollBarSprite.color = color4.new(1, 1, 1, 1);
  vScrollBarSprite.width = 20;
  vScrollBarSprite.height = 200;
  vScrollBarSprite.setAnchors(1, 0, 1, 1);
  vScrollBarSprite.offsetX = -10;
  vScrollBarSprite.marginBottom = 20;
  let vScrollBar = vScrollBarEnt.addComp('ScrollBar');
  vScrollBar.scrollView = scrollView;

  let vScrollBarArea = app.createEntity('vScrollBarArea');
  vScrollBarArea.setParent(vScrollBarEnt);
  let vScrollBarAreaWidget = vScrollBarArea.addComp('Widget');
  vScrollBarAreaWidget.width = 20;
  vScrollBarAreaWidget.height = 200;
  vScrollBarAreaWidget.marginTop = 10;
  vScrollBarAreaWidget.marginBottom = 10;
  vScrollBarAreaWidget.setAnchors(0, 0, 1, 1);

  let vScrollBarHandle = app.createEntity('vScrollBarHandle');
  vScrollBarHandle.setParent(vScrollBarArea);
  let vScrollBarHandleSprite = vScrollBarHandle.addComp('Image');
  vScrollBarHandleSprite.color = color4.new(0, 1, 1, 1);
  vScrollBarHandleSprite.width = 20;
  vScrollBarHandleSprite.height = 20;
  vScrollBarHandleSprite.marginTop = -10;
  vScrollBarHandleSprite.marginBottom = -10;

  vScrollBar.dragArea = screen;
  vScrollBar.handle = vScrollBarHandle;
  vScrollBar.direction = 'vertical';
  vScrollBar.reverse = true;
  // vScrollBar.scrollPos = 0.3;

  let hScrollBarEnt = app.createEntity('hScrollBar');
  hScrollBarEnt.setParent(entity);
  // ent.setWorldRot(rot);
  let hScrollBarSprite = hScrollBarEnt.addComp('Image');
  hScrollBarSprite.color = color4.new(1, 1, 1, 1);
  hScrollBarSprite.width = 200;
  hScrollBarSprite.height = 20;
  hScrollBarSprite.setAnchors(0, 0, 1, 0);
  hScrollBarSprite.offsetY = 10;
  hScrollBarSprite.marginRight = 20;
  let hScrollBar = hScrollBarEnt.addComp('ScrollBar');
  hScrollBar.scrollView = scrollView;

  let hScrollBarArea = app.createEntity('hScrollBarArea');
  hScrollBarArea.setParent(hScrollBarEnt);
  let hScrollBarAreaWidget = hScrollBarArea.addComp('Widget');
  hScrollBarAreaWidget.width = 200;
  hScrollBarAreaWidget.height = 20;
  hScrollBarAreaWidget.marginLeft = 10;
  hScrollBarAreaWidget.marginRight = 10;
  hScrollBarAreaWidget.setAnchors(0, 0, 1, 1);

  let hScrollBarHandle = app.createEntity('hScrollBarHandle');
  hScrollBarHandle.setParent(hScrollBarArea);
  let hScrollBarHandleSprite = hScrollBarHandle.addComp('Image');
  hScrollBarHandleSprite.color = color4.new(0, 1, 1, 1);
  hScrollBarHandleSprite.width = 20;
  hScrollBarHandleSprite.height = 20;
  hScrollBarHandleSprite.marginLeft = -10;
  hScrollBarHandleSprite.marginRight = -10;

  hScrollBar.dragArea = screen;
  hScrollBar.handle = hScrollBarHandle;
  hScrollBar.direction = 'horizontal';
  // hScrollBar.reverse = true;
  // hScrollBar.scrollPos = 0.3;

  let view = app.createEntity('view');
  view.setParent(entity);
  let viewSprite = view.addComp('Image');
  viewSprite.color = color4.new(1, 0, 1, 1);
  viewSprite.width = 200;
  viewSprite.height = 200;
  viewSprite.setAnchors(0, 0, 1, 1);
  viewSprite.marginRight = 20;
  viewSprite.marginBottom = 20;
  // let viewMask = view.addComp('Mask');

  let content = app.createEntity('content');
  content.setParent(view);
  let contentSprite = content.addComp('Image');
  contentSprite.color = color4.new(1, 0, 0, 1);
  contentSprite.width = 200;
  contentSprite.height = 300;
  contentSprite.setPivot(1, 1);

  let temp = app.createEntity('temp');
  temp.setParent(content);
  let tempSprite = temp.addComp('Image');
  tempSprite.color = color4.new(1, 1, 0, 1);
  tempSprite.width = 50;
  tempSprite.height = 50;

  scrollView.moveArea = screen;
  scrollView.content = content;
  scrollView.viewPort = view;
  // scrollView.horizontal = false;
  scrollView.vScroll = vScrollBar;
  scrollView.hScroll = hScrollBar;
})();