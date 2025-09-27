import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteHelper } from '../../../helpers';
import { ITab, Tab } from '../../../models';
import { ITabHistory } from '../../../models/tab-history';
import { TabService } from '../../../services/tab.service';
import { DefaultDetailsTabViewComponent } from '../default-details-tab-view/default-details-tab-view.component';
import { DefaultTabViewComponent } from '../default-tab-view/default-tab-view.component';
import { TabBreadcrumbsComponent } from '../tab-breadcrumbs/tab-breadcrumbs.component';

@Component({
  selector: 'framework-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [
    NgFor,
    NgIf,
    TabBreadcrumbsComponent,
    TranslatePipe,
  ]
})
export class TabsComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get activeHistory(): ITabHistory[] | null {
    return null; // this.tabService.activeHistory;
  }

  protected get activeTab(): string | null {
    return null; // this.tabService.activeTab;
  }

  protected get hasTabs(): boolean {
    return this.tabService.activeTabs.length > 0;
  }

  protected get openTabs(): ITab[] {
    return this.tabService.activeTabs ?? [];
  }

  protected trackByFn: (index: number, tab: ITab) => string = (_: number, tab: ITab): any => tab.url;
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(
    private router: Router,
    private tabService: TabService,
  ) {
    
  }

  public ngOnInit(): void {
    const activatedDetailsTabView: ActivatedRouteSnapshot | null = RouteHelper.getRouteWithComponent(this.router.routerState.snapshot.root, DefaultDetailsTabViewComponent);
    if (activatedDetailsTabView) {
      const shouldIgnoreFirstChildRoute: boolean = !!activatedDetailsTabView.firstChild && activatedDetailsTabView.firstChild.data && activatedDetailsTabView.firstChild.data['ignoreRoute'] === true;

      const url: string = RouteHelper.getRouteURL(activatedDetailsTabView);
      const clones: string[] = [];

      if (shouldIgnoreFirstChildRoute) {
        clones.push(RouteHelper.getRouteURL(activatedDetailsTabView.firstChild!));
        
      } else {
        setTimeout(() => {
          if (!!activatedDetailsTabView.firstChild) {
            const url: string = RouteHelper.getRouteURL(activatedDetailsTabView.firstChild);
            this.tabService.navigateCurrentTab(new Tab({
              queryParams: activatedDetailsTabView.queryParams,
              url: url,
            }));
          }
        });
      }

      this.tabService.openTab(new Tab({
        clones: clones,
        queryParams: activatedDetailsTabView.queryParams,
        url: url,
      }));

    } else {
      const activatedTabView: ActivatedRouteSnapshot | null = RouteHelper.getRouteWithComponent(this.router.routerState.snapshot.root, DefaultTabViewComponent);
      if (activatedTabView) {
        const url: string = RouteHelper.getRouteURL(activatedTabView);
        this.tabService.openTab(new Tab({
          queryParams: activatedTabView.queryParams,
          url: url,
        }));
      } else {
        this.router.navigate(['/']);
      }
    }
  }
  //#endregion

  //#region Event handlers
  protected onActivateTab(tab: ITab): void {
    this.tabService.activateTab(tab);
  }

  protected onCloseTab(index: number): void {
    this.tabService.closeTab(index);
  }
  //#endregion

  //#region Public methods
  protected isTabActive(tab: ITab): boolean {
    return this.tabService.isTabActive(tab);
  }
  //#endregion

  //#region Private methods
  //#endregion
}