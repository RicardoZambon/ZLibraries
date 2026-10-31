import { inject, InjectionToken, Injector, signal } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { FRAMEWORK_VIEW_TYPE, FrameworkViewType, IDetailsViewContext, Tab } from '../../../models';
import { RouteHelper } from '../../../helpers';
import { ButtonViewsComponent } from './button-views.component';

// Test the view switching logic and disabled state of ButtonViewsComponent
// using a minimal instance with mocked dependencies.

describe('ButtonViewsComponent — view switching logic', () => {
  let component: any;
  let mockTabService: { replaceCurrentTabSubView: jest.Mock };
  let mockTabViewService: { setActiveView: jest.Mock };
  let mockAuthService: { checkActionsAreAllowed: jest.Mock };
  let mockRouter: { events: Subject<any>; routerState: { root: { snapshot: any } } };
  let mockDataProviderService: { entityID?: number; getModel$?: () => any; hasEntityID: boolean } | null;

  function createDetailsViewRoute(baseUrl: string, children: any[]): any {
    return {
      routeConfig: {
        children: children,
      },
      children: [{ url: [{ path: children[0]?.path ?? '' }] }],
      url: baseUrl
        .split('/')
        .filter(Boolean)
        .map((p: string) => ({ path: p })),
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
      routerState: { root: { snapshot: {} } },
    };
    mockDataProviderService = { hasEntityID: true };

    // Create a minimal component-like object
    component = Object.create(ButtonViewsComponent.prototype);
    (component as any).authService = mockAuthService;
    // Object.create skips field initialisers, so every signal the component would have built
    // has to be supplied here.
    component.options = signal([]);
    component.disabled = signal(false);
    (component as any).selectedViewId = signal(undefined);
    component.isVisible = signal(true);
    component.isAccessLoaded = signal(true);
    component.destroy$ = new Subject();
    (component as any).hasViewStates = false;
    (component as any).injector = Injector.create({ providers: [] });
    (component as any).viewStates = new Map();

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
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();

      expect(component.options()).toHaveLength(3);
      expect(component.options()[0].id).toBe('');
      expect(component.options()[0].label).toBe('Details');
      expect(component.options()[1].id).toBe('audit');
      expect(component.options()[1].label).toBe('Audit');
      expect(component.options()[2].id).toBe('history');
      expect(component.options()[2].label).toBe('History');
    });

    it('should set icon on options when route data has icon', () => {
      const route: any = createDetailsViewRoute('/contratacoes/1', defaultChildren());
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();

      expect(component.options()[0].icon).toBe('fa-edit');
      expect(component.options()[1].icon).toBe('fa-history');
    });

    it('should set allowedActions on options when route data has allowedActions', () => {
      const children: any[] = [
        { path: '', data: { title: 'Details' } },
        { path: 'audit', data: { title: 'Audit', allowedActions: ['ReadAudit'] } },
      ];
      const route: any = createDetailsViewRoute('/contratacoes/1', children);
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();

      expect(component.options()[0].allowedActions).toBeUndefined();
      expect(component.options()[1].allowedActions).toEqual(['ReadAudit']);
    });

    it('should filter out routes with ignoreRoute flag', () => {
      const children: any[] = [
        { path: '', data: { title: 'Details' } },
        { path: 'hidden', data: { title: 'Hidden', ignoreRoute: true } },
        { path: 'audit', data: { title: 'Audit' } },
      ];
      const route: any = createDetailsViewRoute('/contratacoes/1', children);
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/contratacoes/1');

      component.ngOnInit();

      expect(component.options()).toHaveLength(2);
      expect(component.options()[0].label).toBe('Details');
      expect(component.options()[1].label).toBe('Audit');
    });

    it('should not build options when detailsViewRoute is null', () => {
      component.detailsViewRoute = signal(null);

      component.ngOnInit();

      expect(component.options()).toHaveLength(0);
    });
  });

  describe('onViewClicked — navigation', () => {
    beforeEach(() => {
      const route: any = createDetailsViewRoute('/contratacoes/1', defaultChildren());
      component.detailsViewRoute = signal(route);
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
      expect(component.options()[1].isDisabled).toBe(true);
      expect(component.options()[0].isDisabled).toBe(false);

      component.onViewClicked('history');
      expect(component.options()[1].isDisabled).toBe(false);
      expect(component.options()[2].isDisabled).toBe(true);
    });

    it('should call setActiveView on TabViewService', () => {
      component.onViewClicked('audit');

      expect(mockTabViewService.setActiveView).toHaveBeenCalledWith('audit');
    });
  });

  describe('hasOptions', () => {
    it('should return true when there are visible options without allowedActions', () => {
      component.options = signal([{ id: '', isVisible: true, label: 'Details' }]);

      expect(component.hasOptions).toBe(true);
    });

    it('should return false when all options are not visible', () => {
      component.options = signal([{ id: '', isVisible: false, label: 'Details' }]);

      expect(component.hasOptions).toBe(false);
    });

    it('should return true when option has allowedActions with access allowed', () => {
      component.options = signal([
        { id: 'audit', isVisible: true, label: 'Audit', allowedActions: ['ReadAudit'], isAccessAllowed: true },
      ]);

      expect(component.hasOptions).toBe(true);
    });

    it('should return false when option has allowedActions with access denied', () => {
      mockAuthService.checkActionsAreAllowed.mockReturnValue(of([false]));
      component.options = signal([
        { id: 'audit', isVisible: true, label: 'Audit', allowedActions: ['ReadAudit'], isAccessAllowed: false },
      ]);

      expect(component.hasOptions).toBe(false);
    });
  });

  describe('baseUrlPath update after save redirect (/new → /:id)', () => {
    it('should update baseUrlPath when NavigationEnd fires after save redirect', () => {
      // 1. Initialize with /new URL (simulating creating a new entity)
      const route: any = createDetailsViewRoute('/configs/campos-filtros/new', defaultChildren());
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/configs/campos-filtros/new');

      component.ngOnInit();

      // Verify initial baseUrlPath is /new
      expect((component as any).baseUrlPath).toBe('/configs/campos-filtros/new');

      // 2. Simulate save redirect: router navigates to /94, RouteHelper now returns /94
      const savedRouteSnapshot: any = {
        // The router matches /new and /:id with the same Route definition, so the snapshot it
        // hands over after the redirect carries the very same routeConfig object.
        routeConfig: route.routeConfig,
        data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details },
        url: [{ path: 'configs' }, { path: 'campos-filtros' }, { path: '94' }],
        parent: { url: [{ path: 'configs' }, { path: 'campos-filtros' }], parent: { url: [], parent: null } },
        firstChild: null,
      };
      mockRouter.routerState.root.snapshot = savedRouteSnapshot;

      jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue(savedRouteSnapshot);
      (RouteHelper.getRouteURL as jest.Mock).mockReturnValue('/configs/campos-filtros/94');

      // Fire NavigationEnd as would happen after router.navigateByUrl
      mockRouter.events.next(new NavigationEnd(1, '/configs/campos-filtros/94', '/configs/campos-filtros/94'));

      // 3. Verify baseUrlPath was updated
      expect((component as any).baseUrlPath).toBe('/configs/campos-filtros/94');
    });

    // Regression: every details tab keeps its router subscription alive, including the ones the
    // reuse strategy has detached, and the lookup reads the router -- which names whichever tab
    // the navigation went to. A detached tab used to adopt the incoming tab's base path and
    // switch itself to that tab's view, tearing its own ribbon down and building a fresh one:
    // an active filter came back without its Clear filters button while the grid stayed
    // filtered. A list view never triggered it, because it is not a details route at all.
    it('should ignore a navigation that belongs to another details tab', () => {
      const route: any = createDetailsViewRoute('/integrations/adp-import/1', defaultChildren());
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/integrations/adp-import/1');

      component.ngOnInit();
      component.onViewClicked('audit');

      expect((component as any).baseUrlPath).toBe('/integrations/adp-import/1');
      expect((component as any).selectedViewId()).toBe('audit');

      // Another details tab is opened. Its snapshot is a different Route definition.
      const otherTabSnapshot: any = {
        routeConfig: { children: defaultChildren() },
        data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details },
        url: [{ path: 'configs' }, { path: 'applications' }, { path: '1' }],
        parent: null,
        firstChild: null,
      };
      mockRouter.routerState.root.snapshot = otherTabSnapshot;
      jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue(otherTabSnapshot);
      (RouteHelper.getRouteURL as jest.Mock).mockReturnValue('/configs/applications/1');

      mockRouter.events.next(new NavigationEnd(1, '/configs/applications/1', '/configs/applications/1'));

      // This tab keeps its own base and its own view.
      expect((component as any).baseUrlPath).toBe('/integrations/adp-import/1');
      expect((component as any).selectedViewId()).toBe('audit');
    });

    it('should use updated baseUrlPath when switching views after save redirect', () => {
      // 1. Initialize with /new URL
      const route: any = createDetailsViewRoute('/configs/campos-filtros/new', defaultChildren());
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/configs/campos-filtros/new');

      component.ngOnInit();

      // 2. Simulate save redirect
      const savedRouteSnapshot: any = {
        // The router matches /new and /:id with the same Route definition, so the snapshot it
        // hands over after the redirect carries the very same routeConfig object.
        routeConfig: route.routeConfig,
        data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details },
        url: [{ path: 'configs' }, { path: 'campos-filtros' }, { path: '94' }],
        parent: { url: [{ path: 'configs' }, { path: 'campos-filtros' }], parent: { url: [], parent: null } },
        firstChild: null,
      };
      mockRouter.routerState.root.snapshot = savedRouteSnapshot;

      jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue(savedRouteSnapshot);
      (RouteHelper.getRouteURL as jest.Mock).mockReturnValue('/configs/campos-filtros/94');

      mockRouter.events.next(new NavigationEnd(1, '/configs/campos-filtros/94', '/configs/campos-filtros/94'));

      // 3. Click on Audit view — should use /94, not /new
      component.onViewClicked('audit');

      const args: any[] = lastReplaceCall();
      expect(args[0]).toBe('/configs/campos-filtros/94');
      expect(args[1]).toBeInstanceOf(Tab);
      expect(args[1].url).toBe('/configs/campos-filtros/94/audit');
    });

    it('should use updated baseUrlPath when switching to default view after save redirect', () => {
      // 1. Initialize with /new URL
      const route: any = createDetailsViewRoute('/configs/campos-filtros/new', defaultChildren());
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/configs/campos-filtros/new');

      component.ngOnInit();

      // 2. Simulate save redirect
      const savedRouteSnapshot: any = {
        // The router matches /new and /:id with the same Route definition, so the snapshot it
        // hands over after the redirect carries the very same routeConfig object.
        routeConfig: route.routeConfig,
        data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.Details },
        url: [{ path: 'configs' }, { path: 'campos-filtros' }, { path: '94' }],
        parent: { url: [{ path: 'configs' }, { path: 'campos-filtros' }], parent: { url: [], parent: null } },
        firstChild: null,
      };
      mockRouter.routerState.root.snapshot = savedRouteSnapshot;

      jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue(savedRouteSnapshot);
      (RouteHelper.getRouteURL as jest.Mock).mockReturnValue('/configs/campos-filtros/94');

      mockRouter.events.next(new NavigationEnd(1, '/configs/campos-filtros/94', '/configs/campos-filtros/94'));

      // 3. Click on default view — should use /94
      component.onViewClicked('');

      expect(lastReplaceCall()).toEqual(['/configs/campos-filtros/94']);
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

  describe('visibleWhen and enabledWhen — views that depend on the record', () => {
    let entity$: Subject<any>;
    let route: any;

    function conditionalChildren(): any[] {
      return [
        { path: '', data: { title: 'Details', visibleWhen: () => false, enabledWhen: () => false } },
        {
          path: 'payments',
          data: { title: 'Payments', visibleWhen: ({ entity }: any) => entity?.isCustomer === true },
        },
        { path: 'notes', data: { title: 'Notes', enabledWhen: ({ entity }: any) => entity?.isOpen === true } },
        { path: 'audit', data: { title: 'Audit' } },
      ];
    }

    function option(id: string): any {
      return component.options().find((o: any) => o.id === id);
    }

    // The router shows this tab: same route definition, same base URL.
    function showThisTab(): void {
      jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue({ routeConfig: route.routeConfig } as any);
    }

    function init(children: any[] = conditionalChildren()): void {
      route = createDetailsViewRoute('/customers/1', children);
      component.detailsViewRoute = signal(route);
      jest.spyOn(RouteHelper, 'getRouteURL').mockReturnValue('/customers/1');

      component.ngOnInit();
    }

    beforeEach(() => {
      entity$ = new Subject();
      mockDataProviderService = { entityID: 1, getModel$: () => entity$, hasEntityID: true };
      (component as any).dataProviderService = mockDataProviderService;
    });

    it('should keep a conditional view hidden or unavailable until its condition answers', () => {
      init();

      expect(option('payments').isVisible).toBe(false);
      expect(option('notes').isVisible).toBe(true);
      expect(option('notes').isDisabled).toBe(true);
      expect(option('audit').isVisible).toBe(true);
      expect(option('audit').isDisabled).toBe(false);
    });

    it('should show and hide a view as the record changes', () => {
      init();

      entity$.next({ isCustomer: true });
      expect(option('payments').isVisible).toBe(true);

      entity$.next({ isCustomer: false });
      expect(option('payments').isVisible).toBe(false);
    });

    it('should list a view that enabledWhen turns down, but not let it be chosen', () => {
      init();

      entity$.next({ isOpen: false });
      expect(option('notes').isVisible).toBe(true);
      expect(option('notes').isDisabled).toBe(true);

      entity$.next({ isOpen: true });
      expect(option('notes').isDisabled).toBe(false);
    });

    it('should still mark the current view as disabled when its condition allows it', () => {
      init();
      entity$.next({ isOpen: true });

      component.onViewClicked('notes');

      expect(option('notes').isDisabled).toBe(true);
    });

    it('should never apply conditions to the first view', () => {
      init();
      entity$.next({});

      expect(option('').isVisible).toBe(true);
      expect(option('').isDisabled).toBe(true);
      expect((component as any).viewStates.has('')).toBe(false);
    });

    it('should hand a condition the record, its ID and the details route', () => {
      const visibleWhen: jest.Mock = jest.fn().mockReturnValue(true);
      init([
        { path: '', data: { title: 'Details' } },
        { path: 'payments', data: { title: 'Payments', visibleWhen } },
      ]);

      const entity: any = { id: 1 };
      entity$.next(entity);

      const context: IDetailsViewContext = visibleWhen.mock.calls[0][0];
      expect(context.entity).toBe(entity);
      expect(context.entityID).toBe(1);
      expect(context.route).toBe(route);
    });

    it('should let a condition inject a service', () => {
      const FEATURE_ON: InjectionToken<boolean> = new InjectionToken<boolean>('FEATURE_ON');
      (component as any).injector = Injector.create({ providers: [{ provide: FEATURE_ON, useValue: true }] });
      init([
        { path: '', data: { title: 'Details' } },
        { path: 'payments', data: { title: 'Payments', visibleWhen: () => inject(FEATURE_ON) } },
      ]);

      entity$.next({});

      expect(option('payments').isVisible).toBe(true);
    });

    it('should follow the latest answer of a condition that returns an Observable', () => {
      const answer$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
      init([
        { path: '', data: { title: 'Details' } },
        { path: 'payments', data: { title: 'Payments', visibleWhen: () => answer$ } },
      ]);

      entity$.next({});
      expect(option('payments').isVisible).toBe(false);

      answer$.next(true);
      expect(option('payments').isVisible).toBe(true);
    });

    it('should treat a condition that throws, errors or answers a non-boolean as false', () => {
      init([
        { path: '', data: { title: 'Details' } },
        {
          path: 'throws',
          data: {
            title: 'Throws',
            visibleWhen: () => {
              throw new Error('broken');
            },
          },
        },
        { path: 'errors', data: { title: 'Errors', visibleWhen: () => throwError(() => new Error('broken')) } },
        { path: 'truthy', data: { title: 'Truthy', visibleWhen: () => 'yes' } },
        { path: 'fine', data: { title: 'Fine', visibleWhen: () => true } },
      ]);

      entity$.next({});

      expect(option('throws').isVisible).toBe(false);
      expect(option('errors').isVisible).toBe(false);
      expect(option('truthy').isVisible).toBe(false);
      expect(option('fine').isVisible).toBe(true);
    });

    it('should not ask the data provider for the record when no view declares a condition', () => {
      const getModel$: jest.Mock = jest.fn().mockReturnValue(entity$);
      (component as any).dataProviderService = { getModel$, hasEntityID: true };

      init(defaultChildren());

      expect(getModel$).not.toHaveBeenCalled();
      expect(component.options().every((o: any) => o.isVisible)).toBe(true);
    });

    it('should answer conditions once, without a record, when there is no data provider', () => {
      (component as any).dataProviderService = null;
      const visibleWhen: jest.Mock = jest.fn().mockReturnValue(true);

      init([
        { path: '', data: { title: 'Details' } },
        { path: 'payments', data: { title: 'Payments', visibleWhen } },
      ]);

      expect(visibleWhen).toHaveBeenCalledTimes(1);
      expect(visibleWhen.mock.calls[0][0].entity).toBeNull();
      expect(option('payments').isVisible).toBe(true);
    });

    it('should send the tab back to the first view when the record hides the view it shows', () => {
      init();
      showThisTab();
      entity$.next({ isCustomer: true });
      component.onViewClicked('payments');
      mockTabService.replaceCurrentTabSubView.mockClear();

      entity$.next({ isCustomer: false });

      expect(lastReplaceCall()).toEqual(['/customers/1']);
      expect((component as any).selectedViewId()).toBe('');
    });

    it('should send the tab back to the first view when the record disables the view it shows', () => {
      init();
      showThisTab();
      entity$.next({ isOpen: true });
      component.onViewClicked('notes');
      mockTabService.replaceCurrentTabSubView.mockClear();

      entity$.next({ isOpen: false });

      expect(lastReplaceCall()).toEqual(['/customers/1']);
    });

    it('should leave a hidden view reached by a direct link', () => {
      init();
      showThisTab();
      entity$.next({ isCustomer: false });

      mockRouter.events.next(new NavigationEnd(1, '/customers/1/payments', '/customers/1/payments'));

      expect(lastReplaceCall()).toEqual(['/customers/1']);
    });

    it('should keep a direct link while the record is still loading', () => {
      init();
      showThisTab();

      mockRouter.events.next(new NavigationEnd(1, '/customers/1/payments', '/customers/1/payments'));
      expect(mockTabService.replaceCurrentTabSubView).not.toHaveBeenCalled();

      entity$.next({ isCustomer: true });
      expect(mockTabService.replaceCurrentTabSubView).not.toHaveBeenCalled();
      expect((component as any).selectedViewId()).toBe('payments');
    });

    it('should not navigate a tab the router is not showing', () => {
      init();
      showThisTab();
      entity$.next({ isCustomer: true });
      component.onViewClicked('payments');
      mockTabService.replaceCurrentTabSubView.mockClear();

      // Another details tab is in front.
      jest.spyOn(RouteHelper, 'getRouteByData').mockReturnValue({ routeConfig: { children: [] } } as any);
      entity$.next({ isCustomer: false });

      expect(mockTabService.replaceCurrentTabSubView).not.toHaveBeenCalled();
      expect(option('payments').isVisible).toBe(false);
    });

    it('should stop answering once the button is destroyed', () => {
      const visibleWhen: jest.Mock = jest.fn().mockReturnValue(true);
      init([
        { path: '', data: { title: 'Details' } },
        { path: 'payments', data: { title: 'Payments', visibleWhen } },
      ]);

      component.destroy$.next(true);
      entity$.next({});

      expect(visibleWhen).not.toHaveBeenCalled();
    });
  });
});
