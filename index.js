import cc from 'engine-3d';
import ButtonComponent from './lib/button-component';

cc.extensions.add('uikit', {
  modules: {
    ButtonComponent,
  },
  init(app) {
    app.registerClass('Button', ButtonComponent);
  }
});