(() => {
  const { cc, app } = window;
  const { vec3, color4 } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  // button1 (simple)
  {
    let ent = app.createEntity('button');
    ent.setParent(screen);
    let image = ent.addComp('Image');
    image._width = 200;
    image._height = 50;
    image.setOffset(0, 50);
    image.setAnchors(0.5, 0.5, 0.5, 0.5);
    let button = ent.addComp('Button');
    button._background = image;
    button._transition = 'color';
    button._transitionColors.normal = color4.new(0.8, 0.8, 0.8, 1);
    button._transitionColors.highlight = color4.new(1, 1, 0, 1);
    button._transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    button._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
    button._updateState();
  }

  // button2 (with text)
  {
    let ent = app.createEntity('button-02');
    ent.setParent(screen);
    let image = ent.addComp('Image');
    image._width = 200;
    image._height = 50;
    image.setOffset(0, -50);
    image.setAnchors(0.5, 0.5, 0.5, 0.5);
    let button = ent.addComp('Button');

    let entLabel = app.createEntity('label');
    entLabel.setParent(ent);
    let text = entLabel.addComp('Text');
    text.setAnchors(0, 0, 1, 1);
    text._text = 'Foobar';
    text._color = color4.new(0, 0, 0, 1);
    text._align = 'middle-center';

    button._background = image;
    button._transition = 'color';
    button._transitionColors.normal = color4.new(1, 1, 1, 1);
    button._transitionColors.highlight = color4.new(1, 1, 0, 1);
    button._transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    button._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);
    button._updateState();

    ent.on('transition', e => {
      // let state = e.component._state;
      let state = e.detail.newState;

      if (state === 'normal') {
        text.color = color4.new(0, 0, 0, 1);
      } else if (state === 'highlight') {
        text.color = color4.new(1, 0, 0, 1);
      } else if (state === 'pressed') {
        text.color = color4.new(0.2, 0.2, 0.2, 1);
      }
    });
  }
})();