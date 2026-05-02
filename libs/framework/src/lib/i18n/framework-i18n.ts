import { HttpBackend } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader, TranslationResource } from 'ngx-translate-multi-http-loader';

export interface AngularAssetPattern {
  glob: string;
  input: string;
  output: string;
}

export const ZAMBON_FRAMEWORK_I18N_ASSET_PATH = 'assets/i18n/zambon-dev/framework';

export const ZAMBON_FRAMEWORK_I18N_ASSET: AngularAssetPattern = {
  glob: '**/*.json',
  input: 'node_modules/@zambon-dev/framework/i18n',
  output: ZAMBON_FRAMEWORK_I18N_ASSET_PATH,
};

export const ZAMBON_FRAMEWORK_I18N_RESOURCES: TranslationResource[] = [
  { prefix: `/${ZAMBON_FRAMEWORK_I18N_ASSET_PATH}/`, suffix: '.json' },
];

export interface ZambonFrameworkTranslateConfig {
  defaultLanguage?: string;
  appResources?: (string | TranslationResource)[];
}

export function createZambonFrameworkTranslateLoader(
  httpBackend: HttpBackend,
  appResources: (string | TranslationResource)[] = [],
): MultiTranslateHttpLoader {
  return new MultiTranslateHttpLoader(httpBackend, [
    ...ZAMBON_FRAMEWORK_I18N_RESOURCES,
    ...appResources,
  ]);
}

export function provideZambonFrameworkTranslateLoader(
  appResources: (string | TranslationResource)[] = [],
): Provider {
  return {
    provide: TranslateLoader,
    useFactory: (httpBackend: HttpBackend) => createZambonFrameworkTranslateLoader(httpBackend, appResources),
    deps: [HttpBackend],
  };
}

export function provideZambonFrameworkTranslateService(
  config: ZambonFrameworkTranslateConfig = {},
): EnvironmentProviders {
  return provideTranslateService({
    defaultLanguage: config.defaultLanguage,
    loader: provideZambonFrameworkTranslateLoader(config.appResources),
  });
}
