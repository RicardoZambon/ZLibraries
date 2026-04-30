import { Subject } from 'rxjs';
import { Tab } from '../../../models';
import { ButtonOpenRecordComponent } from './button-open-record.component';

// Test the navigation logic of ButtonOpenRecordComponent by calling onButtonClicked
// through a minimal instance with mocked dependencies.

describe('ButtonOpenRecordComponent — navigation logic', () => {
  let component: any;
  let mockTabService: { navigateCurrentTab: jest.Mock };
  let mockRouter: { url: string };
  let mockDataGridDataset: {
    selectedRowsChanged: Subject<any>;
    selectedRowKeys: string[];
    getRowID: jest.Mock;
  };

  function lastNavigatedTab(): Tab {
    return mockTabService.navigateCurrentTab.mock.calls[
      mockTabService.navigateCurrentTab.mock.calls.length - 1
    ][0];
  }

  beforeEach(() => {
    mockTabService = {
      navigateCurrentTab: jest.fn(),
    };
    mockRouter = {
      url: '/contratacoes',
    };
    mockDataGridDataset = {
      selectedRowsChanged: new Subject(),
      selectedRowKeys: [],
      getRowID: jest.fn(),
    };

    component = Object.create(ButtonOpenRecordComponent.prototype);
    component.elementPath = undefined;
    component.rootPath = undefined;
    component.disabled = false;
    component.visible = true;
    component.isAccessLoaded = true;
    component.destroy$ = new Subject();

    (component as any).tabService = mockTabService;
    (component as any).router = mockRouter;
    (component as any).dataGridDataset = mockDataGridDataset;
    (component as any).selectionCount = 0;
  });

  describe('onButtonClicked', () => {
    it('should call navigateCurrentTab with entity URL and entityBaseUrl', () => {
      (component as any).selectionCount = 1;
      mockDataGridDataset.selectedRowKeys = ['key-325'];
      mockDataGridDataset.getRowID.mockReturnValue(325);

      component.onButtonClicked();

      expect(mockTabService.navigateCurrentTab).toHaveBeenCalledTimes(1);
      const tab: Tab = lastNavigatedTab();
      expect(tab.url).toBe('/contratacoes/325');
      expect(tab.entityBaseUrl).toBe('/contratacoes/325');
    });

    it('should use rootPath when provided instead of router.url', () => {
      (component as any).selectionCount = 1;
      mockDataGridDataset.selectedRowKeys = ['key-9'];
      mockDataGridDataset.getRowID.mockReturnValue(9);
      component.rootPath = '/custom-path';

      component.onButtonClicked();

      const tab: Tab = lastNavigatedTab();
      expect(tab.url).toBe('/custom-path/9');
      expect(tab.entityBaseUrl).toBe('/custom-path/9');
    });

    it('should include elementPath in the URL when provided', () => {
      (component as any).selectionCount = 1;
      mockDataGridDataset.selectedRowKeys = ['key-42'];
      mockDataGridDataset.getRowID.mockReturnValue(42);
      component.elementPath = 'details';

      component.onButtonClicked();

      const tab: Tab = lastNavigatedTab();
      expect(tab.url).toBe('/contratacoes/details/42');
      expect(tab.entityBaseUrl).toBe('/contratacoes/details/42');
    });

    it('should include both rootPath and elementPath', () => {
      (component as any).selectionCount = 1;
      mockDataGridDataset.selectedRowKeys = ['key-7'];
      mockDataGridDataset.getRowID.mockReturnValue(7);
      component.rootPath = '/items';
      component.elementPath = 'sub';

      component.onButtonClicked();

      const tab: Tab = lastNavigatedTab();
      expect(tab.url).toBe('/items/sub/7');
    });

    it('should NOT navigate when disabled', () => {
      (component as any).selectionCount = 1;
      component.disabled = true;

      component.onButtonClicked();

      expect(mockTabService.navigateCurrentTab).not.toHaveBeenCalled();
    });

    it('should NOT navigate when access is not loaded', () => {
      (component as any).selectionCount = 1;
      component.isAccessLoaded = false;

      component.onButtonClicked();

      expect(mockTabService.navigateCurrentTab).not.toHaveBeenCalled();
    });

    it('should NOT navigate when no record is selected (selectionCount = 0)', () => {
      (component as any).selectionCount = 0;

      component.onButtonClicked();

      expect(mockTabService.navigateCurrentTab).not.toHaveBeenCalled();
    });

    it('should NOT navigate when multiple records are selected', () => {
      (component as any).selectionCount = 2;

      component.onButtonClicked();

      expect(mockTabService.navigateCurrentTab).not.toHaveBeenCalled();
    });

    it('should NOT navigate when not visible', () => {
      (component as any).selectionCount = 1;
      component.visible = false;

      component.onButtonClicked();

      expect(mockTabService.navigateCurrentTab).not.toHaveBeenCalled();
    });
  });

  describe('isSelectedOneRecord', () => {
    it('should return true when exactly one record is selected', () => {
      (component as any).selectionCount = 1;
      expect(component.isSelectedOneRecord).toBe(true);
    });

    it('should return false when no records are selected', () => {
      (component as any).selectionCount = 0;
      expect(component.isSelectedOneRecord).toBe(false);
    });

    it('should return false when multiple records are selected', () => {
      (component as any).selectionCount = 3;
      expect(component.isSelectedOneRecord).toBe(false);
    });
  });

  describe('ngOnInit — selection subscription', () => {
    it('should update selectionCount when selectedRowsChanged emits', () => {
      // Call ngOnInit to wire up subscription
      component.ngOnInit();

      mockDataGridDataset.selectedRowKeys = ['key-1', 'key-2'];
      mockDataGridDataset.selectedRowsChanged.next({});

      expect((component as any).selectionCount).toBe(2);
    });

    it('should track selection changes over time', () => {
      component.ngOnInit();

      // Select one
      mockDataGridDataset.selectedRowKeys = ['key-1'];
      mockDataGridDataset.selectedRowsChanged.next({});
      expect((component as any).selectionCount).toBe(1);

      // Select two more
      mockDataGridDataset.selectedRowKeys = ['key-1', 'key-2', 'key-3'];
      mockDataGridDataset.selectedRowsChanged.next({});
      expect((component as any).selectionCount).toBe(3);

      // Deselect all
      mockDataGridDataset.selectedRowKeys = [];
      mockDataGridDataset.selectedRowsChanged.next({});
      expect((component as any).selectionCount).toBe(0);
    });
  });
});
