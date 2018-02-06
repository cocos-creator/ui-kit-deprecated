(() => {
  const { cc, app } = window;
  const { vec3, color4 } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  // button1 (simple button)
  {
    let ent = app.createEntity('button');
    ent.setParent(screen);
    let image = ent.addComp('Image');
    image.width = 200;
    image.height = 50;
    image.setOffset(0, 50);
    image.setAnchors(0.5, 0.5, 0.5, 0.5);
    let button = ent.addComp('Button');
    button.target = ent;
    button.transition = 'color';
    button.transitionColors.normal = color4.new(1, 0, 1, 1);
    button.transitionColors.highlight = color4.new(1, 1, 0, 1);
    button.transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    button.transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
    button._updateState();
  }

  // button2 (with text)
  {
    let ent = app.createEntity('button');
    ent.setParent(screen);
    let image = ent.addComp('Image');
    image.width = 200;
    image.height = 50;
    image.setOffset(0, -50);
    image.setAnchors(0.5, 0.5, 0.5, 0.5);
    let button = ent.addComp('Button');
    button.target = ent;
    button.transition = 'color';
    button.transitionColors.normal = color4.new(1, 1, 1, 1);
    button.transitionColors.highlight = color4.new(1, 1, 0, 1);
    button.transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    button.transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
    button._updateState();

    let entLabel = app.createEntity('button2');
    entLabel.setParent(ent);
    let text = entLabel.addComp('Text');
    text.setAnchors(0, 0, 1, 1);
    text.text = 'Foobar';
    text.color = color4.new(0, 0, 0, 1);
    text.align = 'middle-center';
  }
})();