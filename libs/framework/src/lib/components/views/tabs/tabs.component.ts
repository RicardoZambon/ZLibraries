import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteHelper } from '../../../helpers';
import { FRAMEWORK_VIEW_TYPE, FrameworkViewType, ITab, Tab } from '../../../models';
import { ITabHistory } from '../../../models/tab-history';
import { TabService } from '../../../services/tab.service';
import { TabBreadcrumbsComponent } from '../tab-breadcrumbs/tab-breadcrumbs.component';

/** Sub-pixel slack: scrollLeft is fractional, so an exact comparison never reaches the end. */
const SCROLL_EPSILON = 1;

/** How much of the visible strip one press of a scroll button travels. */
const SCROLL_BUTTON_STEP = 0.8;

@Component({
  selector: 'framework-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TabBreadcrumbsComponent, TranslatePipe],
})
export class TabsComponent implements AfterViewChecked, AfterViewInit, OnDestroy, OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('tabsNav') private tabsNav?: ElementRef<HTMLElement>;
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  private static instances = 0;

  /** Unique per instance: the ids below are referenced by aria-controls/aria-labelledby. */
  private readonly instanceId: string = `framework-tabs-${TabsComponent.instances++}`;

  /**
   * Fingerprint of everything that can invalidate the strip's scroll position: which tab is
   * selected, how many there are, and the strip's own geometry. Deliberately does NOT include
   * scrollLeft -- the user scrolling by hand must not make us yank the strip back.
   */
  private lastStripSignature = '';
  private navResizeObserver?: ResizeObserver;
  private isDestroyed = false;

  /** Drive the scroll buttons. Only ever assigned outside a change-detection pass (see below). */
  protected canScrollLeft = false;
  protected canScrollRight = false;

  /**
   * Whether the strip holds more tabs than it has room for. This decides that the buttons exist;
   * canScrollLeft and canScrollRight only decide whether each one is enabled.
   *
   * They used to decide both, so a button vanished the moment you reached the end it pointed at.
   * The strip then changed width under the pointer, and a click could land after the button had
   * already unmounted and do nothing — which is what "sometimes it does not move" was.
   */
  protected isOverflowing = false;

  /**
   * Whether anything reaches the strip's right edge: a tab, or the right scroll button. While
   * something does, the panel's top-right corner is square, because the card's corner then belongs
   * to the strip. Rounding both leaves whatever sits at the edge standing over the sweep where the
   * panel has curved away and is not there yet — a piece floating past the corner.
   */
  protected isFlushRight = false;
  //#endregion

  //#region Properties
  protected get activeHistory(): ITabHistory[] | null {
    return null; // this.tabService.activeHistory;
  }

  protected get activeTab(): string | null {
    return null; // this.tabService.activeTab;
  }

  protected get hasTabs(): boolean {
    return this.tabService.activeTabs.length > 0;
  }

  protected get openTabs(): ITab[] {
    return this.tabService.activeTabs ?? [];
  }

  protected get tabDisplayTitles(): (string | undefined)[] {
    return this.tabService.activeTabsDisplayTitles;
  }

  protected get tabLoadingStates(): boolean[] {
    return this.tabService.activeTabsLoadingStates;
  }

  /** Id of the panel these tabs control; referenced by each tab's aria-controls. */
  protected get panelId(): string {
    return `${this.instanceId}-panel`;
  }

  /** Id of the selected tab, so the panel can name the tab that labels it. */
  protected get activeTabId(): string | null {
    const index: number = this.openTabs.findIndex((tab: ITab) => this.isTabActive(tab));
    return index === -1 ? null : this.tabId(index);
  }

  protected trackByFn: (index: number, tab: ITab) => string = (_: number, tab: ITab): string => tab.url;
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
    private tabService: TabService,
  ) {}

  public ngAfterViewInit(): void {
    const nav: HTMLElement | undefined = this.tabsNav?.nativeElement;
    if (!nav) {
      return;
    }

    // Outside Angular: these fire continuously while scrolling or dragging a window edge, and
    // none of them need a change-detection pass unless a button's state actually flips.
    this.ngZone.runOutsideAngular(() => {
      nav.addEventListener('scroll', this.onNavScroll, { passive: true });
      nav.addEventListener('wheel', this.onNavWheel, { passive: false });

      // Catches the window resizing and the sidebar collapsing -- both change how many tabs
      // fit without changing the tab list, so nothing else would tell us to re-check.
      if (typeof ResizeObserver === 'function') {
        this.navResizeObserver = new ResizeObserver(() => this.onNavScroll());
        this.navResizeObserver.observe(nav);
      }
    });
  }

  public ngAfterViewChecked(): void {
    // This hook runs AFTER the bindings below have been checked, so assigning canScrollLeft or
    // canScrollRight here would throw NG0100 in dev mode on every cycle. Everything that
    // touches them is therefore deferred to a microtask, which lands after the pass completes.
    const signature: string = this.stripSignature();
    if (signature === this.lastStripSignature) {
      return;
    }
    this.lastStripSignature = signature;
    queueMicrotask(() => {
      this.scrollActiveTabIntoView();
      this.syncScrollAffordance();
    });
  }

  public ngOnDestroy(): void {
    this.isDestroyed = true;
    this.navResizeObserver?.disconnect();

    const nav: HTMLElement | undefined = this.tabsNav?.nativeElement;
    nav?.removeEventListener('scroll', this.onNavScroll);
    nav?.removeEventListener('wheel', this.onNavWheel);
  }

  public ngOnInit(): void {
    const activatedDetailsTabView: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(
      this.router.routerState.snapshot.root,
      FRAMEWORK_VIEW_TYPE,
      FrameworkViewType.Details,
    );
    if (activatedDetailsTabView) {
      const shouldIgnoreFirstChildRoute: boolean =
        !!activatedDetailsTabView.firstChild &&
        activatedDetailsTabView.firstChild.data &&
        activatedDetailsTabView.firstChild.data['ignoreRoute'] === true;

      const url: string = RouteHelper.getRouteURL(activatedDetailsTabView);
      const clones: string[] = [];

      if (shouldIgnoreFirstChildRoute) {
        clones.push(RouteHelper.getRouteURL(activatedDetailsTabView.firstChild!));
      } else if (activatedDetailsTabView.firstChild) {
        const childPath: string = activatedDetailsTabView.firstChild.url.map((s: any) => s.path).join('/');
        const defaultChildPath: string =
          activatedDetailsTabView.routeConfig?.children?.filter(
            (route: Route) => !!route.data && route.data['ignoreRoute'] !== true,
          )?.[0]?.path ?? '';

        if (childPath !== defaultChildPath) {
          const entityID = Number(activatedDetailsTabView.paramMap.get('id'));
          if (!entityID) {
            // New entity: inner views are not available, redirect to base URL.
            this.router.navigate([url], { replaceUrl: true });
          } else {
            // Non-default child route (e.g. direct navigation to /audit): add sub-view to history for breadcrumbs.
            const childTitle: string = activatedDetailsTabView.firstChild?.data?.['title'] ?? '';
            queueMicrotask(() => {
              const childUrl: string = RouteHelper.getRouteURL(activatedDetailsTabView.firstChild!);
              this.tabService.replaceCurrentTabSubView(
                url,
                new Tab({
                  title: childTitle,
                  url: childUrl,
                }),
              );
            });
          }
        }
      }

      this.tabService.openTab(
        new Tab({
          clones: clones,
          entityBaseUrl: url,
          queryParams: activatedDetailsTabView.queryParams,
          url: url,
        }),
      );
    } else {
      const activatedTabView: ActivatedRouteSnapshot | null = RouteHelper.getRouteByData(
        this.router.routerState.snapshot.root,
        FRAMEWORK_VIEW_TYPE,
        FrameworkViewType.List,
      );
      if (activatedTabView) {
        const url: string = RouteHelper.getRouteURL(activatedTabView);
        this.tabService.openTab(
          new Tab({
            queryParams: activatedTabView.queryParams,
            url: url,
          }),
        );
      } else {
        this.router.navigate(['/']);
      }
    }
  }
  //#endregion

  //#region Event handlers
  protected onActivateTab(tab: ITab): void {
    this.tabService.activateTab(tab);
  }

  protected onCloseTab(index: number): void {
    this.tabService.closeTab(index);
  }

  /** Middle click closes a tab, the way it does in a browser. */
  protected onTabAuxClick(event: MouseEvent, index: number): void {
    if (event.button !== 1) {
      return;
    }
    // Chromium starts autoscroll on middle click unless the default is prevented.
    event.preventDefault();
    this.onCloseTab(index);
  }

  /**
   * Roving focus. A tablist is a single tab stop: Tab reaches the selected tab, and the
   * arrow keys move between tabs from there. A delta of 0 means go to `from` exactly,
   * which is what Home and End want.
   */
  protected onMoveFocus(from: number, delta: number): void {
    const count: number = this.openTabs.length;
    if (count === 0) {
      return;
    }
    const target: number = delta === 0 ? Math.min(Math.max(from, 0), count - 1) : (from + delta + count) % count;
    this.focusTab(target);
  }

  /** The scroll buttons at each end of the strip. `direction` is -1 for left, 1 for right. */
  protected onScrollStrip(direction: number): void {
    const nav: HTMLElement | undefined = this.tabsNav?.nativeElement;
    if (!nav) {
      return;
    }

    const step: number = nav.clientWidth * SCROLL_BUTTON_STEP * direction;
    if (typeof nav.scrollBy === 'function') {
      nav.scrollBy({ left: step, behavior: 'smooth' });
    } else {
      // jsdom, and any browser without smooth scrolling, still gets the movement.
      nav.scrollLeft += step;
    }
  }
  //#endregion

  //#region Public methods
  protected isTabActive(tab: ITab): boolean {
    return this.tabService.isTabActive(tab);
  }
  //#endregion

  //#region Private methods
  /** Stable per index, so aria-controls and aria-labelledby have something to point at. */
  protected tabId(index: number): string {
    return `${this.instanceId}-tab-${index}`;
  }

  private tabElements(): HTMLElement[] {
    return Array.from(this.tabsNav?.nativeElement.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
  }

  /** Moves focus AND selection: this tablist follows the automatic-activation pattern. */
  private focusTab(index: number): void {
    const element: HTMLElement | undefined = this.tabElements()[index];
    if (!element) {
      return;
    }
    element.focus();

    const tab: ITab | undefined = this.openTabs[index];
    if (tab) {
      this.onActivateTab(tab);
    }
  }

  /**
   * Everything that invalidates the scroll position, in one cheap string. The geometry is part
   * of it because the window resizing or the sidebar collapsing can push the selected tab out
   * of sight without the tab list changing at all -- which is precisely how you end up looking
   * at a panel whose tab is nowhere on screen.
   */
  private stripSignature(): string {
    const nav: HTMLElement | undefined = this.tabsNav?.nativeElement;
    const index: number = this.openTabs.findIndex((tab: ITab) => this.isTabActive(tab));
    return `${index}|${this.openTabs.length}|${nav?.clientWidth ?? 0}|${nav?.scrollWidth ?? 0}`;
  }

  /** Keeps the selected tab on screen. Called from a microtask, never mid-change-detection. */
  private scrollActiveTabIntoView(): void {
    const index: number = this.openTabs.findIndex((tab: ITab) => this.isTabActive(tab));
    if (index === -1) {
      return;
    }

    // Guarded: scrollIntoView is not implemented in jsdom, so an unguarded call throws in
    // any consumer's unit tests.
    const element: HTMLElement | undefined = this.tabElements()[index];
    if (typeof element?.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  /**
   * Recomputes whether either scroll button applies. Reads first and only enters the zone when
   * a button actually flips, so an ordinary scroll costs one layout read and no render.
   */
  private syncScrollAffordance(): void {
    const nav: HTMLElement | undefined = this.tabsNav?.nativeElement;
    if (!nav || this.isDestroyed) {
      return;
    }

    const canLeft: boolean = nav.scrollLeft > SCROLL_EPSILON;
    const canRight: boolean = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - SCROLL_EPSILON;
    const overflowing: boolean = nav.scrollWidth > nav.clientWidth + SCROLL_EPSILON;

    // Overflowing means the right button holds the edge. Short of that, the last tab does if it
    // ends within a pixel of the strip — the case where the tabs happen to fill it exactly.
    const lastTab: Element | null = nav.lastElementChild;
    const flushRight: boolean =
      overflowing ||
      (lastTab !== null && lastTab.getBoundingClientRect().right >= nav.getBoundingClientRect().right - SCROLL_EPSILON);

    if (
      canLeft === this.canScrollLeft &&
      canRight === this.canScrollRight &&
      overflowing === this.isOverflowing &&
      flushRight === this.isFlushRight
    ) {
      return;
    }

    this.ngZone.run(() => {
      this.canScrollLeft = canLeft;
      this.canScrollRight = canRight;
      this.isOverflowing = overflowing;
      this.isFlushRight = flushRight;
      this.changeDetectorRef.detectChanges();
    });
  }

  /** Arrow function: registered and removed as a listener, so it must keep its `this`. */
  private onNavScroll = (): void => {
    this.syncScrollAffordance();
  };

  /**
   * A tab strip is horizontal but a mouse wheel is vertical, so without this the only way to
   * reach an off-screen tab with a plain wheel mouse is the buttons. Trackpads and shift+wheel
   * already produce deltaX, so those are left alone.
   */
  private onNavWheel = (event: WheelEvent): void => {
    const nav: HTMLElement | undefined = this.tabsNav?.nativeElement;
    if (!nav || event.deltaX !== 0 || event.deltaY === 0) {
      return;
    }
    if (nav.scrollWidth <= nav.clientWidth) {
      return;
    }

    event.preventDefault();
    nav.scrollLeft += event.deltaY;
  };
  //#endregion
}
