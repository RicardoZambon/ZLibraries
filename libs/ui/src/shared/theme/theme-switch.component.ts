import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '@zambon-dev/ui/library';
import { ThemePreference, ThemeService } from './theme.service';

/**
 * The top bar's light/dark control.
 *
 * One button stepping light -> dark -> system rather than three, because the bar is tight and this
 * is not a setting people change often. The icon shows the choice that is in force, not the one a
 * click would bring: a control that displays its own next state cannot be read at a glance.
 *
 * It has no stylesheet: a ghost `lib-button` is already the icon-button treatment, and a second
 * copy of it here would drift from the one in the top bar beside it.
 */
@Component({
  selector: 'shared-theme-switch',
  templateUrl: './theme-switch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, TranslatePipe],
})
export class ThemeSwitchComponent {
  //#region Variables
  private readonly theme = inject(ThemeService);
  //#endregion

  //#region Properties
  /** The choice in force, including `system`. */
  protected readonly preference = this.theme.preference;

  /** Full Font Awesome classes for the current choice -- the style prefix is not optional. */
  protected readonly icon = computed<string>(() => {
    const byPreference: Record<ThemePreference, string> = {
      light: 'fa-solid fa-sun',
      dark: 'fa-solid fa-moon',
      system: 'fa-solid fa-circle-half-stroke',
    };
    return byPreference[this.preference()];
  });

  /** Translation key naming the current choice, used for the label and the tooltip. */
  protected readonly label = computed<string>(() => {
    const byPreference: Record<ThemePreference, string> = {
      light: 'TopBar-Theme-Light',
      dark: 'TopBar-Theme-Dark',
      system: 'TopBar-Theme-System',
    };
    return byPreference[this.preference()];
  });
  //#endregion

  //#region Event handlers
  protected onClick(): void {
    this.theme.cyclePreference();
  }
  //#endregion
}
