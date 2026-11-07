import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      // Examples are standalone components a reader copies. They use the `example-` prefix so a
      // reader can tell them apart from the package's own components.
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'example', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'example', style: 'camelCase' }],
      // An example's class ends in `Example`, so the registry and the docs can tell it from a helper.
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Example', 'Component'] }],
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      // `lib-form-input` renders a native input, so a label wrapping it is associated with it.
      '@angular-eslint/template/label-has-associated-control': ['error', { controlComponents: ['lib-form-input'] }],
    },
  },
  {
    // Story wrappers and test doubles are never shown to a reader as code to copy.
    files: ['**/*.stories.ts', '**/*.spec.ts', 'src/providers/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/directive-selector': 'off',
    },
  },
];
