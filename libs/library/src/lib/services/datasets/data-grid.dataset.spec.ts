import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DataGridDataset } from './data-grid.dataset';
import { GridConfigsProvider } from '../configs-providers/grid-configs.provider';
import { IGridColumn } from '../../models/grid-column';

@Injectable()
class DataGridConfigsProvider extends GridConfigsProvider {
  constructor() {
    super();
    (this._configs as any).multiSelect = false;
    (this._configs as any).selectOnClick = true;
  }
}

@Injectable()
class ConcreteDataGridDataset extends DataGridDataset {
  public getDataMock: jest.Mock = jest.fn();

  public getData(params?: any): Observable<any[]> {
    return this.getDataMock(params);
  }
}

describe('DataGridDataset', () => {
  let dataset: any;

  function loadTestData(): void {
    dataset.getDataMock.mockReturnValue(of([
      { id: 1, name: 'Row 1' },
      { id: 2, name: 'Row 2' },
      { id: 3, name: 'Row 3' },
    ]));
    dataset.loadRows();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConcreteDataGridDataset,
        { provide: GridConfigsProvider, useClass: DataGridConfigsProvider },
      ],
    });

    dataset = TestBed.inject(ConcreteDataGridDataset);
    dataset.columns = [
      { field: 'id', size: '80px' } as IGridColumn,
      { field: 'name' } as IGridColumn,
    ];
    dataset.configs.multiSelect = false;
    dataset.configs.selectOnClick = true;
    loadTestData();
  });

  it('should be created', () => {
    expect(dataset).toBeTruthy();
  });

  describe('columnsSize', () => {
    it('should return column sizes joined by space', () => {
      expect(dataset.columnsSize).toBe('80px minmax(0,1fr)');
    });

    it('should include multiSelect column when enabled', () => {
      dataset.configs.multiSelect = true;

      expect(dataset.columnsSize).toContain('minmax(1.5rem,min-content)');
    });
  });

  describe('selectRow', () => {
    it('should select a row by key', () => {
      const key: string = dataset.loadedKeys![0];

      dataset.selectRow(key);

      expect(dataset.isKeySelected(key)).toBe(true);
      expect(dataset.hasSelectedRows).toBe(true);
    });

    it('should emit selectedRowsChanged', () => {
      let emitted: any = null;
      dataset.selectedRowsChanged.subscribe((v: any) => { emitted = v; });
      const key: string = dataset.loadedKeys![0];

      dataset.selectRow(key);

      expect(emitted[key]).toBeDefined();
      expect(emitted[key].selected).toBe(true);
    });

    it('should replace selection in single-select mode', () => {
      const key1: string = dataset.loadedKeys![0];
      const key2: string = dataset.loadedKeys![1];

      dataset.selectRow(key1);
      dataset.selectRow(key2);

      expect(dataset.isKeySelected(key1)).toBe(false);
      expect(dataset.isKeySelected(key2)).toBe(true);
    });

    it('should not re-select already selected key in single-select', () => {
      const key: string = dataset.loadedKeys![0];
      dataset.selectRow(key);

      let emitted: boolean = false;
      dataset.selectedRowsChanged.subscribe(() => { emitted = true; });

      dataset.selectRow(key);

      expect(emitted).toBe(false);
    });
  });

  describe('selectRows (multi-select)', () => {
    it('should select multiple rows', () => {
      dataset.configs.multiSelect = true;
      const keys: string[] = [dataset.loadedKeys![0], dataset.loadedKeys![1]];

      dataset.selectRows(keys);

      expect(dataset.selectedRowKeys.length).toBe(2);
    });

    it('should not select already-selected keys', () => {
      dataset.configs.multiSelect = true;
      const key: string = dataset.loadedKeys![0];
      dataset.selectRow(key);

      dataset.selectRows([key, dataset.loadedKeys![1]]);

      expect(dataset.selectedRowKeys.length).toBe(2);
    });

    it('should do nothing if not multiSelect', () => {
      const keys: string[] = [dataset.loadedKeys![0], dataset.loadedKeys![1]];

      dataset.selectRows(keys);

      expect(dataset.selectedRowKeys.length).toBe(0);
    });
  });

  describe('deselectRow', () => {
    it('should deselect a selected row', () => {
      const key: string = dataset.loadedKeys![0];
      dataset.selectRow(key);

      dataset.deselectRow(key);

      expect(dataset.isKeySelected(key)).toBe(false);
    });

    it('should emit selectedRowsChanged with selected=false', () => {
      const key: string = dataset.loadedKeys![0];
      dataset.selectRow(key);

      let emitted: any = null;
      dataset.selectedRowsChanged.subscribe((v: any) => { emitted = v; });

      dataset.deselectRow(key);

      expect(emitted[key].selected).toBe(false);
    });

    it('should do nothing for unselected key', () => {
      let emitted: boolean = false;
      dataset.selectedRowsChanged.subscribe(() => { emitted = true; });

      dataset.deselectRow('nonexistent');

      expect(emitted).toBe(false);
    });
  });

  describe('clearSelection', () => {
    it('should clear all selected rows', () => {
      dataset.configs.multiSelect = true;
      dataset.selectRows(dataset.loadedKeys!);

      dataset.clearSelection();

      expect(dataset.hasSelectedRows).toBe(false);
      expect(dataset.selectedRowKeys.length).toBe(0);
    });

    it('should emit selectedRowsChanged for all cleared keys', () => {
      dataset.configs.multiSelect = true;
      dataset.selectRows([dataset.loadedKeys![0], dataset.loadedKeys![1]]);

      let emitted: any = null;
      dataset.selectedRowsChanged.subscribe((v: any) => { emitted = v; });

      dataset.clearSelection();

      expect(Object.keys(emitted).length).toBe(2);
    });

    it('should do nothing when no selection', () => {
      let emitted: boolean = false;
      dataset.selectedRowsChanged.subscribe(() => { emitted = true; });

      dataset.clearSelection();

      expect(emitted).toBe(false);
    });
  });

  describe('getSelectedRowsData', () => {
    it('should return data for selected rows', () => {
      dataset.configs.multiSelect = true;
      dataset.selectRows([dataset.loadedKeys![0], dataset.loadedKeys![2]]);

      const data: any[] = dataset.getSelectedRowsData();

      expect(data.length).toBe(2);
      expect(data[0].id).toBe(1);
      expect(data[1].id).toBe(3);
    });

    it('should return empty array when no selection', () => {
      expect(dataset.getSelectedRowsData()).toEqual([]);
    });
  });

  describe('setFocusedRow', () => {
    it('should auto-select in single-select mode', () => {
      const key: string = dataset.loadedKeys![0];

      dataset.setFocusedRow(key);

      expect(dataset.isKeySelected(key)).toBe(true);
    });

    it('should toggle selection in multi-select mode with selectOnClick', () => {
      dataset.configs.multiSelect = true;
      dataset.configs.selectOnClick = true;
      const key: string = dataset.loadedKeys![0];

      dataset.setFocusedRow(key);
      expect(dataset.isKeySelected(key)).toBe(true);

      dataset.setFocusedRow(key);
      expect(dataset.isKeySelected(key)).toBe(false);
    });
  });

  describe('refresh', () => {
    it('should clear selection before refreshing', () => {
      dataset.selectRow(dataset.loadedKeys![0]);

      dataset.getDataMock.mockReturnValue(of([{ id: 10, name: 'New' }]));
      dataset.refresh();

      expect(dataset.hasSelectedRows).toBe(false);
    });
  });

  describe('removeKeys', () => {
    it('should also remove from selectedRowKeys', () => {
      dataset.configs.multiSelect = true;
      const key: string = dataset.loadedKeys![0];
      dataset.selectRow(key);

      dataset.removeKeys([key]);

      expect(dataset.isKeySelected(key)).toBe(false);
    });
  });

  describe('selectRowID / deselectRowID', () => {
    it('should select a row by its ID', () => {
      dataset.selectRowID(2);

      expect(dataset.isKeySelected(dataset.loadedKeys![1])).toBe(true);
    });

    it('should deselect a row by its ID', () => {
      dataset.selectRowID(2);

      dataset.deselectRowID(2);

      expect(dataset.hasSelectedRows).toBe(false);
    });
  });
});
