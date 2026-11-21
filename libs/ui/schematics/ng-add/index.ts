import { chain, Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import {
  addDependency,
  addRootProvider,
  DependencyType,
  ExistingBehavior,
  ProjectDefinition,
  readWorkspace,
  updateWorkspace,
} from '@schematics/angular/utility';
import { isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { findAppConfig } from '@schematics/angular/utility/standalone/app_config';
import { findBootstrapApplicationCall, getMainFilePath } from '@schematics/angular/utility/standalone/util';
import { readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { ROOT_PROVIDERS } from './providers';

export interface NgAddOptions {
  project?: string;
}

/** Packages the styles need. They are not peer dependencies, so the consumer installs them. */
export const BUILD_DEPENDENCIES = [
  { name: 'tailwindcss', version: '^4.0.0', type: DependencyType.Dev },
  { name: '@tailwindcss/postcss', version: '^4.0.0', type: DependencyType.Dev },
  { name: '@tailwindcss/forms', version: '^0.5.9', type: DependencyType.Dev },
  { name: '@fortawesome/fontawesome-free', version: '^7.0.0', type: DependencyType.Default },
] as const;

const FONT_AWESOME_CSS = '@fortawesome/fontawesome-free/css/all.css';
const THEME_CSS = '@zambon-dev/ui/styles/theme.css';
const COMMON_SCSS = '@zambon-dev/ui/styles/common.scss';

/** The same objects as `ZAMBON_FRAMEWORK_I18N_ASSET` and `ZAMBON_SHARED_I18N_ASSET`; a spec keeps them equal. */
export const I18N_ASSETS = [
  {
    glob: '**/*.json',
    input: 'node_modules/@zambon-dev/ui/i18n/framework',
    output: 'assets/i18n/zambon-dev/framework',
  },
  { glob: '**/*.json', input: 'node_modules/@zambon-dev/ui/i18n/shared', output: 'assets/i18n/zambon-dev/shared' },
];

const POSTCSS_PLUGIN = '@tailwindcss/postcss';
const POSTCSS_CONFIG_FILES = ['.postcssrc.json', 'postcss.config.json'];

/** Must match `THEME_STORAGE_KEY`, which `ThemeService` writes. */
const THEME_SCRIPT_MARKER = "localStorage.getItem('zambon-theme')";
const THEME_SCRIPT = `  <script>
    (function () {
      try {
        var p = localStorage.getItem('zambon-theme') || 'light';
        if (p === 'system') p = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = p;
      } catch (e) {
        document.documentElement.dataset.theme = 'light';
      }
    })();
  </script>
`;

const DOCS_URL = 'https://ricardozambon.github.io/ZLibraries/guides/getting-started';

const NEXT_STEPS = `
@zambon-dev/ui is set up. Library components such as lib-button render now.

The full application shell (MainLayoutComponent and the sign-in screen) needs values only your
application knows, so add these to the application config yourself:
  - APP_CONFIG with your API base URL
  - JwtModule.forRoot(...) with your token getter and domains, and JwtInterceptor
  - AuthInterceptor in HTTP_INTERCEPTORS
  - { provide: AuthService, useExisting: AuthenticationService }
  - { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
  - { provide: SidebarService, useClass: <your SidebarService subclass> }
  - routes for MainLayoutComponent and SharedAuthModule

To load your own translation files, add a resource such as
{ prefix: '/assets/i18n/', suffix: '.json' } to appResources.

Full guide: ${DOCS_URL}
`;

export function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const projectName = resolveProjectName(options.project, workspace.projects);
    const project = workspace.projects.get(projectName);
    if (!project || project.extensions['projectType'] !== 'application') {
      throw new SchematicsException(`"${projectName}" is not an application in this workspace.`);
    }
    if (!project.targets.get('build')) {
      throw new SchematicsException(`The project "${projectName}" has no build target.`);
    }

    const mainPath = await getMainFilePath(tree, projectName);
    if (!isStandaloneApp(tree, mainPath)) {
      throw new SchematicsException(
        `ng add @zambon-dev/ui supports standalone applications only, and "${projectName}" bootstraps an NgModule ` +
          `(${mainPath} calls bootstrapModule). Nothing was changed. ` +
          `Follow the manual setup instead: ${DOCS_URL}`,
      );
    }

    return chain([
      addDependencies(),
      updateBuildOptions(projectName, project),
      addPostcssConfig(),
      addThemeScript(project),
      addProviders(projectName, mainPath, context),
      (_: Tree, ctx: SchematicContext) => ctx.logger.info(NEXT_STEPS),
    ]);
  };
}

function resolveProjectName(requested: string | undefined, projects: Iterable<[string, ProjectDefinition]>): string {
  if (requested) {
    return requested;
  }
  const applications = [...projects].filter(([, project]) => project.extensions['projectType'] === 'application');
  if (applications.length === 1) {
    return applications[0][0];
  }
  throw new SchematicsException('Name the application to set up with --project.');
}

function addDependencies(): Rule {
  // The peer dependencies go into package.json too: the application config imports some of them,
  // and a strict package manager would not let it import a package it does not declare.
  const manifest = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')) as {
    peerDependencies?: Record<string, string>;
  };
  const peers = Object.entries(manifest.peerDependencies ?? {}).map(([name, version]) => ({
    name,
    version,
    type: DependencyType.Default,
  }));

  return chain(
    [...peers, ...BUILD_DEPENDENCIES].map((dependency) =>
      addDependency(dependency.name, dependency.version, {
        type: dependency.type,
        existing: ExistingBehavior.Skip,
      }),
    ),
  );
}

