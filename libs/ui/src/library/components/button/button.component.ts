import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal } from '@angular/core';

/** What the button is for, which is what decides how loud it looks. */
export type ButtonIntent = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * The one button.
 *
 * It replaces the global `.btn` classes, which generated 154 variants by interpolating Tailwind
 * colour names -- `btn blue-500`, `btn red-700` -- in a `@for` loop. Those named a palette entry
 * rather than a purpose, so a screen's buttons were a colour decision taken 154 times, and none of
 * them could follow a theme. An intent says what the button is for and lets the theme decide what
 * that looks like.
 *
 * `lib-ribbon-button` is deliberately not folded in here. It is a different shape -- icon above
 * label, large hit area, an options menu -- and merging the two would produce one component with
 * two personalities. They share the tokens instead.
 *
 * There is no click output: the inner element is a real `<button>`, so a `(click)` bound on
 * `<lib-button>` receives the bubbled event, and a disabled button emits nothing to bubble. For the
 * same reason `type="submit"` works from inside a form with no wiring.
 */
@Component({
  selector: 'lib-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  //#region Inputs
  /** What the button is for. Governs fill and text colour. */
  public readonly intent: InputSignal<ButtonIntent> = input<ButtonIntent>('secondary');

  /** Native button type. `submit` works because the rendered button is inside the host's form. */
  public readonly type: InputSignal<'button' | 'submit' | 'reset'> = input<'button' | 'submit' | 'reset'>('button');

  public readonly disabled: InputSignal<boolean> = input(false);

  /** Shows a spinner, announces `aria-busy` and blocks activation -- by the keyboard too. */
  public readonly loading: InputSignal<boolean> = input(false);

  /** Transient confirmation. Blocks activation so the action cannot be fired twice. */
  public readonly success: InputSignal<boolean> = input(false);

  /** Transient failure. Leaves the button usable so the action can be retried. */
  public readonly error: InputSignal<boolean> = input(false);

  /** Font Awesome classes for a leading icon, e.g. `fa-solid fa-floppy-disk`. */
  public readonly icon: InputSignal<string | undefined> = input<string>();

  /** Required when the button has an icon and no text. */
  public readonly ariaLabel: InputSignal<string | undefined> = input<string>();
  //#endregion

  //#region Properties
  /** Loading and success both stand for "this action is settled"; error is retryable. */
  protected readonly isBlocked: Signal<boolean> = computed(() => this.disabled() || this.loading() || this.success());
  //#endregion
}
