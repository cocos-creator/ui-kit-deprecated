import cc from 'engine-3d';
import enums from './lib/enums';
import ButtonComponent from './lib/button-component';
import ToggleComponent from './lib/toggle-component';
import ToggleGroupComponent from './lib/toggle-group-component';

cc.registerComponent('Button', ButtonComponent);

export default Object.assign({
}, enums);