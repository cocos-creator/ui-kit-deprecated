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
  sprite._color = color4.create();
  sprite._width = 350;
  sprite._height = 80;
  let entEditor = ent.addComp('EditBox');
  entEditor._background = ent;
  entEditor._transition = 'color';
  entEditor._transitionColors.normal = color4.new(1, 1, 1, 1);
  entEditor._transitionColors.highlight = color4.new(0.3, 1, 1, 1);
  entEditor._transitionColors.pressed = color4.new(0.8, 0.8, 0.8, 1);
  entEditor._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
  entEditor._updateState();

  let input = app.createEntity('input');
  input.setParent(ent);
  let inputTextComp = input.addComp('Text');
  inputTextComp._color = color4.new(0, 0, 0, 1);
  inputTextComp._width = 330;
  inputTextComp._height = 70;
  inputTextComp.setAnchors(0, 0, 1, 1);
  inputTextComp.setMargin(5, 5, 5, 5);

  entEditor._defaultText = 'please enter here';
  entEditor._textComp = inputTextComp;
  entEditor._contentType = 'password';
  // entEditor._lineType = 'multi-line';
  entEditor._returnKeyType = 'submit';
})();