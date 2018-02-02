import cc from 'engine-3d';

import UIElementComponent from './lib/ui-element-component';
import ButtonComponent from './lib/button-component';
import ToggleComponent from './lib/toggle-component';
import ToggleGroupComponent from './lib/toggle-group-component';
import SliderComponent from './lib/slider-component';
import ScrollBarComponent from './lib/scrollBar-component';
import EditBoxComponent from './lib/editBox-component';
import ScrollViewComponent from './lib/scrollView-component';
import UISystem from './lib/ui-system';

cc.registerComponent('UIElement', UIElementComponent);
cc.registerComponent('Button', ButtonComponent);
cc.registerComponent('Toggle', ToggleComponent);
cc.registerComponent('ToggleGroup', ToggleGroupComponent);
cc.registerComponent('Slider', SliderComponent);
cc.registerComponent('ScrollBar', ScrollBarComponent);
cc.registerComponent('EditBox', EditBoxComponent);
cc.registerComponent('ScrollView', ScrollViewComponent);

cc.registerSystem('ui', UISystem, 'UIElement', 0);