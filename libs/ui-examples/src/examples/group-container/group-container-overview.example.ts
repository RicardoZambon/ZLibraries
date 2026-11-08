import { Component } from '@angular/core';
import { GroupAccordionComponent, GroupContainerComponent, GroupScrollSpyComponent } from '@zambon-dev/ui/library';

/**
 * A titled panel holding a details screen: collapsible sections, with a strip that follows the
 * section in view. Bind `title` as a property; a plain attribute would also become a tooltip.
 */
@Component({
  selector: 'example-group-container-overview',
  imports: [GroupAccordionComponent, GroupContainerComponent, GroupScrollSpyComponent],
  template: `
    <div class="p-4 h-[32rem] max-w-5xl bg-slate-50">
      <lib-group-container icon="fa-user" [title]="'Customer Profile'">
        <lib-group-scroll-spy>
          <lib-group-accordion label="Overview">
            <div class="grid gap-3 text-sm text-slate-700">
              <p>Primary details, current status, ownership, and account level metadata.</p>
              <p>Assigned representative: Grace Hopper</p>
              <p>Lifecycle stage: Active</p>
            </div>
          </lib-group-accordion>

          <lib-group-accordion label="Commercial">
            <div class="grid gap-3 text-sm text-slate-700">
              <p>Plan, renewal, billing profile, and contract notes.</p>
              <p>Plan: Enterprise</p>
              <p>Renewal: Annual</p>
            </div>
          </lib-group-accordion>

          <lib-group-accordion label="Activity">
            <div class="grid gap-3 text-sm text-slate-700">
              <p>Recent customer interactions and internal follow-up history.</p>
              <p>Last contact: Product onboarding</p>
              <p>Next step: Technical review</p>
            </div>
          </lib-group-accordion>
        </lib-group-scroll-spy>
      </lib-group-container>
    </div>
  `,
})
export class GroupContainerOverviewExample {}
