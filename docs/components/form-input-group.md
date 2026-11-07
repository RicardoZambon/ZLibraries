---
title: Form input group
summary: A labelled form field with validation messages, notes and a loading placeholder.
entryPoint: library
api: [FormInputGroupComponent]
storybook: library-form-components-form-input-group--primary
---

`lib-form-input-group` is the standard row of a form: a label, a [form input](./form-input.md), the
validation messages for its control and an optional note. While the field or the whole form is
loading, it shows a placeholder bar instead.

<!-- example: form-input-group-basic -->

## Usage

```ts
import { FormGroupComponent, FormInputGroupComponent, FormService } from '@zambon-dev/ui/library';
```

```html
<form [formGroup]="form">
  <lib-form-group label="Customer">
    <lib-form-input-group
      controlName="name"
      label="Name"
      notes="As printed on invoices"
      [validations]="{ required: 'Name is required' }"
    ></lib-form-input-group>
  </lib-form-group>
</form>
```

It needs what `lib-form-input` needs: a parent `[formGroup]` and a `FormService` provided by the host
component. Place it inside a [form group](./form-group.md): it fills one row of that group's
two-column grid.

`label`, `notes` and the messages in `validations` are translation keys. A key with no translation
shows as written.

<!-- example: form-input-group-types -->

### Validation messages

`validations` maps a validator's error key to its message. A message shows once the control is
touched and has that error. Errors with no entry in the map show nothing.

The messages follow the control, wherever the change comes from. A save that marks every control
as touched shows the required messages at once. Errors the server returns, set through
`FormService.setValidationErrorsFromHttpResponse()`, show under their fields too. See
[Validation messages on fields](../guides/building-views.md#validation-messages-on-fields).

<!-- example: form-input-group-validation -->

### Loading

The placeholder shows while `FormService.loading` is on and no model has been loaded yet. It also
shows for one field after `FormService.beginFieldLoading(name)`. It goes away when the control's
value or status next changes, or when you call `FormService.setFieldValue(name, value)`.

### Your own field

Pass a `TemplateRef` to `template` to render your own control in place of `lib-form-input`. The
label, messages and notes stay. `lib-catalog-select` is built this way.

Set `showLabel` to `false` to drop the label column and let the field span both columns.

## Accessibility

The label is a `<label>` element with `for` set to the control name. The inner input carries no
matching `id`, so the label is **not** linked to the input, and screen readers do not announce it.
The validation messages are not linked to the input either. Until the package fixes this, put an
`id` equal to the control name on your own template's input, and add `aria-describedby` where the
message matters.

## Theming

The group has no component tokens. The label uses `--color-content-secondary` and
`--text-caption`, messages use `--color-danger`, and the loading bar uses `--color-surface-inset`.
See [Theming](../guides/design-tokens.md).
