import { EventEmitter } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { ChildList } from './child-list';

describe('ChildList', () => {
  let component: any;
  let mockDataGridDataset: {
    loadStarted: EventEmitter<void>;
    loadFinished: EventEmitter<boolean>;
    selectedRowsChanged: Subject<any>;
    selectedRowKeys: string[];
    parentEntityId: any;
    loadedRows: any[] | undefined;
    refresh: jest.Mock;
  };
  let mockDataProvider: {
    hasEntityID: boolean;
    entityID: number | undefined;
    getModel$: jest.Mock;
  };
  let mockResultDataset: {
    parentEntityId: any;
    savedChanges: EventEmitter<void>;
  };
  let modelSubject: ReplaySubject<any>;

  beforeEach(() => {
    modelSubject = new ReplaySubject<any>(1);

    mockDataGridDataset = {
      loadStarted: new EventEmitter(),
      loadFinished: new EventEmitter(),
      selectedRowsChanged: new Subject(),
      selectedRowKeys: [],
      parentEntityId: undefined,
      loadedRows: undefined,
      refresh: jest.fn(),
    };

    mockDataProvider = {
      hasEntityID: true,
      entityID: 42,
      getModel$: jest.fn().mockReturnValue(modelSubject.asObservable()),
    };

    mockResultDataset = {
      parentEntityId: undefined,
      savedChanges: new EventEmitter(),
    };

    component = Object.create(ChildList.prototype);
    component.destroy$ = new Subject();
    component.loading = false;
    component.selectionCount = 0;
    component.dataGridDataset = mockDataGridDataset;
    component.dataProvider = mockDataProvider;
    component.resultDataset = mockResultDataset;
  });

  describe('ngOnInit — initial load', () => {
    it('should set parentEntityId and refresh when dataProvider has entityID', () => {
      component.ngOnInit();

      expect(mockDataGridDataset.parentEntityId).toBe(42);
      expect(mockDataGridDataset.refresh).toHaveBeenCalledTimes(1);
    });

    it('should set parentEntityId on resultDataset when available', () => {
      component.ngOnInit();

      expect(mockResultDataset.parentEntityId).toBe(42);
    });

    it('should not refresh when loadedRows already exist', () => {
      mockDataGridDataset.loadedRows = [{ id: 1 }];

      component.ngOnInit();

      expect(mockDataGridDataset.parentEntityId).toBe(42);
      expect(mockDataGridDataset.refresh).not.toHaveBeenCalled();
    });

    it('should not set parentEntityId when dataProvider has no entityID', () => {
      mockDataProvider.hasEntityID = false;
      mockDataProvider.entityID = undefined;

      component.ngOnInit();

      expect(mockDataGridDataset.parentEntityId).toBeUndefined();
    });

    it('should not fail when dataProvider is null', () => {
      component.dataProvider = null;

      expect(() => component.ngOnInit()).not.toThrow();
      expect(mockDataGridDataset.refresh).not.toHaveBeenCalled();
    });

    it('should not fail when resultDataset is null', () => {
      component.resultDataset = null;

      expect(() => component.ngOnInit()).not.toThrow();
      expect(mockDataGridDataset.parentEntityId).toBe(42);
    });
  });

  describe('model update — auto-refresh child list on parent entity save', () => {
    it('should NOT refresh on the first model emission (initial load)', () => {
      component.ngOnInit();
      mockDataGridDataset.refresh.mockClear();

      modelSubject.next({ id: 42, name: 'Entity' });

      expect(mockDataGridDataset.refresh).not.toHaveBeenCalled();
    });

    it('should refresh on the second model emission (parent entity saved)', () => {
      component.ngOnInit();
      mockDataGridDataset.refresh.mockClear();

      // First emission (initial load) — skipped by skip(1)
      modelSubject.next({ id: 42, name: 'Entity' });
      // Second emission (parent saved) — should refresh
      modelSubject.next({ id: 42, name: 'Updated Entity' });

      expect(mockDataGridDataset.refresh).toHaveBeenCalledTimes(1);
    });

    it('should refresh on every subsequent model emission', () => {
      component.ngOnInit();
      mockDataGridDataset.refresh.mockClear();

      modelSubject.next({ id: 42 }); // initial — skipped
      modelSubject.next({ id: 42 }); // save 1
      modelSubject.next({ id: 42 }); // save 2
      modelSubject.next({ id: 42 }); // save 3

      expect(mockDataGridDataset.refresh).toHaveBeenCalledTimes(3);
    });

    it('should not subscribe to model updates when dataProvider is null', () => {
      component.dataProvider = null;

      component.ngOnInit();

      expect(mockDataProvider.getModel$).not.toHaveBeenCalled();
    });
  });

  describe('resultDataset.savedChanges — refresh on inline save', () => {
    it('should refresh the grid when savedChanges emits', () => {
      component.ngOnInit();
      mockDataGridDataset.refresh.mockClear();

      mockResultDataset.savedChanges.emit();

      expect(mockDataGridDataset.refresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading state', () => {
    it('should set loading to true when loadStarted emits', () => {
      component.ngOnInit();

      mockDataGridDataset.loadStarted.emit();

      expect(component.loading).toBe(true);
    });

    it('should set loading to false when loadFinished emits', () => {
      component.ngOnInit();
      component.loading = true;

      mockDataGridDataset.loadFinished.emit(true);

      expect(component.loading).toBe(false);
    });
  });

  describe('selectedRowChanged', () => {
    it('should update selectionCount when selectedRowsChanged emits', () => {
      component.ngOnInit();
      mockDataGridDataset.selectedRowKeys = ['key-1', 'key-2'];

      mockDataGridDataset.selectedRowsChanged.next({});

      expect(component.selectionCount).toBe(2);
    });

    it('should track selection changes over time', () => {
      component.ngOnInit();

      mockDataGridDataset.selectedRowKeys = ['key-1'];
      mockDataGridDataset.selectedRowsChanged.next({});
      expect(component.selectionCount).toBe(1);

      mockDataGridDataset.selectedRowKeys = [];
      mockDataGridDataset.selectedRowsChanged.next({});
      expect(component.selectionCount).toBe(0);
    });
  });

  describe('isLoading', () => {
    it('should return the loading state', () => {
      component.loading = false;
      expect(component.isLoading).toBe(false);

      component.loading = true;
      expect(component.isLoading).toBe(true);
    });
  });
});
