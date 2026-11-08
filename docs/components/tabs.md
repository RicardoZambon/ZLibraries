---
title: Tabs and breadcrumbs
summary: The application's tab strip, with a breadcrumb trail for the views opened inside a tab.
entryPoint: framework
api: [TabsComponent, TabBreadcrumbsComponent, TabService]
storybook: framework-views--tabs-with-breadcrumbs
---

`framework-tabs` shows the tabs the user has open, like a browser. Each tab keeps its own screen
alive while the user works in another. Inside the active tab, `framework-tab-breadcrumbs` shows the
trail of views the user opened from the tab's first screen, and lets them step back. Both read their
state from `TabService`.

<!-- example: tabs-breadcrumbs -->

## Usage

The [main layout](./main-layout.md) already contains the tab strip, with the router outlet inside
it. Use `framework-tabs` directly only when you build your own shell:

```ts
import { TabsComponent } from '@zambon-dev/ui/framework';
import { RouterOutlet } from '@angular/router';
```

```html
<framework-tabs>
  <router-outlet></router-outlet>
</framework-tabs>
```

The strip projects its content into the tab panel, under the breadcrumbs. The breadcrumbs are part
of the strip; you do not place them yourself.

### What it needs

- `CustomReuseStrategy` registered as the router's `RouteReuseStrategy`. Tabs fail without it.
- The router, translations and `TabService` (provided at the root).

See [Tabbed navigation](../guides/tabbed-navigation.md) for the setup, the route rules and how to
open, replace and close tabs from code.

### What the strip does

- On start, it opens a tab for the route the application loaded on.
- It scrolls sideways when the tabs do not fit, with a button and a fade at each scrollable end.
- A middle click on a tab closes it, as in a browser.
- Tab titles are translation keys, or a spinner while a record's title loads.

## Accessibility

The strip follows the tabs pattern:

- The list has `role="tablist"`; each tab has `role="tab"`, `aria-selected` and `aria-controls`.
- The panel has `role="tabpanel"` and is labelled by the active tab.
- Only the active tab is in the Tab order.

| Key                     | Action                                          |
| ----------------------- | ----------------------------------------------- |
| Arrow Left, Arrow Right | Moves to the previous or next tab and opens it. |
| Home, End               | Moves to the first or last tab and opens it.    |
| Enter, Space            | Opens the focused tab.                          |
| Delete                  | Closes the focused tab.                         |

The close buttons are left out of the Tab order; Delete on the tab does the same job. Close and
scroll buttons have translated names, such as "Close Customers". The close button inserts the tab
title as stored, so a title given as a translation key appears untranslated in that name.

Each breadcrumb has `role="button"`, is in the Tab order and works with Enter and Space. The trail is
not marked up as a breadcrumb navigation landmark.

## Theming

The strip has its own component tokens (`--tabs-*`): tab backgrounds and text, the panel, borders,
the close button, sizes and the scroll fade. The breadcrumbs share them. See the
[tabs token reference](../guides/design-tokens.md#tabs).
