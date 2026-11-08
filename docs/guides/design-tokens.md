# Theming

`@zambon-dev/ui` is themed with CSS custom properties. This page lists the tokens, says which ones
you can override, and explains the light and dark themes.

## Before you start

The tokens come from the package stylesheets. [Getting started](./getting-started.md) shows how to
add them to your build. In short:

- `@zambon-dev/ui/styles/theme.css` defines the core tokens and the dark theme.
- `@zambon-dev/ui/styles/common.scss` includes `@zambon-dev/ui/styles/variables.scss`, which
  defines the component tokens.

Without `theme.css`, every component colour resolves to nothing and the components render
transparent.

## Two kinds of token

- **Component tokens** (`--sidebar-*`, `--tabs-*`, `--app-backdrop`) style one component each.
  They are the published contract. Override these.
- **Core tokens** name a role, such as a surface, a piece of text or a line. Component tokens
  derive from them. The core is an implementation detail and may gain or lose tokens.

## Overriding a component token

Write the override in your own global stylesheet, on `:root`, **without** a cascade layer:

```css
:root {
  --sidebar-bg: color-mix(in srgb, #1b4332 82%, transparent);
}
```

The package declares its component tokens inside `@layer tokens`. An unlayered declaration beats
any layer, so your override wins whatever the import order.

An override on `:root` holds in both themes. To give the dark theme its own value, add a second
rule:

```css
:root[data-theme='dark'] {
  --sidebar-bg: color-mix(in srgb, #0b1f14 82%, transparent);
}
```

**Exception: `--app-backdrop`.** The dark theme sets its own `--app-backdrop` on
`:root[data-theme='dark']`. That selector is more specific than `:root`, so a plain `:root`
override is lost in the dark theme. Override it in both places:

```css
:root {
  --app-backdrop: linear-gradient(160deg, #f1f5f9 0%, #cbd5e1 100%);
}

:root[data-theme='dark'] {
  --app-backdrop: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
}
```

The dark theme sets no other component token.

## Component token reference

Defaults are shown as the core token they derive from. Tokens marked _unused_ are still declared
but no component reads them.

### Sidebar

| Token                             | Default                               | Role                                                     |
| --------------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `--sidebar-collapsed-width`       | `70px`                                | Width of the collapsed rail.                             |
| `--sidebar-expanded-width`        | `220px`                               | Width when expanded.                                     |
| `--sidebar-icon-collapsed-margin` | `10px`                                | Left margin of a menu icon in the collapsed rail.        |
| `--sidebar-item-height`           | `2.75rem`                             | Height of a menu row.                                    |
| `--sidebar-logo-height`           | `50px`                                | _Unused._                                                |
| `--sidebar-picture-size`          | `50px`                                | _Unused._                                                |
| `--sidebar-animation-duration`    | `var(--duration-long)`                | Duration of the expand, collapse and submenu animations. |
| `--sidebar-bg`                    | `var(--color-surface-brand)`          | Sidebar background.                                      |
| `--sidebar-nav-bg`                | 5% white                              | Background of the menu list and its loading state.       |
| `--sidebar-text`                  | `var(--color-content-on-brand)`       | Menu text and icons.                                     |
| `--sidebar-text-muted`            | `var(--color-content-on-brand-muted)` | Region headers and the footer (the app version).         |
| `--sidebar-item-hover-bg`         | `var(--state-hover-on-brand)`         | Menu row on hover.                                       |
| `--sidebar-item-selected-bg`      | `var(--state-selected-on-brand)`      | Selected menu row.                                       |
| `--sidebar-item-selected-text`    | `var(--color-content-on-accent)`      | Text of the selected menu row.                           |
| `--sidebar-accent`                | `var(--color-content-on-brand)`       | _Unused._                                                |
| `--sidebar-tree-line`             | `var(--color-line-on-brand)`          | Lines that connect a submenu to its parent.              |
| `--sidebar-blur`                  | `var(--blur-glass)`                   | Backdrop blur behind the sidebar.                        |
| `--sidebar-shadow`                | `var(--shadow-float-strong)`          | Sidebar shadow.                                          |
| `--sidebar-radius`                | `var(--radius-surface)`               | Corner radius of the sidebar.                            |
| `--sidebar-item-radius`           | `var(--radius-control)`               | Corner radius of a menu row.                             |

### Tabs

