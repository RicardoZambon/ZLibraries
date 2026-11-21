module.exports = {
  displayName: 'ui',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  // Per-project cache dir. A shared default (%TEMP%/jest) makes parallel
  // Nx targets race each other and fail with EPERM on Windows.
  cacheDirectory: '../../.nx/cache/jest/ui',
  coverageDirectory: '../../coverage/libs/ui',
  // Count every source file, not only the ones a spec happens to import. Without this list a
  // file with no spec at all is invisible, so coverage would look higher than it is.
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.spec.ts',
    // Barrels only re-export; they hold no logic to test.
    '!<rootDir>/src/**/index.ts',
    // Test harness and helpers used by the specs, not shipped behaviour.
    '!<rootDir>/src/test-setup.ts',
    '!<rootDir>/src/testing/**',
    // Stories live in libs/ui-examples today; this keeps one from counting if it moves here.
    '!<rootDir>/src/**/*.stories.ts',
  ],
  // The coverage floor. Each number is the highest whole percent at least half a point below
  // the measured value, so small refactors pass and a lost spec fails. Raise it when coverage
  // climbs; never lower it to get a run green. CONTRIBUTING.md explains how it works.
  coverageThreshold: {
    global: {
      statements: 74,
      branches: 61,
      functions: 64,
      lines: 73,
    },
  },
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
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
