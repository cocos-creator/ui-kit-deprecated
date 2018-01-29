import cc from 'engine-3d';
import enums from './lib/enums';
import ButtonComponent from './lib/button-component';
import ToggleComponent from './lib/toggle-component';
import ToggleGroupComponent from './lib/toggle-group-component';
import SliderComponent from './lib/slider-component';
import ScrollBarComponent from './lib/scrollBar-component';
import EditBoxComponent from './lib/editBox-component';
import ScrollViewComponent from './lib/scrollView-component';

if(!cc) {
  console.error('cc is not defined');
}
cc.registerComponent('Button', ButtonComponent);
cc.registerComponent('Toggle', ToggleComponent);
cc.registerComponent('ToggleGroup', ToggleGroupComponent);
cc.registerComponent('Slider', SliderComponent);
cc.registerComponent('ScrollBar', ScrollBarComponent);
cc.registerComponent('EditBox', EditBoxComponent);
cc.registerComponent('ScrollView', ScrollViewComponent);

export default Object.assign({
}, enums);