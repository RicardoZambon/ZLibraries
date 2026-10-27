# Design tokens and theming (for consuming applications)

This guide explains how the three packages are themed: what tokens exist, which ones are safe to
override, and how to turn on the dark theme.

## What changed, in one paragraph

Visual values used to live in two places: a per-component custom property (`--sidebar-bg`,
`--tabs-item-active-bg`) or a Tailwind utility written straight into a component's stylesheet
(`bg-white`, `shadow-md`). The per-component properties are still there and still the thing you
override. What is new is a layer underneath them: a small set of tokens that name a _role_ rather
than a value. A component asks for the role it needs, and the theme decides what that looks like.
That is what makes a light and a dark theme possible without touching a component.

## Prerequisite

Your global stylesheet must import the theme from `@zambon-dev/shared`, even if you only install
`@zambon-dev/library`:

```css
@import '@zambon-dev/shared/styles/theme.css';
```

This is where the tokens are defined. Without it every component resolves its colours to nothing
and renders transparent. `@zambon-dev/library/styles/variables.scss` holds the component tokens but
not the core they derive from.

## The core

| Family                                                            | Names                                                                       | What it is for                                                                                                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-surface-*`                                               | `brand`, `glass-weak`, `glass`, `glass-strong`, `solid`, `inset`, `scrim`   | The plane something sits on. The three `glass` rungs are a ladder of how much backdrop shows through, which is also how rest, hover and active are expressed. |
| `--color-content-*`                                               | `primary`, `secondary`, `subtle`, `on-brand`, `on-brand-muted`, `on-accent` | Text and icons. "Content" rather than "text" because half of these are glyphs and spinners.                                                                   |
| `--color-line-*`                                                  | `line`, `line-strong`, `line-on-glass`, `line-on-brand`, `line-selected`    | Borders, dividers and rules.                                                                                                                                  |
| `--color-accent-*`                                                | `accent`, `accent-strong`, `accent-weak`                                    | The chosen rung of the brand ramp. Retune the brand here, not rung by rung.                                                                                   |
| `--state-*`                                                       | `hover`, `pressed`, `selected`, `hover-on-brand`, `selected-on-brand`       | Interaction washes, expressed as a mix so they work over anything.                                                                                            |
| `--color-danger/warning/success/info`                             | plus a `-surface` variant each                                              | Feedback, as ink and as a fill.                                                                                                                               |
| `--color-focus-ring`, `--focus-ring-width`, `--focus-ring-offset` |                                                                             | Focus, which has to survive every theme and every surface.                                                                                                    |
| `--radius-*`                                                      | `surface`, `control`, `field`, `nested`                                     | Shapes. `nested` keeps a child's corners parallel to its parent's.                                                                                            |
| `--shadow-*`                                                      | `float`, `float-strong`, `overlay`                                          | Elevation.                                                                                                                                                    |
| `--blur-*`                                                        | `glass`, `popover`                                                          | Translucency. Two surfaces only match when the blur beneath them matches.                                                                                     |
| `--duration-*`, `--ease-*`                                        | `instant`, `short`, `long`; `standard`, `emphasized`                        | Motion. Every transition reads one of these, which is what makes reduced motion a single rule.                                                                |
| `--text-*`, `--font-weight-*`                                     | `caption`, `body`, `ui`, `title`, `display`; `ui`, `emphasis`, `strong`     | Typographic roles rather than a scale.                                                                                                                        |

Each one is also a Tailwind utility, because they are declared in `@theme`: `bg-surface-glass`,
`text-content-secondary`, `rounded-surface`, `shadow-float`, `ease-standard`.

## Overriding

**Override the component token, not the core.** `--sidebar-*` and `--tabs-*` are the published
contract; the core is the implementation and may gain or lose a rung.

```css
/* Your application's stylesheet. No layer. */
:root {
  --sidebar-bg: color-mix(in srgb, #1b4332 82%, transparent);
}
```

Write the override **without** a cascade layer. The package declares its tokens inside
`@layer tokens`, and an unlayered declaration beats any layer whatever the import order — so your
override wins either way. This is a change from earlier versions, where it only won if your
stylesheet happened to be imported last.

An override set this way holds in both themes. To vary it by theme, say so:

```css
:root[data-theme='dark'] {
  --sidebar-bg: color-mix(in srgb, #0b1f14 82%, transparent);
}
```

The dark block in `theme.css` touches core tokens only and never `--sidebar-*` or `--tabs-*`, so
your brand override stays yours in both themes without any work.

## The dark theme

The switch is an attribute on `<html>`:

```html
<html data-theme="dark"></html>
```

Not `prefers-color-scheme`, so that both sides keep a choice: an application that never writes the
attribute never has a dark theme, and a user can pick light on a dark machine. Following the
operating system is still supported — it is resolved in TypeScript and written out as a concrete
value.

### Turning it on

1. Add the pre-paint snippet to `index.html`, as the last thing in `<head>`:

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

   An Angular service cannot run before the first paint, and one frame of the wrong theme is worse
   than no theme at all. `ThemeService` picks up from whatever this leaves.

2. Nothing else. The switch in the top bar is rendered by `MainLayoutComponent` already, and
   `ThemeService` is `providedIn: 'root'`.

To **not** offer a dark theme, leave the snippet out. Nothing writes the attribute and every screen
stays light.

### Reading or setting it yourself

```ts
import { ThemeService } from '@zambon-dev/shared';

const theme = inject(ThemeService);
theme.preference(); // 'light' | 'dark' | 'system' -- what the user chose
theme.resolved(); // 'light' | 'dark' -- what is applied right now
theme.setPreference('dark');
```

## Reduced motion

Every transition in these packages reads a `--duration-*` token, and those collapse to 1ms under
`prefers-reduced-motion: reduce`. You get this for free; there is nothing to configure.

## References

- [Top bar configuration](top-bar-configuration.md) — brand, environment badge, notifications and
  the user profile.
- `libs/shared/src/styles/theme.css` — where the core and the dark block are defined.
