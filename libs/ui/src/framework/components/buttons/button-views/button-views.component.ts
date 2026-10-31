import {
  Component,
  forwardRef,
  inject,
  Injector,
  input,
  InputSignal,
  OnInit,
  runInInjectionContext,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Route, Router, UrlSegment } from '@angular/router';
import {
  DataProviderService,
  IRibbonButtonOption,
  RibbonButtonComponent,
  RibbonGroupChild,
} from '@zambon-dev/ui/library';
import { catchError, combineLatest, filter, isObservable, map, Observable, of, switchMap, takeUntil } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import {
  DetailsViewCondition,
  FRAMEWORK_VIEW_TYPE,
  FrameworkViewType,
  IDetailsViewRouteData,
  ITab,
  Tab,
} from '../../../models';
import { TabService, TabViewService } from '../../../services';
import { BaseButton } from '../base-button';

/** A view that declares `visibleWhen` or `enabledWhen`. */
interface IConditionalView {
  enabledWhen?: DetailsViewCondition;
  id: string;
  visibleWhen?: DetailsViewCondition;
}

/** What a view's conditions answered for the current record. */
interface IViewState {
  isEnabled: boolean;
  isVisible: boolean;
}

/** One conditional view's answer for one record. */
interface IViewAnswer {
  id: string;
  state: IViewState;
}

