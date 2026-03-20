# @shared Library

Shared application layer providing authentication, common layouts, reusable features (audit history), and cross-cutting utilities. Depends on both `@framework` and `@library`.

Path alias: `@shared` (mapped in `tsconfig.base.json`)

## Commands

```bash
npx nx build shared          # Build the library
npx nx lint shared            # Run ESLint
npx nx test shared            # Run Jest tests
```

## Architecture Overview

The shared library sits between the framework and application layers. It provides concrete implementations of framework abstractions (e.g., `AuthenticationService` extends `AuthService`) and reusable features consumed by multiple apps.

```
@shared
├── Auth           # Guards, interceptors, login components
├── Services       # AuthenticationService, history services
├── Layouts        # MainLayout (sidebar + tabs), LoginLayout
├── Features       # Home, operations history, services history
├── Datasets       # History data sources
├── Components     # FiltersBase
├── Models         # Auth, history interfaces
├── Pipes          # UtcDate, EnumLabel, BypassHtmlSanitizer
└── Helpers        # Date utilities
```

**Dependencies**: `@framework`, `@library`, `@angular/forms`, `@angular/router`, `@auth0/angular-jwt`, `@ngx-translate/core`

## Authentication

### AuthenticationService

**Extends**: `AuthService` from `@framework`
**Scope**: Provided in root

Concrete JWT authentication implementation.

| Method | Purpose |
|--------|---------|
| `authenticate(model)` | POST `/Authentication/SignIn` — stores token, refreshToken, userInfo in storage |
| `tryRefreshToken()` | POST `/Authentication/RefreshToken` — refreshes expired tokens |
| `getActions()` | POST `/Authentication/GetActions` — returns user's allowed actions |
| `getUserInfo()` | Decodes base64 userInfo from storage |

**Storage**: Uses `localStorage` (remember me) or `sessionStorage` for token, refreshToken, and userInfo (base64-encoded).

### AuthGuard

**Implements**: `CanActivate`
**Scope**: Provided in root

Checks `AuthenticationService.isAuthenticated`. Redirects to `/login?returnUrl=...` if not authenticated. Applied to protected routes.

### AuthInterceptor

**Implements**: `HttpInterceptor`
**Scope**: App-provided

HTTP interceptor chain:
1. Checks if request URL matches `AppConfig.BASE_URL`
2. If JWT is expired, attempts silent refresh via `tryRefreshToken()`
3. Injects refreshed token into request headers
4. Handles 401 responses by signing out and redirecting to `/login`

Uses `JwtInterceptor` from `@auth0/angular-jwt` for token validation.

### Auth Components

| Component | Purpose |
|-----------|---------|
| `LoginComponent` | Login form with username/password; emits to `AuthenticationService.authenticate()` |
| `LanguageSelectorComponent` | Language switcher dropdown |

### Auth Routing (AuthModule)

```typescript
{ path: '', component: LoginLayoutComponent }
{ path: 'login', component: LoginComponent }
```

## Layouts

### MainLayoutComponent

**Selector**: `shared-main-layout`

Primary application layout combining sidebar navigation with the tab system.

- Renders `SidebarComponent` (from `@library`) + `TabsComponent` (from `@framework`) + `<router-outlet>`
- Listens to `SidebarService.menuUrlSelected` → opens tabs via `TabService.openTab()`
- Provides logout modal with confirmation
- Syncs sidebar menu labels with active tab titles

### LoginLayoutComponent

**Selector**: `shared-login-layout`

Simple wrapper layout for the login page.

## Features

### Home

`HomeComponent` — placeholder home/dashboard page.

### Services History

Reusable audit log feature for entity service history. Used across apps via route configuration.

| Component | Purpose |
|-----------|---------|
| `ServicesHistoryViewComponent` | Tab view for service audit log |
| `ServicesHistoryChildListComponent` | Child list displaying service history entries |

**Service**: `ServicesHistoryService` — POSTs to `/{controllerName}/{entityID}/Audit` endpoints.
**Dataset**: `ServicesHistoryDataset` — integrates with the service for paginated loading.

### Operations History

Detailed operation-level audit log, typically shown within a service history entry.

| Component | Purpose |
|-----------|---------|
| `OperationsHistoryChildListComponent` | Child list displaying operation details |
| `OperationsHistoryModalComponent` | Modal for viewing operation details |

**Service**: `OperationsHistoryService` — POSTs to `/{controllerName}/{entityID}/Audit/{serviceHistoryID}` endpoints.
**Dataset**: `OperationsHistoryDataset` — integrates with the service for paginated loading.

## Services

| Service | Scope | Purpose |
|---------|-------|---------|
| `AuthenticationService` | Root | JWT auth (extends `@framework` AuthService) |
| `ServicesHistoryService` | Root | Service-level audit log API calls |
| `OperationsHistoryService` | Root | Operation-level audit log API calls |

## Models

| Model | Purpose |
|-------|---------|
| `IAuthResponse` | Login response (extends ICurrentUserInfo + tokens) |
| `ICurrentUserInfo` | User profile (costCenterName, name) |
| `IServicesHistoryList` | Service audit log entry |
| `IOperationsHistoryList` | Operation audit log entry |

## Pipes

| Pipe | Purpose |
|------|---------|
| `UtcDatePipe` | Converts UTC date strings to local timezone display |
| `EnumLabelPipe` | Translates enum values to human-readable labels |
| `BypassHtmlSanitizerPipe` | Bypasses DomSanitizer for trusted HTML content |

## Components

### FiltersBase

Abstract base class for filter components. Standardizes the filter UI pattern across list views.

## Helpers

| Helper | Purpose |
|--------|---------|
| `DateHelpers` | Shared date manipulation and formatting utilities |

## i18n

Translation files for shared features:

```
src/i18n/
└── services-history/
    ├── en.json    # English translations for audit history
    └── pt.json    # Portuguese translations for audit history
```

## Testing Patterns

```bash
npx nx test shared                    # All shared tests
npx jest --config libs/shared/jest.config.ts --testPathPattern="my-service"  # Single test
```
