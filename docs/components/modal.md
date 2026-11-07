---
title: Modal
summary: A dialog with a header, a body and a footer, opened and closed from code.
entryPoint: library
api: [ModalComponent]
storybook: library-modals-simple-modal--primary
---

`lib-modal` is the dialog every overlay in the package is built on. You project a body and footer
actions; the modal adds the header, the close controls and the backdrop. It renders above the rest of
the application, wherever you declare it.

<!-- example: modal-basic -->

## Usage

```ts
import { ButtonComponent, ModalComponent } from '@zambon-dev/ui/library';
```

```html
<lib-button (click)="modal.toggleModal()">Open</lib-button>

<lib-modal #modal title="Rename file" size="md" (closed)="onClosed()">
  <div body>...</div>
  <div footer>
    <lib-button intent="primary" (click)="rename(); modal.closeModal()">Rename</lib-button>
  </div>
</lib-modal>
```

Project the content into the `body` and `footer` slots with those attributes. Content without one is
not shown. The footer always starts with a close button; its text is `closeButtonText`, shown as
given.

Open and close the modal through `toggleModal()` and `closeModal()`, from a template reference or a
`viewChild` query. `isOpen` is a signal that tells whether it is open. `closed` emits after the modal
closes, however it was closed.

### Closing

The modal closes on the close button, on the header's close icon, on Escape and, while `dialog` is
`true` (the default), on a click on the backdrop. While `modalProcessing` is `true`, the close button
is disabled and Escape and backdrop clicks do nothing. Set it while a save runs.

### Size and position

`size` sets the width, from `sm` to `7xl`, `full`, or `auto` to fit the content. `position` places
the dialog at the `center` (default), `top`, `bottom`, `left` or `right`.

<!-- example: modal-top-confirmation -->

### Forms inside

The modal's content sits inside a `<form>` element whose native submit is cancelled. A
`type="submit"` button inside does not reload the page. Bind the work to the button's click instead.

Fields inside the modal still find your `[formGroup]`, datasets and services through Angular's
injection, even though the modal's element moves.

### Where it renders

On start, the modal moves its element to the end of `<body>`. This lifts it out of any stacking
context, such as the tab panel, so it covers the navigation. Styles that target the modal through
an ancestor selector in your page no longer match.

Opening a modal adds the `modal-active` class to `<body>`. Opening a second modal while one is open
does not work reliably: both share that class. Close one before opening the next.

<!-- example: modal-error -->

## Accessibility

What the modal does:

- Opening it focuses the first element inside with an `autofocus` attribute. Put `autofocus` on the
  field or button the user should start from.
- Escape closes it.
- The footer close button is a native button with visible text.

What it does not do yet, so plan for it:

- It has no `role="dialog"`, `aria-modal` or `aria-labelledby`. Screen readers do not announce it
  as a dialog.
- Focus is not kept inside the modal, and is not returned to the opening control on close.
- The header's close icon has no accessible name. The footer close button is the one to rely on.

## Theming

The modal has no component tokens. The dialog reads `--color-surface-solid`, `--color-line`,
`--radius-control` and `--shadow-overlay`. The backdrop is `--color-surface-scrim`. See
[Theming](../guides/design-tokens.md).
