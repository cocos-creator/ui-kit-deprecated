import cc from 'engine-3d';
import enums from './lib/enums';
import ButtonComponent from './lib/button-component';
import ToggleComponent from './lib/toggle-component';
import ToggleGroupComponent from './lib/toggle-group-component';
import SliderComponent from './lib/slider-component';

if(!cc) {
  console.error('cc is not defined');
}
cc.registerComponent('Button', ButtonComponent);
cc.registerComponent('Toggle', ToggleComponent);
cc.registerComponent('ToggleGroup', ToggleGroupComponent);
cc.registerComponent('Slider', SliderComponent);

export default Object.assign({
}, enums);