---
title: Ribbon
summary: A toolbar of labelled button groups that compacts itself when space runs out.
entryPoint: library
api: [RibbonComponent, RibbonGroupComponent, RibbonButtonComponent, RibbonGroupChild]
storybook: library-ribbon-ribbon--primary
---

The ribbon is the toolbar at the top of a view. `lib-ribbon` is the bar, `lib-ribbon-group` is a
labelled group of buttons, and `lib-ribbon-button` is a large icon button with a label under it. A
ribbon button can also open a menu of options and show a busy or result state.

<!-- example: ribbon-overview -->

## Usage

```ts
import { RibbonButtonComponent, RibbonComponent, RibbonGroupComponent } from '@zambon-dev/ui/library';
```

```html
<lib-ribbon>
  <lib-ribbon-group label="Record">
    <lib-ribbon-button icon="fa-floppy-disk" label="Save" (action)="save()"></lib-ribbon-button>
  </lib-ribbon-group>

  <div right>
    <lib-ribbon-group label="View">...</lib-ribbon-group>
  </div>
</lib-ribbon>
```

Content marked with the `right` attribute goes to the far end of the bar.

### Groups hide when empty

A group shows only while it holds at least one visible `RibbonGroupChild`. The
[action buttons](./action-buttons.md) are such children, and they hide when the user lacks the
right. A group whose buttons are all hidden disappears with them, and a ribbon with no visible group
and no other content hides too.

A plain `lib-ribbon-button` is **not** a `RibbonGroupChild`. A group holding only plain buttons stays
hidden. Wrap each one in a small component that provides `RibbonGroupChild`:

```ts
import { Component, forwardRef, signal } from '@angular/core';
import { RibbonGroupChild } from '@zambon-dev/ui/library';

@Component({
  selector: 'app-ribbon-item',
  template: '<ng-content></ng-content>',
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => RibbonItemComponent) }],
})
export class RibbonItemComponent extends RibbonGroupChild {
  public readonly isVisible = signal(true);
}
```

### Menus

Give a ribbon button `options` and it gets a chevron that opens a menu. `(action)` emits the `id` of
the chosen option. Set `defaultOption` to an index to make the main button run that option directly;
the chevron still opens the menu. An option with `allowedActions` stays disabled until its
permission is known. With none of its options visible, the button is disabled.

### Busy and result states

Set `loading`, or call `startLoading()`, to show a spinner and block clicks. `finishLoading(status)`
ends it and shows `success`, `warning` or `failure` on the button for one second.

### Narrow screens

The bar measures its own width, not the window's. Below 36rem the buttons drop their labels
and keep their icons. This uses a CSS container query, which has one cost: a ribbon inside a parent
that sizes to its content (`inline-block`, a float, an `auto` grid column) collapses to nothing. Put
it in a block, a grid cell or a stretched flex item.

## Accessibility

- A ribbon button is a focusable element with `role="button"`. Enter and Space activate it.
- A disabled or busy button leaves the tab order and carries `aria-disabled`.
- The button is named by its translated `label`, or by `tooltip` when there is no label. The name
  stays when narrow mode hides the label. Give an icon-only button a `tooltip`.
- The chevron has `aria-haspopup="menu"` and `aria-expanded`, and borrows the button's name.
- Menu items are `role="menuitem"` and focusable, and Enter and Space choose one. Escape or a click
  outside closes the menu. Focus does not move into the menu when it opens, and there is no
  arrow-key navigation inside it. The menu renders in an overlay at the end of the page, so Tab
  reaches it only after the rest of the page.

## Theming

The ribbon has no component tokens. The bar reads `--color-surface-inset`, `--color-line` and
`--radius-control`. Buttons read `--state-hover`, `--state-pressed`, `--state-selected` and the
`--color-success-surface`, `--color-warning-surface` and `--color-danger-surface` tokens for their
result states. The icon colour is a Tailwind text class, set through `color` (default
`text-primary-500`). See [Theming](../guides/design-tokens.md).
