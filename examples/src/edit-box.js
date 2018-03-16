(() => {
  const { cc, app } = window;
  const { resl, path } = cc;
  const { color4, vec3 } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');
  let screenWidget = screen.getComp('Widget');

  let ent = app.createEntity('entity');
  ent.setParent(screen);
  let sprite = ent.addComp('Image');
  sprite.color = color4.create();
  sprite.width = 350;
  sprite.height = 80;
  let entEditor = ent.addComp('EditBox');
  entEditor.background = ent;
  entEditor.transition = 'color';
  entEditor.transitionColors.normal = color4.new(1, 1, 1, 1);
  entEditor.transitionColors.highlight = color4.new(0.3, 1, 1, 1);
  entEditor.transitionColors.pressed = color4.new(0.8, 0.8, 0.8, 1);
  entEditor.transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
  entEditor._updateState();

  let placeHolder = app.createEntity('place');
  placeHolder.setParent(ent);
  let placeText = placeHolder.addComp('Text');
  placeText.color = color4.new(0.2, 0.2, 0.2, 1);
  placeText.setMargin(10, 5, 10, 5);
  placeText.setAnchors(0, 0, 1, 1);
  placeText.text = 'Enter text here...';

  let input = app.createEntity('input');
  input.setParent(ent);
  let inputTextComp = input.addComp('Text');
  inputTextComp.color = color4.new(0, 0, 0, 1);
  inputTextComp.width = 330;
  inputTextComp.height = 70;
  inputTextComp.setAnchors(0, 0, 1, 1);
  inputTextComp.setMargin(5, 5, 5, 5);

  entEditor.placeHolder = placeHolder;
  entEditor.textComp = input;
  entEditor.contentType = 'standard';
  entEditor.lineType = 'single-line';
  entEditor.maxLength = 10;
})();