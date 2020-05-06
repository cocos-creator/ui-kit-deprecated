(() => {
  const { cc, app } = window;
  const { vec3, color3, color4, quat } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  // toggle1 (simple)
  {
    let ent = app.createEntity('toggle');
    ent.setParent(screen);
    let image = ent.addComp('Image');
    image._width = 40;
    image._height = 40;
    image.setOffset(0, 50);
    image.setAnchors(0.5, 0.5, 0.5, 0.5);
    let toggle = ent.addComp('Toggle');
    toggle._transition = 'color';
    toggle._transitionColors.normal = color4.new(0.8, 0.8, 0.8, 1);
    toggle._transitionColors.highlight = color4.new(1, 1, 0, 1);
    toggle._transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    toggle._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);

    let checker = app.createEntity('checker');
    checker.setParent(ent);
    let checkerImage = checker.addComp('Image');
    checkerImage._color = color4.new(1, 0, 0, 1);
    checkerImage.setAnchors(0, 0, 1, 1);
    checkerImage.setMargin(5, 5, 5, 5);

    toggle._background = image;
    toggle._checker = checkerImage;
    toggle._updateState();
  }

  // toggle2 (with text)
  {
    let entToggle = app.createEntity('toggle-02');
    entToggle.setParent(screen);

    let widget = entToggle.addComp('Widget');
    widget._width = 200;
    widget._height = 40;
    widget.setOffset(0, -50);

    let toggle = entToggle.addComp('Toggle');
    toggle._transition = 'color';
    toggle._transitionColors.normal = color4.new(0.8, 0.8, 0.8, 1);
    toggle._transitionColors.highlight = color4.new(1, 1, 0, 1);
    toggle._transitionColors.pressed = color4.new(0.5, 0.5, 0.5, 1);
    toggle._transitionColors.disabled = color4.new(0.2, 0.2, 0.2, 1);

    let entBG = app.createEntity('background');
    entBG.setParent(entToggle);
    let image = entBG.addComp('Image');
    image._width = 40;
    image._height = 40;
    image.setAnchors(0, 1, 0, 1);
    image.setPivot(0, 1);

    let entChecker = app.createEntity('checker');
    entChecker.setParent(entBG);
    let checkerImage = entChecker.addComp('Image');
    checkerImage._color = color4.new(1, 0, 0, 1);
    checkerImage.setAnchors(0, 0, 1, 1);
    checkerImage.setMargin(5, 5, 5, 5);

    let entLabel = app.createEntity('label');
    entLabel.setParent(entToggle);
    let text = entLabel.addComp('Text');
    text.setAnchors(0, 0, 1, 1);
    text.setMargin(45, 5, 5, 5);
    text._text = 'Foobar';
    text._color = color4.new(0.1, 0.1, 0.1, 1);
    text._align = 'left-center';

    //
    toggle._background = image;
    toggle._checker = checkerImage;
    toggle._updateState();
  }

  // DEBUG
  app.on('tick', () => {
    cc.utils.walk(screen, ent => {
      let color = color3.new(0, 0, 0);
      let a = vec3.create();
      let b = vec3.create();
      let c = vec3.create();
      let d = vec3.create();
      let wpos = vec3.create();
      let wrot = quat.create();

      let widget = ent.getComp('Widget');
      widget.getWorldCorners(a, b, c, d);

      // rect
      app.debugger.drawLine2D(a, b, color);
      app.debugger.drawLine2D(b, c, color);
      app.debugger.drawLine2D(c, d, color);
      app.debugger.drawLine2D(d, a, color);

      app.debugger.drawAxes2D(
        ent.getWorldPos(wpos),
        ent.getWorldRot(wrot),
        5.0
      );
    });
  });
})();