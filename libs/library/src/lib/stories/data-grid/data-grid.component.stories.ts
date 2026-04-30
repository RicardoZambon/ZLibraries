import type { Meta, StoryObj } from '@storybook/angular';
import { DataGridComponent } from '../../components/data-grid/data-grid.component';

const meta: Meta<DataGridComponent> = {
  component: DataGridComponent,
  title: 'Data Grid/Data Grid',
};
export default meta;
type Story = StoryObj<DataGridComponent>;

export const Primary: Story = {
  args: {
    disabled: false,
    lazyLoadRows: false,
    showButtons: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 max-w-5xl h-96">
        <lib-data-grid
          [disabled]="disabled"
          [lazyLoadRows]="lazyLoadRows"
          [showButtons]="showButtons">
        </lib-data-grid>
      </div>
    `,
  }),
};

export const WithButtons: Story = {
  args: {
    disabled: false,
    lazyLoadRows: false,
    showButtons: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 max-w-5xl h-96">
        <lib-data-grid
          [disabled]="disabled"
          [lazyLoadRows]="lazyLoadRows"
          [showButtons]="showButtons">
          <div buttons class="flex gap-2">
            <button type="button" class="btn slate-100">
              <i class="fa-solid fa-plus"></i>
              Add
            </button>
            <button type="button" class="btn slate-100">
              <i class="fa-solid fa-rotate"></i>
              Refresh
            </button>
          </div>
        </lib-data-grid>
      </div>
    `,
  }),
};

export const ChildListWithButtons: Story = {
  args: {
    disabled: false,
    lazyLoadRows: true,
    showButtons: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 max-w-5xl h-80">
        <lib-data-grid
          [disabled]="disabled"
          [lazyLoadRows]="lazyLoadRows"
          [showButtons]="showButtons">
          <div buttons class="flex gap-2">
            <button type="button" class="btn green-500">
              <i class="fa-solid fa-plus"></i>
              New
            </button>
            <button type="button" class="btn red-500">
              <i class="fa-solid fa-trash"></i>
              Remove
            </button>
          </div>
        </lib-data-grid>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    lazyLoadRows: false,
    showButtons: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 max-w-5xl h-96">
        <lib-data-grid
          [disabled]="disabled"
          [lazyLoadRows]="lazyLoadRows"
          [showButtons]="showButtons">
        </lib-data-grid>
      </div>
    `,
  }),
};

