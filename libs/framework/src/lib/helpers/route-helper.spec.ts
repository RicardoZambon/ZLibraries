import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import { RouteHelper } from './route-helper';

describe('RouteHelper', () => {
  function createRouteSnapshot(segments: string[], component?: any, firstChild?: ActivatedRouteSnapshot, parent?: ActivatedRouteSnapshot, data?: Record<string, any>): ActivatedRouteSnapshot {
    return {
      url: segments.map((s: string) => new UrlSegment(s, {})),
      component,
      data: data ?? {},
      firstChild: firstChild ?? null,
      parent: parent ?? null,
    } as unknown as ActivatedRouteSnapshot;
  }

  describe('getRouteWithComponent', () => {
    it('should return the route if it has the matching component', () => {
      class MyComponent {}
      const route: ActivatedRouteSnapshot = createRouteSnapshot(['test'], MyComponent);

      const result = RouteHelper.getRouteWithComponent(route, MyComponent);

      expect(result).toBe(route);
    });

    it('should search recursively in firstChild', () => {
      class MyComponent {}
      const child: ActivatedRouteSnapshot = createRouteSnapshot(['child'], MyComponent);
      const parent: ActivatedRouteSnapshot = createRouteSnapshot(['parent'], null, child);

      const result = RouteHelper.getRouteWithComponent(parent, MyComponent);

      expect(result).toBe(child);
    });

    it('should return null when component is not found', () => {
      class MyComponent {}
      class OtherComponent {}
      const route: ActivatedRouteSnapshot = createRouteSnapshot(['test'], OtherComponent);

      const result = RouteHelper.getRouteWithComponent(route, MyComponent);

      expect(result).toBeNull();
    });

    it('should return null for null route', () => {
      class MyComponent {}

      expect(RouteHelper.getRouteWithComponent(null, MyComponent)).toBeNull();
    });
  });

  describe('getRouteByData', () => {
    it('should return the route if it has matching data key and value', () => {
      const route: ActivatedRouteSnapshot = createRouteSnapshot(['test'], null, undefined, undefined, { viewType: 'details' });

      const result = RouteHelper.getRouteByData(route, 'viewType', 'details');

      expect(result).toBe(route);
    });

    it('should search recursively in firstChild', () => {
      const child: ActivatedRouteSnapshot = createRouteSnapshot(['child'], null, undefined, undefined, { viewType: 'list' });
      const parent: ActivatedRouteSnapshot = createRouteSnapshot(['parent'], null, child);

      const result = RouteHelper.getRouteByData(parent, 'viewType', 'list');

      expect(result).toBe(child);
    });

    it('should return null when data key is not found', () => {
      const route: ActivatedRouteSnapshot = createRouteSnapshot(['test'], null, undefined, undefined, { other: 'value' });

      const result = RouteHelper.getRouteByData(route, 'viewType', 'details');

      expect(result).toBeNull();
    });

    it('should return null for null route', () => {
      expect(RouteHelper.getRouteByData(null, 'viewType', 'details')).toBeNull();
    });
  });

  describe('getRouteURL', () => {
    it('should build URL from route with parent traversal', () => {
      const root: ActivatedRouteSnapshot = createRouteSnapshot(['app']);
      const child: ActivatedRouteSnapshot = createRouteSnapshot(['users'], null, undefined, root);

      const result: string = RouteHelper.getRouteURL(child, false);

      expect(result).toBe('/app/users');
    });

    it('should build URL from root level traversal', () => {
      const child: ActivatedRouteSnapshot = createRouteSnapshot(['details']);
      const root: ActivatedRouteSnapshot = createRouteSnapshot(['users'], null, child);

      const result: string = RouteHelper.getRouteURL(root, true);

      expect(result).toBe('/users/details');
    });

    it('should return / for empty route', () => {
      const route: ActivatedRouteSnapshot = createRouteSnapshot([]);

      expect(RouteHelper.getRouteURL(route)).toBe('/');
    });
  });
});
