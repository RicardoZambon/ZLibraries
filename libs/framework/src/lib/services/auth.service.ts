import { JwtHelperService } from '@auth0/angular-jwt';
import { map, Observable, of, ReplaySubject, switchMap, take } from 'rxjs';
import { TabService } from './tab.service';

const ADMINISTRATIVE_MASTER_ACTION: string = 'AdministrativeMaster';

export abstract class AuthService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private actionsCache$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  private isActionsCacheInitialized: boolean = false;
  //#endregion

  //#region Properties
  public abstract get adminAction(): string;
  public get isAuthenticated(): boolean {
    return this.username !== null;
  }
  public get isTokenExpired(): boolean {
    return this.token !== null && this.jwtHelper.isTokenExpired(this.token);
  }
  public get token(): string | null {
    return localStorage.getItem('token')
    ?? sessionStorage.getItem('token'); }
  public get userID(): number | undefined { return 0; }
  protected get refreshToken(): string | null {
    return localStorage.getItem('refreshToken')
    ?? sessionStorage.getItem('refreshToken');
  }
  protected get userInfo(): string | null {
    return localStorage.getItem('userInfo')
    ?? sessionStorage.getItem('userInfo');
  }
  protected get username(): string | null {
    return localStorage.getItem('username')
    ?? sessionStorage.getItem('username');
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(
    protected jwtHelper: JwtHelperService,
    protected tabService: TabService,
  ) {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public checkActionIsAllowed(actionToCheck: string): Observable<boolean> {
    if (!this.isActionsCacheInitialized) {
      this.isActionsCacheInitialized = true;

      this.getActions()
        .pipe(take(1))
        .subscribe((actions: string[]) => {
          this.actionsCache$.next(actions);
        });
    }

    return this.actionsCache$
      .pipe(map((actions: string[]) => actions.includes(this.adminAction) || actions.includes(actionToCheck)));
  }

  public checkActionsAreAllowed(actionsToCheck: string[], checkForAdministrativeMaster: boolean = true): Observable<boolean[]> {
    if (!this.isActionsCacheInitialized) {
      this.isActionsCacheInitialized = true;

      this.getActions()
        .pipe(take(1))
        .subscribe((actions: string[]) => {
          this.actionsCache$.next(actions);
        });
    }

    return this.actionsCache$
      .pipe(switchMap((actions: string[]) => of(actionsToCheck.map((actionsToCheck: string) => (checkForAdministrativeMaster && actions.indexOf(ADMINISTRATIVE_MASTER_ACTION) >= 0) || actions.indexOf(actionsToCheck) >= 0))));
  }

  public signOut(): void {
    localStorage.clear();
    sessionStorage.clear();
    
    this.tabService.closeAllTabs();
    this.resetActionsCache();
  }

  protected setStorage(key : 'username' | 'token' | 'refreshToken' | 'userInfo', value : string | null, useLocalStorage: boolean | null = null) {
    if (useLocalStorage === null) {
      useLocalStorage = sessionStorage.getItem(key) === null;
    }

    if (value) {
      if (useLocalStorage) {
        localStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, value);
      }
    } else {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  }
  //#endregion

  //#region Private methods
  protected resetActionsCache(): void {
    this.isActionsCacheInitialized = false;
    this.actionsCache$ = new ReplaySubject<string[]>(1);
  }
  //#endregion

  //#region Abstract methods
  public abstract getActions(): Observable<string[]>;
  //#endregion
}