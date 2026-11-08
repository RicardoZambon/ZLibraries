---
title: Group accordion
summary: A titled section the user can fold away and open again.
entryPoint: library
api: [GroupAccordionComponent]
storybook: library-form-components-group-accordion--primary
---

`lib-group-accordion` is a section with a clickable title. Clicking the title folds the content
away; clicking again opens it. Use it to split a long form or details screen into parts the user
can hide. It starts open.

<!-- example: group-accordion-overview -->

## Usage

```ts
import { GroupAccordionComponent } from '@zambon-dev/ui/library';
```

```html
<lib-group-accordion label="Billing">
  <lib-form-group>...</lib-form-group>
</lib-group-accordion>
```

`label` is required and is shown as given. Unlike most labels in the package it is **not**
translated: pass translated text, for example through the `translate` pipe.

Each accordion opens and closes on its own. Opening one does not close the others, and there is no
input to set the state from outside.

Accordions are the sections that [group scroll spy](./group-scroll-spy.md) lists in its strip of
links.

## Accessibility

- The title has `role="button"`, is in the Tab order and toggles on Enter and Space.
- `aria-expanded` reports whether the section is open.
- The title is an `<h6>` element. Check that this level fits the outline of your page.
- The title does not point at its content with `aria-controls`.

## Theming

The accordion has no component tokens. Its title uses `--color-content-secondary`. See
[Theming](../guides/design-tokens.md).
