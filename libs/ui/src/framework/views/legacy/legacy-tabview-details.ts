import { AfterViewInit, Component, forwardRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService, IRibbonButtonOption } from '@zambon-dev/ui/library';
import { Observable, takeUntil } from 'rxjs';
import { ButtonNewLegacyComponent } from '../../components';
import { Tab } from '../../models';
import { TabService } from '../../services';
import { LegacyTabViewBase } from './legacy-tabview-base';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
/**
 * Base for a legacy record screen inside a tab. Loads the record from the route's `id`, switches
 * between its `details` and `history` sub-views, and keeps the tab title and URL in sync.
 *
 * @deprecated Use {@link TabViewBase} with the {@link DefaultDetailsTabViewComponent} pattern instead.
 * Migrate by extending TabViewBase and composing detail/history views as child routes
 * with standalone component imports.
 */
@Component({ template: '' })
export abstract class LegacyTabViewDetails extends LegacyTabViewBase implements AfterViewInit, OnInit {
  //#region ViewChilds, Inputs, Outputs
  // A forward reference: the legacy buttons import the views barrel, so this class is defined before
  // ButtonNewLegacyComponent -- and in the published bundle it sits further down the file, where
  // reading it eagerly throws the moment a JIT runtime such as Jest loads the package.
  /** The view's New button, when its template has one. */
  @ViewChild(forwardRef(() => ButtonNewLegacyComponent)) public buttonNew!: ButtonNewLegacyComponent;
  //#endregion

  //#region Variables
  /** Title of the record, shown on its tab. Cleared while the record loads. */
  public override title = '';

  protected defaultView = 'details';
  protected entityId?: number;
  protected views: IRibbonButtonOption[] = [
    { id: 'details', label: 'Button-Views-Details', icon: 'fa-dice-d6' },
    { id: 'history', label: 'Button-Views-History', icon: 'fa-history' },
  ];
  //#endregion

  //#region Properties
  /** Whether the record is loading. Writes are mirrored to `FormService.loading`. */
  public override get loading(): boolean {
    return super.loading;
  }

  /** Marks the view and its form as busy (`true`) or idle (`false`). */
  public override set loading(value: boolean) {
    super.loading = value;
    this.formService.loading = value;
  }

  protected get currentView(): string {
    return this.activeView ?? this.defaultView;
  }

  protected get model(): any {
    return this.formService.model;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    route: ActivatedRoute,
    tabService: TabService,
    protected formService: FormService,
  ) {
    super(route, tabService);
  }

  public ngAfterViewInit(): void {
    this.onViewVisible();
  }

  public override ngOnInit(): void {
    this.refreshParameters();

    super.ngOnInit();

    this.formService.modelRefreshed.pipe(takeUntil(this.destroy$)).subscribe((_: any) => {
      const id: number | null = this.getModelId();
      if (id && this.entityId !== id) {
        this.entityId = id;
        this.tabService.redirectCurrentTab(`${this.url.substring(0, this.url.indexOf('/new'))}/${id}`);
      }

      this.updateTitle(this.getModelDescription());
    });

    this.refresh();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  protected override openTabView(): void {
    super.openTabView();

    const activeView: IRibbonButtonOption | undefined = this.views.find(
      (view: IRibbonButtonOption) => view.id === this.activeView,
    );
    if (activeView) {
      activeView.isDisabled = true;
    }
  }

  protected refresh(): void {
    this.loading = true;
    this.title = '';
    this.formService.model = null;

    this.loadModel()
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => {
        this.loading = false;
        this.formService.model = model;
      });
  }
  protected refreshParameters(): void {
    const currentID: string | null = this.route.snapshot.paramMap.get('id');
    this.entityId = currentID ? Number(currentID) : undefined;

    const viewID: string | null = this.route.snapshot.paramMap.get('view');
    if (!viewID || !this.views.some((view: IRibbonButtonOption) => view.id === viewID)) {
      this.switchView(this.defaultView);
    } else {
      this.activeView = viewID;
    }
  }
  protected switchView(viewId?: string): void {
    if (!viewId) {
      viewId = this.defaultView;
    }

    const activeView: IRibbonButtonOption | undefined = this.views.find(
      (view: IRibbonButtonOption) => view.id === (this.activeView ?? this.defaultView),
    );
    if (activeView) {
      activeView.isDisabled = false;
    }

    const newView: IRibbonButtonOption | undefined = this.views.find((view: IRibbonButtonOption) => view.id === viewId);
    if (newView) {
      newView.isDisabled = true;

      const urlViewPath: string = viewId === this.defaultView ? '' : `/${viewId}`;
      let url: string = this.url;
      if (this.activeView && url.endsWith(this.activeView)) {
        url = url.replace(`/${this.activeView}`, urlViewPath);
      } else {
        url += urlViewPath;
      }
      this.tabService.navigateCurrentTab(new Tab({ url }));
      // this.tabService.changeTabView(this, viewId !== this.defaultView ? viewId : undefined);

      this.activeView = newView.id;

      // if (!this.activeView) {
      //   this.activeView = this.defaultView;
      // }
    }

    this.onViewVisible();
  }
  //#endregion

  //#region Private methods
  //#endregion

  //#region Abstract methods
  protected abstract getModelDescription(): string;
  protected abstract getModelId(): number | null;
  protected abstract loadModel(): Observable<any | null>;
  protected abstract newModel(): any;
  protected abstract onViewVisible(): void;
  //#endregion
}
