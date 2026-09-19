import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?js$',
            // Dev-only Storybook wiring shared by every project's .storybook/preview.ts.
            // Never reached by published code.
            '^.*/tools/storybook/.*$',
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    // Override or add rules here
    rules: {
      // Members are grouped by #region (Inputs, Properties, Event handlers, ...),
      // which deliberately separates an @Input() setter from its getter. That is the
      // convention across ~170 members here; the rule would have us break it.
      '@typescript-eslint/adjacent-overload-signatures': 'off',
    },
  },
];
