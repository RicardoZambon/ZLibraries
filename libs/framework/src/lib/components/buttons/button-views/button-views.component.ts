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
  @Input() public detailsViewRoute: ActivatedRouteSnapshot | null = null;
  //#endregion
  
  //#region Variables
  private baseUrlPath?: string;
  private isInternalNavigation: boolean = false;
  private selectedViewId?: string;
  //#endregion
  
  //#region Properties
  private get defaultViewId(): string {
    return this.options[0].id ?? '';
  }

  protected get hasOptions(): boolean {
    return this.options.some((option: IRibbonButtonOption) => (option.isVisible?? true) && (option.allowedActions === undefined || option.allowedActions.length === 0 || option.isAccessAllowed === true || (option.isAccessAllowed == undefined && option.allowedActions?.length > 0)));
  }

  protected get selectedView(): IRibbonButtonOption | undefined {
    return this.options.find((option: IRibbonButtonOption) => option.id === this.selectedViewId);
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
  constructor(
    private router: Router,
    private tabService: TabService,
    private tabViewService: TabViewService,
    authService: AuthService
  ) {
    super(authService);
  }

  public ngOnInit(): void {
    if (!!this.detailsViewRoute) {
      this.options = this.detailsViewRoute.routeConfig?.children
        ?.filter((route: Route) => !!route.data && route.data['ignoreRoute'] !== true)
        ?.map((route: Route) => {
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

      const url: string = RouteHelper.getRouteURL(this.detailsViewRoute);
      this.baseUrlPath = url;

      const option: string = this.detailsViewRoute.children[0]?.url?.map((segment: UrlSegment) => segment.path)?.join('/') ?? '';
      if (option === this.defaultViewId) {
        // We just need to check if the current option is the default, otherwise the router.events will handle the option selection.
        this.changeSelectedView(this.defaultViewId);
      }
    }

    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        const activatedRoute: ActivatedRouteSnapshot | null = this.detailsViewRoute;
        if (activatedRoute) {
          const url: string = RouteHelper.getRouteURL(activatedRoute);
          if (this.baseUrlPath === url) {
            const activeViewId: string = this.getActiveOption(event.url);

            if (!this.isInternalNavigation) {
              if (this.selectedViewId !== activeViewId) {
                this.changeSelectedView(activeViewId);
              }
            } else {
              this.isInternalNavigation = false;
            }

            if (this.tabService.isUrlActive(this.selectedViewUrl) && !!this.selectedView?.label) {
              this.tabService.updateTabTitle(this.selectedViewUrl, this.selectedView.label);
            }
          }
        }
      });
  }
  //#endregion
  
  //#region Event handlers
  protected onViewClicked(selectedOption: string | undefined): void {
    this.changeSelectedView(selectedOption);

    const tab: ITab = new Tab({
      title: this.selectedView?.label,
      url: this.selectedViewUrl,
    });

    this.isInternalNavigation = true;
    this.tabService.navigateCurrentTab(tab);
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

  private getActiveOption(url: string): string {
    const option: string = url.replace(this.baseUrlPath ?? '', '').substring(1);

    if (this.options.some((o: IRibbonButtonOption) => o.id === option)) {
      return option;
    }

    return this.defaultViewId;
  }
  //#endregion
}