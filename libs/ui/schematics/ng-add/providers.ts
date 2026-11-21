import type { CodeBlockCallback } from '@schematics/angular/utility';

/** A provider that `ng add` places in the application config. */
export interface RootProvider {
  /** What the provider is for. Printed when it is added or skipped. */
  readonly description: string;
  /** Matches the application config when this provider, or an equivalent one, is already there. */
  readonly alreadyProvided: RegExp;
  /** Builds the provider expression and its imports. */
  readonly code: CodeBlockCallback;
  /** Returns a warning when the existing setup is present but incomplete. */
  readonly checkExisting?: (configSource: string) => string | undefined;
}

/**
 * Every root provider `ng add` adds, in order. This is the one list to change when the setup
 * changes. Providers that need values only the application knows (the API URL, the JWT options,
 * the sidebar service, the routes) are not here: `ng add` prints them as next steps instead.
 */
export const ROOT_PROVIDERS: readonly RootProvider[] = [
  {
    description: 'HTTP client with class-based interceptors',
    alreadyProvided: /\bprovideHttpClient\s*\(/,
    code: ({ code, external }) =>
      code`${external('provideHttpClient', '@angular/common/http')}(${external('withInterceptorsFromDi', '@angular/common/http')}())`,
    checkExisting: (source) =>
      /\bwithInterceptorsFromDi\s*\(/.test(source)
        ? undefined
        : 'provideHttpClient() is already in the application config without withInterceptorsFromDi(). ' +
          'Add it if you use AuthInterceptor: the package registers it as a class-based interceptor.',
  },
  {
    description: 'translations for the framework and shared layers',
    alreadyProvided:
      /\bprovideZambon(Shared|Framework)TranslateService\s*\(|\bprovideTranslateService\s*\(|\bTranslateModule\.forRoot\s*\(/,
    code: ({ code, external }) =>
      code`${external('provideZambonSharedTranslateService', '@zambon-dev/ui/shared')}({
      defaultLanguage: 'en',
      appResources: [...${external('ZAMBON_FRAMEWORK_I18N_RESOURCES', '@zambon-dev/ui/framework')}],
    })`,
  },
  {
    description: 'language selection at startup',
    alreadyProvided: /\.addLangs\s*\(/,
    code: ({ code, external }) =>
      code`${external('provideAppInitializer', '@angular/core')}(() => {
      const translate = ${external('inject', '@angular/core')}(${external('TranslateService', '@ngx-translate/core')});
      translate.addLangs(['en', 'pt']);
      translate.use(globalThis.localStorage?.getItem('language') ?? 'en');
    })`,
  },
  {
    description: 'grid messages as translation keys',
    alreadyProvided: /\bGridConfigsProvider\b/,
    code: ({ code, external }) =>
      code`{ provide: ${external('GridConfigsProvider', '@zambon-dev/ui/library')}, useClass: ${external('FrameworkGridConfigsProvider', '@zambon-dev/ui/framework')} }`,
  },
];
