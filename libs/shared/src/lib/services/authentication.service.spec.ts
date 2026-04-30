import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

// Mock @zambon/framework to avoid symlink resolution issues
jest.mock('@zambon/framework', () => ({
  APP_CONFIG: 'APP_CONFIG_TOKEN',
  AppConfig: class AppConfig {
    public BASE_URL: string;
    constructor(baseUrl: string) { this.BASE_URL = baseUrl; }
  },
  AuthService: class AuthService {
    protected jwtHelper: any;
    protected tabService: any;
    constructor(jwtHelper: any, tabService: any) {
      this.jwtHelper = jwtHelper;
      this.tabService = tabService;
    }
    public get isAuthenticated(): boolean { return false; }
    public get isTokenExpired(): boolean { return false; }
    public get token(): string | null { return null; }
    protected get refreshToken(): string | null {
      return localStorage.getItem('refreshToken') ?? sessionStorage.getItem('refreshToken');
    }
    protected get userInfo(): string | null {
      return localStorage.getItem('userInfo') ?? sessionStorage.getItem('userInfo');
    }
    protected get username(): string | null {
      return localStorage.getItem('username') ?? sessionStorage.getItem('username');
    }
    protected setStorage(key: string, value: string | null, useLocalStorage: boolean | null = null) {
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
    public signOut(): void {
      localStorage.clear();
      sessionStorage.clear();
    }
  },
  TabService: jest.fn(),
}), { virtual: true });

import { AuthenticationService } from './authentication.service';

interface IAuthResponse {
  username: string;
  token: string;
  refreshToken: string;
  refreshTokenExpiration: string;
  name: string;
  costCenterName: string;
}

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let mockHttp: jest.Mocked<Partial<HttpClient>>;
  let mockJwtHelper: any;
  let mockTabService: any;
  let mockConfig: any;

  const mockAuthResponse: IAuthResponse = {
    username: 'testuser',
    token: 'test-jwt-token',
    refreshToken: 'test-refresh-token',
    refreshTokenExpiration: '2026-12-31',
    name: 'Test User',
    costCenterName: 'Test Center',
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    mockConfig = { BASE_URL: 'http://api.test.com' };

    mockHttp = {
      post: jest.fn(),
    };

    mockJwtHelper = {
      isTokenExpired: jest.fn(() => false),
    };

    mockTabService = {
      closeAllTabs: jest.fn(),
    };

    service = new (AuthenticationService as any)(
      mockConfig,
      mockHttp,
      mockJwtHelper,
      mockTabService,
    );
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should set BASE_URL from config', () => {
    expect((service as any).BASE_URL).toBe('http://api.test.com/Authentication');
  });

  it('should have adminAction set to AdministrativeMaster', () => {
    expect(service.adminAction).toBe('AdministrativeMaster');
  });

  describe('authenticate', () => {
    const model = { username: 'testuser', password: 'pass123', rememberMe: true };

    it('should POST to SignIn endpoint', (done) => {
      (mockHttp.post as jest.Mock).mockReturnValue(of(mockAuthResponse));

      service.authenticate(model).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'http://api.test.com/Authentication/SignIn',
          model,
        );
        done();
      });
    });

    it('should store auth data in localStorage when rememberMe is true', (done) => {
      (mockHttp.post as jest.Mock).mockReturnValue(of(mockAuthResponse));

      service.authenticate(model).subscribe(() => {
        expect(localStorage.getItem('username')).toBe('testuser');
        expect(localStorage.getItem('token')).toBe('test-jwt-token');
        expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
        expect(localStorage.getItem('userInfo')).toBeTruthy();
        done();
      });
    });

    it('should store auth data in sessionStorage when rememberMe is false', (done) => {
      (mockHttp.post as jest.Mock).mockReturnValue(of(mockAuthResponse));

      service.authenticate({ ...model, rememberMe: false }).subscribe(() => {
        expect(sessionStorage.getItem('username')).toBe('testuser');
        expect(sessionStorage.getItem('token')).toBe('test-jwt-token');
        done();
      });
    });

    it('should throw InvalidUsernamePassword on 401 error', (done) => {
      (mockHttp.post as jest.Mock).mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401 }))
      );

      service.authenticate(model).subscribe({
        error: (err: string) => {
          expect(err).toBe('InvalidUsernamePassword');
          done();
        },
      });
    });

    it('should throw InternalServerError on non-401 error', (done) => {
      (mockHttp.post as jest.Mock).mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500 }))
      );

      service.authenticate(model).subscribe({
        error: (err: string) => {
          expect(err).toBe('InternalServerError');
          done();
        },
      });
    });
  });

  describe('getActions', () => {
    it('should POST to GetActions endpoint', () => {
      (mockHttp.post as jest.Mock).mockReturnValue(of(['action1', 'action2']));

      service.getActions().subscribe((actions: string[]) => {
        expect(actions).toEqual(['action1', 'action2']);
      });

      expect(mockHttp.post).toHaveBeenCalledWith(
        'http://api.test.com/Authentication/GetActions',
        {},
      );
    });
  });

  describe('getUserInfo', () => {
    it('should return null when no userInfo is stored', () => {
      expect(service.getUserInfo()).toBeNull();
    });

    it('should return decoded user info from localStorage', () => {
      const userInfo = { name: 'Test User', costCenterName: 'Center' };
      localStorage.setItem('userInfo', window.btoa(JSON.stringify(userInfo)));

      const result = service.getUserInfo();
      expect(result).toEqual(userInfo);
    });

    it('should return decoded user info from sessionStorage', () => {
      const userInfo = { name: 'Session User', costCenterName: 'Center' };
      sessionStorage.setItem('userInfo', window.btoa(JSON.stringify(userInfo)));

      const result = service.getUserInfo();
      expect(result).toEqual(userInfo);
    });
  });

  describe('tryRefreshToken', () => {
    it('should POST to RefreshToken endpoint', (done) => {
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('refreshToken', 'old-refresh');
      (mockHttp.post as jest.Mock).mockReturnValue(of(mockAuthResponse));

      service.tryRefreshToken().subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'http://api.test.com/Authentication/RefreshToken',
          { username: 'testuser', refreshToken: 'old-refresh' },
        );
        done();
      });
    });

    it('should update stored token after refresh', (done) => {
      sessionStorage.setItem('username', 'testuser');
      sessionStorage.setItem('refreshToken', 'old-refresh');
      (mockHttp.post as jest.Mock).mockReturnValue(of(mockAuthResponse));

      service.tryRefreshToken().subscribe(() => {
        expect(
          sessionStorage.getItem('token') || localStorage.getItem('token')
        ).toBe('test-jwt-token');
        done();
      });
    });

    it('should return the new token string', (done) => {
      (mockHttp.post as jest.Mock).mockReturnValue(of(mockAuthResponse));

      service.tryRefreshToken().subscribe((token: string) => {
        expect(token).toBe('test-jwt-token');
        done();
      });
    });
  });
});
