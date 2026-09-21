import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteHelper } from '../../../helpers';
import { FRAMEWORK_VIEW_TYPE, FrameworkViewType, ITab, Tab } from '../../../models';
import { ITabHistory } from '../../../models/tab-history';
import { TabService } from '../../../services/tab.service';
import { TabBreadcrumbsComponent } from '../tab-breadcrumbs/tab-breadcrumbs.component';

@Component({
  selector: 'framework-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TabBreadcrumbsComponent, TranslatePipe],
})
export class TabsComponent implements AfterViewChecked, OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('tabsNav') private tabsNav?: ElementRef<HTMLElement>;
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  private static instances = 0;

  /** Unique per instance: the ids below are referenced by aria-controls/aria-labelledby. */
  private readonly instanceId: string = `framework-tabs-${TabsComponent.instances++}`;
  private scrolledToIndex = -1;
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
    private router: Router,
    private tabService: TabService,
  ) {}

  public ngAfterViewChecked(): void {
    this.scrollActiveTabIntoView();
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
   * Keeps the selected tab on screen now that the strip scrolls. Guarded on the index so
   * this only runs when the selection actually moved -- ngAfterViewChecked runs on every
   * cycle, and scrolling unconditionally would fight the user scrolling by hand.
   */
  private scrollActiveTabIntoView(): void {
    const index: number = this.openTabs.findIndex((tab: ITab) => this.isTabActive(tab));
    if (index === -1 || index === this.scrolledToIndex) {
      return;
    }
    this.scrolledToIndex = index;

    // Guarded: scrollIntoView is not implemented in jsdom, and this runs from
    // ngAfterViewChecked, so an unguarded call throws on every change detection cycle
    // in any consumer's unit tests.
    const element: HTMLElement | undefined = this.tabElements()[index];
    if (typeof element?.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
  //#endregion
}
