# Security policy

## Supported versions

Only the latest release of `@zambon-dev/ui` receives security fixes.

| Package                                                              | Supported                  |
| -------------------------------------------------------------------- | -------------------------- |
| `@zambon-dev/ui`, latest minor                                       | Yes                        |
| `@zambon-dev/ui`, older versions                                     | No. Upgrade to the latest. |
| `@zambon-dev/library`, `@zambon-dev/framework`, `@zambon-dev/shared` | No. These are retired.     |

## Reporting a vulnerability

Do not open a public issue for a security problem.

Report it privately through GitHub instead:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe the problem, the affected version, and the steps to reproduce it.

You can expect a first reply within seven days. Once the problem is confirmed, the fix ships as a
patch release, and the advisory is published with it.

The package ships authentication code: a JWT auth service, an HTTP interceptor and token storage.
Reports about those parts are especially welcome.
