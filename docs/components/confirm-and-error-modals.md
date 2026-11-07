---
title: Confirm and error modals
summary: Ready-made dialogs that ask before an action and report a failed request.
entryPoint: framework
api: [ConfirmModalComponent, ErrorModalComponent]
storybook: framework-modals--confirm-modal
---

Two dialogs built on [modal](./modal.md). `framework-confirm-modal` asks the user to confirm an
action, shows a busy state while it runs and shows the error if it fails. `framework-error-modal`
reports a failed request. Both sit at the top of the screen, and their texts are translation keys.

<!-- example: confirm-modal-basic -->

## Usage

```ts
import { ConfirmModalComponent, ErrorModalComponent } from '@zambon-dev/ui/framework';
import { ButtonComponent } from '@zambon-dev/ui/library';
```

### Confirm modal

Project your confirm button into `[footer]`. The modal adds a Cancel button before it. Run the work
from your button and drive the modal with its methods:

```html
<framework-confirm-modal #confirm title="Archive-Title" message="Archive-Message">
  <div footer>
    <lib-button intent="danger" [loading]="confirm.isLoading()" (click)="archive(confirm)">Archive</lib-button>
  </div>
</framework-confirm-modal>
```

```ts
protected archive(confirm: ConfirmModalComponent): void {
  confirm.beginLoading();
  this.api.archive(this.id).subscribe({
    next: () => confirm.finishLoading(true),
    error: (error: HttpErrorResponse) => confirm.setErrorMessage(error),
  });
}
```

`this.api` and `this.id` stand for your own service and record.

- `beginLoading()` clears any error and sets `isLoading`.
- `finishLoading(true)` ends the busy state and closes the modal. Without `true` it stays open.
- `setErrorMessage(error)` ends the busy state and shows the error. A 400 response is mapped onto
  the fields of the surrounding form instead. A text body is shown as is. Anything else shows the
  default message.

`message` may contain HTML, such as `<b>`. Angular sanitizes it. Extra content projected without the
`footer` attribute shows under the message.

The [delete and confirm buttons](./action-buttons.md#delete-and-confirm) wrap this modal, so you
rarely need it on its own.

### Inside a form

When the modal sits inside a `[formGroup]`, opening or closing it **resets that form**, and a
surrounding `FormService` resets too. This suits a modal that holds its own small form. Do not place
it inside a form whose values you need to keep; declare it outside.

### Error modal

Call `showModal(error)` with a message, a translation key or an `HttpErrorResponse`. A response with
a text body shows that text. Any other error shows the default message.

```html
<framework-error-modal #errors></framework-error-modal>
```

```ts
private readonly errors = viewChild.required(ErrorModalComponent);

protected save(model: Customer): void {
  this.api.save(model).subscribe({ error: (error: HttpErrorResponse) => this.errors().showModal(error) });
}
```

`this.api` and `Customer` stand for your own service and model.

`showModal()` toggles the modal. A second call while it is open closes it.

`title` and `subtitle` default to the shipped keys `Modal-Failed-Title` and
`Modal-Failed-Administrator`. An empty `subtitle` hides that line.

<!-- example: error-modal-basic -->

### Translations

The default texts are keys in the `@zambon-dev/ui/framework` translation files: the Cancel and Close
buttons, the default error and the administrator hint. See
[Internationalization](../guides/internationalization.md).

## Accessibility

Both dialogs inherit the behaviour and the current limits of [modal](./modal.md#accessibility):
Escape closes them, but they are not announced as dialogs and do not keep focus inside. The error
text is not announced when it appears in an open confirm modal. Tell the user in another way when
it matters, for example by moving focus to the message.

## Theming

These dialogs have no tokens of their own and take the [modal](./modal.md#theming)'s styling. The
icon beside the confirm message is a Tailwind text class, set through `messageIconColor` (default
`text-cyan-500`).
