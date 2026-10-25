import { ChangeDetectionStrategy, Component, forwardRef, signal, WritableSignal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { RibbonButtonComponent } from '../../components/ribbon-button/ribbon-button.component';
import { RibbonGroupComponent } from '../../components/ribbon-group/ribbon-group.component';
import { RibbonComponent } from '../../components/ribbon/ribbon.component';
import { RibbonGroupChild } from '../../models/ribbon-group-child';

@Component({
  selector: 'storybook-ribbon-child',
  template: '<ng-content></ng-content>',
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => StorybookRibbonChildComponent) }],
})
class StorybookRibbonChildComponent extends RibbonGroupChild {
  public readonly isVisible: WritableSignal<boolean> = signal(true);
}

const meta: Meta<RibbonComponent> = {
  component: RibbonComponent,
  decorators: [
    moduleMetadata({
      imports: [RibbonButtonComponent, RibbonGroupComponent, StorybookRibbonChildComponent],
    }),
  ],
  title: 'Library/Ribbon/Ribbon',
};
export default meta;
type Story = StoryObj<RibbonComponent>;

/*
 * The one layout `lib-ribbon` does not support, kept so a collapsed bar is one search away from
 * its cause.
 *
 * The host is a query container, which is how the bar compacts itself on a narrow screen. Size
 * containment is the price: a contained element contributes no width to its parent, so a parent
 * that sizes to its own contents -- `inline-block` here, but equally a float or a grid auto
 * column -- shrinks to nothing and takes the bar with it. Measured at 10px: the padding and the
 * border, no buttons. `width: 100%` does not help, because 100% of nothing is nothing.
 *
 * This is inherent to container queries rather than a defect here. An element cannot both size to
 * its contents and be queried on its own width. Put the ribbon in a block, a grid cell, or a
 * stretched flex item -- which is what a toolbar wants anyway.
 */
export const CollapsesInAContentSizedParent: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4">
        <div style="display: inline-block">
          <lib-ribbon>
            <lib-ribbon-group label="Record">
              <storybook-ribbon-child>
                <lib-ribbon-button icon="fa-floppy-disk" label="Save"></lib-ribbon-button>
              </storybook-ribbon-child>

              <storybook-ribbon-child>
                <lib-ribbon-button icon="fa-plus" label="New" color="text-green-600"></lib-ribbon-button>
              </storybook-ribbon-child>
            </lib-ribbon-group>
          </lib-ribbon>
        </div>
      </div>
    `,
  }),
};

export const Primary: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 max-w-5xl">
        <lib-ribbon>
          <lib-ribbon-group label="Record">
            <storybook-ribbon-child>
              <lib-ribbon-button
                icon="fa-floppy-disk"
                label="Save">
              </lib-ribbon-button>
            </storybook-ribbon-child>

            <storybook-ribbon-child>
              <lib-ribbon-button
                icon="fa-plus"
                label="New"
                color="text-green-600">
              </lib-ribbon-button>
            </storybook-ribbon-child>

            <storybook-ribbon-child>
              <lib-ribbon-button
                icon="fa-trash"
                label="Delete"
                color="text-red-600"
                [disabled]="true">
              </lib-ribbon-button>
            </storybook-ribbon-child>
          </lib-ribbon-group>

          <lib-ribbon-group label="Export">
            <storybook-ribbon-child>
              <lib-ribbon-button
                icon="fa-file-export"
                label="Export"
                [options]="[
                  { id: 'pdf', label: 'PDF', icon: 'fa-file-pdf' },
                  { id: 'xlsx', label: 'Excel', icon: 'fa-file-excel' },
                  { id: 'csv', label: 'CSV', icon: 'fa-file-csv' }
                ]">
              </lib-ribbon-button>
            </storybook-ribbon-child>
          </lib-ribbon-group>

          <div right>
            <lib-ribbon-group label="Status">
              <storybook-ribbon-child>
                <lib-ribbon-button
                  icon="fa-rotate"
                  label="Loading"
                  [loading]="true">
                </lib-ribbon-button>
              </storybook-ribbon-child>
            </lib-ribbon-group>
          </div>
        </lib-ribbon>
      </div>
    `,
  }),
};
