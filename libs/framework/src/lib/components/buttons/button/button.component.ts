import { Component, EventEmitter, forwardRef, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button',
  templateUrl: './button.component.html',
  imports: [RibbonButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonComponent) }],
})
export class ButtonComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @Input() public color = 'text-primary-500';
  @Input() public icon?: string;
  @Input() public label = '';

  @Output() public action: EventEmitter<void> = new EventEmitter();
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    if (this.disabled || !this.isAccessLoaded || !this.visible) {
      return;
    }

    this.action.emit();
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
