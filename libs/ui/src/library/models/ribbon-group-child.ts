import { Signal } from '@angular/core';

/**
 * A child that decides whether its ribbon group is shown at all.
 *
 * `isVisible` is a signal rather than a plain field because `RibbonGroupComponent` reads it from
 * a host binding, and Angular evaluates a component's host bindings during its PARENT's pass. A
 * child assigning a field could not reach that pass at all: nothing marked it, and writing it
 * afterwards raised NG0100. A signal read inside the group's binding is tracked, so flipping it
 * refreshes the group whatever strategy the host application uses.
 */
export abstract class RibbonGroupChild {
  abstract readonly isVisible: Signal<boolean>;
}
