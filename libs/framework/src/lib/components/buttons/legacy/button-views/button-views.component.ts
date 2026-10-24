import { Component, forwardRef, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { BaseButton } from '../../base-button';

@Component({
  selector: 'framework-button-views-legacy',
  templateUrl: './button-views.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonViewsLegacyComponent) }],
})
/**
 * @deprecated Use standalone {@link ButtonViewsComponent} instead.
 * Migrate by replacing this legacy component with the standalone equivalent
 * and using inject() for dependency injection.
 */
export class ButtonViewsLegacyComponent extends BaseButton {
  public readonly views: InputSignal<IRibbonButtonOption[]> = input<IRibbonButtonOption[]>([]);

  public readonly viewChanged: OutputEmitterRef<string | undefined> = output<string | undefined>();

  clicked(option?: string): void {
    this.viewChanged.emit(option);
  }
}
