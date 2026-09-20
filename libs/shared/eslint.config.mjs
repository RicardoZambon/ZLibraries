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
      // @shared components use the `shared-` prefix; `lib` stays allowed for parity with
      // the scaffolded default and any lib-prefixed declarations.
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['lib', 'shared'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['lib', 'shared'],
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
];
