---
title: Sidebar
summary: The application's navigation menu, loaded level by level from a service you implement.
entryPoint: library
api: [SidebarComponent, SidebarService, SidebarConfigs, SidebarMenu]
storybook: library-sidebar-sidebar--primary
---

`lib-sidebar` is the navigation menu at the side of the application. It asks a `SidebarService`
subclass for its menus, groups them into regions and loads submenus when the user opens them. It
collapses to a rail of icons, and on small screens it closes itself after a choice.

<!-- example: sidebar-overview -->

## Usage

Subclass `SidebarService`, provide it, and place the sidebar:

```ts
import { Component, Injectable } from '@angular/core';
import { ISidebarProfile, SidebarComponent, SidebarMenu, SidebarService } from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

@Injectable()
class AppSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ id: 1, label: 'Menu-Dashboard', icon: 'fa-chart-line', url }));
  }

  public getUserProfile(): ISidebarProfile | undefined {
    return undefined;
  }

  protected loadMenus(parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    return of(
      parentMenu ? [] : [new SidebarMenu({ id: 1, label: 'Menu-Dashboard', icon: 'fa-chart-line', url: '/dashboard' })],
    );
  }
}

@Component({
  selector: 'app-nav',
  imports: [SidebarComponent],
  providers: [{ provide: SidebarService, useClass: AppSidebarService }],
  template: `<lib-sidebar><span>v1.0.0</span></lib-sidebar>`,
})
export class NavComponent {}
```

In a real application the three members call your API:

- `loadMenus(null)` returns the top-level menus; `loadMenus(menu)` returns that menu's children.
- `getMenuFromUrl(url)` gives the title of a tab opened from a direct link.
- `getUserProfile()` must be implemented, but nothing in the package calls it. Return `undefined`.
  The top bar shows the user instead.

Provide the service once, at the application root, when the [main layout](./main-layout.md) uses it.
Content projected into the sidebar shows in its footer.

The sidebar also needs translations: menu labels and region names are translation keys.

### Menus

A `SidebarMenu` has an `id`, a `label`, an optional Font Awesome `icon` and a `url`. A menu with
`childCount` above zero is a parent: choosing it loads and opens its children. Only top-level
menus show their icon.

`openMode` says how the `url` opens: as an application route (the default), in a new browser tab, or
embedded in an application tab. The value may arrive as a string or as the backend's enum number.

### Regions

Menus with the same `region` label are grouped under that header, in the order they first appear.
Menus without one share a header-less region.

Set `shouldDeriveAreasFromRootMenus` in `SidebarConfigs` to build the regions from the tree instead.
Each top-level menu with children and no URL then becomes a header, and its children are listed
flat beneath it.

### Configuration

Provide `SIDEBAR_CONFIGS` to change the defaults:

```ts
import { SIDEBAR_CONFIGS, SidebarConfigs } from '@zambon-dev/ui/library';

export const sidebarConfig = {
  provide: SIDEBAR_CONFIGS,
  useValue: new SidebarConfigs({ loadingText: 'Loading menu', errorText: 'Menu unavailable' }),
};
```

`loadingText`, `errorText` and `externalLinkText` are shown as given, not translated.
`logoCollapsedPath` and `logoExpandedPath` are ignored: the sidebar draws no logo.

### What a choice does

Choosing a menu with a URL emits `menuUrlSelected` on the service, or `menuExternalUrlSelected` for
an external address. The sidebar does not navigate by itself. The [main layout](./main-layout.md)
listens and opens the tab; outside it, subscribe to these events yourself.

### Loading and errors

The sidebar shows `loadingText` until the top-level menus arrive. A top-level request that fails,
or one that returns an empty list, leaves the loading text on screen; the `errorText` does not show
in that case. A failed submenu load marks only that menu.

## Accessibility

- The sidebar's content is inside a `<nav>` element.
- Each menu row has `role="button"`, is in the Tab order and works with Enter and Space. The
  selected row carries `aria-current`.
- Escape closes a sidebar held open on a small screen.
- The collapse button is named "Toggle navigation", in English.
- Parent rows do not report whether they are open (`aria-expanded`).

## Theming

The sidebar has its own component tokens, from `--sidebar-bg` and `--sidebar-text` to the widths,
row height and animation duration. Override them on `:root`. See the
[sidebar token reference](../guides/design-tokens.md#sidebar).
