import { GridConfigs } from './grid-configs';

export type DataGridConfigs = GridConfigs & {
  hideBorders?: boolean;
  hideColumnHeaders?: boolean;
  multiSelect?: boolean;
  /**
   * Track size of the selection column. Defaults to `min-content`, the checkbox plus the row's
   * padding. A range such as `minmax(1.5rem, min-content)` only reaches its upper bound when the
   * grid has width to spare; in a narrow grid it stays at the minimum, and the row's padding then
   * leaves the checkbox no room at all.
   */
  multiSelectSize?: string;
  selectOnClick?: boolean;
  showMessageOnEmpty?: boolean;
};
