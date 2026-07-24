import { InjectionToken } from '@angular/core';

export const APP_CONFIG: InjectionToken<AppConfig> = new InjectionToken<AppConfig>('Manually constructed AppConfig', {
  providedIn: 'root',
  factory: () => new AppConfig(''),
});

export interface AppConfigOptions {
  appName?: string;
  companyName?: string;
  environment?: string;
  logoUrl?: string;
  notificationsEnabled?: boolean;
  notificationsUrl?: string;
}

export class AppConfig {
  public BASE_URL: string;

  /** Application name shown in the top bar brand block. */
  public appName: string;

  /** Company name shown beneath the application name. */
  public companyName: string;

  /** Environment key (e.g. 'DEV', 'QA', 'STG', 'PROD'). Empty string when unset. */
  public environment: string;

  /** Optional brand logo URL shown in the top bar. */
  public logoUrl?: string;

  /** Whether the top-bar notifications feature (bell + badge) is enabled. */
  public notificationsEnabled: boolean;

  /** SignalR hub URL the notifications service connects to when enabled. */
  public notificationsUrl: string;

  constructor(baseUrl: string, options?: AppConfigOptions) {
    this.BASE_URL = baseUrl;
    this.appName = options?.appName ?? '';
    this.companyName = options?.companyName ?? '';
    this.environment = options?.environment ?? '';
    this.logoUrl = options?.logoUrl;
    this.notificationsEnabled = options?.notificationsEnabled ?? false;
    this.notificationsUrl = options?.notificationsUrl ?? '';
  }
}
