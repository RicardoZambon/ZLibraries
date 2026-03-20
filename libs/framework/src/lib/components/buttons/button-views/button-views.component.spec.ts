import { of, Subject } from 'rxjs';
import { Tab } from '../../../models';
import { RouteHelper } from '../../../helpers';
import { ButtonViewsComponent } from './button-views.component';

// Test the view switching logic and disabled state of ButtonViewsComponent
// using a minimal instance with mocked dependencies.

describe('ButtonViewsComponent — view switching logic', () => {
  let component: any;
  let mockTabService: { replaceCurrentTabSubView: jest.Mock };
  let mockTabViewService: { setActiveView: jest.Mock };
  let mockAuthService: { checkActionsAreAllowed: jest.Mock };
  let mockRouter: { events: Subject<any> };
  let mockDataProviderService: { hasEntityID: boolean } | null;

  function createDetailsViewRoute(baseUrl: string, children: any[]): any {
    return {
      routeConfig: {
        children: children,
      },
      children: [
        { url: [{ path: children[0]?.path ?? '' }] },
      ],
      url: baseUrl.split('/').filter(Boolean).map((p: string) => ({ path: p })),
      data: {},
      firstChild: null,
      parent: null,
    };
  }

  function defaultChildren(): any[] {
    return [
      { path: '', data: { title: 'Details', icon: 'fa-edit' } },
      { path: 'audit', data: { title: 'Audit', icon: 'fa-history' } },
      { path: 'history', data: { title: 'History', icon: 'fa-clock' } },
    ];
  }

  function lastReplaceCall(): any[] {
    return mockTabService.replaceCurrentTabSubView.mock.calls[
      mockTabService.replaceCurrentTabSubView.mock.calls.length - 1
    ];
  }

  beforeEach(() => {
    mockTabService = {
      replaceCurrentTabSubView: jest.fn(),
    };
    mockTabViewService = {
      setActiveView: jest.fn(),
    };
    mockAuthService = {
      checkActionsAreAllowed: jest.fn().mockReturnValue(of([true])),
    };
    mockRouter = {
      events: new Subject(),
    };
    mockDataProviderService = { hasEntityID: true };

    // Create a minimal component-like object
    component = Object.create(ButtonViewsComponent.prototype);
    (component as any).authService = mockAuthService;
    component.options = [];
    component.disabled = false;
    component.visible = true;
    component.isAccessLoaded = true;
    component.destroy$ = new Subject();

    // Inject mocks via private field names
    (component as any).tabService = mockTabService;
    (component as any).tabViewService = mockTabViewService;
    (component as any).router = mockRouter;
    (component as any).dataProviderService = mockDataProviderService;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ngOnInit — options from route children', () => {
    it('should build options from detailsViewRoute children', () => {
      const route: any = createDetailsViewRoute('/contratacoes/1', defaultChildren());
      component.detailsViewRoute = route;
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();

      expect(component.options).toHaveLength(3);
      expect(component.options[0].id).toBe('');
      expect(component.options[0].label).toBe('Details');
      expect(component.options[1].id).toBe('audit');
      expect(component.options[1].label).toBe('Audit');
      expect(component.options[2].id).toBe('history');
      expect(component.options[2].label).toBe('History');
    });

    it('should set icon on options when route data has icon', () => {
      const route: any = createDetailsViewRoute('/contratacoes/1', defaultChildren());
      component.detailsViewRoute = route;
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();

      expect(component.options[0].icon).toBe('fa-edit');
      expect(component.options[1].icon).toBe('fa-history');
    });

    it('should set allowedActions on options when route data has allowedActions', () => {
      const children: any[] = [
        { path: '', data: { title: 'Details' } },
        { path: 'audit', data: { title: 'Audit', allowedActions: ['ReadAudit'] } },
      ];
      const route: any = createDetailsViewRoute('/contratacoes/1', children);
      component.detailsViewRoute = route;
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();

      expect(component.options[0].allowedActions).toBeUndefined();
      expect(component.options[1].allowedActions).toEqual(['ReadAudit']);
    });

    it('should filter out routes with ignoreRoute flag', () => {
      const children: any[] = [
        { path: '', data: { title: 'Details' } },
        { path: 'hidden', data: { title: 'Hidden', ignoreRoute: true } },
        { path: 'audit', data: { title: 'Audit' } },
      ];
      const route: any = createDetailsViewRoute('/contratacoes/1', children);
      component.detailsViewRoute = route;
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();

      expect(component.options).toHaveLength(2);
      expect(component.options[0].label).toBe('Details');
      expect(component.options[1].label).toBe('Audit');
    });

    it('should not build options when detailsViewRoute is null', () => {
      component.detailsViewRoute = null;

      component.ngOnInit();

      expect(component.options).toHaveLength(0);
    });
  });

  describe('onViewClicked — navigation', () => {
    beforeEach(() => {
      const route: any = createDetailsViewRoute('/contratacoes/1', defaultChildren());
      component.detailsViewRoute = route;
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();
    });

    it('should call replaceCurrentTabSubView with baseUrl only for default view', () => {
      component.onViewClicked('');

      expect(mockTabService.replaceCurrentTabSubView).toHaveBeenCalledTimes(1);
      expect(lastReplaceCall()).toEqual(['/contratacoes/1']);
    });

    it('should call replaceCurrentTabSubView with Tab for non-default view', () => {
      component.onViewClicked('audit');

      expect(mockTabService.replaceCurrentTabSubView).toHaveBeenCalledTimes(1);
      const args: any[] = lastReplaceCall();
      expect(args[0]).toBe('/contratacoes/1');
      expect(args[1]).toBeInstanceOf(Tab);
      expect(args[1].url).toBe('/contratacoes/1/audit');
      expect(args[1].title).toBe('Audit');
    });

    it('should mark selected view as disabled and unmark previous', () => {
      component.onViewClicked('audit');
      expect(component.options[1].isDisabled).toBe(true);
      expect(component.options[0].isDisabled).toBe(false);

      component.onViewClicked('history');
      expect(component.options[1].isDisabled).toBe(false);
      expect(component.options[2].isDisabled).toBe(true);
    });

    it('should call setActiveView on TabViewService', () => {
      component.onViewClicked('audit');

      expect(mockTabViewService.setActiveView).toHaveBeenCalledWith('audit');
    });
  });

  describe('hasOptions', () => {
    it('should return true when there are visible options without allowedActions', () => {
      component.options = [
        { id: '', isVisible: true, label: 'Details' },
      ];

      expect(component.hasOptions).toBe(true);
    });

    it('should return false when all options are not visible', () => {
      component.options = [
        { id: '', isVisible: false, label: 'Details' },
      ];

      expect(component.hasOptions).toBe(false);
    });

    it('should return true when option has allowedActions with access allowed', () => {
      component.options = [
        { id: 'audit', isVisible: true, label: 'Audit', allowedActions: ['ReadAudit'], isAccessAllowed: true },
      ];

      expect(component.hasOptions).toBe(true);
    });

    it('should return false when option has allowedActions with access denied', () => {
      mockAuthService.checkActionsAreAllowed.mockReturnValue(of([false]));
      component.options = [
        { id: 'audit', isVisible: true, label: 'Audit', allowedActions: ['ReadAudit'], isAccessAllowed: false },
      ];

      expect(component.hasOptions).toBe(false);
    });
  });

  describe('isNewEntity — disabled state for new entities', () => {
    it('should return true when DataProviderService has no entity ID (new entity)', () => {
      (component as any).dataProviderService = { hasEntityID: false };

      expect(component.isNewEntity).toBe(true);
    });

    it('should return false when DataProviderService has an entity ID (existing entity)', () => {
      (component as any).dataProviderService = { hasEntityID: true };

      expect(component.isNewEntity).toBe(false);
    });

    it('should return true when DataProviderService is null', () => {
      (component as any).dataProviderService = null;

      expect(component.isNewEntity).toBe(true);
    });
  });
});
