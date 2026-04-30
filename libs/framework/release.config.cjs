module.exports = {
  branches: ['main'],
  tagFormat: 'framework-v${version}',
  plugins: [
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
    [
      '@semantic-release/npm',
      {
        pkgRoot: '../../dist/libs/framework',
      },
    ],
    '@semantic-release/github',
  ],
};
