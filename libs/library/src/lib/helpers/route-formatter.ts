import { ActivatedRouteSnapshot } from '@angular/router';

export abstract class RouterFormatter {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public static getURL(route: ActivatedRouteSnapshot): string {
    let parentRoute = '';
    if (route.parent) {
      parentRoute = this.getURL(route.parent);
    }

    let path = route.routeConfig?.path ?? '';
    route.paramMap.keys
    .forEach(k => {
      path = path.replace(':' + k,
        k === 'view'
        ? ''
        : (route.paramMap.get(k) ?? '')
      );
    });

    if (!route.parent || (parentRoute !== '' && parentRoute !== '/' && route.routeConfig?.path && path)) {
      parentRoute += '/';
    }

    return parentRoute + path;
  }
  //#endregion

  //#region Private methods
  //#endregion
}