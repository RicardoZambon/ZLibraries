import { Location } from '@angular/common';
import { ApplicationRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { Router, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './custom-reuse-strategy';
import { ITab } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TabService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private activeTabIndex: number = -1;
  private customReuseStrategy: CustomReuseStrategy;
  private displayTitleIndices: number[] = [];
  private openTabs: ITab[][] = [];
  //#endregion

  //#region Properties
  private get activeTab(): ITab[] | null {
    if (this.activeTabIndex < 0 ) {
      return null;
    }
    return this.openTabs[this.activeTabIndex];
  }

  public get activeTabHistory(): ITab[] {
    return this.openTabs[this.activeTabIndex] ?? [];
  }

  public get activeTabs(): ITab[] {
    return this.openTabs.map((tabs: ITab[]) => tabs[0]) ?? [];
  }

  public get activeTabsDisplayTitles(): (string | undefined)[] {
    return this.openTabs.map((tabs: ITab[], i: number) => {
      const displayIndex: number = this.displayTitleIndices[i] ?? 0;
      return tabs[displayIndex]?.title;
    });
  }

  public get activeTabsLoadingStates(): boolean[] {
    return this.openTabs.map((tabs: ITab[], i: number) => {
      const displayIndex: number = this.displayTitleIndices[i] ?? 0;
      return tabs[displayIndex]?.isTitleLoading ?? true;
    });
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(
    private applicationRef: ApplicationRef,
    private location: Location,
    private router: Router,
    routeReuseStrategy: RouteReuseStrategy,
  ) {
    this.customReuseStrategy = <CustomReuseStrategy>routeReuseStrategy;
    this.customReuseStrategy.tabService = this;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public activateTab(tab: ITab): void {
    this.activeTabIndex = this.activeTabs.indexOf(tab);
    const tabStack: ITab[] = this.openTabs[this.activeTabIndex];
    const currentView: ITab = tabStack[tabStack.length - 1];
    this.navigateTo(currentView);
  }

  public cloneCurrentTab(url: string): void {
    if (!this.activeTab) {
      return;
    }

    const tab: ITab = this.activeTab[this.activeTab.length - 1];

    this.customReuseStrategy.clones[url] = tab.url;
    if (tab.clones.indexOf(url) === -1) {
      tab.clones.push(url);
    }

    this.navigateTo(tab, url);
  }

  public closeActiveTab(): void {
    this.closeTab(this.activeTabIndex);
  }

  public closeAllTabs(): void {
    this.openTabs = [];
    this.displayTitleIndices = [];
    this.activeTabIndex = -1;
    this.customReuseStrategy.clearAllHandles();
  }

  public closeTab(index: number): void {
    if (index > this.activeTabs.length - 1 || this.activeTabs.length === 0) {
      return;
    }

    const wasActive: boolean = index === this.activeTabIndex;
    const closedTab: ITab[] = this.openTabs[index];
    this.openTabs.splice(index, 1);
    this.displayTitleIndices.splice(index, 1);

    if (wasActive) {
      // Closed the active tab — pick an adjacent tab to focus.
      if (this.activeTabIndex >= this.activeTabs.length) {
        this.activeTabIndex = this.activeTabs.length - 1;
      }

      this.navigateTo(this.activeTabs[this.activeTabIndex]);
    } else if (index < this.activeTabIndex) {
      // Closed a tab before the active one — shift index to keep the same tab active.
      this.activeTabIndex--;
    }

    closedTab.forEach((tab: ITab) => {
      if (!this.isUrlOpen(tab.url)) {
        // Tab is not in use by any other tab, we're clear to remove.
        this.customReuseStrategy.clearHandle(tab.url);
      }
    });
  }

  public isTabActive(tab: ITab): boolean {
    return this.activeTabs[this.activeTabIndex] === tab;
  }

  public isUrlActive(url: string, checkForClones: boolean = false): boolean {
    if (!this.activeTab) {
      return false;
    }

    const tab: ITab = this.activeTab[this.activeTab.length - 1];

    if (tab.url === url) {
      return true;
    } else if (checkForClones) {
      return tab.clones.indexOf(url) !== -1;
    }

    return false
  }

  public isUrlOpen(url: string): boolean {
    const tabs: ITab[] = this.openTabs
      .flatMap((tabs: ITab[]) => tabs);

    return this.isTabExists(tabs, url);
  }

  public navigateBackOrCloseActiveTab(): void {
    if (!this.activeTab || this.activeTab.length === 0) {
      return;
    }

    if (this.activeTab.length <= 1) {
      this.closeTab(this.activeTabIndex);
    } else {
      const previousEntry: ITab = this.activeTab[this.activeTab.length - 2];
      this.navigateCurrentTabBack(previousEntry);
    }
  }

  public navigateCurrentTab(tab: ITab): void {
    if (!this.activeTab) {
      return;
    }

    // Check other tabs for entity match first, then fall back to current behavior.
    if (tab.entityBaseUrl) {
      const entityMatchIndex: number = this.findTabIndexByEntityMatch(tab.entityBaseUrl, this.activeTabIndex);
      if (entityMatchIndex !== -1) {
        this.activeTabIndex = entityMatchIndex;
        const otherTab: ITab[] = this.openTabs[entityMatchIndex];
        this.navigateTo(otherTab[otherTab.length - 1]);
        return;
      }
    } else {
      // Fallback for tabs without entityBaseUrl (existing behavior).
      const showingIndex: number = this.findTabIndexByCurrentView(tab.url, this.activeTabIndex, true);
      if (showingIndex !== -1) {
        this.activeTabIndex = showingIndex;
        const otherTab: ITab[] = this.openTabs[showingIndex];
        this.navigateTo(otherTab[otherTab.length - 1]);
        return;
      }
    }

    // Check if URL already in current tab's stack — navigate back.
    const tabIsAlreadyOpen: ITab | undefined = this.findTab(this.activeTab, tab.url);
    if (tabIsAlreadyOpen) {
      this.navigateCurrentTabBack(tabIsAlreadyOpen);
      return;
    }

    // Inherit title from an existing tab entry with the same URL, if available.
    this.inheritTitleIfKnown(tab);

    // Push new entry onto the stack.
    let clonedUrl: string | undefined = undefined;
    if (tab.clones.length > 0) {
      clonedUrl = tab.clones[0];
      this.customReuseStrategy.clones[clonedUrl] = tab.url;
    }

    this.activeTab.push(tab);
    this.displayTitleIndices[this.activeTabIndex] = this.activeTab.length - 1;

    this.navigateTo(tab, clonedUrl);
  }

  public navigateCurrentTabBack(tab: ITab): void {
    if (!this.activeTab) {
      return;
    }

    // If another tab is currently showing this URL, focus it instead.
    const otherTabIndex: number = this.findTabIndexByCurrentView(tab.url, this.activeTabIndex);
    if (otherTabIndex !== -1) {
      this.activeTabIndex = otherTabIndex;
      const otherTab: ITab[] = this.openTabs[otherTabIndex];
      this.navigateTo(otherTab[otherTab.length - 1]);
      return;
    }

    const lastIndex: number = this.activeTab.lastIndexOf(tab);
    if (lastIndex !== -1) {
      this.activeTab.slice(lastIndex + 1)
        .forEach((tab: ITab) => {
          this.customReuseStrategy.clearHandle(tab.url);
        });

      this.openTabs[this.activeTabIndex] = this.activeTab.slice(0, lastIndex + 1);

      if (this.displayTitleIndices[this.activeTabIndex] > lastIndex) {
        this.displayTitleIndices[this.activeTabIndex] = lastIndex;
      }
    }

    this.navigateTo(tab);
  }

  public navigateTo(tab: ITab | undefined, clonedUrl?: string): void {
    let url: string = tab?.url ?? '/';
    if (!!clonedUrl) {
      url = clonedUrl;
    }

    this.router.navigate([ url ], { queryParams: tab?.queryParams })
      .then((navigated: boolean) => {
        this.customReuseStrategy.redirects = {};

        // Clean up clone mapping after successful clone-based navigation.
        if (navigated && this.customReuseStrategy.clones[url]) {
          delete this.customReuseStrategy.clones[url];
        }

        this.applicationRef.tick();
      });
  }

  public openTab(tab: ITab): void {
    // 1. Exact URL match at top-of-stack — focus that tab.
    const exactMatchIndex: number = this.findTabIndexByCurrentView(tab.url);
    if (exactMatchIndex !== -1) {
      this.activeTabIndex = exactMatchIndex;
      const currentTab: ITab[] = this.openTabs[exactMatchIndex];
      this.navigateTo(currentTab[currentTab.length - 1]);
      return;
    }

    // 2. Entity match (only when entityBaseUrl is set) — focus that tab, keep current view.
    if (tab.entityBaseUrl) {
      const entityMatchIndex: number = this.findTabIndexByEntityMatch(tab.entityBaseUrl);
      if (entityMatchIndex !== -1) {
        this.activeTabIndex = entityMatchIndex;
        const existingTab: ITab[] = this.openTabs[entityMatchIndex];
        this.navigateTo(existingTab[existingTab.length - 1]);
        return;
      }
    }

    // 3. No match — open a new tab.
    this.inheritTitleIfKnown(tab);
    this.openTabs.push([tab]);
    this.displayTitleIndices.push(0);
    this.activeTabIndex = this.openTabs.length - 1;
    this.navigateTo(tab);
  }

  public replaceCurrentTabSubView(baseUrl: string, tab?: ITab): void {
    if (!this.activeTab || this.activeTab.length === 0) {
      return;
    }

    // Find the anchor entry (the detail view whose URL matches baseUrl).
    // Keep all entries up to and including the anchor.
    const anchorIndex: number = this.activeTab.findIndex((t: ITab) => t.url === baseUrl);
    const keepUntil: number = anchorIndex !== -1 ? anchorIndex + 1 : 1;

    const keptEntries: ITab[] = this.activeTab.slice(0, keepUntil);
    const removedEntries: ITab[] = this.activeTab.slice(keepUntil);

    // Update history: keep entries up to anchor, optionally add new sub-view
    if (tab) {
      // Propagate entityBaseUrl from the anchor so entity matching works on sub-views.
      const anchor: ITab | undefined = keptEntries[anchorIndex !== -1 ? anchorIndex : 0];
      if (!tab.entityBaseUrl && anchor?.entityBaseUrl) {
        tab.entityBaseUrl = anchor.entityBaseUrl;
      }

      this.openTabs[this.activeTabIndex] = [...keptEntries, tab];
    } else {
      this.openTabs[this.activeTabIndex] = keptEntries;
    }

    // Clear reuse-strategy handles for removed entries no longer open anywhere
    removedEntries.forEach((entry: ITab) => {
      if (!this.isUrlOpen(entry.url)) {
        this.customReuseStrategy.clearHandle(entry.url);
      }
    });

    // Navigate to the topmost entry
    const current: ITab[] = this.openTabs[this.activeTabIndex];
    this.navigateTo(current[current.length - 1]);
  }

  public redirectCurrentTab(url: string, updateLocation: boolean = true): void {
    if (!this.activeTab) {
      return;
    }

    const tab: ITab = this.activeTab[this.activeTab.length - 1];

    // Update entityBaseUrl if it was pointing to the old URL (e.g., /new → /:id after save).
    if (tab.entityBaseUrl === tab.url) {
      tab.entityBaseUrl = url;
    }

    tab.url = url;
    tab.queryParams = {};

    if (updateLocation) {
      this.location.replaceState(url);
    }
  }

  public setRouteRedirect(fromUrl: string, toUrl: string): void {
    this.customReuseStrategy.redirects[fromUrl] = toUrl;
  }

  public updateActiveTabRootTitle(title: string): void {
    if (this.activeTab && this.activeTab.length > 0) {
      this.activeTab[0].title = title;
    }
  }

  public updateTabTitle(url: string, title: string): void {
    this.openTabs.flatMap((tabs: ITab[]) => tabs)
      .filter((tab: ITab) => tab.url === url)
      .forEach((tab: ITab) => {
        tab.title = title;
      });
  }
  //#endregion
  
  //#region Private methods
  private findTab(tabs: ITab[], url: string): ITab | undefined {
    return tabs.find((tab: ITab) => this.matchTabUrl(tab, url));
  }

  private findTabIndex(tabs: ITab[], url: string): number {
    return tabs.findIndex((tab: ITab) => this.matchTabUrl(tab, url));
  }

  private isTabExists(tabs: ITab[], url: string): boolean {
    return tabs.some((tab: ITab) => this.matchTabUrl(tab, url));
  }

  private findTabIndexByEntityMatch(entityBaseUrl: string, excludeIndex: number = -1): number {
    return this.openTabs.findIndex((tabStack: ITab[], index: number) => {
      if (index === excludeIndex) {
        return false;
      }
      // Only check the current view (top of stack), not the full history.
      const currentView: ITab = tabStack[tabStack.length - 1];
      return currentView.entityBaseUrl === entityBaseUrl || currentView.url === entityBaseUrl;
    });
  }

  private findTabIndexByCurrentView(url: string, excludeIndex: number = -1, includeChildRoutes: boolean = false): number {
    return this.openTabs.findIndex((tabStack: ITab[], index: number) => {
      if (index === excludeIndex) {
        return false;
      }
      const currentView: ITab = tabStack[tabStack.length - 1];
      return this.matchTabUrl(currentView, url)
        || (includeChildRoutes && this.isChildRoute(currentView.url, url));
    });
  }

  private inheritTitleIfKnown(tab: ITab): void {
    if (tab.title || !tab.isTitleLoading) {
      return;
    }

    const existing: ITab | undefined = this.openTabs
      .flatMap((stack: ITab[]) => stack)
      .find((entry: ITab) => entry.url === tab.url && !entry.isTitleLoading && !!entry.title);

    if (existing) {
      tab.title = existing.title;
      tab.isTitleLoading = false;
    }
  }

  private isChildRoute(currentUrl: string, parentUrl: string): boolean {
    return currentUrl.startsWith(parentUrl + '/');
  }

  private matchTabUrl(tab: ITab, url: string): boolean {
    return tab.url === url
      || tab.clones.indexOf(url) !== -1;
  }
  //#endregion
}