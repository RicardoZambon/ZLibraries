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
      '@semantic-release/npm',
      {
        pkgRoot: '../../dist/libs/library',
      },
    ],
    '@semantic-release/github',
  );
}

module.exports = {
  branches: isValidation ? [process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'main'] : ['main'],
  tagFormat: 'library-v${version}',
  plugins,
};
