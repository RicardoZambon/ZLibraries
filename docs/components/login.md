---
title: Login
summary: A ready sign-in screen with username, password, remember me and a language picker.
entryPoint: shared
api: [LoginComponent, LoginLayoutComponent, SharedAuthModule, AuthenticationService]
storybook: shared-auth--login
---

`shared-login` is a complete sign-in screen. It asks for a username and password, offers "remember
me" and a language picker, and signs in through `AuthenticationService`. `shared-login-layout` puts
it on the application backdrop, or on a background picture you configure.

## Usage

Route `SharedAuthModule` at the root of your routes. It serves the layout and the form at `/login`:

```ts
import { Routes } from '@angular/router';
import { MainLayoutComponent, SharedAuthModule } from '@zambon-dev/ui/shared';

export const routes: Routes = [
  { path: '', component: MainLayoutComponent, children: [/* your screens */] },
  { path: '', loadChildren: () => SharedAuthModule },
];
```

Keep the main layout first: both routes start at the empty path. See
[Routes](../guides/getting-started.md#routes) for the full set.

To build your own route, use the two components directly: `LoginLayoutComponent` renders a router
outlet and any projected content, and `LoginComponent` is the form.

### What it needs

- `APP_CONFIG` with an `AppConfig`. The form reads `companyName` and the logo (`loginLogoUrl`, or
  else `logoUrl`); the layout reads `loginBackgroundUrl`.
- `AuthenticationService`, which signs in against your API. See
  [Sign in](../guides/backend-contract.md#sign-in) for the contract.
- `JwtHelperService` from `@auth0/angular-jwt`, `HttpClient` and the router.
- The shared login and language-selector translations. See
  [Internationalization](../guides/internationalization.md).

### What it does

- Both fields are required. Their messages show once the user has left a field.
- While signing in, the form is disabled and the button shows a spinner, then a check mark.
- On success it navigates to the `returnUrl` query parameter, or else to `/`.
- On failure it shows "incorrect username or password" for a 401 and a server error otherwise,
  clears the password and puts focus back on the username.
- "Remember me" keeps the session after the browser closes.

## Accessibility

- Each field has a visible `<label>` and the right `autocomplete` value (`username`,
  `current-password`), so password managers fill them.
- An invalid field carries `aria-invalid`.
- The sign-in error has `role="alert"` and is announced when it appears.
- The submit button is a native submit button, so Enter in either field signs in.
- The logo has an empty `alt`; the heading names the screen.

## Theming

The form has no component tokens. The page behind it uses `--app-backdrop`, and the card is a glass
surface (`--color-surface-glass-strong`, `--blur-glass`). See
[Theming](../guides/design-tokens.md), including the note on overriding `--app-backdrop` in both
themes.
