import { HttpRequest, HttpHandler, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

// Mock @framework to avoid symlink resolution issues
jest.mock('@framework', () => ({
  APP_CONFIG: 'APP_CONFIG_TOKEN',
  AppConfig: class AppConfig {
    public BASE_URL: string;
    constructor(baseUrl: string) { this.BASE_URL = baseUrl; }
  },
}), { virtual: true });

// Mock services barrel
jest.mock('../../services', () => ({
  AuthenticationService: jest.fn(),
}));

import { AuthInterceptor } from './auth-interceptors';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let mockConfig: any;
  let mockAuthService: any;
  let mockJwtInterceptor: any;
  let mockRouter: jest.Mocked<Partial<Router>>;
  let mockNext: jest.Mocked<HttpHandler>;

  beforeEach(() => {
    mockConfig = { BASE_URL: 'http://api.test.com' };

    mockAuthService = {
      isTokenExpired: false,
      tryRefreshToken: jest.fn(() => of('new-token')),
      signOut: jest.fn(),
    };

    mockJwtInterceptor = {
      isDisallowedRoute: jest.fn(() => false),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockNext = {
      handle: jest.fn(() => of(new HttpResponse({ status: 200 }))),
    } as unknown as jest.Mocked<HttpHandler>;

    interceptor = new (AuthInterceptor as any)(
      mockConfig,
      mockAuthService,
      mockJwtInterceptor,
      mockRouter,
    );
  });

  it('should create', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should pass through requests when token is not expired', () => {
    const req: HttpRequest<unknown> = new HttpRequest('GET', 'http://api.test.com/data');
    interceptor.intercept(req, mockNext).subscribe();
    expect(mockNext.handle).toHaveBeenCalledWith(req);
  });

  it('should pass through requests for non-API URLs', () => {
    const req: HttpRequest<unknown> = new HttpRequest('GET', 'http://other.com/data');
    mockAuthService.isTokenExpired = true;
    interceptor.intercept(req, mockNext).subscribe();
    expect(mockNext.handle).toHaveBeenCalledWith(req);
  });

  it('should pass through requests for disallowed routes', () => {
    const req: HttpRequest<unknown> = new HttpRequest('GET', 'http://api.test.com/data');
    mockJwtInterceptor.isDisallowedRoute.mockReturnValue(true);
    mockAuthService.isTokenExpired = true;
    interceptor.intercept(req, mockNext).subscribe();
    expect(mockNext.handle).toHaveBeenCalledWith(req);
  });

  it('should refresh token when expired and retry request with new token', (done) => {
    const req: HttpRequest<unknown> = new HttpRequest('GET', 'http://api.test.com/data');
    mockAuthService.isTokenExpired = true;

    interceptor.intercept(req, mockNext).subscribe(() => {
      expect(mockAuthService.tryRefreshToken).toHaveBeenCalled();
      expect(mockNext.handle).toHaveBeenCalled();
      const handledReq: HttpRequest<unknown> = (mockNext.handle as jest.Mock).mock.calls[0][0];
      expect(handledReq.headers.get('authorization')).toBe('Bearer new-token');
      done();
    });
  });

  it('should sign out and navigate to /login on 401 during refresh', (done) => {
    const req: HttpRequest<unknown> = new HttpRequest('GET', 'http://api.test.com/data');
    mockAuthService.isTokenExpired = true;
    mockAuthService.tryRefreshToken.mockReturnValue(of('new-token'));
    (mockNext.handle as jest.Mock).mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );

    interceptor.intercept(req, mockNext).subscribe({
      error: () => {
        expect(mockAuthService.signOut).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        done();
      },
    });
  });

  it('should rethrow non-401 errors during refresh', (done) => {
    const req: HttpRequest<unknown> = new HttpRequest('GET', 'http://api.test.com/data');
    mockAuthService.isTokenExpired = true;
    mockAuthService.tryRefreshToken.mockReturnValue(of('new-token'));
    (mockNext.handle as jest.Mock).mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    interceptor.intercept(req, mockNext).subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
        expect(mockAuthService.signOut).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should share refresh token observable for concurrent requests', () => {
    const req: HttpRequest<unknown> = new HttpRequest('GET', 'http://api.test.com/data');
    mockAuthService.isTokenExpired = true;

    // Use a Subject to control when the refresh completes, keeping refreshToken$ alive
    const { Subject } = require('rxjs');
    const refreshSubject = new Subject();
    mockAuthService.tryRefreshToken.mockReturnValue(refreshSubject.asObservable());

    interceptor.intercept(req, mockNext).subscribe();
    interceptor.intercept(req, mockNext).subscribe();

    // tryRefreshToken should only be called once due to shareReplay (refreshToken$ is still pending)
    expect(mockAuthService.tryRefreshToken).toHaveBeenCalledTimes(1);

    // Complete the refresh to clean up
    refreshSubject.next('new-token');
    refreshSubject.complete();
  });
});
