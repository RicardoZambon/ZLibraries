import { Injectable } from '@angular/core';
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
    return this.openTabs.map((tabs: ITab[]) => tabs[tabs.length - 1]) ?? [];
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(
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
    this.navigateTo(tab);
  }

  public closeActiveTab(): void {
    this.closeTab(this.activeTabIndex);
  }

  public closeAllTabs(): void {
    this.openTabs = [];
    this.activeTabIndex = -1;
    this.customReuseStrategy.clearAllHandles();
  }

  public closeTab(index: number): void {
    if (index > this.activeTabs.length - 1 || this.activeTabs.length === 0) {
      return;
    }

    const closedTab: ITab[] = this.openTabs[index];
    this.openTabs.splice(index, 1);
    
    if (this.activeTabIndex >= this.activeTabs.length) {
      this.activeTabIndex = this.activeTabs.length - 1;
    }

    closedTab.forEach((tab: ITab) => {
      if (!this.isUrlOpen(tab.url)) {
        // Tab is not in use by any other tab, we're clear to remove.
        this.customReuseStrategy.clearHandle(tab.url);
      }
    });
    
    this.navigateTo(this.activeTabs[this.activeTabIndex]);
  }

  public isTabActive(tab: ITab): boolean {
    return this.activeTabs[this.activeTabIndex] === tab;
  }

  public isUrlOpen(url: string): boolean {
    return this.openTabs
      .flatMap((tabs: ITab[]) => tabs)
      .some((tab: ITab) => tab.url === url);
  }

  public navigateCurrentTab(tab: ITab): void {
    if (!this.activeTab) {
      return;
    }

    const existingTab: ITab | undefined = this.activeTab.find((t: ITab) => t.url === tab.url);
    if (existingTab) {
      // If the URL is active in the current tab, we need to navigate back.
      this.navigateCurrentTabBack(existingTab);
      return;
    }

    this.activeTab.push(tab);
    this.navigateTo(tab);
  }

  public navigateCurrentTabBack(tab: ITab): void {
    if (!this.activeTab) {
      return;
    }

    if (this.isUrlOpen(tab.url)) {
      // If the URL is active in other tab, we need to focus the tab.
      const tabIndex: number = this.activeTabs.findIndex((t: ITab) => t.url === tab.url);
      if (tabIndex !== -1) {
        this.activateTab(this.activeTabs[tabIndex]);
        return;
      }
    }

    const lastIndex: number = this.activeTab.lastIndexOf(tab);
    if (lastIndex !== -1) {
      this.activeTab.slice(lastIndex + 1)
        .forEach((tab: ITab) => {
          this.customReuseStrategy.clearHandle(tab.url);
        });

      this.openTabs[this.activeTabIndex] = this.activeTab.slice(0, lastIndex + 1);
    }

    this.navigateTo(tab);
  }

  public openTab(tab: ITab): void {
    const openTab: ITab | undefined = this.getActiveTab(tab.url);
    if (openTab) {
      this.activateTab(openTab);
      return;
    }

    this.openTabs.push([]);
    this.activeTabIndex = this.openTabs.length - 1;
    this.navigateCurrentTab(tab);
  }

  public redirectCurrentTab(url: string): void {
    if (!this.activeTab) {
      return;
    }

    const tab: ITab = this.activeTab[this.activeTab.length - 1];

    this.customReuseStrategy.redirects[tab.url] = url;
    tab.url = url;

    this.navigateTo(tab);
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
  private getActiveTab(url: string): ITab | undefined {
    return this.activeTabs
      .find((tab: ITab) => tab.url === url);
  }

  public navigateTo(tab: ITab | undefined): void {
    const url: string = tab?.url ?? '/';
    this.router.navigate([ url ])
      .then(() => {
        this.customReuseStrategy.redirects = {};
      });
  }
  //#endregion
}