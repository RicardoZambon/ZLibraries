import { AbstractControl } from '@angular/forms';

/**
 * Tracks the form controls that exist only to show a catalog selection's label.
 *
 * `lib-catalog-select` works in pairs: the control named by `controlName` holds the identifier, and
 * the one named by `displayControlName` holds the text the user reads. The second is created by the
 * component itself when a screen does not declare it, so a form ends up carrying controls nobody
 * wrote down — and a filters form then submits them alongside the real filters.
 *
 * The mark lives in a `WeakSet` keyed by the control instance rather than by its name. That is the
 * only scope that is actually correct: two forms may each have an `employeeName`, and only the one
 * a catalog select drives is a display control. It also keeps nothing alive.
 */
export class DisplayControls {
  //#region Variables
  private static readonly marked: WeakSet<AbstractControl> = new WeakSet<AbstractControl>();
  //#endregion

  //#region Public methods
  /**
   * Whether the control exists only to display a catalog selection's label.
   *
   * @param control The control, which may be absent.
   * @returns `true` when a catalog select drives it as its display control.
   */
  public static isDisplayControl(control: AbstractControl | null | undefined): boolean {
    return !!control && DisplayControls.marked.has(control);
  }

  /**
   * Marks the control as existing only to display a catalog selection's label.
   *
   * @param control The control, which may be absent.
   */
  public static markAsDisplayControl(control: AbstractControl | null | undefined): void {
    if (control) {
      DisplayControls.marked.add(control);
    }
  }
  //#endregion
}
