import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterModule } from '@angular/router';
import { DataProviderService, GroupContainerComponent, RibbonComponent, RibbonGroupComponent } from '@library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import { ITab } from '../../../models';
import { TabService, TabViewService } from '../../../services';
import { ButtonViewsComponent } from '../../buttons';
import { ErrorModalComponent } from '../../modals/error-modal/error-modal.component';
import { DefaultTabViewComponent } from '../default-tab-view/default-tab-view.component';

function dataProviderFactory(route: ActivatedRoute): DataProviderService<any> {
  return <DataProviderService<any>>route.snapshot.data['dataProvider']();
}

@Component({
  selector: 'framework-default-details-tab-view',
  templateUrl: './default-details-tab-view.component.html',
  styleUrls: ['./default-details-tab-view.component.scss'],
  imports: [
    ButtonViewsComponent,
    ErrorModalComponent,
    GroupContainerComponent,
    NgTemplateOutlet,
    RibbonComponent,
    RibbonGroupComponent,
    RouterModule,
    TranslatePipe,
  ],
  providers: [
    { provide: TabViewService },
    { provide: DataProviderService, useFactory: dataProviderFactory, deps: [ActivatedRoute] },
  ]
})
export class DefaultDetailsTabViewComponent extends DefaultTabViewComponent implements AfterViewInit, OnDestroy, OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ErrorModalComponent) private errorModal!: ErrorModalComponent;
  //#endregion

  //#region Variables
  protected containerIcon?: string;
  protected containerTitle?: string;
  protected dataProviderClassName?: any;
  protected detailsViewRoute: ActivatedRouteSnapshot | null = null;

  private dataProviderService: DataProviderService<any> | null = inject(DataProviderService, { optional: true });
  private hasEntityID: boolean | null = null;
  private hasLoadError: boolean = false;
  private router: Router = inject(Router);
  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Properties
  protected get componentName(): string {
    return DefaultDetailsTabViewComponent.name;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    const changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    const tabViewService: TabViewService = inject(TabViewService);
    super(changeDetectorRef, tabViewService);

  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.detailsViewRoute = RouteHelper.getRouteWithComponent(this.router.routerState.root.snapshot, DefaultDetailsTabViewComponent);
    this.hasEntityID = this.dataProviderService?.hasEntityID ?? null;

    this.dataProviderService?.getModel$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((model: any) => {
        if (this.hasEntityID !== this.dataProviderService!.hasEntityID || !this.detailsViewRoute) {
          // If the entity ID changes, we need update the detailsViewRoute to get the correct route URL later.
          this.hasEntityID = this.dataProviderService!.hasEntityID;
          this.detailsViewRoute = RouteHelper.getRouteWithComponent(this.router.routerState.root.snapshot, DefaultDetailsTabViewComponent);
        }

        if (!!this.detailsViewRoute) {
          let title: string = this.detailsViewRoute.data['defaultTitle'];
          if (this.dataProviderService!.hasEntityID) {
            title = this.dataProviderService!.getTitle(model);
          }

          this.containerIcon = '';
          this.containerTitle = title;

          const url: string = RouteHelper.getRouteURL(this.detailsViewRoute);
          this.tabService.updateTabTitle(url, title);
        }
      });

    this.dataProviderService?.getError$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: HttpErrorResponse) => {
        this.hasLoadError = true;

        if (error.status === 404) {
          this.errorModal.title = 'Modal-NotFound-Title';
          this.errorModal.subtitle = '';
          this.errorModal.showModal('Modal-NotFound-Message');
        } else {
          this.errorModal.title = 'Modal-Failed-Title';
          this.errorModal.subtitle = 'Modal-Failed-Administrator';
          this.errorModal.showModal(error);
        }
      });
  }
  //#endregion

  //#region Event handlers
  protected onErrorModalClosed(): void {
    if (!this.hasLoadError) {
      return;
    }

    const history: ITab[] = this.tabService.activeTabHistory;
    const entityBaseUrl: string | undefined = history[history.length - 1]?.entityBaseUrl;

    // Find the entry before the invalid entity in the tab history.
    if (entityBaseUrl && history.length > 1) {
      const entityIndex: number = history.findIndex((entry: ITab) => entry.entityBaseUrl === entityBaseUrl);
      if (entityIndex > 0) {
        this.tabService.navigateCurrentTabBack(history[entityIndex - 1]);
        return;
      }
    }

    this.tabService.closeActiveTab();
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
