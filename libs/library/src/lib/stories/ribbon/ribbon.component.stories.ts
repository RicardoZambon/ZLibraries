import { Component, forwardRef } from '@angular/core';
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
  public visible = true;
}

const meta: Meta<RibbonComponent> = {
  component: RibbonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RibbonButtonComponent,
        RibbonGroupComponent,
        StorybookRibbonChildComponent,
      ],
    }),
  ],
  title: 'Ribbon/Ribbon',
};
export default meta;
type Story = StoryObj<RibbonComponent>;

export const Primary: Story = {
  args: {
  },
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

