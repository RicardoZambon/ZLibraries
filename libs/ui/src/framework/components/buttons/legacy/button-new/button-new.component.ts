import { Component, forwardRef, inject, input, InputSignal } from '@angular/core';
import { ITabView, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { Tab } from '../../../../models';
import { TabService } from '../../../../services';
import { BaseButton } from '../../base-button';

/**
 * Ribbon button that opens `path`/`endpoint` in a new tab.
 *
 * @deprecated Use {@link ButtonNewComponent} instead.
 */
@Component({
  selector: 'framework-button-new-legacy',
  templateUrl: './button-new.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonNewLegacyComponent) }],
})
export class ButtonNewLegacyComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  /** Last URL segment of the new-record page. Defaults to `new`. */
  public readonly endpoint: InputSignal<string> = input('new');
  /** Base URL placed before `endpoint`. Defaults to `''`. */
  public readonly path: InputSignal<string> = input('');
  /** Not used; kept so existing bindings still compile. */
  public readonly tabView: InputSignal<ITabView | undefined> = input<ITabView>();
  //#endregion

  //#region Variables
  private tabService: TabService = inject(TabService);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  /** Opens the new-record page, as a click on the button does. */
  public clicked(): void {
    this.tabService.navigateTo(new Tab({ url: `${this.path()}/${this.endpoint()}` }));
    // this.tabService.navigateTab(this.tabView, `${this.path}/${this.endpoint}`);
  }
  //#endregion

  //#region Private methods
  //#endregion
}
