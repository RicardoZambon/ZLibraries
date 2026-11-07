import { Component, forwardRef, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { IRibbonButtonOption, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { BaseButton } from '../../base-button';

/**
 * Ribbon dropdown listing `views`; emits `viewChanged` with the chosen one.
 *
 * @deprecated Use {@link ButtonViewsComponent} instead.
 */
@Component({
  selector: 'framework-button-views-legacy',
  templateUrl: './button-views.component.html',
  imports: [RibbonButtonComponent],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonViewsLegacyComponent) }],
})
export class ButtonViewsLegacyComponent extends BaseButton {
  /** Views listed in the dropdown. Defaults to `[]`. */
  public readonly views: InputSignal<IRibbonButtonOption[]> = input<IRibbonButtonOption[]>([]);

  /** Emits the `id` of the view the user picked, or `undefined` for a click on the main button. */
  public readonly viewChanged: OutputEmitterRef<string | undefined> = output<string | undefined>();

  /** Emits `viewChanged` with `option`, as picking a view does. */
  clicked(option?: string): void {
    this.viewChanged.emit(option);
  }
}
