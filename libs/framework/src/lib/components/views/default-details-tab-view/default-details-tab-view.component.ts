import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterModule } from '@angular/router';
import { DataProviderService, GroupContainerComponent, RibbonComponent, RibbonGroupComponent } from '@library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import { TabService, TabViewService } from '../../../services';
import { ButtonViewsComponent } from '../../buttons';
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
  //#endregion

  //#region Variables
  protected containerIcon?: string;
  protected containerTitle?: string;
  protected dataProviderClassName?: any;
  protected detailsViewRoute: ActivatedRouteSnapshot | null = null;
  private hasEntityID: boolean | null = null;
  //#endregion

  //#region Properties
  protected get componentName(): string {
    return DefaultDetailsTabViewComponent.name;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    @Optional() private dataProviderService: DataProviderService<any>,
    private router: Router,
    private tabService: TabService,
    changeDetectorRef: ChangeDetectorRef,
    tabViewService: TabViewService,
  ) {
    super(changeDetectorRef, tabViewService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.detailsViewRoute = RouteHelper.getRouteWithComponent(this.router.routerState.root.snapshot, DefaultDetailsTabViewComponent);
    this.hasEntityID = this.dataProviderService?.hasEntityID ?? null;

    this.dataProviderService?.getModel$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((model: any) => {
        if (this.hasEntityID !== this.dataProviderService.hasEntityID || !this.detailsViewRoute) {
          // If the entity ID changes, we need update the detailsViewRoute to get the correct route URL later.
          this.hasEntityID = this.dataProviderService.hasEntityID;
          this.detailsViewRoute = RouteHelper.getRouteWithComponent(this.router.routerState.root.snapshot, DefaultDetailsTabViewComponent);
        }

        if (!!this.detailsViewRoute) {
          let title: string = this.detailsViewRoute.data['defaultTitle'];
          if (this.dataProviderService.hasEntityID) {
            title = this.dataProviderService.getTitle(model);
          }

          this.containerIcon = '';
          this.containerTitle = title;

          const url: string = RouteHelper.getRouteURL(this.detailsViewRoute);
          this.tabService.updateTabTitle(url, title);
        }
      });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}