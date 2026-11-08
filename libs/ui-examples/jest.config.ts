module.exports = {
  displayName: 'ui-examples',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  // Per-project cache dir. A shared default (%TEMP%/jest) makes parallel
  // Nx targets race each other and fail with EPERM on Windows.
  cacheDirectory: '../../.nx/cache/jest/ui-examples',
  coverageDirectory: '../../coverage/libs/ui-examples',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
