import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { GridDataset } from './grid.dataset';
import { GridConfigsProvider } from '../configs-providers/grid-configs.provider';

@Injectable()
class ConcreteGridDataset extends GridDataset {
  public getDataMock: jest.Mock = jest.fn();

  public getData(params?: any): Observable<any[]> {
    return this.getDataMock(params);
  }
}

describe('GridDataset', () => {
  let dataset: ConcreteGridDataset;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConcreteGridDataset,
        GridConfigsProvider,
      ],
    });

    dataset = TestBed.inject(ConcreteGridDataset);
    dataset.getDataMock.mockReturnValue(of([
      { id: 1, name: 'Row 1' },
      { id: 2, name: 'Row 2' },
      { id: 3, name: 'Row 3' },
    ]));
  });

  it('should be created', () => {
    expect(dataset).toBeTruthy();
  });

  describe('initial state', () => {
    it('should not have loaded rows', () => {
      expect(dataset.hasLoadedRows).toBe(false);
    });

    it('should not have been loaded', () => {
      expect(dataset.hasBeenLoaded).toBe(false);
    });

    it('should have undefined loadedRows', () => {
      expect(dataset.loadedRows).toBeUndefined();
    });

    it('should have undefined loadedKeys', () => {
      expect(dataset.loadedKeys).toBeUndefined();
    });
  });

  describe('loadRows', () => {
    it('should load data and populate loadedRows', () => {
      dataset.loadRows();

      expect(dataset.hasLoadedRows).toBe(true);
      expect(dataset.loadedRows!.length).toBe(3);
    });

    it('should set hasBeenLoaded to true after loading', () => {
      dataset.loadRows();

      expect(dataset.hasBeenLoaded).toBe(true);
    });

    it('should emit loadStarted', () => {
      let started: boolean = false;
      dataset.loadStarted.subscribe(() => { started = true; });

      dataset.loadRows();

      expect(started).toBe(true);
    });

    it('should emit loadFinished with true on success', () => {
      let finished: boolean | undefined;
      dataset.loadFinished.subscribe((v: boolean) => { finished = v; });

      dataset.loadRows();

      expect(finished).toBe(true);
    });

    it('should emit loadFinished with false on error', () => {
      dataset.getDataMock.mockReturnValue(throwError(() => new Error('fail')));
      let finished: boolean | undefined;
      dataset.loadFinished.subscribe((v: boolean) => { finished = v; });

      dataset.loadRows();

      expect(finished).toBe(false);
    });

    it('should not load if already loading', () => {
      const subject: Subject<any[]> = new Subject();
      dataset.getDataMock.mockReturnValue(subject.asObservable());

      dataset.loadRows();
      dataset.loadRows();

      expect(dataset.getDataMock).toHaveBeenCalledTimes(1);
    });

    it('should assign unique keys to each row', () => {
      dataset.loadRows();

      const keys: string[] = dataset.loadedKeys!;
      const uniqueKeys: Set<string> = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should set loadedLastRow when fewer rows than block size', () => {
      dataset.loadRows();

      expect(dataset.loadedLastRow).toBe(true);
    });

    it('should handle empty result', () => {
      dataset.getDataMock.mockReturnValue(of([]));

      dataset.loadRows();

      expect(dataset.hasLoadedRows).toBe(false);
      expect(dataset.hasBeenLoaded).toBe(true);
      expect(dataset.loadedRows).toEqual([]);
    });

    it('should handle null result (coerced to empty)', () => {
      dataset.getDataMock.mockReturnValue(of(null));

      dataset.loadRows();

      expect(dataset.hasBeenLoaded).toBe(true);
    });

    it('should pass filters in parameters', () => {
      dataset.setFilters({ status: 'active' });

      expect(dataset.getDataMock).toHaveBeenCalledWith(
        expect.objectContaining({ filters: { status: 'active' } })
      );
    });
  });

  describe('addNewRow', () => {
    it('should add a row to existing loaded rows', () => {
      dataset.loadRows();
      const initialCount: number = dataset.loadedRows!.length;

      dataset.addNewRow({ id: 4, name: 'Row 4' });

      expect(dataset.loadedRows!.length).toBe(initialCount + 1);
    });

    it('should work when no rows loaded yet', () => {
      dataset.addNewRow({ id: 1, name: 'First' });

      expect(dataset.hasLoadedRows).toBe(true);
      expect(dataset.loadedRows!.length).toBe(1);
    });
  });

  describe('getRowData', () => {
    it('should return row data by key', () => {
      dataset.loadRows();
      const key: string = dataset.loadedKeys![0];

      const row: any = dataset.getRowData(key);

      expect(row.id).toBe(1);
      expect(row.name).toBe('Row 1');
    });

    it('should return null when no rows loaded', () => {
      expect(dataset.getRowData('nonexistent')).toBeNull();
    });
  });

  describe('getRowID', () => {
    it('should return the compare property value', () => {
      dataset.loadRows();
      const key: string = dataset.loadedKeys![1];

      expect(dataset.getRowID(key)).toBe(2);
    });
  });

  describe('getRowInternalKey', () => {
    it('should return the internal _key field', () => {
      dataset.loadRows();
      const row: any = dataset.loadedRows![0];

      expect(dataset.getRowInternalKey(row)).toBe(dataset.loadedKeys![0]);
    });
  });

  describe('hasRowWithID', () => {
    it('should return true for existing ID', () => {
      dataset.loadRows();

      expect(dataset.hasRowWithID(2)).toBe(true);
    });

    it('should return false for non-existing ID', () => {
      dataset.loadRows();

      expect(dataset.hasRowWithID(999)).toBe(false);
    });

    it('should return false when no rows loaded', () => {
      expect(dataset.hasRowWithID(1)).toBe(false);
    });
  });

  describe('isKeyExists', () => {
    it('should return true for existing key', () => {
      dataset.loadRows();

      expect(dataset.isKeyExists(dataset.loadedKeys![0])).toBe(true);
    });

    it('should return false for non-existing key', () => {
      dataset.loadRows();

      expect(dataset.isKeyExists('fake-key')).toBe(false);
    });
  });

  describe('removeKeys', () => {
    it('should remove rows by keys', () => {
      dataset.loadRows();
      const keyToRemove: string = dataset.loadedKeys![1];

      dataset.removeKeys([keyToRemove]);

      expect(dataset.loadedRows!.length).toBe(2);
      expect(dataset.isKeyExists(keyToRemove)).toBe(false);
    });

    it('should clear focused row if it is removed', () => {
      dataset.loadRows();
      const key: string = dataset.loadedKeys![0];
      dataset.setFocusedRow(key);

      dataset.removeKeys([key]);

      expect((dataset as any).focusedRow).toBeNull();
    });

    it('should do nothing when no rows loaded', () => {
      expect(() => dataset.removeKeys(['key'])).not.toThrow();
    });
  });

  describe('updateRow', () => {
    it('should update an existing row', () => {
      dataset.loadRows();
      const key: string = dataset.loadedKeys![0];

      dataset.updateRow(key, { id: 1, name: 'Updated Row 1' });

      expect(dataset.getRowData(key).name).toBe('Updated Row 1');
    });

    it('should preserve the internal key on updated row', () => {
      dataset.loadRows();
      const key: string = dataset.loadedKeys![0];

      dataset.updateRow(key, { id: 1, name: 'Updated' });

      expect(dataset.getRowInternalKey(dataset.getRowData(key))).toBe(key);
    });

    it('should do nothing when no rows loaded', () => {
      expect(() => dataset.updateRow('key', { id: 1 })).not.toThrow();
    });
  });

  describe('refresh', () => {
    it('should clear loaded rows and reload', () => {
      dataset.loadRows();
      expect(dataset.hasLoadedRows).toBe(true);

      dataset.getDataMock.mockReturnValue(of([{ id: 10, name: 'New' }]));
      dataset.refresh();

      expect(dataset.loadedRows!.length).toBe(1);
    });

    it('should clear focused row', () => {
      dataset.loadRows();
      dataset.setFocusedRow(dataset.loadedKeys![0]);

      dataset.refresh();

      expect((dataset as any).focusedRow).toBeNull();
    });
  });

  describe('setFilters', () => {
    it('should store filters and emit filtersChanged', () => {
      let emittedFilters: any = null;
      dataset.filtersChanged.subscribe((f: any) => { emittedFilters = f; });

      dataset.setFilters({ type: 'test' });

      expect(dataset.filters).toEqual({ type: 'test' });
      expect(emittedFilters).toEqual({ type: 'test' });
    });

    it('should trigger a refresh', () => {
      dataset.setFilters({ type: 'test' });

      expect(dataset.getDataMock).toHaveBeenCalled();
    });
  });

  describe('setFocusedRow / clearFocusedRow', () => {
    it('should set and clear focused row', () => {
      dataset.loadRows();
      const key: string = dataset.loadedKeys![0];

      dataset.setFocusedRow(key);
      expect((dataset as any).focusedRow).toBe(key);

      dataset.clearFocusedRow();
      expect((dataset as any).focusedRow).toBeNull();
    });
  });

  describe('parentEntityId override', () => {
    it('should trigger refresh when set after rows are loaded', () => {
      dataset.loadRows();
      dataset.getDataMock.mockClear();
      dataset.getDataMock.mockReturnValue(of([]));

      dataset.parentEntityId = 5;

      expect(dataset.getDataMock).toHaveBeenCalled();
    });

    it('should not trigger refresh when set before rows loaded', () => {
      dataset.getDataMock.mockClear();

      dataset.parentEntityId = 5;

      expect(dataset.getDataMock).not.toHaveBeenCalled();
    });

    it('should trigger refresh when re-assigned the same value after rows are loaded', () => {
      dataset.parentEntityId = 5;
      dataset.loadRows();
      dataset.getDataMock.mockClear();
      dataset.getDataMock.mockReturnValue(of([]));

      dataset.parentEntityId = 5;

      expect(dataset.getDataMock).toHaveBeenCalled();
    });
  });
});
