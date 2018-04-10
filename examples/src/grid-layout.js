(() => {
  const { cc, app } = window;
  const { vec3, color4 } = cc.math;

  let camEnt = app.createEntity('camera');
  vec3.set(camEnt.lpos, 10, 10, 10);
  camEnt.lookAt(vec3.new(0, 0, 0));
  camEnt.addComp('Camera');

  let screen = app.createEntity('screen');
  screen.addComp('Screen');

  // horizontal
  {
    let ent = app.createEntity('ent');
    ent.setParent(screen);
    let image = ent.addComp('Image');
    image.color = color4.new(1, 1, 1, 0.2);
    image.setOffset(-100, 100);
    image.width = 160;
    image.height = 50;

    for (let i = 0; i < 6; i++) {
      let item = app.createEntity('item' + i);
      item.setParent(ent);
      let img = item.addComp('Image');
      img.color = color4.new(0.8, 0.8, 0.8, 1);
      img.width = 80;
      img.height = 30;

      let child = app.createEntity('tag');
      child.setParent(item);
      let childImg = child.addComp('Text');
      childImg.color = color4.new(0, 0, 1, 1);
      childImg.setAnchors(0, 0, 1, 1);
      childImg.text = 'tag ' + i;
    }

    let grid = ent.addComp('GridLayout');
    grid.setCellSize(85, 35);
    grid.setPivot(0.5, 1);
    grid.limit = 2;
  }

  // vertical
  {
    let ent = app.createEntity('ent');
    ent.setParent(screen);
    let image = ent.addComp('Image');
    image.color = color4.new(1, 1, 1, 0.2);
    image.setOffset(50, -50);
    image.width = 160;
    image.height = 50;

    for (let i = 0; i < 6; i++) {
      let item = app.createEntity('item' + i);
      item.setParent(ent);
      let img = item.addComp('Image');
      img.color = color4.new(0.8, 0.8, 0.8, 1);
      img.width = 80;
      img.height = 30;

      let child = app.createEntity('tag');
      child.setParent(item);
      let childImg = child.addComp('Text');
      childImg.color = color4.new(0, 0, 1, 1);
      childImg.setAnchors(0, 0, 1, 1);
      childImg.text = 'tag ' + i;
    }

    let grid = ent.addComp('GridLayout');
    grid.setCellSize(85, 35);
    grid.axis = 'vertical';
    grid.setPivot(0.5, 1);
    grid.limit = 2;
  }
 })();