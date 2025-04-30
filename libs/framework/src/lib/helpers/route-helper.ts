import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router';

export abstract class RouteHelper {
  public static getRouteWithComponent(routeSnapshot: ActivatedRouteSnapshot | null, componentName: string): ActivatedRouteSnapshot | null {
    if (!routeSnapshot) {
      return null;
    }
    return routeSnapshot.component?.name === componentName ? routeSnapshot : this.getRouteWithComponent(routeSnapshot.firstChild, componentName);
  }

  public static getRouteURL(route: ActivatedRouteSnapshot, rootLevel: boolean = false): string {
    let segments: string[] = [];
    
    const buildRoute: (route: ActivatedRouteSnapshot | null) => void = (route: ActivatedRouteSnapshot | null): void => {
      if (route) {
        if (route.url.length) {
          segments.push(...route.url.map((segment: UrlSegment) => segment.path));
        }
        buildRoute(rootLevel ? route.firstChild : route.parent);
      }
    };

    buildRoute(route);

    if (!rootLevel) {
      segments = segments.reverse();
    }

    return `/${segments.join('/')}`;
  }
}