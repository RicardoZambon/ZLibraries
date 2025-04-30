import { NgIf } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Route, Router, UrlSegment } from '@angular/router';
import { IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { filter, takeUntil } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import { ITab, Tab } from '../../../models';
import { AuthService, TabService, TabViewService } from '../../../services';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-views',
  templateUrl: './button-views.component.html',
  imports: [
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonViewsComponent)}]
})
export class ButtonViewsComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public defaultDetailsTabViewComponentName: string = '';
  //#endregion
  
  //#region Variables
  private baseUrlPath?: string;
  private selectedViewId?: string;
  //#endregion
  
  //#region Properties
  protected get detailsViewRoute(): ActivatedRouteSnapshot | null {
    return RouteHelper.getRouteWithComponent(this.router.routerState.root.snapshot, this.defaultDetailsTabViewComponentName);
  }

  protected get hasOptions(): boolean {
    return this.options.some((option: IRibbonButtonOption) => (option.isVisible?? true) && (option.allowedActions === undefined || option.allowedActions.length === 0 || option.isAccessAllowed === true || (option.isAccessAllowed == undefined && option.allowedActions?.length > 0)));
  }

  protected get selectedView(): IRibbonButtonOption | undefined {
    return this.options.find((option: IRibbonButtonOption) => option.id === this.selectedViewId);
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(
    private router: Router,
    private tabService: TabService,
    private tabViewService: TabViewService,
    authService: AuthService
  ) {
    super(authService);
  }

  public ngOnInit(): void {
    const activatedRoute: ActivatedRouteSnapshot | null = this.detailsViewRoute;
    if (activatedRoute) {
      this.options = activatedRoute.routeConfig?.children?.map((route: Route) => {
        const data: { [key: string | symbol]: any } = route.data ?? {};

        const option: IRibbonButtonOption = {
          id: route.path ?? '',
          isDisabled: false,
          isVisible: true,
          label: data['title'] ?? '',
        };

        const icon: string | undefined = data['icon'];
        if (icon) {
          option.icon = icon;
        }

        const allowedActions: string[] | undefined = data['allowedActions'];
        if (allowedActions && allowedActions.length > 0) {
          option.allowedActions = allowedActions;
        }

        return option;
      }) ?? [];

      const url: string = RouteHelper.getRouteURL(activatedRoute);
      this.baseUrlPath = url;

      this.changeSelectedView(this.getActiveOption(activatedRoute));
    }

    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        const activatedRoute: ActivatedRouteSnapshot | null = this.detailsViewRoute;
        if (activatedRoute) {
          const url: string = RouteHelper.getRouteURL(activatedRoute);
          if (this.baseUrlPath === url) {
            const activeViewId: string = this.getActiveOption(activatedRoute);
            if (this.selectedViewId !== activeViewId) {
              this.changeSelectedView(activeViewId);

              if (activeViewId && activeViewId.length > 0) {
                this.tabService.updateTabTitle(`${url}/${activeViewId}`, this.selectedView!.label);
              }
            }
          }
        }
      });
  }
  //#endregion
  
  //#region Event handlers
  protected onViewClicked(selectedOption: string | undefined): void {
    const activatedRoute: ActivatedRouteSnapshot | null = this.detailsViewRoute;
    if (activatedRoute) {

      this.changeSelectedView(selectedOption);
      
      const selectedView: IRibbonButtonOption | undefined = this.selectedView;
      if (selectedView) {

        let url: string = RouteHelper.getRouteURL(activatedRoute);
        if (selectedView.id) {
          url += `/${selectedView.id}`;
        }

        const tab: ITab = new Tab({
          title: selectedView.label,
          url: url,
        });
  
        this.tabService.navigateCurrentTab(tab);
      }
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  private changeSelectedView(viewId: string | undefined): void {
    if (this.selectedView) {
      this.selectedView.isDisabled = false;
    }

    this.selectedViewId = viewId;
    this.tabViewService.setActiveView(viewId ?? '');

    if (this.selectedView) {
      this.selectedView.isDisabled = true;
    }
  }

  private getActiveOption(routeSnapshot: ActivatedRouteSnapshot): string {
    return routeSnapshot.children[0]?.url?.map((segment: UrlSegment) => segment.path)?.join('/') ?? '';
  }
  //#endregion
}