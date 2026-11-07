import { Component } from '@angular/core';
import { ButtonComponent } from '@zambon-dev/ui/library';

/** With no text the label collapses, so an icon-only button stays square and centred. */
@Component({
  selector: 'example-button-icon-only',
  imports: [ButtonComponent],
  template: `
    <div class="flex items-center gap-3 p-4">
      <lib-button intent="primary" icon="fa-solid fa-plus" ariaLabel="Add"></lib-button>
      <lib-button intent="secondary" icon="fa-solid fa-rotate" ariaLabel="Refresh"></lib-button>
      <lib-button intent="danger" icon="fa-solid fa-trash" ariaLabel="Delete"></lib-button>
      <lib-button intent="ghost" icon="fa-solid fa-gear" ariaLabel="Settings"></lib-button>
    </div>
  `,
})
export class ButtonIconOnlyExample {}