@Component({
  selector: 'framework-button-views',
  templateUrl: './button-views.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonViewsComponent) }],
})
export class ButtonViewsComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  public readonly detailsViewRoute: InputSignal<ActivatedRouteSnapshot | null> = input<ActivatedRouteSnapshot | null>(
    null,
  );
  //#endregion

  //#region Variables
  private baseUrlPath?: string;
  private dataProviderService: DataProviderService<any> | null = inject(DataProviderService, { optional: true });
  // Whether the views' conditions have answered for a record yet. Until then a pending view is no
  // reason to leave it: a direct link to it has to survive the record loading.
  private hasViewStates = false;
  private injector: Injector = inject(Injector);
  private isInternalNavigation = false;
  private router: Router = inject(Router);
  // A signal rather than a field: switching views changes which option the dropdown marks as the
  // current one, and the switch arrives from a router event.
  private readonly selectedViewId: WritableSignal<string | undefined> = signal(undefined);
  private tabService: TabService = inject(TabService);
  private tabViewService: TabViewService = inject(TabViewService);
  // Only a view that declares a condition has an entry; every other view is shown and available.
  // Not read by the template: the options are, and applyViewStates() writes these into them.
  private readonly viewStates: Map<string, IViewState> = new Map<string, IViewState>();
  //#endregion

  //#region Properties
  protected get hasOptions(): boolean {
    return this.options().some(
      (option: IRibbonButtonOption) =>
        (option.isVisible ?? true) &&
        (option.allowedActions === undefined ||
          option.allowedActions.length === 0 ||
          option.isAccessAllowed === true ||
          (option.isAccessAllowed === undefined && option.allowedActions?.length > 0)),
    );
  }

  protected get isNewEntity(): boolean {
    return !(this.dataProviderService?.hasEntityID ?? false);
  }

  protected get selectedView(): IRibbonButtonOption | undefined {
    return this.options().find((option: IRibbonButtonOption) => option.id === this.selectedViewId());
  }

  private get defaultViewId(): string {
    return this.options()[0].id ?? '';
  }

  private get selectedViewUrl(): string {
    let url: string = this.baseUrlPath ?? '';

    const selectedView: IRibbonButtonOption | undefined = this.selectedView;
    if (selectedView && selectedView.id) {
      url += `/${selectedView.id}`;
    }

    return url;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods

  public ngOnInit(): void {
    const detailsViewRoute: ActivatedRouteSnapshot | null = this.detailsViewRoute();
    if (detailsViewRoute) {
      const viewRoutes: Route[] =
        detailsViewRoute.routeConfig?.children?.filter(
          (route: Route) => !!route.data && route.data['ignoreRoute'] !== true,
        ) ?? [];

      this.options.set(
        viewRoutes.map((route: Route) => {
          const data: IDetailsViewRouteData = route.data ?? {};

          const option: IRibbonButtonOption = {
            id: route.path ?? '',
            isDisabled: false,
            isVisible: true,
            label: data.title ?? '',
          };

          const icon: string | undefined = data.icon;
          if (icon) {
            option.icon = icon;
          }

          const allowedActions: string[] | undefined = data.allowedActions;
          if (allowedActions && allowedActions.length > 0) {
            option.allowedActions = allowedActions;
          }

          return option;
        }),
      );

      // The first view is where every tab lands, and where a view that goes away sends it, so it
      // cannot be conditional itself.
      const conditionalViews: IConditionalView[] = viewRoutes
        .slice(1)
        .map((route: Route) => {
          const data: IDetailsViewRouteData = route.data ?? {};
          return { enabledWhen: data.enabledWhen, id: route.path ?? '', visibleWhen: data.visibleWhen };
        })
        .filter((view: IConditionalView) => !!view.visibleWhen || !!view.enabledWhen);

      // A pending view is hidden and unavailable, so it never shows only to vanish a moment later.
      conditionalViews.forEach((view: IConditionalView) =>
        this.viewStates.set(view.id, { isEnabled: !view.enabledWhen, isVisible: !view.visibleWhen }),
      );
      this.applyViewStates();

      const url: string = RouteHelper.getRouteURL(detailsViewRoute);
      this.baseUrlPath = url;

      const option: string =
        detailsViewRoute.children[0]?.url?.map((segment: UrlSegment) => segment.path)?.join('/') ?? '';
      if (option === this.defaultViewId) {
        // We just need to check if the current option is the default, otherwise the router.events will handle the option selection.
        this.changeSelectedView(this.defaultViewId);
      }

      if (conditionalViews.length > 0) {
        this.watchViewConditions(detailsViewRoute, conditionalViews);
      }
    }

    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        if (this.detailsViewRoute()) {
          // Use the current router state to get the up-to-date URL, since the stored
          // detailsViewRoute snapshot is immutable and becomes stale after save redirects
          // (e.g., /new → /:id).
          const currentRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(
            this.router.routerState.root.snapshot,
            FRAMEWORK_VIEW_TYPE,
            FrameworkViewType.Details,
          );

          // Every details tab keeps this subscription alive, including the ones the reuse
          // strategy has detached, and the lookup above reads the *router*, which names
          // whichever tab the navigation went to. Without this guard a detached tab adopted
          // the base path of the tab being opened and then switched itself to that tab's view,
          // tearing its own ribbon down and rebuilding it -- which is how an active filter lost
          // its Clear filters button while the grid stayed filtered. Comparing the route
          // definition rather than the URL keeps the one navigation that legitimately changes
          // this tab's path: the redirect from /new to /:id after a save.
          if (currentRoute && currentRoute.routeConfig === this.detailsViewRoute()!.routeConfig) {
            const url: string = RouteHelper.getRouteURL(currentRoute);
            this.baseUrlPath = url;

            const activeViewId: string = this.getActiveOption(event.url);

            if (!this.isInternalNavigation) {
              if (this.selectedViewId() !== activeViewId) {
                this.changeSelectedView(activeViewId);
              }
            } else {
              this.isInternalNavigation = false;
            }

            this.leaveUnavailableView();
          }
        }
      });
  }
  //#endregion

  //#region Event handlers
  protected onViewClicked(selectedOption: string | undefined): void {
    this.changeSelectedView(selectedOption);
    this.isInternalNavigation = true;

    if (selectedOption === this.defaultViewId) {
      // Default view: remove sub-view entry, navigate back to detail view
      this.tabService.replaceCurrentTabSubView(this.baseUrlPath!);
    } else {
      const tab: ITab = new Tab({
        title: this.selectedView?.label,
        url: this.selectedViewUrl,
      });
      this.tabService.replaceCurrentTabSubView(this.baseUrlPath!, tab);
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  /**
   * Writes each view's state into the options: hidden when its `visibleWhen` said no, and
   * disabled when it is the current view or its `enabledWhen` said no.
   *
   * The options are rebuilt rather than edited in place: the ribbon button takes the list as an
   * input, so a field changed inside it is a change nothing can see. An option whose state did not
   * change keeps its identity, so the dropdown does not rebuild every row.
   */
  private applyViewStates(): void {
    const selectedViewId: string | undefined = this.selectedViewId();

    this.options.update((options: IRibbonButtonOption[]) =>
      options.map((option: IRibbonButtonOption) => {
        const state: IViewState | undefined = this.viewStates.get(option.id);
        const isVisible: boolean = state?.isVisible ?? true;
        const isDisabled: boolean = option.id === selectedViewId || !(state?.isEnabled ?? true);

        return option.isVisible === isVisible && option.isDisabled === isDisabled
          ? option
          : { ...option, isDisabled, isVisible };
      }),
    );
  }

  /**
   * Marks the chosen view as the current one, which is how the dropdown greys its own entry out.
   */
  private changeSelectedView(viewId: string | undefined): void {
    this.selectedViewId.set(viewId);
    this.tabViewService.setActiveView(viewId ?? '');

    this.applyViewStates();
  }

  /**
   * Runs one condition for one record, as a stream of answers.
   *
   * A condition that throws, errors, or answers anything but `true` counts as `false`: a view whose
   * condition is broken stays out of reach rather than showing where it should not.
   */
  private evaluateCondition(
    condition: DetailsViewCondition | undefined,
    detailsViewRoute: ActivatedRouteSnapshot,
    entity: any,
  ): Observable<boolean> {
    if (!condition) {
      return of(true);
    }

    try {
      const result: boolean | Observable<boolean> = runInInjectionContext(this.injector, () =>
        condition({ entity, entityID: this.dataProviderService?.entityID, route: detailsViewRoute }),
      );

      return (isObservable(result) ? result : of(result)).pipe(
        map((answer: boolean) => answer === true),
        catchError(() => of(false)),
      );
    } catch {
      return of(false);
    }
  }

  private getActiveOption(url: string): string {
    const option: string = url.replace(this.baseUrlPath ?? '', '').substring(1);

    if (this.options().some((o: IRibbonButtonOption) => o.id === option)) {
      return option;
    }

    return this.defaultViewId;
  }

  /**
   * Sends this tab back to its first view when the view it shows has been hidden or disabled --
   * because the record changed under it, or because it was opened by a direct link.
   *
   * Only for the tab the router is showing: a detached tab keeps its subscriptions, and the
   * navigation below always acts on the current tab.
   */
  private leaveUnavailableView(): void {
    const selectedViewId: string | undefined = this.selectedViewId();
    if (!this.hasViewStates || selectedViewId === undefined || selectedViewId === this.defaultViewId) {
      return;
    }

    const state: IViewState | undefined = this.viewStates.get(selectedViewId);
    if (!state || (state.isVisible && state.isEnabled)) {
      return;
    }

    const currentRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(
      this.router.routerState.root.snapshot,
      FRAMEWORK_VIEW_TYPE,
      FrameworkViewType.Details,
    );
    if (
      !currentRoute ||
      currentRoute.routeConfig !== this.detailsViewRoute()?.routeConfig ||
      RouteHelper.getRouteURL(currentRoute) !== this.baseUrlPath
    ) {
      return;
    }

    this.onViewClicked(this.defaultViewId);
  }

  /**
   * Answers every conditional view again each time the data provider emits the record, so a save
   * or a status change shows, hides, enables or disables views at once.
   */
  private watchViewConditions(detailsViewRoute: ActivatedRouteSnapshot, conditionalViews: IConditionalView[]): void {
    const entity$: Observable<any> = this.dataProviderService?.getModel$() ?? of(null);

    entity$
      .pipe(
        switchMap((entity: any) =>
          combineLatest(
            conditionalViews.map((view: IConditionalView): Observable<IViewAnswer> =>
              combineLatest([
                this.evaluateCondition(view.visibleWhen, detailsViewRoute, entity),
                this.evaluateCondition(view.enabledWhen, detailsViewRoute, entity),
              ]).pipe(
                map(([isVisible, isEnabled]: [boolean, boolean]) => ({ id: view.id, state: { isEnabled, isVisible } })),
              ),
            ),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((answers: IViewAnswer[]) => {
        answers.forEach((answer: IViewAnswer) => this.viewStates.set(answer.id, answer.state));
        this.hasViewStates = true;

        this.applyViewStates();
        this.leaveUnavailableView();
      });
  }
  //#endregion
}
