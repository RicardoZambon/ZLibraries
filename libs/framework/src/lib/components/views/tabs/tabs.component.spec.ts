import { Subject } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import { FRAMEWORK_VIEW_TYPE, FrameworkViewType, Tab } from '../../../models';
import { TabsComponent } from './tabs.component';

// Test the ngOnInit routing logic of TabsComponent using a minimal instance
// with mocked dependencies (Object.create pattern).

describe('TabsComponent — ngOnInit routing logic', () => {
  let component: any;
  let mockRouter: {
    routerState: { snapshot: { root: any } };
    navigate: jest.Mock;
  };
  let mockTabService: {
    activeTabs: any[];
    openTab: jest.Mock;
    replaceCurrentTabSubView: jest.Mock;
  };

  function createDetailsRoute(params: { id: string }, children: any[], firstChildPath: string): any {
    const route: any = {
      data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details },
      paramMap: {
        get: (key: string): string | null => (params as any)[key] ?? null,
      },
      routeConfig: { children: children },
      url: [{ path: 'entity' }, { path: params.id }],
      queryParams: {},
      firstChild: {
        data: { title: 'Audit' },
        url: [{ path: firstChildPath }],
        parent: null,
      },
      parent: {
        url: [{ path: 'configs' }],
        parent: null,
      },
    };
    route.firstChild.parent = route;
    return route;
  }

  function defaultChildren(): any[] {
    return [
      { path: '', data: { title: 'Details', icon: 'fa-edit' } },
      { path: 'audit', data: { title: 'Audit', icon: 'fa-history' } },
    ];
  }

  beforeEach(() => {
    mockTabService = {
      activeTabs: [],
      openTab: jest.fn(),
      replaceCurrentTabSubView: jest.fn(),
    };
    mockRouter = {
      routerState: { snapshot: { root: null } },
      navigate: jest.fn(),
    };

    component = Object.create(TabsComponent.prototype);
    (component as any).router = mockRouter;
    (component as any).tabService = mockTabService;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Details view — non-default child route', () => {
    it('should add sub-view to history for existing entity', () => {
      const route: any = createDetailsRoute({ id: '42' }, defaultChildren(), 'audit');
      mockRouter.routerState.snapshot.root = route;

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation(
        (_root: any, key: string, value: any): any => {
          if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.Details) {
            return route;
          }
          return null;
        },
      );
      jest.spyOn(RouteHelper, 'getRouteURL').mockImplementation(
        (r: any): string => {
          if (r === route) {
            return '/configs/entity/42';
          }
          if (r === route.firstChild) {
            return '/configs/entity/42/audit';
          }
          return '/';
        },
      );

      component.ngOnInit();

      // Should NOT redirect
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      // Should open tab with entityBaseUrl
      expect(mockTabService.openTab).toHaveBeenCalledTimes(1);
      const openedTab: any = mockTabService.openTab.mock.calls[0][0];
      expect(openedTab.entityBaseUrl).toBe('/configs/entity/42');

      // Flush microtask to trigger replaceCurrentTabSubView
      return Promise.resolve().then(() => {
        expect(mockTabService.replaceCurrentTabSubView).toHaveBeenCalledTimes(1);
        const args: any[] = mockTabService.replaceCurrentTabSubView.mock.calls[0];
        expect(args[0]).toBe('/configs/entity/42');
        expect(args[1]).toBeInstanceOf(Tab);
        expect(args[1].title).toBe('Audit');
        expect(args[1].url).toBe('/configs/entity/42/audit');
      });
    });

    it('should redirect to base URL when entity is new and inner view is accessed', () => {
      const route: any = createDetailsRoute({ id: 'new' }, defaultChildren(), 'audit');
      mockRouter.routerState.snapshot.root = route;

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation(
        (_root: any, key: string, value: any): any => {
          if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.Details) {
            return route;
          }
          return null;
        },
      );
      jest.spyOn(RouteHelper, 'getRouteURL').mockImplementation(
        (r: any): string => {
          if (r === route) {
            return '/configs/entity/new';
          }
          if (r === route.firstChild) {
            return '/configs/entity/new/audit';
          }
          return '/';
        },
      );

      component.ngOnInit();

      // Should redirect to base URL
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/configs/entity/new'],
        { replaceUrl: true },
      );

      // Should NOT add sub-view to history
      return Promise.resolve().then(() => {
        expect(mockTabService.replaceCurrentTabSubView).not.toHaveBeenCalled();
      });
    });

    it('should not redirect when entity is new and child route is the default view', () => {
      const route: any = createDetailsRoute({ id: 'new' }, defaultChildren(), '');
      mockRouter.routerState.snapshot.root = route;

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation(
        (_root: any, key: string, value: any): any => {
          if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.Details) {
            return route;
          }
          return null;
        },
      );
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/configs/entity/new');

      component.ngOnInit();

      // Should NOT redirect — default child path matches
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      // Should open the tab normally
      expect(mockTabService.openTab).toHaveBeenCalledTimes(1);
    });
  });

  describe('Details view — default child route', () => {
    it('should open tab without sub-view for default child route', () => {
      const route: any = createDetailsRoute({ id: '10' }, defaultChildren(), '');
      mockRouter.routerState.snapshot.root = route;

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation(
        (_root: any, key: string, value: any): any => {
          if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.Details) {
            return route;
          }
          return null;
        },
      );
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/configs/entity/10');

      component.ngOnInit();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockTabService.openTab).toHaveBeenCalledTimes(1);

      return Promise.resolve().then(() => {
        expect(mockTabService.replaceCurrentTabSubView).not.toHaveBeenCalled();
      });
    });
  });

  describe('List view — fallback', () => {
    it('should open tab for list view when no details view is found', () => {
      const listRoute: any = {
        data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
        queryParams: {},
        url: [{ path: 'configs' }, { path: 'entity' }],
        parent: null,
      };
      mockRouter.routerState.snapshot.root = listRoute;

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation(
        (_root: any, key: string, value: any): any => {
          if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.List) {
            return listRoute;
          }
          return null;
        },
      );
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/configs/entity');

      component.ngOnInit();

      expect(mockTabService.openTab).toHaveBeenCalledTimes(1);
      const openedTab: any = mockTabService.openTab.mock.calls[0][0];
      expect(openedTab.url).toBe('/configs/entity');
    });

    it('should navigate to root when no view is found', () => {
      mockRouter.routerState.snapshot.root = { data: {}, firstChild: null };
      jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue(null);

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
