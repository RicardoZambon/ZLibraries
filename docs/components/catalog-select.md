---
title: Catalog select
summary: A labelled, searchable dropdown over a fixed list or a server search.
entryPoint: library
api: [CatalogSelectComponent, CatalogService]
storybook: library-form-components-catalog-select--primary
---

`lib-catalog-select` lets the user pick one entry from a catalog. The entries come from a list you
pass in, or from a search endpoint on your API. The field writes two controls of the surrounding
form: the chosen value and its display text.

<!-- example: catalog-select-basic -->

## Usage

```ts
import { CatalogSelectComponent, FormGroupComponent, FormService } from '@zambon-dev/ui/library';
```

```html
<form [formGroup]="form">
  <lib-form-group>
    <lib-catalog-select
      controlName="countryId"
      displayControlName="countryName"
      label="Country"
      [entriesList]="countries"
    ></lib-catalog-select>
  </lib-form-group>
</form>
```

```ts
protected readonly form = new FormGroup({
  countryId: new FormControl<number | null>(null),
  countryName: new FormControl<string>(''),
});

protected readonly countries = [
  { value: 1, display: 'Brazil' },
  { value: 2, display: 'Portugal' },
];
```

### What it needs

- A parent `[formGroup]` with **both** controls: `controlName` for the value and
  `displayControlName` for the text the input shows.
- A `FormService` provided by the host component, as for every form field.
- `HttpClient` (`provideHttpClient()`), even for a fixed list: the search service is always
  created.
- The translations of the `@zambon-dev/ui/framework` files, for the dropdown's status messages. See
  [Internationalization](../guides/internationalization.md).

It renders a [form input group](./form-input-group.md), so it fills one row of a
[form group](./form-group.md) and shows `validations` for the value control.

### A starting value

The input shows the display control, not the value. To open the form with an entry already chosen,
set both controls:

```ts
type: new FormControl<string | null>('date'),
typeName: new FormControl<string>('Date'),
```

<!-- example: catalog-select-enum -->

### A fixed list

`entriesList` takes any array. Each item's value and text are read from `valueProperty` and
`displayProperty`, by default `value` and `display`. The text may be an observable, such as a
translation from `TranslateService.get()`. Typing filters the list by text, ignoring case. A new
array refreshes the dropdown.

For a short list, set `searchable` to `false`. The field then works as a plain picker: it opens on
click, takes no typing and keeps its clear button.

<!-- example: catalog-select-short-list -->

### A server search

Set `searchEndpoint` to a URL. The field POSTs `{ maxResults, criteria, filters }` to it, 500 ms
after the user stops typing, and expects `{ entries, shouldUseCriteria }` back. When the first answer
says `shouldUseCriteria: true`, the field asks for at least `minimumLengthSearch` characters (default 3) before it searches. See [Catalog search](../guides/backend-contract.md#catalog-search) for the
contract.

`filters` is sent with every search, and a changed filter set starts the search over. `maxEntries`
caps the result count (default 100).

<!-- example: catalog-select-remote -->

### Inside a grid editor

When a `DataGridDataset` is provided around the field and `controlName` equals the dataset's key
property, entries whose value is already a loaded row are left out. This stops a multi-editor from
adding the same record twice.

### Read-only

`readOnly` blocks typing, hides the clear button and stops the dropdown opening on focus. A click
still opens it.

## Accessibility

The input follows the combobox pattern. It carries `role="combobox"`, `aria-expanded`,
`aria-autocomplete="list"` and points at the active option with `aria-activedescendant`. The list is
a `listbox` of `option` elements with `aria-selected`.

| Key         | Action                                        |
| ----------- | --------------------------------------------- |
| Arrow Down  | Opens the list, then moves to the next entry. |
| Arrow Up    | Moves to the previous entry.                  |
| Enter       | Chooses the active entry.                     |
| Escape, Tab | Closes the list.                              |

Status rows (loading, no results, type more) are announced through `aria-live`. The retry row after
a failed search is a real button. The clear button is left out of the Tab order.

The label has the same limit as in [form input group](./form-input-group.md#accessibility): it is
not linked to the input.

## Theming

The field has no component tokens. The dropdown reads `--color-surface-solid`, `--color-line`,
`--shadow-overlay` and `--radius-control`. An entry under the pointer uses `--state-hover`; the
chosen and the keyboard-active entries use `--state-selected`. See [Theming](../guides/design-tokens.md).
