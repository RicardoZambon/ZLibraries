import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService, IRibbonButtonOption } from '@library';
import { Observable, takeUntil } from 'rxjs';
import { ButtonNewLegacyComponent } from '../../components';
import { Tab } from '../../models';
import { TabService } from '../../services';
import { LegacyTabViewBase } from './legacy-tabview-base';

@Component({ template: '' })
export abstract class LegacyTabViewDetails extends LegacyTabViewBase implements AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ButtonNewLegacyComponent) public buttonNew!: ButtonNewLegacyComponent;
  //#endregion
  
  //#region Variables
  protected entityId?: number;

  protected defaultView: string = 'details';

  public override title: string = '';

  protected views: IRibbonButtonOption[] = [
    { id: 'details', label: 'Button-Views-Details', icon: 'fa-dice-d6' },
    { id: 'history', label: 'Button-Views-History', icon: 'fa-history' }
  ];
  //#endregion

  //#region Properties
  protected get currentView(): string {
    return this.activeView ?? this.defaultView;
  }

  public override get loading(): boolean {
    return super.loading;
  }
  
  public override set loading(value: boolean) {
    super.loading = value;
    this.formService.loading = value;
  }

  protected get model(): any {
    return this.formService.model;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    route: ActivatedRoute,
    tabService: TabService,
    protected formService: FormService
  ) {
    super(route, tabService);
  }

  public ngAfterViewInit(): void {
    this.onViewVisible();
  }

  public override ngOnInit(): void {
    this.refreshParameters();

    super.ngOnInit();

    this.formService.modelRefreshed
      .pipe(takeUntil(this.destroy$))
      .subscribe((_: any) => {
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

    const activeView: IRibbonButtonOption | undefined = this.views.find((view: IRibbonButtonOption) => view.id === this.activeView);
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
    .subscribe(model => {
      this.loading = false;
      this.formService.model = model;
    });
  }
  protected refreshParameters(): void {
    const currentID: string | null = this.route.snapshot.paramMap.get('id');
    this.entityId = currentID ? Number(currentID) : undefined;

    let viewID: string | null = this.route.snapshot.paramMap.get('view');
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

    const activeView: IRibbonButtonOption | undefined = this.views.find((view: IRibbonButtonOption) => view.id === (this.activeView ?? this.defaultView));
    if (activeView) {
      activeView.isDisabled = false;
    }

    const newView: IRibbonButtonOption | undefined = this.views.find((view: IRibbonButtonOption) => view.id === viewId);
    if (newView) {
      newView.isDisabled = true;

      let urlViewPath: string = viewId === this.defaultView ? '' : `/${viewId}`;
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