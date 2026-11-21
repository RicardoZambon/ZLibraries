/**
 * @jest-environment node
 */
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'node:path';
import { ZAMBON_FRAMEWORK_I18N_ASSET } from '../../src/framework/i18n/framework-i18n';
import { ZAMBON_SHARED_I18N_ASSET } from '../../src/shared/i18n/shared-i18n';
import { I18N_ASSETS } from './index';
import { ROOT_PROVIDERS } from './providers';

// The test runner loads the package-install task, which requires the ES-module-only `ora`. Jest
// cannot require it, and the tests never run the task, so it is stubbed.
jest.mock('ora', () => ({ __esModule: true, default: () => ({}) }));

const collectionPath = join(__dirname, '..', 'collection.json');
const runner = new SchematicTestRunner('@zambon-dev/ui', collectionPath);

async function createApp(standalone: boolean): Promise<UnitTestTree> {
  const workspace = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '22.0.0',
  });
  return runner.runExternalSchematic(
    '@schematics/angular',
    'application',
    { name: 'app', standalone, skipTests: true },
    workspace,
  );
}

function buildOptions(tree: UnitTestTree): Record<string, unknown> {
  const angularJson = JSON.parse(tree.readText('/angular.json'));
  return angularJson.projects.app.architect.build.options;
}

/** Every file's bytes, so a binary file such as the favicon compares too. */
function snapshot(tree: UnitTestTree): Map<string, string | undefined> {
  return new Map(tree.files.map((file) => [file, tree.read(file)?.toString('base64')]));
}

function count(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

describe('ng-add', () => {
  describe('on a fresh standalone application', () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic('ng-add', {}, await createApp(true));
    });

    it('adds the global stylesheets in order, before the application stylesheet', () => {
      const styles = buildOptions(tree)['styles'] as string[];
      expect(styles).toEqual([
        '@fortawesome/fontawesome-free/css/all.css',
        '@zambon-dev/ui/styles/theme.css',
        '@zambon-dev/ui/styles/common.scss',
        expect.stringMatching(/projects\/app\/src\/styles\.css$/),
      ]);
    });

    it('copies the translation files into the build', () => {
      const assets = buildOptions(tree)['assets'] as unknown[];
      expect(assets).toEqual(expect.arrayContaining(I18N_ASSETS));
    });

    it('runs Tailwind through PostCSS', () => {
      expect(JSON.parse(tree.readText('/.postcssrc.json'))).toEqual({ plugins: { '@tailwindcss/postcss': {} } });
    });

    it('adds the build packages and the peer dependencies', () => {
      const manifest = JSON.parse(tree.readText('/package.json'));
      expect(manifest.devDependencies).toEqual(
        expect.objectContaining({
          tailwindcss: '^4.0.0',
          '@tailwindcss/postcss': '^4.0.0',
          '@tailwindcss/forms': '^0.5.9',
        }),
      );
      expect(manifest.dependencies).toEqual(
        expect.objectContaining({
          '@fortawesome/fontawesome-free': '^7.0.0',
          '@ngx-translate/core': expect.any(String),
          '@angular/cdk': expect.any(String),
        }),
      );
    });

    it('sets the theme before the first paint', () => {
      const html = tree.readText('/projects/app/src/index.html');
      expect(html).toContain("localStorage.getItem('zambon-theme')");
      expect(html.indexOf('zambon-theme')).toBeLessThan(html.indexOf('</head>'));
    });

    it('adds the root providers and their imports to the application config', () => {
      const config = tree.readText('/projects/app/src/app/app.config.ts');
      expect(config).toContain('provideHttpClient(withInterceptorsFromDi())');
      expect(config).toContain('provideZambonSharedTranslateService({');
      expect(config).toContain('appResources: [...ZAMBON_FRAMEWORK_I18N_RESOURCES]');
      expect(config).toContain("translate.addLangs(['en', 'pt'])");
      expect(config).toContain('{ provide: GridConfigsProvider, useClass: FrameworkGridConfigsProvider }');
      expect(config).toMatch(/import \{[^}]*provideZambonSharedTranslateService[^}]*\} from '@zambon-dev\/ui\/shared'/);
      expect(config).toMatch(/import \{[^}]*ZAMBON_FRAMEWORK_I18N_RESOURCES[^}]*\} from '@zambon-dev\/ui\/framework'/);
      expect(config).toMatch(/import \{[^}]*GridConfigsProvider[^}]*\} from '@zambon-dev\/ui\/library'/);
      expect(config).toMatch(/import \{[^}]*TranslateService[^}]*\} from '@ngx-translate\/core'/);
    });

    it('changes nothing when it runs a second time', async () => {
      const before = snapshot(tree);
      const again = await runner.runSchematic('ng-add', {}, tree);

      expect([...again.files].sort()).toEqual([...before.keys()].sort());
      for (const [file, text] of before) {
        expect({ file, text: again.read(file)?.toString('base64') }).toEqual({ file, text });
      }
    });
  });

  it('keeps an existing provideHttpClient and warns when it lacks withInterceptorsFromDi', async () => {
    const app = await createApp(true);
    const path = '/projects/app/src/app/app.config.ts';
    app.overwrite(
      path,
      "import { provideHttpClient } from '@angular/common/http';\n" +
        app.readText(path).replace('providers: [', 'providers: [provideHttpClient(), '),
    );
    const warnings: string[] = [];
    const subscription = runner.logger.subscribe((entry) => {
      if (entry.level === 'warn') {
        warnings.push(entry.message);
      }
    });

    const tree = await runner.runSchematic('ng-add', {}, app);
    subscription.unsubscribe();

    expect(count(tree.readText(path), 'provideHttpClient(')).toBe(1);
    expect(warnings.join('\n')).toContain('withInterceptorsFromDi');
  });

  it('keeps a stylesheet that already imports the theme, and loads common.scss after it', async () => {
    const app = await createApp(true);
    app.overwrite(
      '/projects/app/src/styles.css',
      "@import '@fortawesome/fontawesome-free/css/all.css';\n@import '@zambon-dev/ui/styles/theme.css';\n",
    );

    const tree = await runner.runSchematic('ng-add', {}, app);

    expect(buildOptions(tree)['styles']).toEqual([
      expect.stringMatching(/styles\.css$/),
      '@zambon-dev/ui/styles/common.scss',
    ]);
  });

  it('rejects an NgModule application and changes nothing', async () => {
    const app = await createApp(false);
    const before = snapshot(app);

    await expect(runner.runSchematic('ng-add', {}, app)).rejects.toThrow(/standalone applications only/);

    for (const [file, text] of before) {
      expect(app.read(file)?.toString('base64')).toBe(text);
    }
  });

  it('keeps one list of root providers', () => {
    expect(ROOT_PROVIDERS.map((provider) => provider.description)).toEqual([
      'HTTP client with class-based interceptors',
      'translations for the framework and shared layers',
      'language selection at startup',
      'grid messages as translation keys',
    ]);
  });

  it('copies the translation files to the folders the provider helpers load them from', () => {
    expect(I18N_ASSETS).toEqual([ZAMBON_FRAMEWORK_I18N_ASSET, ZAMBON_SHARED_I18N_ASSET]);
  });
});
