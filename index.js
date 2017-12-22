import cc from 'engine-3d';
import enums from './lib/enums';
import ButtonComponent from './lib/button-component';
import ToggleComponent from './lib/toggle-component';

cc.registerComponent('Button', ButtonComponent);

export default Object.assign({
}, enums);