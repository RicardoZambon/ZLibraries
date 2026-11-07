import { Component } from '@angular/core';
import { ButtonComponent } from '@zambon-dev/ui/library';

/** A single primary button with an icon and a label. */
@Component({
  selector: 'example-button-overview',
  imports: [ButtonComponent],
  template: ` <lib-button intent="primary" icon="fa-solid fa-floppy-disk">Save</lib-button> `,
})
export class ButtonOverviewExample {}
