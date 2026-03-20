import { NgIf } from '@angular/common';
import { Component, forwardRef, inject, Input } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { DataProviderService, IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { RouteHelper } from '../../../helpers';
import { FRAMEWORK_VIEW_TYPE, FrameworkViewType, ITab, Tab } from '../../../models';
import { TabService } from '../../../services';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-new',
  templateUrl: './button-new.component.html',
  imports: [
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonNewComponent)}]
})
export class ButtonNewComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @Input() public endpoint: string = 'new';
  @Input() public parameters?: { [key: string]: string };
  @Input() public path?: string;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get hasDataProvider(): boolean {
    return !!this.dataProviderService;
  }

  protected get hasDataProviderEntityID(): boolean {
    return this.dataProviderService?.hasEntityID ?? false;
  }
  //#endregion

  private dataProviderService: DataProviderService<any> | null = inject(DataProviderService, { optional: true });
  private router: Router = inject(Router);
  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onButtonClicked(optionId?: string): void {
    let option: IRibbonButtonOption | undefined = undefined;
    if (optionId) {
      option = this.options.find(o => o.id === optionId);
    }

    let path: string | undefined = this.path;
    if (option && option.path && option.path.length > 0) {
      path = option.path ?? optionId;
    }

    let queryParameters: { [key: string]: string } | undefined = this.parameters;
    if (option && option.parameters && Object.keys(option.parameters).length > 0) {
      queryParameters = { ...queryParameters, ...option.parameters };
    }

    let url: string = '';

    // Try to find the route with ':id' parameters.
    const targetRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(this.router.routerState.root.snapshot, FRAMEWORK_VIEW_TYPE, FrameworkViewType.Details);
    if (!targetRoute) {
      // If not found, uses the current route.
      url = RouteHelper.getRouteURL(this.router.routerState.root.snapshot, true);
    } else {
      url = RouteHelper.getRouteURL(targetRoute!.parent!);
    }

    if (path && path.length > 0) {
      url += `/${path}`;
    }

    const entityUrl: string = `${url}/${this.endpoint}`;
    const tab: ITab = new Tab({
      entityBaseUrl: entityUrl,
      queryParams: queryParameters,
      url: entityUrl,
    });

    this.tabService.navigateCurrentTab(tab);
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
