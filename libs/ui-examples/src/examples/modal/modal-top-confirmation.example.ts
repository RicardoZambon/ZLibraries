import { Component } from '@angular/core';
import { ButtonComponent, ModalComponent } from '@zambon-dev/ui/library';

/** A confirmation for an action that cannot be undone, shown at the top of the screen. */
@Component({
  selector: 'example-modal-top-confirmation',
  imports: [ButtonComponent, ModalComponent],
  template: `
    <div class="p-4">
      <lib-button intent="primary" (click)="modal.toggleModal()">Open confirmation</lib-button>

      <lib-modal #modal title="Confirm action" closeButtonText="Cancel" position="top" size="xl">
        <div body class="grid gap-3 text-sm text-slate-700">
          <p>Use this shape for activate, pause, reprocess and similar actions.</p>
          <p>The action cannot be undone after confirmation.</p>
        </div>

        <div footer>
          <lib-button intent="danger" (click)="modal.toggleModal()">Confirm</lib-button>
        </div>
      </lib-modal>
    </div>
  `,
})
export class ModalTopConfirmationExample {}
