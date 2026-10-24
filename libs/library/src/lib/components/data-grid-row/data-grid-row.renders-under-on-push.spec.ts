import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { DataGridDataset } from '../../services/datasets/data-grid.dataset';
import { OnPushRender, renderUnderOnPush } from '../../../testing';
import { DataGridRowComponent } from './data-grid-row.component';

/**
 * A row's checkbox follows a selection the grid announces, which arrives from a subscription
 * long after the row first painted. It used to keep up by calling `detectChanges()` on itself:
 * that renders, but it renders because the component forced a pass rather than because anything
 * was notified -- so it proved nothing about the row being reachable.
 *
 * The selection is pushed through a Subject the spec controls, not `of(...)`, so it lands after
 * the first paint, where a strategy that is not notified cannot recover.
 *
 * `whenStable` rather than a synchronous tick, because `ngModel` writes to the control on a
 * microtask. It still discriminates: under the zoneless test environment it awaits the
 * scheduler, which only refreshes a view something notified.
 */
describe(`${DataGridRowComponent.name} under an OnPush ancestor`, () => {
  let selectedKeys: Set<string>;
  let selectedRowsChanged: Subject<{ [id: string]: { rowData: any; selected: boolean } }>;

  function checkbox(render: OnPushRender<DataGridRowComponent>): HTMLInputElement {
    return render.element.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  }

  beforeEach(() => {
    // The row measures its cells through ngx-resize-observer, and jsdom has no ResizeObserver.
    // Nothing here depends on a measurement, so it only has to exist.
    globalThis.ResizeObserver = class {
      public observe(): void {}
      public unobserve(): void {}
      public disconnect(): void {}
    } as unknown as typeof ResizeObserver;

    selectedKeys = new Set<string>();
    selectedRowsChanged = new Subject();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: DataGridDataset,
          useValue: {
            columns: [{ field: 'name', title: 'Name' }],
            configs: { multiSelect: true, rowHeight: 24, selectOnClick: false },
            deselectRow: (key: string): boolean => selectedKeys.delete(key),
            focusedRowKey: undefined,
            getRowInternalKey: (rowData: { id: string }): string => rowData.id,
            isKeySelected: (key: string): boolean => selectedKeys.has(key),
            selectRow: (key: string): Set<string> => selectedKeys.add(key),
            selectedRowsChanged,
            setFocusedRow: (): void => undefined,
          },
        },
      ],
    });
  });

  it('ticks its checkbox when the grid announces the row is selected', async () => {
    const render: OnPushRender<DataGridRowComponent> = renderUnderOnPush(DataGridRowComponent, {
      rowData: { id: 'row-1', name: 'Ada' },
    });
    await render.fixture.whenStable();

    expect(checkbox(render).checked).toBe(false);

    selectedKeys.add('row-1');
    selectedRowsChanged.next({ 'row-1': { rowData: { id: 'row-1' }, selected: true } });
    await render.fixture.whenStable();

    expect(checkbox(render).checked).toBe(true);
  });

  it('clears it again when the grid announces the row is no longer selected', async () => {
    selectedKeys.add('row-1');

    const render: OnPushRender<DataGridRowComponent> = renderUnderOnPush(DataGridRowComponent, {
      rowData: { id: 'row-1', name: 'Ada' },
    });
    await render.fixture.whenStable();

    expect(checkbox(render).checked).toBe(true);

    selectedKeys.delete('row-1');
    selectedRowsChanged.next({ 'row-1': { rowData: { id: 'row-1' }, selected: false } });
    await render.fixture.whenStable();

    expect(checkbox(render).checked).toBe(false);
  });

  it('leaves a row the announcement does not name alone', async () => {
    const render: OnPushRender<DataGridRowComponent> = renderUnderOnPush(DataGridRowComponent, {
      rowData: { id: 'row-1', name: 'Ada' },
    });
    await render.fixture.whenStable();

    selectedRowsChanged.next({ 'row-2': { rowData: { id: 'row-2' }, selected: true } });
    await render.fixture.whenStable();

    expect(checkbox(render).checked).toBe(false);
  });
});
