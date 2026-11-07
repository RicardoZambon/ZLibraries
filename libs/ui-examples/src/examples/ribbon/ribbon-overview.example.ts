import { Component } from '@angular/core';
import {
  IRibbonButtonOption,
  RibbonButtonComponent,
  RibbonComponent,
  RibbonGroupComponent,
} from '@zambon-dev/ui/library';
import { RibbonItemComponent } from './ribbon-item.component';

/**
 * A toolbar of labelled groups. Buttons can be disabled, busy or open a menu of options. Content
 * marked `right` sits at the far end.
 */
@Component({
  selector: 'example-ribbon-overview',
  imports: [RibbonButtonComponent, RibbonComponent, RibbonGroupComponent, RibbonItemComponent],
  template: `
    <div class="p-4 max-w-5xl">
      <lib-ribbon>
        <lib-ribbon-group label="Record">
          <example-ribbon-item>
            <lib-ribbon-button icon="fa-floppy-disk" label="Save"></lib-ribbon-button>
          </example-ribbon-item>

          <example-ribbon-item>
            <lib-ribbon-button icon="fa-plus" label="New" color="text-green-600"></lib-ribbon-button>
          </example-ribbon-item>

          <example-ribbon-item>
            <lib-ribbon-button
              icon="fa-trash"
              label="Delete"
              color="text-red-600"
              [disabled]="true"
            ></lib-ribbon-button>
          </example-ribbon-item>
        </lib-ribbon-group>

        <lib-ribbon-group label="Export">
          <example-ribbon-item>
            <lib-ribbon-button icon="fa-file-export" label="Export" [options]="exportOptions"></lib-ribbon-button>
          </example-ribbon-item>
        </lib-ribbon-group>

        <div right>
          <lib-ribbon-group label="Status">
            <example-ribbon-item>
              <lib-ribbon-button icon="fa-rotate" label="Loading" [loading]="true"></lib-ribbon-button>
            </example-ribbon-item>
          </lib-ribbon-group>
        </div>
      </lib-ribbon>
    </div>
  `,
})
export class RibbonOverviewExample {
  protected readonly exportOptions: IRibbonButtonOption[] = [
    { id: 'pdf', label: 'PDF', icon: 'fa-file-pdf' },
    { id: 'xlsx', label: 'Excel', icon: 'fa-file-excel' },
    { id: 'csv', label: 'CSV', icon: 'fa-file-csv' },
  ];
}
