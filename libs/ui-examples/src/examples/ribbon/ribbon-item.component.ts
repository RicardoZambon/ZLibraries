import { Component, forwardRef, signal, WritableSignal } from '@angular/core';
import { RibbonGroupChild } from '@zambon-dev/ui/library';

/**
 * A ribbon group counts its visible children to decide whether to show itself. The framework
 * buttons register as children on their own. A plain `lib-ribbon-button` does not, so wrap it in
 * a component that provides `RibbonGroupChild`.
 */
@Component({
  selector: 'example-ribbon-item',
  template: '<ng-content></ng-content>',
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => RibbonItemComponent) }],
})
export class RibbonItemComponent extends RibbonGroupChild {
  public readonly isVisible: WritableSignal<boolean> = signal(true);
}
