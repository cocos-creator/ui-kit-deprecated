(() => {
  const { cc, app, uikit } = window;
  const { resl,path } = cc;
  const { color4,vec3 } = cc.math;

  let screen = app.createEntity('screen');
  screen.addComp('Screen');
  screen.addComp('Widget');

  let otherArea = app.createEntity('otherArea');
  otherArea.setParent(screen);
  let otherAreaWidget = otherArea.addComp('Widget');
  otherAreaWidget.width = 960;
  otherAreaWidget.height = 640;

  let ent = app.createEntity('entity');
  ent.setParent(screen);
  let widget = ent.addComp('Widget');
  widget.width = 300;
  widget.height = 40;
  let sprite = ent.addComp('Image');
  sprite.color = color4.create();
  var entEditor = ent.addComp('EditBox');
  entEditor.setTargetSprite(sprite);
  entEditor.setTransition(uikit.BUTTON_TRANSITION_COLOR_TINT);
  entEditor.setTransitionColor(color4.new(1, 0, 0, 1), uikit.BUTTON_STATE_HIGHLIGHT);
  entEditor.setTransitionColor(color4.new(0, 1, 0, 1), uikit.BUTTON_STATE_PRESSED);
  entEditor.setTransitionColor(color4.new(1, 0, 0, 1), uikit.BUTTON_STATE_DISABLED);
  entEditor.otherArea = otherArea;

  let placeHolder = app.createEntity('place');
  placeHolder.setParent(ent);
  let placeWidget = placeHolder.addComp('Widget');
  placeWidget.setAnchors(0, 0, 1, 1);
  let placeText = placeHolder.addComp('Text');

  let input = app.createEntity('input');
  input.setParent(ent);
  let inputWidget = input.addComp('Widget');
  inputWidget.width = 280;
  inputWidget.height = 30;
  inputWidget.setAnchors(0, 0, 1, 1);
  inputWidget.setMargin(5, 5, 5, 5);
  let inputTextComp = input.addComp('Text');
  let inputMask = input.addComp('Mask');

  placeText.text = 'Enter text here...';
  entEditor.placeHolder = placeText;
  entEditor.textComp = inputTextComp;
  entEditor.contentType = 'standard';
  entEditor.lineType = 'multi-line';
  entEditor.maxLength = 10;
})();