| Token                     | Default                             | Role                                                       |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| `--tabs-item-bg`          | `var(--color-surface-glass-weak)`   | Tab at rest.                                               |
| `--tabs-item-hover-bg`    | `var(--color-surface-glass)`        | Tab and breadcrumb on hover.                               |
| `--tabs-item-active-bg`   | `var(--color-surface-glass-strong)` | Active tab.                                                |
| `--tabs-item-text`        | `var(--color-content-secondary)`    | Tab and breadcrumb text.                                   |
| `--tabs-item-active-text` | `var(--color-content-primary)`      | Text of the active tab and current breadcrumb.             |
| `--tabs-content-bg`       | `var(--color-surface-glass-strong)` | Panel that holds the views. Matches the active tab.        |
| `--tabs-border`           | `var(--color-line-on-glass)`        | Borders of the tabs and breadcrumbs.                       |
| `--tabs-close`            | `var(--color-content-subtle)`       | Close button icon and breadcrumb separators.               |
| `--tabs-close-hover-bg`   | `var(--state-pressed)`              | Close button background on hover or focus.                 |
| `--tabs-close-hover`      | gray 700                            | Close button icon on hover or focus.                       |
| `--tabs-blur`             | `var(--blur-glass)`                 | Backdrop blur behind the tabs and panel.                   |
| `--tabs-shadow`           | `var(--shadow-float)`               | Shadow of the tabs and panel.                              |
| `--tabs-radius`           | `var(--radius-surface)`             | Corner radius of the panel.                                |
| `--tabs-item-radius`      | `var(--radius-control)`             | Corner radius of a tab.                                    |
| `--tabs-height`           | `2.75rem`                           | Height of the tab strip.                                   |
| `--tabs-item-max-width`   | `14rem`                             | Widest a tab grows.                                        |
| `--tabs-item-min-width`   | `7rem`                              | Narrowest a tab shrinks before the strip starts to scroll. |
| `--tabs-scroll-width`     | `1.75rem`                           | Width of the scroll buttons at each end of the strip.      |
| `--tabs-fade-width`       | `1.5rem`                            | Width of the fade at a scrollable edge.                    |

### Application

| Token            | Default                        | Role                                                                                      |
| ---------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| `--app-backdrop` | Gray gradient (light and dark) | Background behind the main layout and the sign-in screen. Override per theme (see above). |

## Core tokens

The core is listed so you can use it in your own styles. Do not override it to restyle a
component: override the component token instead.

### Tailwind utilities

These tokens are declared in Tailwind's `@theme`, so each one is also a utility in your templates,
for example `bg-surface-glass`, `text-content-secondary`, `border-line`, `rounded-surface`,
`shadow-float`, `backdrop-blur-glass`, `ease-standard`, `text-body` and `font-ui`.

| Tokens                                                                                                                                                                                    | Role                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--color-primary-50` … `--color-primary-900`                                                                                                                                              | The raw brand ramp.                                                                                              |
| `--color-surface-brand`, `--color-surface-glass-weak`, `--color-surface-glass`, `--color-surface-glass-strong`, `--color-surface-solid`, `--color-surface-inset`, `--color-surface-scrim` | Planes. The three glass rungs let more or less of the backdrop through, and also express rest, hover and active. |
| `--color-content-primary`, `--color-content-secondary`, `--color-content-subtle`, `--color-content-on-brand`, `--color-content-on-brand-muted`, `--color-content-on-accent`               | Text and icons.                                                                                                  |
| `--color-line`, `--color-line-strong`, `--color-line-on-glass`, `--color-line-on-brand`, `--color-line-selected`                                                                          | Borders, dividers and rules.                                                                                     |
| `--color-accent`, `--color-accent-strong`, `--color-accent-weak`                                                                                                                          | The rungs of the brand ramp the components use.                                                                  |
| `--color-focus-ring`                                                                                                                                                                      | Focus ring colour.                                                                                               |
| `--color-danger`, `--color-warning`, `--color-success`, `--color-info`, each with a `-surface` variant                                                                                    | Feedback, as text and as a fill.                                                                                 |
| `--radius-surface`, `--radius-control`, `--radius-field`, `--radius-nested`                                                                                                               | Corner radii. `nested` keeps a child's corners parallel to its parent's.                                         |
| `--shadow-float`, `--shadow-float-strong`, `--shadow-overlay`                                                                                                                             | Elevation.                                                                                                       |
| `--blur-glass`, `--blur-popover`                                                                                                                                                          | Backdrop blur.                                                                                                   |
| `--ease-standard`, `--ease-emphasized`                                                                                                                                                    | Easing curves.                                                                                                   |
| `--text-caption`, `--text-body`, `--text-ui`, `--text-title`, `--text-display`                                                                                                            | Font sizes by role.                                                                                              |
| `--font-weight-ui`, `--font-weight-emphasis`, `--font-weight-strong`                                                                                                                      | Font weights by role.                                                                                            |

### `var()` only

These are plain custom properties on `:root`. They have no utilities. Read them with `var()`.

| Tokens                                                                                                        | Role                                                   |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `--state-hover`, `--state-pressed`, `--state-selected`, `--state-hover-on-brand`, `--state-selected-on-brand` | Interaction washes, mixed over whatever is underneath. |
| `--opacity-disabled`                                                                                          | Opacity of a disabled element.                         |
| `--focus-ring-width`, `--focus-ring-offset`                                                                   | Focus ring geometry.                                   |
| `--duration-instant`, `--duration-short`, `--duration-long`                                                   | Transition durations.                                  |

To use `@apply` with these utilities in a component stylesheet, reference the theme first:

```scss
@reference '@zambon-dev/ui/styles/theme.css';

