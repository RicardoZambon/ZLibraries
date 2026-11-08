---
title: Button
summary: A native button that takes its look from what it is for, with loading, success and error states.
entryPoint: library
api: [ButtonComponent]
storybook: buttons-button--primary
---

`lib-button` is the general-purpose button. You say what the button is for with an intent, and the
theme decides how that looks. It also shows a busy, a success and an error state, so an action can
report back without extra markup.

<!-- example: button-overview -->

## Usage

```ts
import { ButtonComponent } from '@zambon-dev/ui/library';
```

```html
<lib-button intent="primary" icon="fa-solid fa-floppy-disk" (click)="save()">Save</lib-button>
```

The label is the projected content. `icon` takes full Font Awesome classes, style prefix included.

### Intents

| Intent      | Use it for                                           |
| ----------- | ---------------------------------------------------- |
| `primary`   | The main action of a screen or dialog. One per area. |
| `secondary` | Every other action. The default.                     |
| `danger`    | An action that deletes or cannot be undone.          |
| `ghost`     | A quiet action, such as an icon in a toolbar.        |

<!-- example: button-intents -->

### Clicks and forms

There is no click output. The component renders a real `<button>`, so bind the native `(click)` on
`<lib-button>`: the event bubbles up from the inner button. A disabled button fires no click.

For the same reason `type="submit"` works inside a `<form>` with no extra wiring.

### States

- `loading` shows a spinner and blocks the button until you clear it.
- `success` shows a check mark and also blocks the button, so the action cannot run twice.
- `error` shows a cross but leaves the button usable, so the user can retry.

The states only change the button. Clearing them is up to you, for example after a short delay.

<!-- example: button-states -->

## Accessibility

- The inner element is a native `<button>`, so focus, Enter and Space work as usual.
- While `loading` is on, the button carries `aria-busy="true"`.
- `disabled`, `loading` and `success` set the native `disabled` attribute. The button then leaves
  the tab order.
- A button with an icon and no text has no accessible name. Set `ariaLabel` on it.

<!-- example: button-icon-only -->

## Theming

The button has no component tokens of its own. It reads the core role tokens: `--color-accent` and
`--color-accent-strong` for `primary`, `--color-danger` for `danger`, `--color-success` for the
success state, plus `--color-surface-inset`, `--color-line`, `--radius-control` and
`--color-focus-ring`. Changing those changes every component that uses them. See
[Theming](../guides/design-tokens.md).
