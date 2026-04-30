import { Tab, FRAMEWORK_VIEW_TYPE, FrameworkViewType } from '../../../models';
import { TabService } from '../../../services';
import { RouteHelper } from '../../../helpers';
import { ButtonNewComponent } from './button-new.component';

// Test the navigation logic of ButtonNewComponent by calling onButtonClicked
// through a minimal instance with mocked dependencies.

describe('ButtonNewComponent — navigation logic', () => {
  let component: any;
  let mockTabService: { navigateCurrentTab: jest.Mock };
  let mockRouter: { routerState: any; url: string };
  let mockDataProviderService: { hasEntityID: boolean } | null;

  function lastNavigatedTab(): Tab {
    return mockTabService.navigateCurrentTab.mock.calls[
      mockTabService.navigateCurrentTab.mock.calls.length - 1
    ][0];
  }

  function setupRouterWithDetailsRoute(parentUrl: string): void {
    // Simulate a Details route found by RouteHelper.getRouteByData
    const parentSnapshot: any = {
      url: parentUrl.split('/').filter(Boolean).map((p: string) => ({ path: p })),
      data: {},
      firstChild: null,
      parent: null,
    };
    const detailsSnapshot: any = {
      url: [{ path: ':id' }],
      data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details },
      firstChild: null,
      parent: parentSnapshot,
    };
    mockRouter.routerState = {
      root: {
        snapshot: {
          url: [],
          data: {},
          firstChild: detailsSnapshot,
          parent: null,
        },
      },
    };

    // Mock RouteHelper so getRouteByData returns the details route
    jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue(detailsSnapshot);
    jest.spyOn(RouteHelper, 'getRouteURL').mockImplementation((route: any) => {
      if (route === detailsSnapshot.parent) {
        return parentUrl;
      }
      return parentUrl;
    });
  }

  function setupRouterWithoutDetailsRoute(currentUrl: string): void {
    const rootSnapshot: any = {
      url: currentUrl.split('/').filter(Boolean).map((p: string) => ({ path: p })),
      data: {},
      firstChild: null,
      parent: null,
    };
    mockRouter.routerState = {
      root: {
        snapshot: rootSnapshot,
      },
    };

    jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue(null);
    jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue(currentUrl);
  }

  beforeEach(() => {
    mockTabService = {
      navigateCurrentTab: jest.fn(),
    };
    mockRouter = {
      routerState: { root: { snapshot: { url: [], data: {}, firstChild: null, parent: null } } },
      url: '/contratacoes',
    };
    mockDataProviderService = null;

    // Create a minimal component-like object to test onButtonClicked
    component = Object.create(ButtonNewComponent.prototype);
    component.endpoint = 'new';
    component.parameters = undefined;
    component.path = undefined;
    component.options = [];
    component.disabled = false;
    component.visible = true;
    component.isAccessLoaded = true;

    // Inject mocks via private field names
    (component as any).tabService = mockTabService;
    (component as any).router = mockRouter;
    (component as any).dataProviderService = mockDataProviderService;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call navigateCurrentTab with /new URL and entityBaseUrl from list view', () => {
    setupRouterWithoutDetailsRoute('/contratacoes');

    component.onButtonClicked();

    expect(mockTabService.navigateCurrentTab).toHaveBeenCalledTimes(1);
    const tab: Tab = lastNavigatedTab();
    expect(tab.url).toBe('/contratacoes/new');
    expect(tab.entityBaseUrl).toBe('/contratacoes/new');
  });

  it('should call navigateCurrentTab with /new URL from detail view (uses parent route)', () => {
    setupRouterWithDetailsRoute('/contratacoes');

    component.onButtonClicked();

    expect(mockTabService.navigateCurrentTab).toHaveBeenCalledTimes(1);
    const tab: Tab = lastNavigatedTab();
    expect(tab.url).toBe('/contratacoes/new');
    expect(tab.entityBaseUrl).toBe('/contratacoes/new');
  });

  it('should use custom path when provided', () => {
    setupRouterWithoutDetailsRoute('/contratacoes');
    component.path = 'items';

    component.onButtonClicked();

    const tab: Tab = lastNavigatedTab();
    expect(tab.url).toBe('/contratacoes/items/new');
    expect(tab.entityBaseUrl).toBe('/contratacoes/items/new');
  });

  it('should use custom endpoint when provided', () => {
    setupRouterWithoutDetailsRoute('/contratacoes');
    component.endpoint = 'create';

    component.onButtonClicked();

    const tab: Tab = lastNavigatedTab();
    expect(tab.url).toBe('/contratacoes/create');
    expect(tab.entityBaseUrl).toBe('/contratacoes/create');
  });

  it('should pass query parameters to the tab', () => {
    setupRouterWithoutDetailsRoute('/contratacoes');
    component.parameters = { type: 'admin' };

    component.onButtonClicked();

    const tab: Tab = lastNavigatedTab();
    expect(tab.queryParams).toEqual({ type: 'admin' });
  });

  it('should use option path and parameters when optionId is provided', () => {
    setupRouterWithoutDetailsRoute('/contratacoes');
    component.options = [
      { id: 'custom', path: 'special', parameters: { mode: 'fast' } },
    ];

    component.onButtonClicked('custom');

    const tab: Tab = lastNavigatedTab();
    expect(tab.url).toBe('/contratacoes/special/new');
    expect(tab.queryParams).toEqual({ mode: 'fast' });
  });

  it('should merge option parameters with component parameters', () => {
    setupRouterWithoutDetailsRoute('/contratacoes');
    component.parameters = { type: 'admin' };
    component.options = [
      { id: 'custom', path: '', parameters: { mode: 'fast' } },
    ];

    component.onButtonClicked('custom');

    const tab: Tab = lastNavigatedTab();
    expect(tab.queryParams).toEqual({ type: 'admin', mode: 'fast' });
  });

  it('should create Tab with entityBaseUrl matching the URL (for entity-level matching)', () => {
    setupRouterWithoutDetailsRoute('/users');

    component.onButtonClicked();

    const tab: Tab = lastNavigatedTab();
    expect(tab.entityBaseUrl).toBe(tab.url);
    expect(tab.entityBaseUrl).toBe('/users/new');
  });

  describe('hasDataProvider / hasDataProviderEntityID properties', () => {
    it('should return false for hasDataProvider when no DataProviderService injected', () => {
      (component as any).dataProviderService = null;
      expect(component.hasDataProvider).toBe(false);
    });

    it('should return true for hasDataProvider when DataProviderService is present', () => {
      (component as any).dataProviderService = { hasEntityID: true };
      expect(component.hasDataProvider).toBe(true);
    });

    it('should return hasEntityID from DataProviderService', () => {
      (component as any).dataProviderService = { hasEntityID: false };
      expect(component.hasDataProviderEntityID).toBe(false);

      (component as any).dataProviderService = { hasEntityID: true };
      expect(component.hasDataProviderEntityID).toBe(true);
    });
  });
});