.my-panel {
  @apply bg-surface-glass rounded-surface shadow-float;
}
```

### Retuning the brand

To change the brand colour, override the ramp on `:root`, without a layer:

```css
:root {
  --color-primary-50: #e8f5ee;
  /* ... */
  --color-primary-900: #03140b;
}
```

The brand surface, the accent, the focus ring, the selection colours and `info` all derive from
the ramp, in both themes. The ramp lives in Tailwind's theme layer, so an unlayered override wins.

## Light and dark themes

The theme is an attribute on `<html>`:

```html
<html data-theme="dark"></html>
```

The CSS reads only this attribute, never `prefers-color-scheme`. "Follow the system" is resolved
in TypeScript and written to the attribute as `light` or `dark`.

### The theme switch

`MainLayoutComponent` always renders a theme switch in the top bar. It steps through light, dark
and system. There is no option to hide it, so an application that uses the main layout always
offers the dark theme.

Without the main layout, you can place the switch yourself: `ThemeSwitchComponent`
(`<shared-theme-switch>`) from `@zambon-dev/ui/shared`.

### Avoiding a flash of the wrong theme

`ThemeService` writes the attribute as soon as it is created, but that happens after the first
paint. Add this snippet to `index.html`, as the last element in `<head>`, so the first paint
already uses the stored choice:

```html
<script>
  (function () {
    try {
      var p = localStorage.getItem('zambon-theme') || 'light';
      if (p === 'system') p = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = p;
    } catch (e) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
</script>
```

`'zambon-theme'` must match `THEME_STORAGE_KEY`. Leaving the snippet out does not remove the dark
theme. It only risks one frame of the wrong theme on load.

When nothing is stored, `ThemeService` keeps whatever theme the attribute already holds, and falls
back to `light`.

### `ThemeService`

`ThemeService` is `providedIn: 'root'` and exported from `@zambon-dev/ui/shared`.

```ts
import { inject } from '@angular/core';
import { ThemeService } from '@zambon-dev/ui/shared';

const theme = inject(ThemeService);
theme.preference(); // 'light' | 'dark' | 'system': what the user chose
theme.resolved(); // 'light' | 'dark': what is applied now
theme.setPreference('dark');
theme.cyclePreference(); // light -> dark -> system -> light
```

| Member                 | Kind                      | Description                                                                           |
| ---------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| `preference`           | `Signal<ThemePreference>` | The user's choice, including `system`.                                                |
| `resolved`             | `Signal<ResolvedTheme>`   | The theme applied now. Follows the operating system live when the choice is `system`. |
| `setPreference(value)` | method                    | Applies a choice and stores it in `localStorage`. A blocked store is ignored.         |
| `cyclePreference()`    | method                    | Steps light, dark, system, light. The theme switch uses this.                         |

Related exports from `@zambon-dev/ui/shared`:

| Export              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `ThemePreference`   | `'light' \| 'dark' \| 'system'`                          |
| `ResolvedTheme`     | `'light' \| 'dark'`                                      |
| `THEME_STORAGE_KEY` | `'zambon-theme'`, the `localStorage` key for the choice. |

## Reduced motion

Under `prefers-reduced-motion: reduce`, the `--duration-*` tokens drop to `1ms`. Transitions that
read them stop animating: the sidebar's expand and collapse, the colour transitions of
`lib-button` and of ribbon button labels, and the sign-in fields. The busy spinner of `lib-button`
also stops.

Other transitions use fixed durations and still animate, for example the modal, the tabs, the
ribbon button hover and the form inputs.

## References

- [Getting started](./getting-started.md): adding the stylesheets to your build.
- [Top bar configuration](./top-bar-configuration.md): what else the top bar shows.
- [theme.css](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/styles/theme.css):
  the core tokens and the dark theme.
- [variables.scss](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/styles/variables.scss):
  the component tokens.
