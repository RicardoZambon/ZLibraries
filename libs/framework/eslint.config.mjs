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
            '{projectRoot}/.storybook/**/*',
            '{projectRoot}/src/test-setup.ts',
            '{projectRoot}/src/**/*.spec.ts',
            '{projectRoot}/src/**/*.stories.ts',
          ],
          // Sibling workspace packages carry a placeholder 0.0.1 version in git;
          // semantic-release stamps the real one at publish time, so the range
          // in peerDependencies can never match what is checked out.
          ignoredDependencies: ['@zambon-dev/framework', '@zambon-dev/library', '@zambon-dev/shared'],
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
    files: ['**/*.ts'],
    rules: {
      // @framework declarations use the `framework-` prefix; nothing here uses `lib-`.
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'framework',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'framework',
          style: 'kebab-case',
        },
      ],
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
    files: [
      '**/views/**/*.ts',
      '**/components/buttons/base-*.ts',
      '**/components/filters-base.ts',
    ],
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
    // TEMPORARY -- these are real defects, downgraded so the CI lint gate can land
    // without a 47-violation big bang. Phase 3 fixes them and restores 'error'.
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
      '@angular-eslint/template/no-autofocus': 'warn',
    },
  },
  {
    // TEMPORARY -- @Output()s named after native DOM events double-fire for
    // consumers. Renaming them is a breaking change; Phase 3 handles it.
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/no-output-native': 'warn',
    },
  },
];
