import cc from 'engine-3d.js';
import enums from './lib/enums';
import ButtonComponent from './lib/button-component';

cc.extensions.add('uikit', {
  modules: {
    enums,
    ButtonComponent,
  },
  init(app) {
    app.registerClass('Button', ButtonComponent);
  }
});