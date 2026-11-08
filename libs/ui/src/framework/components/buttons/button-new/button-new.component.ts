import { Component, forwardRef, inject, input, InputSignal } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import {
  DataProviderService,
  IRibbonButtonOption,
  RibbonButtonComponent,
  RibbonGroupChild,
} from '@zambon-dev/ui/library';
import { RouteHelper } from '../../../helpers';
import { FRAMEWORK_VIEW_TYPE, FrameworkViewType, ITab, Tab } from '../../../models';
import { TabService } from '../../../services';
import { BaseButton } from '../base-button';

/**
 * Ribbon button that opens the "new record" page in the current tab. Inside a details view it shows
 * only once the parent record is saved. Each option in `options` can add its own path and query
 * parameters.
 */
@Component({
  selector: 'framework-button-new',
  templateUrl: './button-new.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonNewComponent) }],
})
export class ButtonNewComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  /** Last URL segment of the new-record page. Defaults to `new`. */
  public readonly endpoint: InputSignal<string> = input('new');
  /** Query parameters added to the new-record URL. An option's own parameters are merged over these. */
  public readonly parameters: InputSignal<{ [key: string]: string } | undefined> = input<{ [key: string]: string }>();
  /** Segment inserted before `endpoint`, such as a child entity's route. An option's `path` replaces it. */
  public readonly path: InputSignal<string | undefined> = input<string>();
  //#endregion

  //#region Variables
  private dataProviderService: DataProviderService<any> | null = inject(DataProviderService, { optional: true });
  private router: Router = inject(Router);
  private tabService: TabService = inject(TabService);
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
  //#endregion

  //#region Event handlers
  protected onButtonClicked(optionId?: string): void {
    let option: IRibbonButtonOption | undefined = undefined;
    if (optionId) {
      option = this.options().find((o) => o.id === optionId);
    }

    let path: string | undefined = this.path();
    if (option && option.path && option.path.length > 0) {
      path = option.path ?? optionId;
    }

    let queryParameters: { [key: string]: string } | undefined = this.parameters();
    if (option && option.parameters && Object.keys(option.parameters).length > 0) {
      queryParameters = { ...queryParameters, ...option.parameters };
    }

    // Try to find the route with ':id' parameters; fall back to the current route.
    const targetRoute: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(
      this.router.routerState.root.snapshot,
      FRAMEWORK_VIEW_TYPE,
      FrameworkViewType.Details,
    );
    let url: string = targetRoute
      ? RouteHelper.getRouteURL(targetRoute.parent!)
      : RouteHelper.getRouteURL(this.router.routerState.root.snapshot, true);

    if (path && path.length > 0) {
      url += `/${path}`;
    }

    const entityUrl = `${url}/${this.endpoint()}`;
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
