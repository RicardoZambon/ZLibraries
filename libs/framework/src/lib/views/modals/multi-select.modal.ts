import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MultiSelectComponent } from '@library';
import { ModalBase } from './modal-base';

@Component({ template: '' })
export abstract class MultiSelectModal extends ModalBase {
  @ViewChild(MultiSelectComponent) multiSelect!: MultiSelectComponent;
  @Output() public savedChanges: EventEmitter<void> = new EventEmitter();

  toggle(): void {
    this.multiSelect.toggleModal();    
  }
}