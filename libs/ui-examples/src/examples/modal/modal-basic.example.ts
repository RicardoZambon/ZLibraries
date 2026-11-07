import { Component } from '@angular/core';
import { ButtonComponent, ModalComponent } from '@zambon-dev/ui/library';

/** Open and close a modal through a template reference. Project the content into `body` and `footer`. */
@Component({
  selector: 'example-modal-basic',
  imports: [ButtonComponent, ModalComponent],
  template: `
    <div class="p-4">
      <lib-button intent="primary" (click)="modal.toggleModal()">Open modal</lib-button>

      <lib-modal #modal title="Simple modal" size="md">
        <div body class="grid gap-3 text-sm text-slate-700">
          <p>This is a simple modal body rendered through the projected body slot.</p>
          <p>The footer holds the actions. The close button is added for you.</p>
        </div>

        <div footer>
          <lib-button intent="primary" (click)="modal.toggleModal()">Confirm</lib-button>
        </div>
      </lib-modal>
    </div>
  `,
})
export class ModalBasicExample {}
