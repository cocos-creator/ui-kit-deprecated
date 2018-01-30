(() => {
  const { cc, app, uikit } = window;
  const { color4 } = cc.math;

  let screen = app.createEntity('screen')
  screen.addComp('Screen');

  let entity = app.createEntity('scrollView');
  entity.setParent(screen);
  let scrollWidget = entity.addComp('Widget');
  scrollWidget.width = 2000;
  scrollWidget.height = 2000;
  let scrollView = entity.addComp('ScrollView');
  scrollView.movementType = 'elastic';
  // scrollView.vertical = false;

  let view = app.createEntity('view');
  view.setParent(screen);
  let viewSprite = view.addComp('Image');
  viewSprite.color = color4.new(1, 0, 1, 1);
  viewSprite.width = 100;
  viewSprite.height = 100;
  // let viewMask = view.addComp('Mask');

  let content = app.createEntity('content');
  content.setParent(view);
  let contentSprite = content.addComp('Image');
  contentSprite.color = color4.new(1, 0, 0, 1);
  contentSprite.width = 150;
  contentSprite.height = 200;
  contentSprite.setPivot(1, 1);

  let temp = app.createEntity('temp');
  temp.setParent(content);
  let tempSprite = temp.addComp('Image');
  tempSprite.color = color4.new(1, 1, 0, 1);
  tempSprite.width = 50;
  tempSprite.height = 50;

  scrollView.content = content;
  scrollView.viewPort = view;
})();