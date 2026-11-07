import { JwtHelperService } from '@auth0/angular-jwt';
import { map, Observable, of, ReplaySubject, switchMap, take } from 'rxjs';
import { TabService } from './tab.service';

const ADMINISTRATIVE_MASTER_ACTION = 'AdministrativeMaster';

/**
 * Base for the app's authentication service. Reads the stored session token and checks which
 * actions the signed-in user may perform. The app extends it and supplies `getActions()`.
 */
export abstract class AuthService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private actionsCache$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  private isActionsCacheInitialized = false;
  //#endregion

  //#region Properties
  /** Name of the action that grants every permission in `checkActionIsAllowed()`. */
  public abstract get adminAction(): string;
  /** `true` when a username is stored for the session. */
  public get isAuthenticated(): boolean {
    return this.username !== null;
  }
  /** `true` when a token is stored and it has expired. */
  public get isTokenExpired(): boolean {
    return this.token !== null && this.jwtHelper.isTokenExpired(this.token);
  }
  /** The stored access token, from local or session storage, or `null`. */
  public get token(): string | null {
    return localStorage.getItem('token') ?? sessionStorage.getItem('token');
  }
  /** ID of the signed-in user. The base class always returns `0`; override it to supply the real ID. */
  public get userID(): number | undefined {
    return 0;
  }
  protected get refreshToken(): string | null {
    return localStorage.getItem('refreshToken') ?? sessionStorage.getItem('refreshToken');
  }
  protected get userInfo(): string | null {
    return localStorage.getItem('userInfo') ?? sessionStorage.getItem('userInfo');
  }
  protected get username(): string | null {
    return localStorage.getItem('username') ?? sessionStorage.getItem('username');
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected jwtHelper: JwtHelperService,
    protected tabService: TabService,
  ) {}
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  /**
   * Emits whether the user may perform an action. Holding `adminAction` allows every action.
   * The user's actions are loaded once and cached.
   */
  public checkActionIsAllowed(actionToCheck: string): Observable<boolean> {
    if (!this.isActionsCacheInitialized) {
      this.isActionsCacheInitialized = true;

      this.getActions()
        .pipe(take(1))
        .subscribe((actions: string[]) => {
          this.actionsCache$.next(actions);
        });
    }

    return this.actionsCache$.pipe(
      map((actions: string[]) => actions.includes(this.adminAction) || actions.includes(actionToCheck)),
    );
  }

  /**
   * Emits, for each action in `actionsToCheck`, whether the user may perform it.
   *
   * @param checkForAdministrativeMaster Whether holding `AdministrativeMaster` allows every action. Defaults to `true`.
   */
  public checkActionsAreAllowed(actionsToCheck: string[], checkForAdministrativeMaster = true): Observable<boolean[]> {
    if (!this.isActionsCacheInitialized) {
      this.isActionsCacheInitialized = true;

      this.getActions()
        .pipe(take(1))
        .subscribe((actions: string[]) => {
          this.actionsCache$.next(actions);
        });
    }

    return this.actionsCache$.pipe(
      switchMap((actions: string[]) =>
        of(
          actionsToCheck.map(
            (actionsToCheck: string) =>
              (checkForAdministrativeMaster && actions.indexOf(ADMINISTRATIVE_MASTER_ACTION) >= 0) ||
              actions.indexOf(actionsToCheck) >= 0,
          ),
        ),
      ),
    );
  }

  /** Clears local and session storage, closes every tab and forgets the cached actions. */
  public signOut(): void {
    localStorage.clear();
    sessionStorage.clear();

    this.tabService.closeAllTabs();
    this.resetActionsCache();
  }

  protected setStorage(
    key: 'username' | 'token' | 'refreshToken' | 'userInfo',
    value: string | null,
    useLocalStorage: boolean | null = null,
  ) {
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
  /** Loads the names of the actions the signed-in user may perform. */
  public abstract getActions(): Observable<string[]>;
  //#endregion
}
