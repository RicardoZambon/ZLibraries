---
title: Group scroll spy
summary: A scrolling area with a strip of links that follows the section in view.
entryPoint: library
api: [GroupScrollSpyComponent, ScrollSpyDirective]
storybook: library-form-components-group-scroll-spy--primary
---

`lib-group-scroll-spy` makes its content scroll and adds a strip of links beside it, one per
[group accordion](./group-accordion.md) inside. The link of the section in view is highlighted.
Clicking a link scrolls to its section. Use it for a long details screen with several sections.

<!-- example: group-scroll-spy-basic -->

## Usage

```ts
import { GroupAccordionComponent, GroupScrollSpyComponent } from '@zambon-dev/ui/library';
```

```html
<lib-group-scroll-spy>
  <lib-group-accordion label="Contact">...</lib-group-accordion>
  <lib-group-accordion label="Billing">...</lib-group-accordion>
  <lib-group-accordion label="Notes">...</lib-group-accordion>
</lib-group-scroll-spy>
```

The component fills the height of its parent and scrolls inside it. Give the parent a height, for
example a [group container](./group-container.md) or a flex column with a fixed height. In a parent
that grows with its content, nothing scrolls and the strip never moves.

The link labels are the accordions' labels. Accordions nested deeper inside the content count too.

The strip shows from the `md` breakpoint (768px) up. On narrower screens only the content shows.
With no accordions inside, the strip and the room kept for it are dropped.

### Sections added later

The section positions are read once, when the component first renders. Accordions added later, for
example under an `@if`, get a link but are not tracked while scrolling. Render all sections up front
and hide their content instead.

Give each accordion a distinct label. The links are tracked by label.

### `libScrollSpy` on your own container

`ScrollSpyDirective` is the part that tracks scrolling. Put it on any scrolling element, list the
tag names that count as sections in `spiedTags`, and listen to `activeSectionChange` for the index
of the section in view. Call `scrollTo(index)` on it to jump to a section.

## Accessibility

- Each link has `role="button"`, is in the Tab order and works with Enter and Space.
- The link of the section in view carries `aria-current`.
- The strip is hidden on narrow screens, where the user scrolls the content directly.

## Theming

The component has no component tokens. The links use `--color-content-secondary` and
`--color-line`; the current one uses `--color-accent`. See [Theming](../guides/design-tokens.md).
