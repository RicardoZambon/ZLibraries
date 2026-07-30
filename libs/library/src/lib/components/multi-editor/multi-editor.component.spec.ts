import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { IBatchUpdate } from '../../models/batch-update';
import { MultiEditorDataset } from '../../services/datasets/multi-editor.dataset';
import { MultiEditorComponent } from './multi-editor.component';

// Matches GridDataset's internal row-key field. The stub below stamps it the same way the real
// dataset does, because the ordering of that mutation is exactly what one of these tests guards.
const KEY_FIELD = '_key';

/**
 * Stands in for DataGridDataset. Deliberately behavioural rather than a bag of jest.fn()s: it
 * appends rows, assigns each an internal key, and mirrors `updateRow`'s side effect of writing that
 * key back onto the object it is handed. A purely inert stub would not catch a regression where the
 * "did newData pre-fill anything?" check is evaluated after `addNewRow` has already added `_key`.
 */
function createGridStub() {
  const keys: string[] = [];
  const rows: any[] = [];

  return {
    loadFinished: new Subject<boolean>(),
    selectedRowsChanged: new Subject<void>(),

    hasSelectedRows: false,
    selectedRowKeys: [] as string[],

    get hasLoadedRows(): boolean {
      return rows.length > 0;
    },
    get loadedKeys(): string[] {
      return keys;
    },
    get loadedRows(): any[] {
      return rows;
    },

    addNewRow(row: any): void {
      row[KEY_FIELD] = `key-${keys.length + 1}`;
      rows.push(row);
      keys.push(row[KEY_FIELD]);
    },
    getRowData(key: string): any {
      return rows[keys.indexOf(key)] ?? null;
    },
    getRowID(key: string): any {
      return (rows[keys.indexOf(key)] ?? {})['id'];
    },
    removeKeys(toRemove: string[]): void {
      toRemove.forEach((key: string) => {
        const index: number = keys.indexOf(key);
        if (index >= 0) {
          keys.splice(index, 1);
          rows.splice(index, 1);
        }
      });
    },
    selectRow: jest.fn(),
    updateRow(key: string, newRowData: any): void {
      newRowData[KEY_FIELD] = key;
      const index: number = keys.indexOf(key);
      if (index >= 0) {
        rows[index] = newRowData;
      }
    },
  };
}

// A real MultiEditorDataset (not a mock) so the change tracking and batch assembly under test are
// the shipped implementations. Built with Object.create because its constructor calls inject().
function createDataset(grid: any, newDataResult: any) {
  const dataset: any = Object.create(MultiEditorDataset.prototype);

  dataset.dataGridDataset = grid;
  dataset.fakeIDsGenerated = [];
  dataset.modifiedValues = { changed: {}, removed: [] };
  dataset.savedChanges = { emit: jest.fn() };

  dataset.newData = jest.fn(() => newDataResult);
  dataset.saveData = jest.fn((batch: IBatchUpdate<any, any>): Observable<any> => of(batch));

  return dataset;
}

function lastBatch(dataset: any): IBatchUpdate<any, any> {
  dataset.saveChanges().subscribe();
  return dataset.saveData.mock.calls[dataset.saveData.mock.calls.length - 1][0];
}

describe('MultiEditorComponent', () => {
  let component: MultiEditorComponent;
  let grid: ReturnType<typeof createGridStub>;

  function build(newDataResult: any): any {
    grid = createGridStub();
    const dataset: any = createDataset(grid, newDataResult);

    component = Object.create(MultiEditorComponent.prototype);
    (component as any).destroy$ = new Subject<boolean>();
    (component as any).dataGridDataset = grid;
    (component as any).multiEditorDataset = dataset;
    (component as any).formService = { loading: false };
    (component as any).gridLoading = false;

    component.formGroup = new FormGroup({
      city: new FormControl<string | null>(null),
      country: new FormControl<string | null>(null),
      id: new FormControl<number | null>(null),
      street: new FormControl<string | null>(null),
    });

    return dataset;
  }

  describe('onNewClick', () => {
    it('should include values pre-filled by newData in the save batch', () => {
      const dataset: any = build({ city: 'Toronto', country: 'Canada', street: 'New address' });

      (component as any).onNewClick();

      // The row is never touched by the user, so nothing marks the form dirty. The pre-filled values
      // must still reach the backend. `_key` rides along because updateRow stamps it onto the row —
      // long-standing behaviour of the grid dataset, not something this assertion cares about.
      expect(lastBatch(dataset).entitiesToInsertOrUpdate).toEqual([
        expect.objectContaining({ city: 'Toronto', country: 'Canada', street: 'New address' }),
      ]);
    });

    it('should send nothing for a value-less new row', () => {
      // The blank-row convention: `newData` returning {} means "no defaults". Adding such a row and
      // saving without typing must still post an empty batch. This also pins the ordering of the
      // emptiness check — addNewRow stamps `_key` onto the row, so a check made afterwards would see
      // one own key and wrongly enqueue {}.
      const dataset: any = build({});

      (component as any).onNewClick();

      expect(lastBatch(dataset).entitiesToInsertOrUpdate).toEqual([]);
    });

    it('should keep every added row when several are added and none are edited', () => {
      const dataset: any = build({ city: 'Toronto', street: 'New address' });

      (component as any).onNewClick();
      (component as any).onNewClick();
      (component as any).onNewClick();

      expect(lastBatch(dataset).entitiesToInsertOrUpdate).toHaveLength(3);
    });

    it('should add nothing when newData returns a falsy model', () => {
      const dataset: any = build(null);

      (component as any).onNewClick();

      expect(grid.loadedKeys).toHaveLength(0);
      expect(lastBatch(dataset).entitiesToInsertOrUpdate).toEqual([]);
    });

    it('should still record a user edit over the pre-filled values', () => {
      const dataset: any = build({ city: 'Toronto', street: 'New address' });
      component.ngOnInit();

      (component as any).onNewClick();

      // Mirror the selection the grid would emit after selectRow, so the component binds the form to
      // the new row the way it does at runtime.
      grid.hasSelectedRows = true;
      grid.selectedRowKeys = ['key-1'];
      grid.selectedRowsChanged.next();

      component.formGroup.markAsDirty();
      component.formGroup.patchValue({ street: '42 Queen Street West' });

      const entities: any[] = lastBatch(dataset).entitiesToInsertOrUpdate;
      expect(entities).toHaveLength(1);
      expect(entities[0]).toEqual(expect.objectContaining({ city: 'Toronto', street: '42 Queen Street West' }));
    });
  });
});
