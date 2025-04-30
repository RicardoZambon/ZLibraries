import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { BaseButton } from '../../base-button';

@Component({
  selector: 'framework-button-views-legacy',
  templateUrl: './button-views.component.html',
  imports: [
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonViewsLegacyComponent)}]
})
export class ButtonViewsLegacyComponent extends BaseButton {
  @Input() views!: IRibbonButtonOption[];

  @Output() viewChanged = new EventEmitter<string | undefined>();


  clicked(option?: string): void {
    this.viewChanged.emit(option);
  }
}