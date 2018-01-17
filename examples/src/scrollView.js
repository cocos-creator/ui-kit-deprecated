(() => {
  const { cc, app, uikit } = window;
  const { color4 } = cc.math;

  let screen = app.createEntity('screen')
  screen.addComp('Screen');
  screen.addComp('Widget');

  let view = app.createEntity('view');
  view.setParent(screen);
  let viewWidget = view.addComp('Widget');
  viewWidget.width = 100;
  viewWidget.height = 100;
  let viewSprite = view.addComp('Image');
  viewSprite.color = color4.new(1, 0, 1, 1);
  // let viewMask = view.addComp('Mask');

  let content = app.createEntity('content');
  content.setParent(view);
  let contentWidget = content.addComp('Widget');
  contentWidget.width = 200;
  contentWidget.height = 300;
  contentWidget.setPivot(1, 1);
  let contentSprite = content.addComp('Image');
  contentSprite.color = color4.new(1, 0, 0, 1);

  let entity = app.createEntity('scrollView');
  entity.setParent(screen);
  let widget = entity.addComp('Widget');
  widget.width = 2000;
  widget.height = 2000;
  let scrollView = entity.addComp('ScrollView');
  // scrollView.movementType = uikit.CLAMPED;
  // scrollView.vertical = false;

  scrollView.content = content;
  scrollView.viewPort = view;
})();