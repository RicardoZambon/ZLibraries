import { Component } from '@angular/core';
import { RibbonButtonComponent, RibbonComponent, RibbonGroupComponent } from '@zambon-dev/ui/library';
import { RibbonItemComponent } from './ribbon-item.component';

/*
 * The one layout `lib-ribbon` does not support, kept so a collapsed bar is one search away from
 * its cause.
 *
 * The host is a query container, which is how the bar compacts itself on a narrow screen. Size
 * containment is the price: a contained element contributes no width to its parent, so a parent
 * that sizes to its own contents -- `inline-block` here, but equally a float or a grid auto
 * column -- shrinks to nothing and takes the bar with it. `width: 100%` does not help, because
 * 100% of nothing is nothing.
 *
 * Put the ribbon in a block, a grid cell, or a stretched flex item instead.
 */

/** What not to do: in a parent that sizes to its content, the ribbon collapses to nothing. */
@Component({
  selector: 'example-ribbon-content-sized-parent',
  imports: [RibbonButtonComponent, RibbonComponent, RibbonGroupComponent, RibbonItemComponent],
  template: `
    <div class="p-4">
      <div style="display: inline-block">
        <lib-ribbon>
          <lib-ribbon-group label="Record">
            <example-ribbon-item>
              <lib-ribbon-button icon="fa-floppy-disk" label="Save"></lib-ribbon-button>
            </example-ribbon-item>

            <example-ribbon-item>
              <lib-ribbon-button icon="fa-plus" label="New" color="text-green-600"></lib-ribbon-button>
            </example-ribbon-item>
          </lib-ribbon-group>
        </lib-ribbon>
      </div>
    </div>
  `,
})
export class RibbonContentSizedParentExample {}
