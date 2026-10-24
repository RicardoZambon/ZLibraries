import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // Dev-only entry points: their imports are not part of the published surface.
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs}',
            '{projectRoot}/jest.config.ts',
            '{projectRoot}/jest.time-zone-environment.cjs',
            '{projectRoot}/.storybook/**/*',
            '{projectRoot}/src/test-setup.ts',
            '{projectRoot}/src/**/*.spec.ts',
            '{projectRoot}/src/**/*.stories.ts',
          ],
          // Sibling workspace packages carry a placeholder 0.0.1 version in git;
          // semantic-release stamps the real one at publish time, so the range
          // in peerDependencies can never match what is checked out.
          ignoredDependencies: ['@zambon-dev/ui'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    // Each layer keeps the selector prefix it published under. One package does not
    // mean one prefix: a consumer still reads <lib-*> and knows which layer it came from.
    files: ['src/library/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'lib', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'lib', style: 'kebab-case' }],
    },
  },
  {
    // Each layer keeps the selector prefix it published under. One package does not
    // mean one prefix: a consumer still reads <framework-*> and knows which layer it came from.
    files: ['src/framework/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'framework', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'framework', style: 'kebab-case' }],
    },
  },
  {
    // Each layer keeps the selector prefix it published under. One package does not
    // mean one prefix: a consumer still reads <shared-*> and knows which layer it came from.
    files: ['src/shared/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'shared', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'shared', style: 'kebab-case' }],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },

  {
    // Abstract view/button/modal base classes are exported public API. They are
    // decorated with @Component so subclasses inherit Angular metadata, but they are
    // not components and renaming them would break every consumer.
    files: ['**/views/**/*.ts', '**/components/buttons/base-*.ts', '**/components/filters-base.ts'],
    rules: {
      '@angular-eslint/component-class-suffix': 'off',
    },
  },
  {
    // Test hosts and story wrappers are never rendered by a consumer, so they are
    // not bound by the published selector prefix.
    files: ['**/*.spec.ts', '**/*.stories.ts'],
    rules: {
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/directive-selector': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'error',
      '@angular-eslint/template/interactive-supports-focus': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
    },
  },
  {
    // <lib-*> hosts are real DOM elements: an output sharing a native event name
    // double-fires or shadows the native one for consumers.
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/no-output-native': 'error',
    },
  },
  {
    // Both became errors in the angular-eslint that ships with Angular 22; neither
    // was configured here before. Kept visible as warnings rather than switched off.
    files: ['**/*.ts'],
    rules: {
      // A warning for the shared layer, which still has components that depend on being walked
      // on every event. Its change-detection-contract.spec.ts names the ones left; no count
      // here, because it would go stale every time one is migrated. The library and framework
      // layers are finished and ratchet to 'error' below. Delete that block and make this one
      // 'error' once the shared list is empty too.
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      // The codebase mixes constructor injection and inject(). Converting the
      // remainder is a job for , which needs
      // Node 22+, not a hand edit of base classes their subclasses call super() on.
      '@angular-eslint/prefer-inject': 'warn',
    },
  },
  {
    // The library and framework layers are finished: every component in them renders without
    // being walked on every event, and each layer's change-detection-contract.spec.ts asserts
    // that over its public API with an empty list. An error here keeps them finished.
    //
    // Scoped to the layers rather than the package because shared is not done. As three packages
    // this was a per-package switch; one package makes the remaining work visible instead of
    // hiding it behind a single flag.
    //
    // The harness's own self-test declares Eager to prove it changes nothing, and disables this
    // rule on that line.
    files: ['src/library/**/*.ts', 'src/framework/**/*.ts'],
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  {
    // The layer direction: shared may use framework and library, framework may use library,
    // library may use neither. It held as three packages because npm could not express a cycle.
    // In one project nothing enforces it -- @nx/enforce-module-boundaries works between projects,
    // and these layers are folders now -- so it is spelled out here or it stops being true.
    //
    // Both spellings are listed on purpose. Blocking only the published subpath leaves
    // '../../shared/services/x' open, which compiles and inverts the layering just as thoroughly.
    files: ['src/library/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@zambon-dev/ui/framework', '@zambon-dev/ui/shared', '**/framework/**', '**/shared/**'],
              message:
                'The library layer is the bottom of the stack and may not import from the framework or shared layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/framework/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@zambon-dev/ui/shared', '**/shared/**'],
              message: 'The framework layer may not import from the shared layer, only from the library layer.',
            },
          ],
        },
      ],
    },
  },
];
