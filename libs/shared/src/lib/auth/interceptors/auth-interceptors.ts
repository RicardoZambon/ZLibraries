import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtInterceptor } from '@auth0/angular-jwt';
import { APP_CONFIG, AppConfig } from '@framework';
import { catchError, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { AuthenticationService } from '../../services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private refreshToken$?: Observable<string>;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private authenticationService: AuthenticationService,
    private jwtInterceptor: JwtInterceptor,
    private router: Router,
  ) {}
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (
      request.url.indexOf(this.config.BASE_URL) >= 0 &&
      !this.jwtInterceptor.isDisallowedRoute(request) &&
      this.authenticationService.isTokenExpired
    ) {
      if (!this.refreshToken$) {
        this.refreshToken$ = this.authenticationService.tryRefreshToken()
          .pipe(
            shareReplay(),
            tap(() => {
              this.refreshToken$ = undefined;
            })
          );
      }

      return this.refreshToken$!
        .pipe(
          switchMap((token: string) => {
            return next.handle(
              request.clone({ setHeaders: { authorization: `Bearer ${token}` } })
            );
          }),
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              this.authenticationService.signOut();
              this.router.navigate(['/login']);
            }
            throw err;
          })
        );
    }
    return next.handle(request);
  }
  //#endregion

  //#region Private methods
  //#endregion
}