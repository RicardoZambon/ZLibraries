import type { Meta, StoryObj } from '@storybook/angular';
import { GroupAccordionComponent } from '../../components/group-accordion/group-accordion.component';

const meta: Meta<GroupAccordionComponent> = {
  component: GroupAccordionComponent,
  title: 'Form Components/Group Accordion',
};
export default meta;
type Story = StoryObj<GroupAccordionComponent>;

export const Primary: Story = {
  args: {
    label: 'Details',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 max-w-3xl">
        <lib-group-accordion [label]="label">
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
  }),
};

