import { Component, inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@zambon-dev/framework';

@Component({
  selector: 'shared-environment-badge',
  templateUrl: './environment-badge.component.html',
  styleUrls: ['./environment-badge.component.scss'],
})
export class EnvironmentBadgeComponent {
  //#region Variables
  private config: AppConfig = inject(APP_CONFIG);
  //#endregion

  //#region Properties
  /** CSS modifier class for the current environment, falling back to a neutral style. */
  protected get badgeClass(): string {
    const colorByEnvironment: Record<string, string> = {
      DEV: 'env-dev',
      QA: 'env-qa',
      STG: 'env-stg',
    };
    return colorByEnvironment[this.environment] ?? 'env-neutral';
  }

  /** Normalized environment key (uppercase, trimmed). */
  protected get environment(): string {
    return (this.config.environment ?? '').trim().toUpperCase();
  }

  /** The badge is hidden in production and when no environment is configured. */
  protected get isVisible(): boolean {
    return this.environment.length > 0 && this.environment !== 'PROD';
  }
  //#endregion
}
