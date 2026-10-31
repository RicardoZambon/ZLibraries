import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

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
export const FRAMEWORK_VIEW_TYPE = 'frameworkViewType';

/**
 * Values for the {@link FRAMEWORK_VIEW_TYPE} route data key.
 */
export enum FrameworkViewType {
  /** A details/edit view with data provider and sub-views (breadcrumbs, save, etc.). */
  Details = 'details',
  /** A list/grid view (no data provider, no sub-views). */
  List = 'list',
}

/**
 * What a details view's `visibleWhen` and `enabledWhen` conditions receive.
 *
 * A context object rather than positional arguments, so a field can be added later without
 * breaking the conditions already written.
 */
export interface IDetailsViewContext<TEntity = any> {
  /** The record the details tab shows: `null` while it loads, for a new record, or after a load error. */
  readonly entity: TEntity | null;
  /** The record's ID, or `undefined` for a new record. */
  readonly entityID: number | undefined;
  /** The details route, the parent of every view. */
  readonly route: ActivatedRouteSnapshot;
}

/**
 * Decides, per record, whether a details view is shown or available.
 *
 * It runs in an injection context, so it may call `inject()` -- a condition can depend on a
 * feature flag, a setting or the signed-in user, not only on the record. It runs again every time
 * the data provider emits the record, so a save or a status change updates the views at once.
 * Return an `Observable` when the answer comes from somewhere asynchronous; the latest value wins.
 * A condition that throws or errors counts as `false`.
 */
export type DetailsViewCondition<TEntity = any> = (
  context: IDetailsViewContext<TEntity>,
) => boolean | Observable<boolean>;

/**
 * The route `data` that the framework reads from one view of a details route -- a child route of
 * the route whose `data` holds `[FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details`.
 *
 * Usage in route config:
 * ```ts
 * children: [
 *   { path: '', component: MyFormComponent, data: { icon: 'fa-dice-d6', title: 'Button-Views-Details' } },
 *   {
 *     path: 'payments',
 *     component: MyPaymentsComponent,
 *     data: <IDetailsViewRouteData<IMyEntity>>{
 *       icon: 'fa-file-invoice-dollar',
 *       title: 'My-Button-Views-Payments',
 *       visibleWhen: ({ entity }: IDetailsViewContext<IMyEntity>) => entity?.isCustomer === true,
 *     },
 *   },
 * ],
 * ```
 */
export interface IDetailsViewRouteData<TEntity = any> {
  /** Actions the user needs for the view to be listed. An empty list asks for none. */
  allowedActions?: string[];
  /** The API controller an audit-history view reads from. */
  controllerName?: string;
  /**
   * When it returns `false`, the view is listed but cannot be chosen. While the first answer is
   * pending the view is unavailable. Ignored on the first view, which every tab lands on.
   */
  enabledWhen?: DetailsViewCondition<TEntity>;
  /** Font Awesome icon class shown beside the view's label. */
  icon?: string;
  /** Leaves the route out of the views menu and the tab history. */
  ignoreRoute?: boolean;
  /** Translation key of the view's label. */
  title?: string;
  /**
   * When it returns `false`, the view is left out of the views menu. While the first answer is
   * pending the view is hidden, so it never appears only to vanish. Ignored on the first view,
   * which every tab lands on.
   */
  visibleWhen?: DetailsViewCondition<TEntity>;
}
