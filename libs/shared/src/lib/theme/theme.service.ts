import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

/** What the user chose. `system` follows the operating system and keeps following it. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** What the stylesheet is actually asked for. The CSS never sees `system`. */
export type ResolvedTheme = 'light' | 'dark';

/** Key the preference is stored under, and the one the pre-paint snippet has to read. */
export const THEME_STORAGE_KEY = 'zambon-theme';

/** Attribute on `<html>` the token layer keys off. */
const THEME_ATTRIBUTE = 'data-theme';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Owns the light/dark choice and writes it to `<html>`.
 *
 * The CSS switch is an attribute rather than `prefers-color-scheme` so that both sides keep a
 * choice: an application can leave the attribute unwritten and never have a dark theme, and a user
 * can pick light on a dark machine. Following the operating system is still a supported choice --
 * it is resolved here, in TypeScript, and written out as a concrete `light` or `dark`. That is why
 * `theme.css` holds one dark block instead of two that would have to be kept identical.
 *
 * The attribute is normally written before this service exists, by the snippet in `index.html`
 * documented in the design-tokens guide -- an Angular service cannot run before the first paint,
 * and a frame of the wrong theme is worse than no theme. This picks up from there.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  //#region Variables
  private readonly document = inject(DOCUMENT);
  private readonly preferenceState = signal<ThemePreference>(this.readStoredPreference());
  private readonly systemPrefersDark = signal<boolean>(this.readSystemPrefersDark());
  //#endregion

  //#region Properties
  /** What the user chose, including `system`. */
  public readonly preference = this.preferenceState.asReadonly();

  /** What is actually applied right now. `system` is already resolved here. */
  public readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.preferenceState();
    if (preference !== 'system') {
      return preference;
    }
    return this.systemPrefersDark() ? 'dark' : 'light';
  });
  //#endregion

  constructor() {
    this.watchSystemPreference();

    // Writes on creation as well as on every later change, so a mismatch between the pre-paint
    // snippet and the stored preference is corrected rather than left on screen.
    effect(() => {
      this.document.documentElement.setAttribute(THEME_ATTRIBUTE, this.resolved());
    });
  }

  //#region Methods
  /** Records a choice and applies it. Persisting is best-effort: a blocked store is not an error. */
  public setPreference(preference: ThemePreference): void {
    this.preferenceState.set(preference);

    try {
      this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Private mode, or storage disabled by policy. The choice still applies for this session.
    }
  }

  /** Steps light -> dark -> system -> light, which is what a single-button switch needs. */
  public cyclePreference(): void {
    const order: ThemePreference[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(this.preferenceState()) + 1) % order.length];
    this.setPreference(next);
  }
  //#endregion

  //#region Private methods
  private readStoredPreference(): ThemePreference {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Unreadable storage is the same as no stored choice.
    }
    return 'light';
  }

  private readSystemPrefersDark(): boolean {
    return this.document.defaultView?.matchMedia?.(SYSTEM_DARK_QUERY).matches ?? false;
  }

  /**
   * Keeps following the operating system after the first read. Without this, choosing `system` and
   * then switching the machine to dark would leave the application on light until a reload.
   */
  private watchSystemPreference(): void {
    const query = this.document.defaultView?.matchMedia?.(SYSTEM_DARK_QUERY);
    query?.addEventListener('change', (event) => this.systemPrefersDark.set(event.matches));
  }
  //#endregion
}
