# Internationalization

Every label in the package is a translation key, resolved by `@ngx-translate/core`. The package ships the translation files. Your build copies them, and a provider helper loads them.

## Shipped languages

| Code | Language   | Notes                                  |
| ---- | ---------- | -------------------------------------- |
| `en` | English    | Dates as `MM/dd/yyyy`, locale `en-US`. |
| `pt` | Portuguese | Dates as `dd/MM/yyyy`, locale `pt-BR`. |

The files come in two groups, one per entry point:

| Group     | Package folder   | What it covers                                                                                                          |
| --------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Framework | `i18n/framework` | Ribbon buttons, modals, grid messages, tabs, catalog select, language names and the format keys. One file per language. |
| Shared    | `i18n/shared`    | Sign-in, top bar (including sign-out), language selector, audit history and external content. One folder per feature.   |

## Copy the files into your build

Add two entries to the build target's `assets` in `angular.json`. `angular.json` cannot import TypeScript, so write the objects out:

```json
"assets": [
  {
    "glob": "**/*.json",
    "input": "node_modules/@zambon-dev/ui/i18n/framework",
    "output": "assets/i18n/zambon-dev/framework"
  },
  {
    "glob": "**/*.json",
    "input": "node_modules/@zambon-dev/ui/i18n/shared",
    "output": "assets/i18n/zambon-dev/shared"
  }
]
```

The output paths must stay exactly as shown. The provider helpers request the files from `/assets/i18n/zambon-dev/framework/` and `/assets/i18n/zambon-dev/shared/`.

The same objects are exported as `ZAMBON_FRAMEWORK_I18N_ASSET` and `ZAMBON_SHARED_I18N_ASSET`, for build tools that take their configuration from code.

The request paths start at the site root. If your application is served under a sub-path, build your own resource list from the relative paths instead of using the helpers.

## Load the files

Each entry point has a provider helper. Each one loads only its own group:

| Helper                                   | Entry point                | Loads                  |
| ---------------------------------------- | -------------------------- | ---------------------- |
| `provideZambonFrameworkTranslateService` | `@zambon-dev/ui/framework` | The framework files.   |
| `provideZambonSharedTranslateService`    | `@zambon-dev/ui/shared`    | The shared files only. |

Both take the same options:

| Option            | Type                                | Meaning                                                 |
| ----------------- | ----------------------------------- | ------------------------------------------------------- |
| `defaultLanguage` | `string`                            | Passed to `provideTranslateService`.                    |
| `appResources`    | `(string \| TranslationResource)[]` | Extra files to load and merge, after the package's own. |

An application that uses the shell needs both groups and its own files. Register one helper and pass the other group's resources, plus yours, through `appResources`:

```ts
import { ZAMBON_FRAMEWORK_I18N_RESOURCES } from '@zambon-dev/ui/framework';
import { provideZambonSharedTranslateService } from '@zambon-dev/ui/shared';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZambonSharedTranslateService({
      defaultLanguage: 'en',
      appResources: [...ZAMBON_FRAMEWORK_I18N_RESOURCES, { prefix: '/assets/i18n/', suffix: '.json' }],
    }),
  ],
};
```

Do not register both helpers. Each provides the single `TranslateLoader`, so the second one replaces the first.

An application that only uses framework and library components can use `provideZambonFrameworkTranslateService` on its own.

The loaders fetch through `HttpBackend`, so your HTTP interceptors do not run for translation files.

Lower-level pieces are exported too, for custom setups:

| Export                                                                        | What it is                                          |
| ----------------------------------------------------------------------------- | --------------------------------------------------- |
| `ZAMBON_FRAMEWORK_I18N_RESOURCES`, `ZAMBON_SHARED_I18N_RESOURCES`             | The resource lists the helpers load.                |
| `provideZambonFrameworkTranslateLoader`, `provideZambonSharedTranslateLoader` | The `TranslateLoader` provider alone.               |
| `createZambonFrameworkTranslateLoader`, `createZambonSharedTranslateLoader`   | Factories that return a `MultiTranslateHttpLoader`. |
| `ZAMBON_FRAMEWORK_I18N_ASSET_PATH`, `ZAMBON_SHARED_I18N_ASSET_PATH`           | The output folders, without the leading slash.      |

## Choose the language at startup

The helpers do not pick a language. Register the available languages and select one when the application starts:

```ts
import { inject, provideAppInitializer } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...the translate provider above
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      translate.addLangs(['en', 'pt']);
      translate.use(localStorage.getItem('language') ?? 'en');
    }),
  ],
};
```

The language selector lists what `addLangs` registered. Without that call the list is empty.

## How the language selector saves the choice

The selector appears in the top bar and on the sign-in screen. When the user picks a language, it calls `TranslateService.use` and writes the code to local storage under the key `language`.

The package never reads that key back. Read it yourself at startup, as in the snippet above.

Signing out clears local storage, so the saved choice is lost on sign-out.

## Keys your application provides

The package's own templates use only keys that ship in the files above, including the sign-out labels. You do not have to supply any package key.

Your content still needs keys: sidebar menu labels, column headers, field labels, tab titles and route titles. Put them in your own files.

## Format keys

The framework files carry format strings per language. Use them with Angular's pipes so that dates and numbers follow the chosen language.

| Key                | `en`                 | `pt`               | Used by the package                   |
| ------------------ | -------------------- | ------------------ | ------------------------------------- |
| `Format-Date`      | `MM/dd/yyyy`         | `dd/MM/yyyy`       | No.                                   |
| `Format-DateTime`  | `MM/dd/yyyy hh:mm a` | `dd/MM/yyyy HH:mm` | Yes: dates in the audit history list. |
| `MonthYear-Format` | `MM/yyyy`            | `MM/yyyy`          | No.                                   |
| `Format-Number`    | `1.0`                | `1.0`              | No.                                   |
| `Format-Currency`  | `1.2`                | `1.2`              | No.                                   |
| `locale`           | `en-US`              | `pt-BR`            | No.                                   |

```html
{{ order.createdOn | date: ('Format-Date' | translate) }}
```

## Add your own translation files

Your files are plain JSON, one per language, with flat keys:

```json
{
  "Menu-Dashboard": "Dashboard",
  "Customers-Column-Name": "Name"
}
```

Put them where your build serves them, for example `public/assets/i18n/en.json` and `public/assets/i18n/pt.json`. Then add a resource for them to `appResources`. A resource is a `prefix` and a `suffix` around the language code: `{ prefix: '/assets/i18n/', suffix: '.json' }` loads `/assets/i18n/en.json` for English.

Files are merged in order: the package's files first, then yours. A key you define again replaces the package's text, so you can reword any label.

A file that fails to load logs an error, and its keys show as raw keys. If a resource may be missing for some languages, mark it `optional: true` to silence the error.

### Adding a language

To add a language beyond `en` and `pt`:

1. Translate each shipped `en.json` into a `<code>.json`. Serve each one next to its English original in your build output, for example `assets/i18n/zambon-dev/framework/es.json` and `assets/i18n/zambon-dev/shared/login/es.json`. The helpers then load them like the shipped files.
2. Add a `Language-<code>` key to your files with the language's name, as the selector shows it.
3. Add the code to `addLangs`.

The selector has flag images for `en` and `pt` only. Other languages show without a flag.

## References

- Framework helpers: https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/framework/i18n/framework-i18n.ts
- Shared helpers: https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/shared/i18n/shared-i18n.ts
- Shipped files: https://github.com/RicardoZambon/ZLibraries/tree/main/libs/ui/src/i18n
