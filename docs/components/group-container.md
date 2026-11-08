---
title: Group container
summary: A titled panel with an icon that frames a screen's content and shows a spinner until its title arrives.
entryPoint: library
api: [GroupContainerComponent]
storybook: library-form-components-group-container--primary
---

`lib-group-container` is a panel with a title bar. It frames one block of a screen, such as a
record's details. While its title is empty it shows a spinner in the title bar, so a screen can draw
the panel before the record's name has loaded.

<!-- example: group-container-overview -->

## Usage

```ts
import { GroupContainerComponent } from '@zambon-dev/ui/library';
```

```html
<lib-group-container icon="fa-user" [title]="customerName()"> ... </lib-group-container>
```

`title` is a translation key. A key with no translation shows as written. `icon` is a Font Awesome
icon class, such as `fa-user`, and shows only next to a title.

Bind `title` as a property, as above. A plain `title="..."` attribute also stays on the element as
the native tooltip.

The panel lays out whatever you project. For a long screen, project a
[group scroll spy](./group-scroll-spy.md) holding [group accordions](./group-accordion.md), as in the
example above.

<!-- example: group-container-loading -->

### Members to ignore

`sections`, `titles`, `activeSection`, `activeSectionChanged()` and `scrollTo()` are left over from
an older design. The panel has no scroll spy of its own, so `scrollTo()` fails. Use the members of
`lib-group-scroll-spy` instead.

## Accessibility

The title is an `<h4>`. Check that this level fits the outline of your page. The loading spinner
has no text alternative; if the wait matters, announce it in your own content.

## Theming

The panel has no component tokens. It reads `--color-surface-solid` for its background,
`--color-line` for its border and `--color-content-secondary` for the title. Its corner radius is
`--surface-radius`, which falls back to `0.5rem`. See [Theming](../guides/design-tokens.md).
