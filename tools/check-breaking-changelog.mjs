/*
 * Fails when the changelog announces a breaking change that the release would ship as a minor.
 *
 *   node tools/check-breaking-changelog.mjs <base-ref>
 *
 * semantic-release decides the version from commits, and only from commits that touch libs/ui.
 * The changelog is written by hand. 1.1.0 and 1.2.0 listed breaking changes and still shipped as
 * minors, because no qualifying commit was marked breaking. This connects the two: if the
 * Unreleased section has anything under "Breaking Changes / Migration", some commit since
 * <base-ref> that touches libs/ui must carry a `BREAKING CHANGE:` footer or the
 * `breaking-changes` type.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const base = process.argv[2];
if (!base) {
  console.error('usage: node tools/check-breaking-changelog.mjs <base-ref>');
  process.exit(2);
}

const changelog = readFileSync('libs/ui/CHANGELOG.md', 'utf8').replace(/\r\n/g, '\n');
const unreleased = changelog.split('\n## [Unreleased]')[1]?.split(/\n## \[/)[0] ?? '';
const breaking = unreleased.split(/\n### ⚠ Breaking Changes \/ Migration\n/)[1]?.split(/\n### /)[0] ?? '';

if (!breaking.trim()) {
  console.log('breaking-changelog: the Unreleased section lists no breaking change');
  process.exit(0);
}

const log = execFileSync('git', ['log', '--format=%B%x00', `${base}..HEAD`, '--', 'libs/ui'], { encoding: 'utf8' });
const marked = log
  .split('\0')
  .some((message) => /^BREAKING[ -]CHANGE:/m.test(message) || /^breaking-changes(\(.*\))?:/.test(message.trim()));

if (!marked) {
  console.error(
    [
      'breaking-changelog: the changelog lists a breaking change, but no commit since',
      `${base} that touches libs/ui is marked breaking, so the release would be a minor.`,
      'Add a `BREAKING CHANGE:` footer to the commit that makes the change.',
    ].join('\n'),
  );
  process.exit(1);
}
console.log('breaking-changelog: a breaking commit backs the changelog entry');
