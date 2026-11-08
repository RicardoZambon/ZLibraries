import { Component } from '@angular/core';
import { ButtonComponent, ModalComponent } from '@zambon-dev/ui/library';

/** An error message with no footer actions. The close button is the only way out. */
@Component({
  selector: 'example-modal-error',
  imports: [ButtonComponent, ModalComponent],
  template: `
    <div class="p-4">
      <lib-button intent="danger" (click)="modal.toggleModal()">Open error</lib-button>

      <lib-modal #modal title="Action failed" position="top" size="xl">
        <div body class="flex items-start gap-3 text-sm text-slate-700">
          <i class="fa-solid fa-triangle-exclamation mt-1 text-yellow-600"></i>
          <p>The operation failed because the selected record is no longer in a valid state.</p>
        </div>
      </lib-modal>
    </div>
  `,
})
export class ModalErrorExample {}
