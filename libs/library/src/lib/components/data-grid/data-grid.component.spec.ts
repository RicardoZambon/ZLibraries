import { EventEmitter } from '@angular/core';
import { NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { DataGridComponent } from './data-grid.component';

describe('DataGridComponent', () => {
  let component: any;
  let mockDataGridDataset: {
    configs: any;
    columns: any[];
    columnsSize: string;
    hasBeenLoaded: boolean;
    isLoading: boolean;
    loadedRows: any[] | undefined;
    loadedLastRow: boolean;
    loadFinished: EventEmitter<boolean>;
    loadRows: jest.Mock;
    loadStarted: EventEmitter<void>;
  };
  let mockViewport: {
    checkViewportSize: jest.Mock;
    getRenderedRange: jest.Mock;
    measureScrollOffset: jest.Mock;
    measureViewportSize: jest.Mock;
    renderedRangeStream: Subject<{ start: number; end: number }>;
    scrollTo: jest.Mock;
  };
  let mockRouter: {
    events: Subject<any>;
    url: string;
  };
  let mockChangeDetectorRef: { detectChanges: jest.Mock };
  let mockNgZone: { runOutsideAngular: jest.Mock };
  let mockBodyElement: { nativeElement: { clientWidth: number } };

  let mockResizeObserverInstance: { observe: jest.Mock; disconnect: jest.Mock };
  let resizeObserverCallback: (() => void) | undefined;
  let originalResizeObserver: typeof ResizeObserver;

  function setupComponent(options?: {
    lazyLoadRows?: boolean;
    loadedRows?: any[];
    hasBeenLoaded?: boolean;
  }): void {
    const opts = options ?? {};

    mockDataGridDataset = {
      configs: {
        rowHeight: 41.6,
        rowsToDisplay: 6,
        multiSelect: false,
        messageOnEmpty: '',
        messageOnLazyLoad: '',
        messageOnFailed: '',
        showMessageOnEmpty: true,
      },
      columns: [],
      columnsSize: '',
      hasBeenLoaded: opts.hasBeenLoaded ?? false,
      isLoading: false,
      loadedRows: opts.loadedRows ?? undefined,
      loadedLastRow: false,
      loadFinished: new EventEmitter<boolean>(),
      loadRows: jest.fn(),
      loadStarted: new EventEmitter<void>(),
    };

    mockViewport = {
      checkViewportSize: jest.fn(),
      getRenderedRange: jest.fn().mockReturnValue({ start: 0, end: 5 }),
      measureScrollOffset: jest.fn().mockReturnValue(0),
      measureViewportSize: jest.fn().mockReturnValue(500),
      renderedRangeStream: new Subject(),
      scrollTo: jest.fn(),
    };

    mockRouter = {
      events: new Subject(),
      url: '/test-route',
    };

    mockChangeDetectorRef = { detectChanges: jest.fn() };

    mockNgZone = {
      runOutsideAngular: jest.fn((fn: () => void) => fn()),
    };

    mockBodyElement = {
      nativeElement: { clientWidth: 520 },
    };

    component = Object.create(DataGridComponent.prototype);

    // BaseComponent
    component.destroy$ = new Subject<boolean>();

    // Inputs
    component.disabled = false;
    component.lazyLoadRows = opts.lazyLoadRows ?? false;
    component.showButtons = false;

    // Variables
    component.bodyResizeObserver = undefined;
    component.bodyResized$ = new Subject<void>();
    component.changeDetectorRef = mockChangeDetectorRef;
    component.dataGridDataset = mockDataGridDataset;
    component.ngZone = mockNgZone;
    component.router = mockRouter;

    component.gridRoute = '';
    component.hasFailed = false;
    component.headerRightMargin = 0;
    component.isGridCurrentUrl = false;
    component.lastPosition = 0;
    component.loading = false;
    component.selectionColRealSize = undefined;

    // ViewChilds
    component.bodyElement = mockBodyElement;
    component.viewport = mockViewport;
  }

  beforeEach(() => {
    originalResizeObserver = global.ResizeObserver;
    resizeObserverCallback = undefined;
    mockResizeObserverInstance = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };
    global.ResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
      resizeObserverCallback = callback as any;
      return mockResizeObserverInstance;
    }) as any;
  });

  afterEach(() => {
    if (component?.destroy$) {
      component.destroy$.next(true);
      component.destroy$.complete();
    }
    global.ResizeObserver = originalResizeObserver;
    jest.restoreAllMocks();
  });

  //#region Initialization
  describe('initialization', () => {
    it('should set loading to true and call loadRows when not lazy loading', () => {
      setupComponent({ lazyLoadRows: false });

      component.ngOnInit();

      expect(component.loading).toBe(true);
      expect(mockDataGridDataset.loadRows).toHaveBeenCalled();
    });

    it('should not call loadRows when lazy loading', () => {
      setupComponent({ lazyLoadRows: true });

      component.ngOnInit();

      expect(mockDataGridDataset.loadRows).not.toHaveBeenCalled();
    });

    it('should set loading to true when dataset is already loading in lazy mode', () => {
      setupComponent({ lazyLoadRows: true });
      mockDataGridDataset.isLoading = true;

      component.ngOnInit();

      expect(component.loading).toBe(true);
    });

    it('should not set loading when loadedRows already exist', () => {
      setupComponent({ lazyLoadRows: false, loadedRows: [{ key: '1' }] });

      component.ngOnInit();

      expect(component.loading).toBe(false);
    });
  });
  //#endregion

  //#region Load events
  describe('load events', () => {
    beforeEach(() => {
      setupComponent({ lazyLoadRows: true });
      component.ngOnInit();
    });

    it('should set loading to true on loadStarted', () => {
      mockDataGridDataset.loadStarted.emit();

      expect(component.loading).toBe(true);
    });

    it('should set loading to false on loadFinished', () => {
      component.loading = true;

      mockDataGridDataset.loadFinished.emit(true);

      expect(component.loading).toBe(false);
    });

    it('should set hasFailed to true on loadFinished with failure', () => {
      mockDataGridDataset.loadFinished.emit(false);

      expect(component.hasFailed).toBe(true);
    });

    it('should set hasFailed to false on loadFinished with success', () => {
      component.hasFailed = true;

      mockDataGridDataset.loadFinished.emit(true);

      expect(component.hasFailed).toBe(false);
    });

    it('should call checkViewportSize after loadFinished', () => {
      jest.useFakeTimers();

      mockDataGridDataset.loadFinished.emit(true);
      jest.runAllTimers();

      expect(mockViewport.checkViewportSize).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should recalculate headerRightMargin after loadFinished', () => {
      jest.useFakeTimers();
      mockViewport.measureViewportSize.mockReturnValue(500);
      mockBodyElement.nativeElement.clientWidth = 520;

      mockDataGridDataset.loadFinished.emit(true);
      jest.advanceTimersByTime(100);

      expect(component.headerRightMargin).toBe(20);

      jest.useRealTimers();
    });
  });
  //#endregion

  //#region Virtual scroll lazy loading
  describe('virtual scroll lazy loading', () => {
    beforeEach(() => {
      setupComponent({ lazyLoadRows: true, loadedRows: [{ key: '1' }, { key: '2' }], hasBeenLoaded: true });
      mockDataGridDataset.hasBeenLoaded = true;
      component.ngOnInit();
      component.ngAfterViewInit();
    });

    it('should load more rows when rendered range reaches loaded rows count', () => {
      mockViewport.renderedRangeStream.next({ start: 0, end: 2 });

      expect(component.loading).toBe(true);
      expect(mockDataGridDataset.loadRows).toHaveBeenCalled();
    });

    it('should not load more rows when already loading', () => {
      component.loading = true;

      mockViewport.renderedRangeStream.next({ start: 0, end: 2 });

      expect(mockDataGridDataset.loadRows).not.toHaveBeenCalled();
    });

    it('should not load more rows when last row is already loaded', () => {
      mockDataGridDataset.loadedLastRow = true;

      mockViewport.renderedRangeStream.next({ start: 0, end: 2 });

      expect(mockDataGridDataset.loadRows).not.toHaveBeenCalled();
    });

    it('should not load more rows when rendered range is within loaded rows', () => {
      mockViewport.renderedRangeStream.next({ start: 0, end: 1 });

      expect(mockDataGridDataset.loadRows).not.toHaveBeenCalled();
    });
  });
  //#endregion

  //#region ResizeObserver
  describe('ResizeObserver', () => {
    beforeEach(() => {
      setupComponent({ lazyLoadRows: true });
      component.ngOnInit();
      component.ngAfterViewInit();
    });

    it('should create a ResizeObserver on the body element', () => {
      expect(global.ResizeObserver).toHaveBeenCalled();
      expect(mockResizeObserverInstance.observe).toHaveBeenCalledWith(mockBodyElement.nativeElement);
    });

    it('should run ResizeObserver outside Angular zone', () => {
      expect(mockNgZone.runOutsideAngular).toHaveBeenCalled();
    });

    it('should call checkViewportSize on resize after debounce', () => {
      jest.useFakeTimers();

      resizeObserverCallback!();
      jest.advanceTimersByTime(150);

      expect(mockViewport.checkViewportSize).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should recalculate headerRightMargin on resize', () => {
      jest.useFakeTimers();
      mockViewport.measureViewportSize.mockReturnValue(480);
      mockBodyElement.nativeElement.clientWidth = 500;

      resizeObserverCallback!();
      jest.advanceTimersByTime(150);

      expect(component.headerRightMargin).toBe(20);

      jest.useRealTimers();
    });

    it('should not update headerRightMargin when viewport width is 0', () => {
      jest.useFakeTimers();
      mockViewport.measureViewportSize.mockReturnValue(0);
      component.headerRightMargin = 10;

      resizeObserverCallback!();
      jest.advanceTimersByTime(150);

      expect(component.headerRightMargin).toBe(10);

      jest.useRealTimers();
    });

    it('should call detectChanges on resize', () => {
      jest.useFakeTimers();

      resizeObserverCallback!();
      jest.advanceTimersByTime(150);

      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should debounce multiple rapid resize events', () => {
      jest.useFakeTimers();

      resizeObserverCallback!();
      resizeObserverCallback!();
      resizeObserverCallback!();
      jest.advanceTimersByTime(150);

      expect(mockViewport.checkViewportSize).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should not trigger after destroy', () => {
      jest.useFakeTimers();

      component.ngOnDestroy();

      resizeObserverCallback!();
      jest.advanceTimersByTime(150);

      expect(mockViewport.checkViewportSize).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should disconnect ResizeObserver on destroy', () => {
      component.bodyResizeObserver = mockResizeObserverInstance;

      component.ngOnDestroy();

      expect(mockResizeObserverInstance.disconnect).toHaveBeenCalled();
    });
  });
  //#endregion

  //#region Properties
  describe('properties', () => {
    beforeEach(() => {
      setupComponent({ loadedRows: [{ key: '1' }, { key: '2' }, { key: '3' }] });
    });

    it('should calculate bodyMinHeight based on loaded rows when less than rowsToDisplay', () => {
      const expected: number = 3 * 41.6;

      expect(component.bodyMinHeight).toBeCloseTo(expected);
    });

    it('should calculate bodyMinHeight based on rowsToDisplay when more rows are loaded', () => {
      mockDataGridDataset.loadedRows = Array.from({ length: 10 }, (_: unknown, i: number) => ({ key: `${i}` }));
      const expected: number = 6 * 41.6;

      expect(component.bodyMinHeight).toBeCloseTo(expected);
    });

    it('should use 1 row height when no rows are loaded', () => {
      mockDataGridDataset.loadedRows = [];
      const expected: number = 1 * 41.6;

      expect(component.bodyMinHeight).toBeCloseTo(expected);
    });

    it('should return true for hasLoadedRows when rows exist', () => {
      expect(component.hasLoadedRows).toBe(true);
    });

    it('should return false for hasLoadedRows when no rows exist', () => {
      mockDataGridDataset.loadedRows = [];

      expect(component.hasLoadedRows).toBe(false);
    });

    it('should return first visible row correctly', () => {
      mockViewport.getRenderedRange.mockReturnValue({ start: 3, end: 10 });

      expect(component.isFirstVisibleRow(3)).toBe(true);
      expect(component.isFirstVisibleRow(4)).toBe(false);
    });

    it('should return false for isFirstVisibleRow when no viewport range', () => {
      component.viewport = undefined;

      expect(component.isFirstVisibleRow(0)).toBe(false);
    });

    it('should return selection column width from real size when available', () => {
      component.selectionColRealSize = 24;

      expect(component.selectionColWidth).toBe('24px');
    });

    it('should return default selection column width when no real size', () => {
      expect(component.selectionColWidth).toBe('minmax(1.5rem,min-content)');
    });
  });
  //#endregion

  //#region Event handlers
  describe('event handlers', () => {
    beforeEach(() => {
      setupComponent();
    });

    it('should update selectionColRealSize on selection resize', () => {
      component.onSelectionResized(30);

      expect(component.selectionColRealSize).toBe(30);
    });

    it('should keep selectionColRealSize unchanged when value is the same', () => {
      component.selectionColRealSize = 30;

      component.onSelectionResized(30);

      expect(component.selectionColRealSize).toBe(30);
    });
  });
  //#endregion

  //#region Navigation
  describe('navigation', () => {
    beforeEach(() => {
      setupComponent({ lazyLoadRows: true });
      component.ngOnInit();
    });

    it('should save scroll position on NavigationStart', () => {
      mockViewport.measureScrollOffset.mockReturnValue(250);

      const navStart: NavigationStart = new NavigationStart(1, '/other-route');
      mockRouter.events.next(navStart);

      expect(component.lastPosition).toBe(250);
    });

    it('should restore scroll position on NavigationEnd to same route', () => {
      component.lastPosition = 250;
      component.isGridCurrentUrl = false;

      const navEnd: NavigationEnd = new NavigationEnd(1, '/test-route', '/test-route');
      mockRouter.events.next(navEnd);

      expect(mockViewport.scrollTo).toHaveBeenCalledWith({ top: 250 });
      expect(mockViewport.checkViewportSize).toHaveBeenCalled();
    });
  });
  //#endregion
});
