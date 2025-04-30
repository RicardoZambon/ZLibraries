import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authenticationService.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    return true;
  }
  //#endregion

  //#region Private methods
  //#endregion
}