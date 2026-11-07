import { Component } from '@angular/core';
import { GroupAccordionComponent, GroupScrollSpyComponent } from '@zambon-dev/ui/library';

/**
 * A strip of links to the sections below it. The link of the section in view is highlighted, and a
 * click scrolls to its section. It needs a height to scroll within.
 */
@Component({
  selector: 'example-group-scroll-spy-basic',
  imports: [GroupAccordionComponent, GroupScrollSpyComponent],
  template: `
    <div class="h-80 max-w-3xl p-4">
      <lib-group-scroll-spy>
        <lib-group-accordion label="Contact">
          <p class="h-40">Phone, email and the preferred time to call.</p>
        </lib-group-accordion>
        <lib-group-accordion label="Billing">
          <p class="h-40">Billing address, payment terms and tax number.</p>
        </lib-group-accordion>
        <lib-group-accordion label="Notes">
          <p class="h-40">Free text kept with the record.</p>
        </lib-group-accordion>
      </lib-group-scroll-spy>
    </div>
  `,
})
export class GroupScrollSpyBasicExample {}
