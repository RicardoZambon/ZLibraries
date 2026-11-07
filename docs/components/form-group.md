---
title: Form group
summary: A titled block that lays out related form fields.
entryPoint: library
api: [FormGroupComponent]
storybook: library-form-components-form-group--primary
---

`lib-form-group` gathers related fields under an optional heading. It is a layout container only.
It does not create or bind a form: the fields inside it still read their controls from the
surrounding `[formGroup]`.

<!-- example: form-group-overview -->

## Usage

```ts
import { FormGroupComponent, FormInputGroupComponent, FormService } from '@zambon-dev/ui/library';
```

```html
<form [formGroup]="form">
  <lib-form-group label="Customer">
    <lib-form-input-group controlName="name" label="Name"></lib-form-input-group>
    <lib-form-input-group controlName="email" label="Email" type="email"></lib-form-input-group>
  </lib-form-group>
</form>
```

The content is a two-column grid: labels on the left, fields on the right.
`lib-form-input-group` and `lib-catalog-select` each fill one row of it through CSS subgrid. Put
them directly inside a form group, or inside your own two-column grid. Elsewhere their label and
field do not line up.

`label` is a translation key. A key with no translation shows as written, so plain text works too.
Without a label, no heading is drawn.

Set `shouldExpand` when the group should grow to fill the space left in its container, for example
the last group on a screen that holds a tall text area.

Do not confuse it with Angular's `FormGroup` class or the `formGroup` directive. The names overlap;
the jobs do not.

## Accessibility

The heading is an `<h3>`. Check that this level fits the outline of your page. The group adds no
`fieldset` or `role="group"`. If assistive technology must announce the fields as a set, wrap them in
your own `<fieldset>` with a `<legend>`.

## Theming

The group has no component tokens. The line under the heading uses `--color-line`. See
[Theming](../guides/design-tokens.md).
