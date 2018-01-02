import cc from 'engine-3d.js';
import enums from './lib/enums';
import ButtonComponent from './lib/button-component';
import ToggleComponent from './lib/toggle-component';
import ToggleGroupComponent from './lib/toggle-group-component';

if(!cc) {
  console.error('cc is not defined');
}
cc.registerComponent('Button', ButtonComponent);
cc.registerComponent('Toggle', ToggleComponent);
cc.registerComponent('ToggleGroup', ToggleGroupComponent);

export default Object.assign({
}, enums);