import { GridConfigs } from './grid-configs';

export interface DataGridConfigs extends GridConfigs {
  hideBorders?: boolean;
  hideColumnHeaders?: boolean;
  multiSelect?: boolean;
  multiSelectSize?: string;
  selectOnClick?: boolean;
  showMessageOnEmpty?: boolean;
}