import { Component } from '@angular/core';
import { GroupAccordionComponent } from '@zambon-dev/ui/library';

/** A collapsible section. Click the header to fold the content away. */
@Component({
  selector: 'example-group-accordion-overview',
  imports: [GroupAccordionComponent],
  template: `
    <div class="p-4 max-w-3xl">
      <lib-group-accordion label="Details">
        <div class="rounded-md border border-slate-200 bg-white p-4">
          <div class="text-sm font-semibold text-slate-700">Account summary</div>
          <div class="mt-2 grid gap-2 text-sm text-slate-600">
            <div>Customer: Ada Lovelace</div>
            <div>Status: Active</div>
            <div>Region: North America</div>
          </div>
        </div>
      </lib-group-accordion>
    </div>
  `,
})
export class GroupAccordionOverviewExample {}
