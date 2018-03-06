import cc from 'engine-3d';

import UIElementComponent from './lib/ui-element-component';
import ButtonComponent from './lib/button-component';
import ToggleComponent from './lib/toggle-component';
import ToggleGroupComponent from './lib/toggle-group-component';
import SliderComponent from './lib/slider-component';
import ScrollBarComponent from './lib/scrollBar-component';
import EditBoxComponent from './lib/editBox-component';
import ScrollViewComponent from './lib/scroll-view-component';
import UISystem from './lib/ui-system';

cc.registerClass('UIElement', UIElementComponent);
cc.registerClass('Button', ButtonComponent);
cc.registerClass('Toggle', ToggleComponent);
cc.registerClass('ToggleGroup', ToggleGroupComponent);
cc.registerClass('Slider', SliderComponent);
cc.registerClass('ScrollBar', ScrollBarComponent);
cc.registerClass('EditBox', EditBoxComponent);
cc.registerClass('ScrollView', ScrollViewComponent);

cc.registerSystem('ui', UISystem, 'UIElement', 0);