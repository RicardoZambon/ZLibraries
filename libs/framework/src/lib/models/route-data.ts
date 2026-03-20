/**
 * Key used in Angular route `data` to identify the framework tab view type.
 *
 * Usage in route config:
 * ```ts
 * {
 *   path: ':id',
 *   component: MyDetailsViewComponent,
 *   data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details, ... },
 * }
 * ```
 */
export const FRAMEWORK_VIEW_TYPE: string = 'frameworkViewType';

/**
 * Values for the {@link FRAMEWORK_VIEW_TYPE} route data key.
 */
export enum FrameworkViewType {
  /** A details/edit view with data provider and sub-views (breadcrumbs, save, etc.). */
  Details = 'details',
  /** A list/grid view (no data provider, no sub-views). */
  List = 'list',
}
