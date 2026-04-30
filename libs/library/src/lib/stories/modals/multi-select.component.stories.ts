import type { Meta, StoryObj } from '@storybook/angular';
import { MultiSelectComponent } from '../../components/multi-select/multi-select.component';

const meta: Meta<MultiSelectComponent> = {
  component: MultiSelectComponent,
  title: 'Modals/Multi Select',
};
export default meta;
type Story = StoryObj<MultiSelectComponent>;

export const Primary: Story = {
  args: {
    closeButtonText: 'Cancel',
    dialog: true,
    modalProcessing: false,
    position: 'center',
    size: '5xl',
    title: 'Select records',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4">
        <button type="button" class="btn blue-500" (click)="multiSelect.toggleModal()">
          Open selector
        </button>

        <lib-multi-select
          #multiSelect
          [closeButtonText]="closeButtonText"
          [dialog]="dialog"
          [modalProcessing]="modalProcessing"
          [position]="position"
          [size]="size"
          [title]="title">
        </lib-multi-select>
      </div>
    `,
  }),
};

export const CompactSelector: Story = {
  args: {
    ...Primary.args,
    size: '3xl',
    title: 'Select assignees',
  },
  render: Primary.render,
};

export const WidePermissionSelector: Story = {
  args: {
    ...Primary.args,
    size: '7xl',
    title: 'Select permissions',
  },
  render: Primary.render,
};

