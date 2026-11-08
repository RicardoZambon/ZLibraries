import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MultiSelectComponent } from '@zambon-dev/ui/library';
import { ModalBase } from './modal-base';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
/**
 * Base for a modal that wraps a `lib-multi-select`, for picking several records at once.
 */
@Component({ template: '' })
export abstract class MultiSelectModal extends ModalBase {
  /** The multi-select in this modal's template. */
  @ViewChild(MultiSelectComponent) multiSelect!: MultiSelectComponent;
  /** Emits after the selection is saved. Subclasses emit it; the base class never does. */
  @Output() public savedChanges: EventEmitter<void> = new EventEmitter();

  /** Opens or closes the multi-select. */
  toggle(): void {
    this.multiSelect.toggleModal();
  }
}
