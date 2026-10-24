import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemePreference, ThemeService } from './theme.service';

/**
 * The top bar's light/dark control.
 *
 * One button stepping light -> dark -> system rather than three, because the bar is tight and this
 * is not a setting people change often. The icon shows the choice that is in force, not the one a
 * click would bring: a control that displays its own next state cannot be read at a glance.
 */
@Component({
  selector: 'shared-theme-switch',
  templateUrl: './theme-switch.component.html',
  styleUrls: ['./theme-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class ThemeSwitchComponent {
  //#region Variables
  private readonly theme = inject(ThemeService);
  //#endregion

  //#region Properties
  /** The choice in force, including `system`. */
  protected readonly preference = this.theme.preference;

  /** Font Awesome class for the current choice. */
  protected readonly icon = computed<string>(() => {
    const byPreference: Record<ThemePreference, string> = {
      light: 'fa-sun',
      dark: 'fa-moon',
      system: 'fa-circle-half-stroke',
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
