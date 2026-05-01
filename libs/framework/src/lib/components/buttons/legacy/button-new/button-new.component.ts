import { NgIf } from '@angular/common';
import { Component, forwardRef, inject, Input } from '@angular/core';
import { ITabView, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { Tab } from '../../../../models';
import { TabService } from '../../../../services';
import { BaseButton } from '../../base-button';

@Component({
  selector: 'framework-button-new-legacy',
  templateUrl: './button-new.component.html',
  imports: [
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonNewLegacyComponent)}]
})
/**
 * @deprecated Use standalone {@link ButtonNewComponent} instead.
 * Migrate by replacing this legacy component with the standalone equivalent
 * and using inject() for dependency injection.
 */
export class ButtonNewLegacyComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @Input() public endpoint: string = 'new';
  @Input() public path!: string;
  @Input() public tabView!: ITabView;
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
  public clicked(): void {
    this.tabService.navigateTo(new Tab({ url: `${this.path}/${this.endpoint}` }));
    // this.tabService.navigateTab(this.tabView, `${this.path}/${this.endpoint}`);
  }
  //#endregion

  //#region Private methods
  //#endregion
}