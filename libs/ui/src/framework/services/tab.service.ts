import { Location } from '@angular/common';
import { ApplicationRef, Injectable, signal, WritableSignal } from '@angular/core';
import { Router, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './custom-reuse-strategy';
import { ITab } from '../models';

/**
 * Keeps the app's open tabs. Each tab has a history stack of the views opened in it; the service
 * opens, focuses, navigates and closes tabs, and keeps the router's view cache in step.
 */
@Injectable({
  providedIn: 'root',
})
export class TabService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  // Tab state is a tree of arrays mutated in place -- spliced, pushed, and with ITab objects
  // whose titles are rewritten as they resolve. A signal over the array could not see any of
  // that, so this counter stands in for it: every write below bumps it, and the public getters
  // read it, which is what makes a template that reads them re-render. It is a bridge, not the
  // destination -- the tab state itself still wants to become signals. See
  // docs/guides/reactivity.md.
  private readonly revision: WritableSignal<number> = signal(0);

  private activeTabIndex = -1;
  private customReuseStrategy: CustomReuseStrategy;
  private displayTitleIndices: number[] = [];
  private openTabs: ITab[][] = [];
  //#endregion

  //#region Properties
  /** The active tab's history stack, root first. Empty when no tab is open. */
  public get activeTabHistory(): ITab[] {
    this.revision();
    return this.openTabs[this.activeTabIndex] ?? [];
  }

  /** The root entry of every open tab, in strip order. */
  public get activeTabs(): ITab[] {
    this.revision();
    return this.openTabs.map((tabs: ITab[]) => tabs[0]) ?? [];
  }

  /** The title each open tab shows: that of the entry it was last navigated to, in strip order. */
  public get activeTabsDisplayTitles(): (string | undefined)[] {
    this.revision();
    return this.openTabs.map((tabs: ITab[], i: number) => {
      const displayIndex: number = this.displayTitleIndices[i] ?? 0;
      return tabs[displayIndex]?.title;
    });
  }

  /** Whether each open tab's title is still loading, in strip order. */
  public get activeTabsLoadingStates(): boolean[] {
    this.revision();
    return this.openTabs.map((tabs: ITab[], i: number) => {
      const displayIndex: number = this.displayTitleIndices[i] ?? 0;
      return tabs[displayIndex]?.isTitleLoading ?? true;
    });
  }

  private get activeTab(): ITab[] | null {
    if (this.activeTabIndex < 0) {
      return null;
    }
    return this.openTabs[this.activeTabIndex];
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
  /** Focuses a tab, given its root entry, and navigates to the view it was showing. */
  public activateTab(tab: ITab): void {
    this.activeTabIndex = this.activeTabs.indexOf(tab);
    this.touched();
    this.navigateTo(this.currentViewOf(this.activeTabIndex));
  }

  /** Navigates to `url` while keeping the active tab's current view cached under it. */
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

  /** Closes the active tab. */
  public closeActiveTab(): void {
    this.closeTab(this.activeTabIndex);
  }

  /** Closes every tab and clears the view cache. */
  public closeAllTabs(): void {
    this.openTabs = [];
    this.touched();
    this.displayTitleIndices = [];
    this.touched();
    this.activeTabIndex = -1;
    this.touched();
    this.customReuseStrategy.clearAllHandles();
  }

  /** Closes the tab at `index`. Closing the active tab focuses a neighbour, or goes home when none is left. */
  public closeTab(index: number): void {
    if (index > this.activeTabs.length - 1 || this.activeTabs.length === 0) {
      return;
    }

    const wasActive: boolean = index === this.activeTabIndex;
    const closedTab: ITab[] = this.openTabs[index];
    this.openTabs.splice(index, 1);
    this.touched();
    this.displayTitleIndices.splice(index, 1);
    this.touched();

    if (wasActive) {
      // Closed the active tab — pick an adjacent tab to focus, and put it back on the view it was
      // left on. This used to navigate to activeTabs[i], which is that tab's *root*: a tab opened
      // as a list and then drilled into a record went back to the list, under the record's own
      // tab, until the tab was clicked again.
      if (this.activeTabIndex >= this.openTabs.length) {
        this.activeTabIndex = this.openTabs.length - 1;
        this.touched();
      }

      // Undefined once the last tab is gone, which navigateTo answers with the home URL.
      this.navigateTo(this.currentViewOf(this.activeTabIndex));
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

  /** Whether `tab`, a root entry, belongs to the active tab. */
  public isTabActive(tab: ITab): boolean {
    return this.activeTabs[this.activeTabIndex] === tab;
  }

  /**
   * Whether the active tab is showing `url`.
   *
   * @param checkForClones Also match URLs cloned from the current view. Defaults to `false`.
   */
  public isUrlActive(url: string, checkForClones = false): boolean {
    if (!this.activeTab) {
      return false;
    }

    const tab: ITab = this.activeTab[this.activeTab.length - 1];

    if (tab.url === url) {
      return true;
    } else if (checkForClones) {
      return tab.clones.indexOf(url) !== -1;
    }

    return false;
  }

  /** Whether any tab has `url` anywhere in its history. */
  public isUrlOpen(url: string): boolean {
    const tabs: ITab[] = this.openTabs.flatMap((tabs: ITab[]) => tabs);

    return this.isTabExists(tabs, url);
  }

  /** Goes back one step in the active tab's history, or closes the tab when it has no earlier step. */
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

  /**
   * Opens a view in the active tab, adding it to the tab's history. Focuses another tab instead when
   * that one already shows the same record or URL.
   */
  public navigateCurrentTab(tab: ITab): void {
    if (!this.activeTab) {
      return;
    }

    // Check other tabs for entity match first, then fall back to current behavior.
    if (tab.entityBaseUrl) {
      const entityMatchIndex: number = this.findTabIndexByEntityMatch(tab.entityBaseUrl, this.activeTabIndex);
      if (entityMatchIndex !== -1) {
        this.activeTabIndex = entityMatchIndex;
        this.touched();
        const otherTab: ITab[] = this.openTabs[entityMatchIndex];
        this.navigateTo(otherTab[otherTab.length - 1]);
        return;
      }
    } else {
      // Fallback for tabs without entityBaseUrl (existing behavior).
      const showingIndex: number = this.findTabIndexByCurrentView(tab.url, this.activeTabIndex, true);
      if (showingIndex !== -1) {
        this.activeTabIndex = showingIndex;
        this.touched();
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
    this.touched();

    this.navigateTo(tab, clonedUrl);
  }

  /** Goes back to an earlier entry of the active tab, dropping the entries after it. */
  public navigateCurrentTabBack(tab: ITab): void {
    if (!this.activeTab) {
      return;
    }

    // If another tab is currently showing this URL, focus it instead.
    const otherTabIndex: number = this.findTabIndexByCurrentView(tab.url, this.activeTabIndex);
    if (otherTabIndex !== -1) {
      this.activeTabIndex = otherTabIndex;
      this.touched();
      const otherTab: ITab[] = this.openTabs[otherTabIndex];
      this.navigateTo(otherTab[otherTab.length - 1]);
      return;
    }

    const lastIndex: number = this.activeTab.lastIndexOf(tab);
    if (lastIndex !== -1) {
      const removedEntries: ITab[] = this.activeTab.slice(lastIndex + 1);

      this.openTabs[this.activeTabIndex] = this.activeTab.slice(0, lastIndex + 1);
      this.touched();

      if (this.displayTitleIndices[this.activeTabIndex] > lastIndex) {
        this.displayTitleIndices[this.activeTabIndex] = lastIndex;
        this.touched();
      }

      // Every open tab keeps its views in the reuse cache, the one it shows or one in its history,
      // so a view leaves the cache only once no tab has its URL open. This cleared every removed
      // URL unconditionally and could take a view out from under another tab; closeTab and
      // replaceCurrentTabSubView already made this check. The history is cut first, so the removed
      // entries no longer count as open themselves.
      removedEntries.forEach((entry: ITab) => {
        if (!this.isUrlOpen(entry.url)) {
          this.customReuseStrategy.clearHandle(entry.url);
        }
      });
    }

    this.navigateTo(tab);
  }

  /**
   * Navigates the router to a tab entry, or to the home URL when `tab` is undefined.
   *
   * @param clonedUrl URL to navigate to instead of the entry's own URL.
   */
  public navigateTo(tab: ITab | undefined, clonedUrl?: string): void {
    let url: string = tab?.url ?? '/';
    if (clonedUrl) {
      url = clonedUrl;
    }

    this.router.navigate([url], { queryParams: tab?.queryParams }).then((navigated: boolean) => {
      this.customReuseStrategy.redirects = {};

      // Clean up clone mapping after successful clone-based navigation.
      if (navigated && this.customReuseStrategy.clones[url]) {
        delete this.customReuseStrategy.clones[url];
      }

      this.applicationRef.tick();
    });
  }

  /** Opens a view in a new tab, or focuses the tab that already shows that URL or record. */
  public openTab(tab: ITab): void {
    // 1. Exact URL match at top-of-stack — focus that tab.
    const exactMatchIndex: number = this.findTabIndexByCurrentView(tab.url);
    if (exactMatchIndex !== -1) {
      this.activeTabIndex = exactMatchIndex;
      this.touched();
      const currentTab: ITab[] = this.openTabs[exactMatchIndex];
      this.navigateTo(currentTab[currentTab.length - 1]);
      return;
    }

    // 2. Entity match (only when entityBaseUrl is set) — focus that tab, keep current view.
    if (tab.entityBaseUrl) {
      const entityMatchIndex: number = this.findTabIndexByEntityMatch(tab.entityBaseUrl);
      if (entityMatchIndex !== -1) {
        this.activeTabIndex = entityMatchIndex;
        this.touched();
        const existingTab: ITab[] = this.openTabs[entityMatchIndex];
        this.navigateTo(existingTab[existingTab.length - 1]);
        return;
      }
    }

    // 3. No match — open a new tab.
    this.inheritTitleIfKnown(tab);
    this.openTabs.push([tab]);
    this.touched();
    this.displayTitleIndices.push(0);
    this.touched();
    this.activeTabIndex = this.openTabs.length - 1;
    this.touched();
    this.navigateTo(tab);
  }

  /**
   * Replaces the sub-view of the active tab: keeps its history up to the entry at `baseUrl`, then adds
   * `tab` when given, and navigates to the result.
   */
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
      this.touched();
    } else {
      this.openTabs[this.activeTabIndex] = keptEntries;
      this.touched();
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

  /**
   * Changes the URL of the active tab's current entry without navigating, such as after a new record is saved.
   *
   * @param updateLocation Whether to also replace the browser address. Defaults to `true`.
   */
  public redirectCurrentTab(url: string, updateLocation = true): void {
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

  /** Makes the next navigation to `fromUrl` reuse the cached view of `toUrl`. */
  public setRouteRedirect(fromUrl: string, toUrl: string): void {
    this.customReuseStrategy.redirects[fromUrl] = toUrl;
  }

  /** Sets the title of the active tab's root entry. */
  public updateActiveTabRootTitle(title: string): void {
    if (this.activeTab && this.activeTab.length > 0) {
      this.activeTab[0].title = title;
      this.touched();
    }
  }

  /** Sets the title of every tab entry whose URL is `url`. */
  public updateTabTitle(url: string, title: string): void {
    this.openTabs
      .flatMap((tabs: ITab[]) => tabs)
      .filter((tab: ITab) => tab.url === url)
      .forEach((tab: ITab) => {
        tab.title = title;
        this.touched();
      });
  }
  //#endregion

  //#region Private methods
  /** Announces that the tab state changed, so views reading it re-render. */
  private touched(): void {
    this.revision.update((revision: number) => revision + 1);
  }

  /**
   * The view a tab is showing: the top of its history stack.
   *
   * Not `activeTabs[index]`, which is the stack's *root* -- the entry the strip takes each tab's
   * label from. The two are the same only for a tab nobody has drilled into, which is why
   * reaching for the wrong one survives most testing. Undefined for an index with no tab, which
   * is what closing the last tab leaves behind.
   */
  private currentViewOf(index: number): ITab | undefined {
    const history: ITab[] | undefined = this.openTabs[index];

    return history?.[history.length - 1];
  }

  private findTab(tabs: ITab[], url: string): ITab | undefined {
    return tabs.find((tab: ITab) => this.matchTabUrl(tab, url));
  }

  private findTabIndex(tabs: ITab[], url: string): number {
    return tabs.findIndex((tab: ITab) => this.matchTabUrl(tab, url));
  }

  private isTabExists(tabs: ITab[], url: string): boolean {
    return tabs.some((tab: ITab) => this.matchTabUrl(tab, url));
  }

  private findTabIndexByEntityMatch(entityBaseUrl: string, excludeIndex = -1): number {
    return this.openTabs.findIndex((tabStack: ITab[], index: number) => {
      if (index === excludeIndex) {
        return false;
      }
      // Only check the current view (top of stack), not the full history.
      const currentView: ITab = tabStack[tabStack.length - 1];
      return currentView.entityBaseUrl === entityBaseUrl || currentView.url === entityBaseUrl;
    });
  }

  private findTabIndexByCurrentView(url: string, excludeIndex = -1, includeChildRoutes = false): number {
    return this.openTabs.findIndex((tabStack: ITab[], index: number) => {
      if (index === excludeIndex) {
        return false;
      }
      const currentView: ITab = tabStack[tabStack.length - 1];
      return this.matchTabUrl(currentView, url) || (includeChildRoutes && this.isChildRoute(currentView.url, url));
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
      this.touched();
      tab.isTitleLoading = false;
      this.touched();
    }
  }

  private isChildRoute(currentUrl: string, parentUrl: string): boolean {
    return currentUrl.startsWith(parentUrl + '/');
  }

  private matchTabUrl(tab: ITab, url: string): boolean {
    return tab.url === url || tab.clones.indexOf(url) !== -1;
  }
  //#endregion
}
