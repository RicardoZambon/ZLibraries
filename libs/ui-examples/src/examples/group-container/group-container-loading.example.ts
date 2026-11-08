import { Component } from '@angular/core';
import { GroupAccordionComponent, GroupContainerComponent, GroupScrollSpyComponent } from '@zambon-dev/ui/library';

/**
 * Without a title the title bar shows a spinner. Leave `title` empty until the record it names
 * has loaded.
 */
@Component({
  selector: 'example-group-container-loading',
  imports: [GroupAccordionComponent, GroupContainerComponent, GroupScrollSpyComponent],
  template: `
    <div class="p-4 h-[32rem] max-w-5xl bg-slate-50">
      <lib-group-container>
        <lib-group-scroll-spy>
          <lib-group-accordion label="Summary">
            <div class="grid gap-3 text-sm text-slate-700">
              <p>Summary section content for scroll spy navigation.</p>
              <p>Use this section to validate active state and click navigation.</p>
              <p>Additional content keeps the scroll area realistic.</p>
            </div>
          </lib-group-accordion>

          <lib-group-accordion label="Details">
            <div class="grid gap-3 text-sm text-slate-700">
              <p>Detailed information section content.</p>
              <p>More details are shown here so the section has meaningful height.</p>
              <p>Scroll spy should activate this item when the section enters view.</p>
            </div>
          </lib-group-accordion>

          <lib-group-accordion label="History">
            <div class="grid gap-3 text-sm text-slate-700">
              <p>History and audit section content.</p>
              <p>Recent changes, updates, and ownership notes are displayed here.</p>
              <p>This provides another target for scroll spy navigation.</p>
            </div>
          </lib-group-accordion>
        </lib-group-scroll-spy>
      </lib-group-container>
    </div>
  `,
})
export class GroupContainerLoadingExample {}
