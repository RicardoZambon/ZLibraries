import { Component } from '@angular/core';
import { ErrorModalComponent } from '@zambon-dev/ui/framework';
import { ButtonComponent } from '@zambon-dev/ui/library';

/** Pass the error text to `showModal()`. The title and subtitle stay the same for every error. */
@Component({
  selector: 'example-error-modal-basic',
  imports: [ButtonComponent, ErrorModalComponent],
  template: `
    <div class="p-4">
      <lib-button intent="danger" (click)="modal.showModal('The server rejected the requested operation.')">
        Open error
      </lib-button>

      <framework-error-modal
        #modal
        size="xl"
        [title]="'Action failed'"
        subtitle="Please review the record and try again."
      ></framework-error-modal>
    </div>
  `,
})
export class ErrorModalBasicExample {}
