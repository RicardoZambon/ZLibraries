import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { RouteHelper } from '../../../helpers';
import { FRAMEWORK_VIEW_TYPE, FrameworkViewType, ITab, Tab } from '../../../models';
import { TabService } from '../../../services/tab.service';
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

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation((_root: any, key: string, value: any): any => {
        if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.Details) {
          return route;
        }
        return null;
      });
      jest.spyOn(RouteHelper, 'getRouteURL').mockImplementation((r: any): string => {
        if (r === route) {
          return '/configs/entity/42';
        }
        if (r === route.firstChild) {
          return '/configs/entity/42/audit';
        }
        return '/';
      });

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

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation((_root: any, key: string, value: any): any => {
        if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.Details) {
          return route;
        }
        return null;
      });
      jest.spyOn(RouteHelper, 'getRouteURL').mockImplementation((r: any): string => {
        if (r === route) {
          return '/configs/entity/new';
        }
        if (r === route.firstChild) {
          return '/configs/entity/new/audit';
        }
        return '/';
      });

      component.ngOnInit();

      // Should redirect to base URL
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/configs/entity/new'], { replaceUrl: true });

      // Should NOT add sub-view to history
      return Promise.resolve().then(() => {
        expect(mockTabService.replaceCurrentTabSubView).not.toHaveBeenCalled();
      });
    });

    it('should not redirect when entity is new and child route is the default view', () => {
      const route: any = createDetailsRoute({ id: 'new' }, defaultChildren(), '');
      mockRouter.routerState.snapshot.root = route;

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation((_root: any, key: string, value: any): any => {
        if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.Details) {
          return route;
        }
        return null;
      });
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

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation((_root: any, key: string, value: any): any => {
        if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.Details) {
          return route;
        }
        return null;
      });
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

      jest.spyOn(RouteHelper, 'getRouteByData').mockImplementation((_root: any, key: string, value: any): any => {
        if (key === FRAMEWORK_VIEW_TYPE && value === FrameworkViewType.List) {
          return listRoute;
        }
        return null;
      });
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

// ---------------------------------------------------------------------------
// Tab strip interaction — rendered, because these are all DOM contracts:
// ARIA wiring, roving focus, and the pointer/key shortcuts.
// ---------------------------------------------------------------------------

describe('TabsComponent — tab strip interaction', () => {
  let fixture: ComponentFixture<TabsComponent>;
  let tabs: ITab[];
  let activeUrl: string;
  let tabServiceStub: {
    activeTabs: ITab[];
    activeTabsDisplayTitles: (string | undefined)[];
    activeTabsLoadingStates: boolean[];
    activateTab: jest.Mock;
    closeTab: jest.Mock;
    isTabActive: (tab: ITab) => boolean;
    openTab: jest.Mock;
  };

  function tabElements(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
  }

  beforeEach(async () => {
    tabs = [
      new Tab({ isTitleLoading: false, title: 'First', url: '/first' }),
      new Tab({ isTitleLoading: false, title: 'Second', url: '/second' }),
      new Tab({ isTitleLoading: true, url: '/third' }),
    ];
    activeUrl = '/first';

    tabServiceStub = {
      activeTabs: tabs,
      activeTabsDisplayTitles: ['First', 'Second', undefined],
      activeTabsLoadingStates: [false, false, true],
      activateTab: jest.fn((tab: ITab) => (activeUrl = tab.url)),
      closeTab: jest.fn(),
      isTabActive: (tab: ITab) => tab.url === activeUrl,
      openTab: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TabsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TabService, useValue: tabServiceStub },
        { provide: Router, useValue: { routerState: { snapshot: { root: {} } }, navigate: jest.fn() } },
      ],
    }).compileComponents();

    // ngOnInit only does route-to-tab bootstrapping, which the suite above covers.
    jest.spyOn(TabsComponent.prototype, 'ngOnInit').mockImplementation(() => undefined);

    // Without a loaded translation the pipe echoes the key and drops interpolation, so
    // the close-button label could never be asserted.
    const translate: TranslateService = TestBed.inject(TranslateService);
    translate.setTranslation('en', { 'Tabs-CloseTab': 'Close {{title}}' });
    translate.use('en');

    fixture = TestBed.createComponent(TabsComponent);
    fixture.detectChanges();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should point every tab at the panel it controls', () => {
    const panel: HTMLElement = fixture.nativeElement.querySelector('[role="tabpanel"]');
    expect(panel).toBeTruthy();

    for (const tab of tabElements()) {
      expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    }
  });

  it('should label the panel with the selected tab', () => {
    const panel: HTMLElement = fixture.nativeElement.querySelector('[role="tabpanel"]');
    expect(panel.getAttribute('aria-labelledby')).toBe(tabElements()[0].id);
  });

  it('should expose the tablist as a single tab stop', () => {
    // Roving tabindex: Tab reaches the selected tab, arrows move from there.
    expect(tabElements().map((t: HTMLElement) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('should move selection with the arrow keys', () => {
    tabElements()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(tabServiceStub.activateTab).toHaveBeenCalledWith(tabs[1]);
  });

  it('should wrap around at both ends', () => {
    tabElements()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(tabServiceStub.activateTab).toHaveBeenCalledWith(tabs[2]);
  });

  it('should jump to the first and last tab with Home and End', () => {
    tabElements()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(tabServiceStub.activateTab).toHaveBeenLastCalledWith(tabs[2]);

    tabElements()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(tabServiceStub.activateTab).toHaveBeenLastCalledWith(tabs[0]);
  });

  it('should close a tab with Delete', () => {
    tabElements()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    expect(tabServiceStub.closeTab).toHaveBeenCalledWith(1);
  });

  it('should close a tab on middle click', () => {
    tabElements()[1].dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true }));
    expect(tabServiceStub.closeTab).toHaveBeenCalledWith(1);
  });

  it('should ignore a right click', () => {
    tabElements()[1].dispatchEvent(new MouseEvent('auxclick', { button: 2, bubbles: true }));
    expect(tabServiceStub.closeTab).not.toHaveBeenCalled();
  });

  it('should name each close button after its tab', () => {
    const labels: (string | null)[] = Array.from(fixture.nativeElement.querySelectorAll<HTMLElement>('.tab-close')).map(
      (button: HTMLElement) => button.getAttribute('aria-label'),
    );

    // Six identical "Close tab" labels tell a screen reader user nothing.
    expect(labels[0]).toContain('First');
    expect(labels[1]).toContain('Second');
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('should keep a tab at its width while the title is still loading', () => {
    // The label used to be swapped out for the spinner, so the strip reflowed as each
    // title arrived. Both are present now; the spinner sits beside the label.
    const loading: HTMLElement = tabElements()[2];
    expect(loading.querySelector('.label')).toBeTruthy();
    expect(loading.querySelector('.spinner')).toBeTruthy();
  });
});
