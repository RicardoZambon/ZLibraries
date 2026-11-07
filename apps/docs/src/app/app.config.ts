import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import topBarEn from '@zambon-dev/ui/i18n/shared/top-bar/en.json';
import { Observable, of } from 'rxjs';
import { routes } from './app.routes';

/** The shell uses the package's theme switch, whose labels come from the shared translations. */
class ShellTranslateLoader implements TranslateLoader {
  public getTranslation(): Observable<Record<string, string>> {
    return of(topBarEn);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideTranslateService({
      defaultLanguage: 'en',
      loader: { provide: TranslateLoader, useClass: ShellTranslateLoader },
    }),
  ],
};
