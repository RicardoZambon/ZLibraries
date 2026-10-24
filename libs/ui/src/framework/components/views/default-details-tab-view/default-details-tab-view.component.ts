import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterModule } from '@angular/router';
import {
  DataProviderService,
  FormService,
  GroupContainerComponent,
  RibbonComponent,
  RibbonGroupComponent,
} from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import { ITab } from '../../../models';
import { TabService, TabViewService } from '../../../services';
// Imported by concrete path, not through the buttons barrel: that barrel re-exports
// ./legacy, whose buttons import the views barrel, which re-exports this file. Going
// through it leaves one of this component's imports undefined at evaluation time.
import { ButtonViewsComponent } from '../../buttons/button-views/button-views.component';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    { provide: TabViewService },
    { provide: DataProviderService, useFactory: dataProviderFactory, deps: [ActivatedRoute] },
    // A record's views are siblings: the form is one route, a child list is another, and only the
    // form provides a FormService of its own. So anything a non-form view renders has to find one
    // here or not at all -- and framework-button-edit asks for FormService and DataProviderService
    // together, of which this shell supplied only the second. Opening a child-list view threw
    // NG0201 before the component rendered at all.
    //
    // A form view's own provider shadows this one inside its subtree, so nothing changes there.
    // What reaches this instance is a view that has no form of its own, where the service sits
    // idle: the edit button reads `loading` and listens for `editCanceled`, and in modal mode --
    // which is why a child list has that button -- it never begins an edit on it.
    { provide: FormService },
  ],
})
export class DefaultDetailsTabViewComponent extends DefaultTabViewComponent implements OnDestroy, OnInit {
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
  private hasLoadError = false;
  private router: Router = inject(Router);
  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Properties
  protected get componentName(): string {
    return DefaultDetailsTabViewComponent.name;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  public override ngOnInit(): void {
    super.ngOnInit();

    this.detailsViewRoute = RouteHelper.getRouteWithComponent(
      this.router.routerState.root.snapshot,
      DefaultDetailsTabViewComponent,
    );
    this.hasEntityID = this.dataProviderService?.hasEntityID ?? null;

    this.dataProviderService
      ?.getModel$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((model: any) => {
        if (this.hasEntityID !== this.dataProviderService!.hasEntityID || !this.detailsViewRoute) {
          // If the entity ID changes, we need update the detailsViewRoute to get the correct route URL later.
          this.hasEntityID = this.dataProviderService!.hasEntityID;
          this.detailsViewRoute = RouteHelper.getRouteWithComponent(
            this.router.routerState.root.snapshot,
            DefaultDetailsTabViewComponent,
          );
        }

        if (this.detailsViewRoute) {
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

    this.dataProviderService
      ?.getError$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: HttpErrorResponse) => {
        this.hasLoadError = true;

        if (error.status === 404) {
          this.errorModal.title.set('Modal-NotFound-Title');
          this.errorModal.subtitle.set('');
          this.errorModal.showModal('Modal-NotFound-Message');
        } else {
          this.errorModal.title.set('Modal-Failed-Title');
          this.errorModal.subtitle.set('Modal-Failed-Administrator');
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
