import { Component, Injectable } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Observable, of } from 'rxjs';
import { DataGridComponent } from '../../components/data-grid/data-grid.component';
import { IGridColumn } from '../../models';
import { DataGridDataset } from '../../services/datasets/data-grid.dataset';

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

// Multi-select turned on over rows taller than the 41.6px default — the height a row needs once it
// shows a thumbnail. Anything misaligned in the selection column stands out at this height, so this
// is the story to look at when checking the checkbox's vertical centring.
type TallRow = { id: number; name: string; status: string };

@Injectable()
class TallRowsMultiSelectDataset extends DataGridDataset {
  public override columns: IGridColumn[] = [
    { field: 'id', headerName: 'ID', size: '5rem' },
    { field: 'name', headerName: 'Name', size: 'minmax(12rem, 1fr)' },
    { field: 'status', headerName: 'Status', size: '10rem' },
  ];

  constructor() {
    super();
    this.configs = { ...this.configs, multiSelect: true, rowHeight: 56 };
  }

  public getData(): Observable<TallRow[]> {
    return of([
      { id: 1, name: 'Alpha record', status: 'Active' },
      { id: 2, name: 'Beta record', status: 'Pending' },
      { id: 3, name: 'Gamma record', status: 'Archived' },
    ]);
  }
}

// The dataset is provided on a host component rather than through the story's module metadata so it
// resolves from the element injector, which always wins over the preview-wide provider.
@Component({
  selector: 'lib-tall-rows-multi-select-host',
  imports: [DataGridComponent],
  providers: [{ provide: DataGridDataset, useClass: TallRowsMultiSelectDataset }],
  template: `
    <div class="p-4 max-w-5xl h-96">
      <lib-data-grid></lib-data-grid>
    </div>
  `,
})
class TallRowsMultiSelectHostComponent {}

export const MultiSelectTallRows: Story = {
  decorators: [moduleMetadata({ imports: [TallRowsMultiSelectHostComponent] })],
  render: () => ({
    template: `<lib-tall-rows-multi-select-host></lib-tall-rows-multi-select-host>`,
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

