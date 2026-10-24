import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MultiSelectComponent } from '@zambon-dev/ui/library';
import { ModalBase } from './modal-base';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
@Component({ template: '' })
export abstract class MultiSelectModal extends ModalBase {
  @ViewChild(MultiSelectComponent) multiSelect!: MultiSelectComponent;
  @Output() public savedChanges: EventEmitter<void> = new EventEmitter();

  toggle(): void {
    this.multiSelect.toggleModal();
  }
}
