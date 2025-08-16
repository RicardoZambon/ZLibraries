import { NgIf } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { RibbonButtonComponent, RibbonGroupChild } from '@library';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button',
  templateUrl: './button.component.html',
  imports: [
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonComponent)}]
})
export class ButtonComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @Input() public color: string = 'text-primary-500';
  @Input() public icon?: string;
  @Input() public label: string = '';

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