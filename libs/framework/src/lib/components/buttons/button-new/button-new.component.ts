import { NgIf } from '@angular/common';
import { Component, forwardRef, Input, Optional } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { DataProviderService, IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { RouteHelper } from '../../../helpers';
import { ITab, Tab } from '../../../models';
import { AuthService, TabService } from '../../../services';
import { DefaultDetailsTabViewComponent } from '../../views';
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

  //#region Constructor and Angular life cycle methods
  constructor(
    @Optional() private dataProviderService: DataProviderService<any>,
    private router: Router,
    private tabService: TabService,
    authService: AuthService,
  ) {
    super(authService);
  }
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
    const targetRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteWithComponent(this.router.routerState.root.snapshot, DefaultDetailsTabViewComponent);
    if (!targetRoute) {
      // If not found, uses the current route.
      url = RouteHelper.getRouteURL(this.router.routerState.root.snapshot, true);
    } else {
      url = RouteHelper.getRouteURL(targetRoute!.parent!);
    }
    
    if (path && path.length > 0) {
      url += `/${path}`;
    }

    const tab: ITab = new Tab({
      queryParams: queryParameters,
      url: `${url}/${this.endpoint}`,
    });

    this.tabService.navigateCurrentTab(tab);
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}