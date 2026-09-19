import { Component, EventEmitter, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MultiSelectComponent } from '@zambon-dev/library';
import { ModalBase } from './modal-base';

@Component({ changeDetection: ChangeDetectionStrategy.Eager, template: '' })
export abstract class MultiSelectModal extends ModalBase {
  @ViewChild(MultiSelectComponent) multiSelect!: MultiSelectComponent;
  @Output() public savedChanges: EventEmitter<void> = new EventEmitter();

  toggle(): void {
    this.multiSelect.toggleModal();
  }
}
