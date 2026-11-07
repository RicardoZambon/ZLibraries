# Tabbed navigation

`@zambon-dev/ui/framework` turns the Angular router into a tabbed workspace. Each screen opens in
a tab, a tab keeps a history of what was opened in it, and a view left in the background keeps its
state until its tab closes.

This guide explains the model, what each framework button does to it, and what an application must
provide for it to work. For the routes themselves, see [Building views](./building-views.md).

## Setup

Two things are required.

**The reuse strategy.** Register `CustomReuseStrategy` as the router's reuse strategy.
`TabService` relies on it and fails without it.

```ts
import { ApplicationConfig } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from '@zambon-dev/ui/framework';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ],
};
```

**The tab strip.** `TabsComponent` (`<framework-tabs>`) renders the tabs, the breadcrumbs and the
router outlet. `MainLayoutComponent` from `@zambon-dev/ui/shared` already includes it, together
with the sidebar. Route your screens as children of the layout, so the tab strip starts after the
router has matched a route.

## Route rules

The tab system builds URLs from the route tree. Three rules follow from that.

- **One URL segment per route path.** Nest `contracts` and `:id` as two routes. A path such as
  `'sales/contracts'` rebuilds in the wrong order, and tab URLs break.
- **Name the record parameter `id`.** The details shell and the data provider read
  `paramMap.get('id')`.
- **Mark every tab root with `FRAMEWORK_VIEW_TYPE`.** A route with
  `FrameworkViewType.List` or `FrameworkViewType.Details` is a tab. When the tab strip starts on a
  URL with neither, it navigates to `/`.

## The model

A **tab** is a stack of **entries**. Each entry has a URL and a title.

- The first entry is the tab's root: a list, or a record opened directly.
- Opening a record from inside the tab pushes an entry on top.
- The top entry is the tab's **current view**. It is what the router shows.

The breadcrumbs show the whole stack. Clicking an entry goes back to it and drops everything above
it. The tab's label shows the title of the last record pushed onto it.

```text
Tab 1: [ /contracts ] > [ /contracts/325 ] > [ /contracts/325/audit ]
         root            record                sub-view (current view)
```

### Entity-level matching

An entry for a record carries an **entity base URL**: the record's URL without a sub-view, such as
`/contracts/325`. Every sub-view entry of that record carries the same base URL.

This lets the framework see that `/contracts/325` and `/contracts/325/audit` are the same record.
It uses that to avoid opening one record in two tabs.

Matching looks only at each tab's **current view**, never at its history. A record buried in
another tab's history does not count as open there.

## The three navigation modes

| Mode                    | `TabService` method                    | What it does                                                                   |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| Open a tab              | `openTab(tab)`                         | Starts a new tab, unless a tab already shows the URL or the record.            |
| Push in the current tab | `navigateCurrentTab(tab)`              | Pushes an entry onto the current tab, unless another tab already shows it.     |
| Replace a sub-view      | `replaceCurrentTabSubView(base, tab?)` | Swaps the sub-view on top of a record. Without `tab`, goes back to the record. |

"Already shows" means:

- `openTab`: another tab's current view has the exact URL, or the same entity base URL. That tab
  gets the focus and stays on its current view.
- `navigateCurrentTab` with an entity base URL: another tab's current view is the same record. That
  tab gets the focus.
- `navigateCurrentTab` without one: another tab's current view has the URL, or a URL below it.

When the URL is already lower in the current tab's own stack, `navigateCurrentTab` goes back to
that entry instead of pushing a duplicate.

## What the framework does

### Buttons and the tab strip

| Action                                    | Result                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Sidebar menu item                         | Opens a tab titled with the menu label. Focuses an existing tab whose current view is that exact URL.             |
| **New** (`framework-button-new`)          | Pushes `<list URL>/new` onto the current tab. Focuses another tab already on a new record of that list.           |
| **Open** (`framework-button-open-record`) | Pushes `<current URL>/<selected row id>`. Focuses another tab already showing that record. Title loads from data. |
| **Views**, to a non-default view          | Pushes the view as a sub-view entry, titled with the route's `title`. Replaces a sub-view already on top.         |
| **Views**, back to the default view       | Removes the sub-view entry and shows the record.                                                                  |
| **Save**                                  | Saves, then changes the current entry's URL in place: `/contracts/new` becomes `/contracts/325`.                  |
| **Save and close**                        | Saves, then goes back one entry. Closes the tab when the record was its only entry.                               |
| **Save and new**                          | Saves, keeps the saved record cached, then pushes `/contracts/new`.                                               |
| Breadcrumb                                | Goes back to that entry. Focuses another tab instead if its current view is that URL.                             |
| Tab label                                 | Focuses the tab on its current view.                                                                              |
| Close button or middle click              | Closes the tab and its whole history. The tab to its right gets the focus, or the last tab, on its current view.  |
| Sign out (`AuthService.signOut`)          | Closes every tab.                                                                                                 |

