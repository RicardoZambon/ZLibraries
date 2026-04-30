import { InjectionToken } from '@angular/core';

export const APP_CONFIG: InjectionToken<AppConfig> = new InjectionToken<AppConfig>('Manually constructed AppConfig', {
  providedIn: 'root',
  factory: () => new AppConfig(''),
});

export class AppConfig {
  public BASE_URL: string;

  constructor(baseUrl: string) {
    this.BASE_URL = baseUrl;
  }
}