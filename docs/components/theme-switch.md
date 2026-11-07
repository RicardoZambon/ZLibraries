---
title: Theme switch
summary: One button that steps between the light theme, the dark theme and the system setting.
entryPoint: shared
api: [ThemeSwitchComponent, ThemeService]
storybook: shared-theme-switch--primary
---

`shared-theme-switch` lets the user choose light, dark or "follow the system". Each click moves to
the next choice. The icon shows the choice in force, not the one the next click brings. The choice is
kept in the browser and applied to the whole page.

<!-- example: theme-switch-basic -->

## Usage

The [main layout](./main-layout.md)'s top bar already includes the switch. Place it yourself only in
your own shell:

```ts
import { ThemeSwitchComponent } from '@zambon-dev/ui/shared';
```

```html
<shared-theme-switch></shared-theme-switch>
```

The switch has no inputs. It drives `ThemeService`, which is provided at the root. Read the service
to react to the theme, or call `setPreference()` to set it from your own control:

```ts
import { inject } from '@angular/core';
import { ThemeService } from '@zambon-dev/ui/shared';

const theme = inject(ThemeService);
theme.resolved(); // 'light' or 'dark', what is applied now
```

The service writes `data-theme="light"` or `data-theme="dark"` on `<html>`. With `system`, it follows
the operating system as it changes. To avoid a frame of the wrong theme on load, add the small
script from [Avoiding a flash of the wrong theme](../guides/design-tokens.md#avoiding-a-flash-of-the-wrong-theme)
to your `index.html`.

The switch's labels are keys from the shared top-bar translations (`TopBar-Theme-Light`,
`TopBar-Theme-Dark`, `TopBar-Theme-System`). See [Internationalization](../guides/internationalization.md).

## Accessibility

The switch is a [button](./button.md) with an icon only. Its accessible name and tooltip are the
translated name of the current choice, such as "Light theme". Enter and Space activate it.

## Theming

The switch is a `ghost` button and takes its styling from [button](./button.md#theming). For the
light and dark token sets, see [Light and dark themes](../guides/design-tokens.md#light-and-dark-themes).