The **Views** button lists the details route's child routes. It is disabled while the record is
new, because sub-views need a saved record. The [details views guide](./details-views.md) covers
the route data it reads and how to show a view only for some records.

### Direct URLs

When the application starts on a URL, or the user reloads, the tab strip rebuilds one tab from
the URL.

| URL                     | Result                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| A list                  | Opens a tab for the list. With `MainLayoutComponent`, the matching sidebar menu supplies its title.      |
| A record                | Opens a tab for the record. The title shows a spinner until the record loads.                            |
| A record's sub-view     | Opens a tab for the record, then adds the sub-view entry, titled with the route's `title`.               |
| A new record's sub-view | Redirects to the new record itself (`/contracts/new/audit` becomes `/contracts/new`), replacing the URL. |

## Edge cases

**The record is open at a sub-view in another tab.** Opening it again focuses that tab. The tab
stays on the sub-view; it does not go back to the record.

**The record is only in another tab's history.** It does not count. Tab 1 holds
`[/contracts, /contracts/325, /invoices/13620]`. Opening `/contracts/325` from Tab 2 pushes it onto
Tab 2.

**The title is already known.** A new entry takes the resolved title of any open entry with the
same URL, so it shows no spinner.

**The record does not exist.** The load fails, typically with 404. The details shell shows the
error modal: "Record not found" for 404, the generic server error otherwise. Closing the modal goes
back to the entry before the record. When the record was the tab's first entry, the tab closes.
Every entry of the record is skipped, sub-views included. See
[Building views](./building-views.md#error-handling).

**Save moves the URL.** After the first save the entry's URL and entity base URL both change from
`/new` to the saved ID. The router follows without rebuilding the view, so the next **New** click
still works.

**Closing the last tab** navigates to `/`.

## Titles

| Entry                       | Where its title comes from                                     |
| --------------------------- | -------------------------------------------------------------- |
| A list opened from the menu | The menu label.                                                |
| A saved record              | `DataProviderService.getTitle(entity)`, once the record loads. |
| A new record                | The details route's `defaultTitle`.                            |
| A sub-view                  | The child route's `title`.                                     |

Titles go through the translation pipe, so they may be translation keys.

## Calling `TabService` from an application

The buttons cover the usual flows. Use these methods when a screen needs its own navigation.

| Method                                 | Use it to                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `openTab(tab)`                         | Open a screen in a new tab, such as from a dashboard link.                    |
| `navigateCurrentTab(tab)`              | Open a related record in the current tab, such as an invoice from a contract. |
| `replaceCurrentTabSubView(base, tab?)` | Switch a record's sub-view from your own control.                             |
| `navigateBackOrCloseActiveTab()`       | Leave the current view: back one entry, or close the tab.                     |
| `closeActiveTab()` / `closeTab(index)` | Close a tab.                                                                  |
| `closeAllTabs()`                       | Close everything. `AuthService.signOut()` already calls it.                   |
| `updateTabTitle(url, title)`           | Set the title of every entry with that URL.                                   |
| `isUrlOpen(url)`                       | Check whether any tab holds the URL, anywhere in its history.                 |

Build entries with `Tab`. Set `entityBaseUrl` when the URL is a record, so entity matching works.
Set `title` and `isTitleLoading: false` when you already know the title.

```ts
import { Component, inject } from '@angular/core';
import { Tab, TabService } from '@zambon-dev/ui/framework';

@Component({
  selector: 'app-contract-invoices',
  template: `<button type="button" (click)="openInvoice(13620)">Invoice 13620</button>`,
})
export class ContractInvoicesComponent {
  private readonly tabService: TabService = inject(TabService);

  protected openInvoice(invoiceID: number): void {
    const url = `/invoices/${invoiceID}`;
    this.tabService.navigateCurrentTab(new Tab({ entityBaseUrl: url, url }));
  }
}
```

Navigate through `TabService`, not `Router.navigate`. A plain router navigation changes the view
but not the tab history, and the two drift apart.

## Cached views

`CustomReuseStrategy` keeps views alive while their URL is open in any tab.

- **Leaving a view detaches it.** Switching tabs, pushing an entry or picking a sub-view keeps the
  component instance, its form state, grid rows and scroll position.
- **Coming back reattaches it.** The constructor and `ngOnInit` do not run again. A view that must
  refresh on return has to do so on its own trigger, such as a data provider emission.
- **Subscriptions keep running while detached.** A detached view still receives router events and
  service emissions. Guard work that should happen only for the visible tab.
- **The cache is per URL, not per tab.** Two tabs on the same list URL share one instance.
- **Closing releases it.** When a tab closes or an entry is dropped from history, a view whose URL
  no longer appears in any tab leaves the cache, and the routed component's `ngOnDestroy` runs.

## References

- [`TabService`](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/framework/services/tab.service.ts)
- [`CustomReuseStrategy`](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/framework/services/custom-reuse-strategy.ts)
- [`TabsComponent`](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/framework/components/views/tabs/tabs.component.ts)
