(() => {
  const { cc, app } = window;
  const { resl, path } = cc;
  const { color4, vec3 } = cc.math;

  let screen = app.createEntity('screen');
  screen.addComp('Screen');
  let screenWidget = screen.getComp('Widget');

  let dragArea = app.createEntity('dragArea');
  dragArea.setParent(screen);
  let dragWidget = dragArea.addComp('Widget');
  dragWidget.width = screenWidget.width;
  dragWidget.height = screenWidget.height;

  let ent = app.createEntity('entity');
  ent.setParent(screen);
  let sprite = ent.addComp('Image');
  sprite.color = color4.create();
  sprite.width = 300;
  sprite.height = 40;
  var entEditor = ent.addComp('EditBox');
  entEditor.setTargetSprite(sprite);
  entEditor.setTransition('button-transition-color-tint');
  entEditor.setTransitionColor(color4.new(1, 0, 0, 1), 'button-state-highlight');
  entEditor.setTransitionColor(color4.new(0, 1, 0, 1), 'button-state-pressed');
  entEditor.setTransitionColor(color4.new(1, 0, 0, 1), 'button-state-disabled');
  entEditor.otherArea = dragArea;

  let placeHolder = app.createEntity('place');
  placeHolder.setParent(ent);
  let placeText = placeHolder.addComp('Text');
  placeText.setAnchors(0, 0, 1, 1);

  let input = app.createEntity('input');
  input.setParent(ent);
  let inputTextComp = input.addComp('Text');
  inputTextComp.width = 280;
  inputTextComp.height = 30;
  inputTextComp.setAnchors(0, 0, 1, 1);
  inputTextComp.setMargin(5, 5, 5, 5);
  let inputMask = input.addComp('Mask');

  placeText.text = 'Enter text here...';
  entEditor.placeHolder = placeText;
  entEditor.textComp = inputTextComp;
  entEditor.contentType = 'standard';
  entEditor.lineType = 'single-line';
  entEditor.maxLength = 10;
})();