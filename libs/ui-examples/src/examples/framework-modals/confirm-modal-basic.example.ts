import { Component } from '@angular/core';
import { ConfirmModalComponent } from '@zambon-dev/ui/framework';
import { ButtonComponent } from '@zambon-dev/ui/library';

/** A question with an icon, and your own confirm button in the footer. */
@Component({
  selector: 'example-confirm-modal-basic',
  imports: [ButtonComponent, ConfirmModalComponent],
  template: `
    <div class="p-4">
      <lib-button intent="primary" (click)="modal.toggleModal()">Open confirmation</lib-button>

      <framework-confirm-modal
        #modal
        [title]="'Confirm action'"
        message="This action will update the selected record."
        messageIcon="fa-solid fa-circle-question"
        messageIconColor="text-cyan-500"
        size="xl"
      >
        <div footer>
          <lib-button intent="primary" (click)="modal.closeModal()">Confirm</lib-button>
        </div>
      </framework-confirm-modal>
    </div>
  `,
})
export class ConfirmModalBasicExample {}
