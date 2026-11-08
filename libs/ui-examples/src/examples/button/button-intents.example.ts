import { Component } from '@angular/core';
import { ButtonComponent } from '@zambon-dev/ui/library';

/** The four intents side by side. An intent says what the button is for; the theme picks the colour. */
@Component({
  selector: 'example-button-intents',
  imports: [ButtonComponent],
  template: `
    <div class="flex items-center gap-3 p-4">
      <lib-button intent="primary" icon="fa-solid fa-floppy-disk">Save</lib-button>
      <lib-button intent="secondary">Cancel</lib-button>
      <lib-button intent="danger" icon="fa-solid fa-trash">Delete</lib-button>
      <lib-button intent="ghost" icon="fa-solid fa-ellipsis" ariaLabel="More"></lib-button>
    </div>
  `,
})
export class ButtonIntentsExample {}
