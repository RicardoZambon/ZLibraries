import { GridConfigs } from './grid-configs';

export type DataGridConfigs = GridConfigs & {
  hideBorders?: boolean;
  hideColumnHeaders?: boolean;
  multiSelect?: boolean;
  multiSelectSize?: string;
  selectOnClick?: boolean;
  showMessageOnEmpty?: boolean;
}