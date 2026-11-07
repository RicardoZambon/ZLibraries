import { Component } from '@angular/core';
import { ButtonComponent } from '@zambon-dev/ui/framework';
import { RibbonComponent, RibbonGroupComponent } from '@zambon-dev/ui/library';

/** A framework button that is busy, and one that is disabled. */
@Component({
  selector: 'example-framework-buttons-states',
  imports: [ButtonComponent, RibbonComponent, RibbonGroupComponent],
  template: `
    <div class="p-4 max-w-xl">
      <lib-ribbon>
        <lib-ribbon-group label="States">
          <framework-button color="text-primary-500" icon="fa-sync-alt" label="Processing" [loading]="true">
          </framework-button>
          <framework-button color="text-slate-500" icon="fa-lock" label="Disabled" [disabled]="true">
          </framework-button>
        </lib-ribbon-group>
      </lib-ribbon>
    </div>
  `,
})
export class FrameworkButtonsStatesExample {}
