import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// Mock the @framework module to avoid symlink resolution issues
jest.mock('@framework', () => ({}), { virtual: true });
// Mock the services barrel to avoid pulling in AuthenticationService's full import chain
jest.mock('../../services', () => ({
  AuthenticationService: jest.fn(),
}));

// Import after mocks
import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: any;
  let mockRouter: jest.Mocked<Partial<Router>>;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: true,
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    guard = new (AuthGuard as any)(
      mockAuthService,
      mockRouter,
    );
  });

  it('should create', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true when user is authenticated', () => {
    mockAuthService.isAuthenticated = true;
    const result: boolean = guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/dashboard' } as RouterStateSnapshot,
    );
    expect(result).toBe(true);
  });

  it('should not navigate when user is authenticated', () => {
    mockAuthService.isAuthenticated = true;
    guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/dashboard' } as RouterStateSnapshot,
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return false when user is not authenticated', () => {
    mockAuthService.isAuthenticated = false;
    const result: boolean = guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/dashboard' } as RouterStateSnapshot,
    );
    expect(result).toBe(false);
  });

  it('should navigate to /login with returnUrl when not authenticated', () => {
    mockAuthService.isAuthenticated = false;
    guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/some/page' } as RouterStateSnapshot,
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: '/some/page' } },
    );
  });
});
