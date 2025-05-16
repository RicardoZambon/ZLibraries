import { Inject } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, UrlSegment } from '@angular/router';
import { TabService } from './tab.service';

@Inject({})
export class CustomReuseStrategy implements RouteReuseStrategy {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private cachedHandles: { [key: string]: DetachedRouteHandle | null } = {};

  public clones: { [key: string]: string } = {};
  public redirects: { [key: string]: string } = {};
  //#endregion

  //#region Properties
  public tabService?: TabService;
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public clearAllHandles(): void {
    this.cachedHandles = {};
  }

  public clearHandle(url: string): void {
    const keysToRemove: string[] = Object.keys(this.cachedHandles)
      .filter((key: string) => key.startsWith(`${url}-`));

    keysToRemove.forEach((key: string) => {
      const handle: DetachedRouteHandle | null = this.cachedHandles[key];

      if (handle) {
        if ((<any>handle)?.componentRef?.instance?.ngOnDestroy) {
          (<any>handle).componentRef.instance.ngOnDestroy();
        }
      }
      delete this.cachedHandles[key];
    });
  }

  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.component) {
      return null;
    }

    const cacheKey: string = this.getCacheKey(route);
    return this.cachedHandles[cacheKey];
  }

  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const url: string = this.getUrlFromRoute(route);
    const hasComponent: boolean = !!route.component;

    if ((this.tabService?.isUrlOpen(url) ?? false) && hasComponent)
    {
      const cacheKey: string = this.getCacheKey(route);
      const isCached: boolean = !!this.cachedHandles[cacheKey];
      return isCached;
    }
    return false;
  }

  public shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const url: string = this.getUrlFromRoute(route);
    const hasComponent: boolean = !!route.component;

    return (this.tabService?.isUrlOpen(url) ?? false) && hasComponent;
  }

  public shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    const futureUrl: string = this.getUrlFromRoute(future);
    const currentUrl: string = this.getUrlFromRoute(current);

    return (futureUrl === currentUrl && future.routeConfig === current.routeConfig) || this.redirects[currentUrl] === futureUrl || this.clones[futureUrl] === currentUrl;
  }

  public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const cacheKey: string = this.getCacheKey(route);
    this.cachedHandles[cacheKey] = handle;
  }
  //#endregion

  //#region Private methods
  private getCacheKey(route: ActivatedRouteSnapshot): string {
    let url: string = this.getUrlFromRoute(route);
    if (this.clones[url]) {
      url = this.clones[url];
    }

    const componentName: string = route.component?.name ?? '';
    return `${url}-${componentName}`;
  }

  private getUrlFromRoute(route: ActivatedRouteSnapshot): string {
    const segments: string[] = [];

    const buildRoute: (route: ActivatedRouteSnapshot | null) => void = (route: ActivatedRouteSnapshot | null): void => {
      if (!!route) {
        if (!!route.url.length) {
          segments.push(...route.url.map((segment: UrlSegment) => segment.path));
        }
        buildRoute(route.parent);
      }
    };

    buildRoute(route);

    return `/${segments.reverse().join('/')}`;
  }
  //#endregion
}