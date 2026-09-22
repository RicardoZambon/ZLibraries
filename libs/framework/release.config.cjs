const isValidation = process.env.SEMANTIC_RELEASE_VALIDATION === 'true';

const plugins = [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          { scope: 'no-release', release: false },
          { type: 'bug', release: 'patch' },
          { type: 'fix', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'feat', release: 'minor' },
          { type: 'breaking-changes', release: 'major' },
          { breaking: true, release: 'major' },
        ],
      },
    ],
    '@semantic-release/release-notes-generator',
];

if (!isValidation) {
  plugins.push(
    [
      '@semantic-release/exec',
      {
        // Stamp the published package's CHANGELOG with the resolved version.
        prepareCmd: 'node ../../scripts/stamp-changelog.mjs framework ${nextRelease.version} --dist',
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: '../../dist/libs/framework',
      },
    ],
  );
}

module.exports = {
  // 1.4.x is the maintenance line for applications still on Angular 19: main moved to Angular 22,
  // so a release from there cannot be consumed by them. It publishes under its own dist-tag rather
  // than latest, which must keep pointing at the current line.
  branches: isValidation
    ? [process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'main']
    : ['main', { name: '1.4.x', range: '1.4.x', channel: '1.4.x' }],
  tagFormat: 'framework-v${version}',
  plugins,
};
