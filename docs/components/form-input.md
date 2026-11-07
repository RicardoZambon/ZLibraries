---
title: Form input
summary: A bare form field that edits a reactive-form control and turns into read-only text in view mode.
entryPoint: library
api: [FormInputComponent, FormService]
storybook: library-form-components-form-input--primary
---

`lib-form-input` is the field itself, without a label or messages. It edits one control of the
surrounding reactive form. When the form is disabled and not in edit mode, it shows the value as
plain text instead of an input. Use it when you build your own field layout. For the usual
label-plus-field row, use [form input group](./form-input-group.md), which wraps it.

<!-- example: form-input-basic -->

## Usage

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormInputComponent, FormService } from '@zambon-dev/ui/library';

@Component({
  selector: 'app-quantity',
  imports: [FormInputComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form">
      <label>
        Quantity
        <lib-form-input controlName="quantity" type="number" [step]="1"></lib-form-input>
      </label>
    </form>
  `,
})
export class QuantityComponent {
  protected readonly form = new FormGroup({ quantity: new FormControl<number | null>(12) });
}
```

### What it needs

- **A parent `[formGroup]`.** The field looks it up by injection and fails without one. This holds
  even when you only show a `fixedValue`.
- **A `FormService`.** Provide it on the host component, as above. The field reads its edit mode.
  In a framework form view it is already provided.

`controlName` names a control of that form group. Inside a `formGroupName`, the name is relative to
that nested group.

### Field types

`type` takes `textarea`, `checkbox` (drawn as a switch) or any native input type, such as `text`,
`number`, `date`, `datetime-local` or `email`. A `number` field writes `null` rather than an empty
string when cleared. A `date` field stores `yyyy-MM-dd` strings.

### Read-only display

The field shows an input while the form is enabled or `FormService` is in edit mode. Otherwise it
shows text, formatted by `format`: a `DatePipe` pattern for dates (a `date` field defaults to
`yyyy-MM-dd`) or a `DecimalPipe` digits string for numbers. A checkbox shows a ticked or empty box
icon.

`disabledControlName` shows another control's value in that read-only text. Use it to show a name
while the form holds an ID.

`fixedValue` shows a value that is not a form control. Leave `controlName` empty to use it. A fixed
text value is always read-only. A fixed checkbox can be toggled when `isDisabled` is `false`.

### Events

The outputs are named `blurred`, `focused`, `changed` and `inputChanged` rather than `blur`,
`focus`, `change` and `input`. An output that shared a native event name would fire your handler
twice for events that bubble.

## Accessibility

The field renders no label. Wrap it in a `<label>`, as above, or use `lib-form-input-group`. The
read-only text is a plain `<span>`, so it reads as text, not as a form control.

## Theming

The field has no component tokens. Inputs read `--color-line-strong`, `--radius-field` and
`--color-focus-ring`. A touched, invalid control, or a field with `invalid` set, turns
`--color-danger`. The switch uses `--color-accent` and `--color-surface-solid`. See
[Theming](../guides/design-tokens.md).
