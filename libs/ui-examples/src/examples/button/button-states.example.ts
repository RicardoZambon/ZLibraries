import { Component } from '@angular/core';
import { ButtonComponent } from '@zambon-dev/ui/library';

/**
 * Loading and success block activation, because the action is in flight or already done. Error does
 * not: it is the one outcome you retry from.
 */
@Component({
  selector: 'example-button-states',
  imports: [ButtonComponent],
  template: `
    <div class="flex items-center gap-3 p-4">
      <lib-button intent="primary" icon="fa-solid fa-floppy-disk">Idle</lib-button>
      <lib-button intent="primary" [loading]="true">Saving</lib-button>
      <lib-button intent="primary" [success]="true">Saved</lib-button>
      <lib-button intent="primary" [error]="true">Failed</lib-button>
      <lib-button intent="primary" [disabled]="true">Disabled</lib-button>
    </div>
  `,
})
export class ButtonStatesExample {}