type StyleEntry = string | { input: string };

function styleInput(entry: StyleEntry): string {
  return typeof entry === 'string' ? entry : entry.input;
}

/** Adds the three global stylesheets in their required order, and skips any already loaded. */
export function withGlobalStyles(existing: StyleEntry[], tree: Tree): StyleEntry[] {
  const styles = [...existing];
  const indexOf = (needle: string): number =>
    styles.findIndex((entry) => {
      const input = styleInput(entry);
      return input === needle || (tree.exists(input) && tree.readText(input).includes(needle));
    });

  if (indexOf(FONT_AWESOME_CSS) < 0) {
    styles.unshift(FONT_AWESOME_CSS);
  }
  if (indexOf(THEME_CSS) < 0) {
    styles.splice(indexOf(FONT_AWESOME_CSS) + 1, 0, THEME_CSS);
  }
  if (indexOf(COMMON_SCSS) < 0) {
    styles.splice(indexOf(THEME_CSS) + 1, 0, COMMON_SCSS);
  }
  return styles;
}

function updateBuildOptions(projectName: string, project: ProjectDefinition): Rule {
  return (tree: Tree) => {
    const options = project.targets.get('build')?.options ?? {};
    const styles = withGlobalStyles((options['styles'] as StyleEntry[] | undefined) ?? [], tree);

    const assets = [...((options['assets'] as (string | { input?: string })[] | undefined) ?? [])];
    for (const asset of I18N_ASSETS) {
      const present = assets.some((entry) => (typeof entry === 'string' ? entry : entry.input) === asset.input);
      if (!present) {
        assets.push(asset);
      }
    }

    return updateWorkspace((workspace) => {
      const build = workspace.projects.get(projectName)?.targets.get('build');
      if (!build) {
        return;
      }
      build.options ??= {};
      build.options['styles'] = styles;
      build.options['assets'] = assets;
    });
  };
}

function addPostcssConfig(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const existing = POSTCSS_CONFIG_FILES.find((file) => tree.exists(file));
    if (!existing) {
      tree.create('.postcssrc.json', JSON.stringify({ plugins: { [POSTCSS_PLUGIN]: {} } }, null, 2) + '\n');
      return;
    }

    let config: { plugins?: Record<string, unknown> };
    try {
      config = JSON.parse(tree.readText(existing));
    } catch {
      context.logger.warn(`Could not read ${existing}. Add "${POSTCSS_PLUGIN}": {} to its plugins yourself.`);
      return;
    }
    if (config.plugins?.[POSTCSS_PLUGIN]) {
      return;
    }
    config.plugins = { ...config.plugins, [POSTCSS_PLUGIN]: {} };
    tree.overwrite(existing, JSON.stringify(config, null, 2) + '\n');
  };
}

function indexHtmlPath(project: ProjectDefinition): string {
  const index = project.targets.get('build')?.options?.['index'] as string | { input: string } | undefined;
  if (typeof index === 'string') {
    return index;
  }
  if (index?.input) {
    return index.input;
  }
  return posix.join(project.sourceRoot ?? posix.join(project.root, 'src'), 'index.html');
}

/** Sets the theme before the first paint, so a user who chose dark never sees a flash of light. */
function addThemeScript(project: ProjectDefinition): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const path = indexHtmlPath(project);
    if (!tree.exists(path)) {
      context.logger.warn(`${path} not found. Add the dark-theme script yourself: ${DOCS_URL}`);
      return;
    }
    const html = tree.readText(path);
    if (html.includes(THEME_SCRIPT_MARKER)) {
      return;
    }
    const headEnd = html.indexOf('</head>');
    if (headEnd < 0) {
      context.logger.warn(`${path} has no </head>. Add the dark-theme script yourself: ${DOCS_URL}`);
      return;
    }
    // At the start of the </head> line, so the script is the last element in <head>.
    const lineStart = html.lastIndexOf('\n', headEnd) + 1;
    const atLineStart = html.slice(lineStart, headEnd).trim() === '';
    const recorder = tree.beginUpdate(path);
    recorder.insertLeft(atLineStart ? lineStart : headEnd, atLineStart ? THEME_SCRIPT : '\n' + THEME_SCRIPT);
    tree.commitUpdate(recorder);
  };
}

function addProviders(projectName: string, mainPath: string, context: SchematicContext): Rule {
  return (tree: Tree) => {
    const bootstrapCall = findBootstrapApplicationCall(tree, mainPath);
    const configPath = findAppConfig(bootstrapCall, tree, mainPath)?.filePath ?? mainPath;
    const source = tree.readText(configPath);

    const rules: Rule[] = [];
    for (const provider of ROOT_PROVIDERS) {
      if (provider.alreadyProvided.test(source)) {
        context.logger.info(`Skipped ${provider.description}: already in ${configPath}.`);
        const warning = provider.checkExisting?.(source);
        if (warning) {
          context.logger.warn(warning);
        }
        continue;
      }
      rules.push(addRootProvider(projectName, provider.code));
    }
    return chain(rules);
  };
}
