import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { APP_CONFIG, AppConfig, AuthService, TabService } from '@framework';
import { Observable, catchError, interval, map, mergeMap, tap } from 'rxjs';
import { IAuthResponse, ICurrentUserInfo } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends AuthService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion
  
  //#region Variables
  public adminAction: string = 'AdministrativeMaster';

  private readonly BASE_URL: string;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private http: HttpClient,
    jwtHelper: JwtHelperService,
    tabService: TabService,
  ) {
    super(jwtHelper, tabService);
    this.BASE_URL = `${this.config.BASE_URL}/Authentication`;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public authenticate(model: { username: string, password: string, rememberMe: boolean }): Observable<void> {
    return this.http
      .post<IAuthResponse>(`${this.BASE_URL}/SignIn`, model)
      .pipe(
        map((res: IAuthResponse) => {
          this.setStorage('username', res.username, model.rememberMe);
          this.setStorage('token', res.token, model.rememberMe);
          this.setStorage('refreshToken', res.refreshToken, model.rememberMe);
          this.setStorage('userInfo',  window.btoa(JSON.stringify(res as ICurrentUserInfo)), model.rememberMe);
        }),
        catchError((error: HttpErrorResponse) =>
          interval(1000)
          .pipe(
            mergeMap(() => {
              switch(error.status) {
                case 401:
                  throw 'InvalidUsernamePassword';
                default:
                  throw 'InternalServerError';
              }
            })
          )
        )
      );
  }

  public getActions(): Observable<string[]> {
    return this.http.post<string[]>(`${this.BASE_URL}/GetActions`, {})
  }

  public getUserInfo(): ICurrentUserInfo | null {
    const userInfo: string | null = this.userInfo;
    if (userInfo) {
      return JSON.parse(window.atob(userInfo)) as ICurrentUserInfo;
    }
    return null;
  }

  public tryRefreshToken(): Observable<string> {
    return this.http
      .post<IAuthResponse>(`${this.BASE_URL}/RefreshToken`, {
        username: this.username ?? '',
        refreshToken: this.refreshToken ?? ''
      })
      .pipe(
        tap((res: IAuthResponse) => {
          this.setStorage('token', res.token);
          this.setStorage('refreshToken', res.refreshToken);
          this.setStorage('userInfo', window.btoa(JSON.stringify(res as ICurrentUserInfo)));
        }),
        map((res: IAuthResponse) => res.token ?? '')
      );
  }
  //#endregion

  //#region Private methods
  //#endregion
}