// Stamps a library CHANGELOG on release: turns the curated `## [Unreleased]`
// section into `## [<version>] - <date>`, opens a fresh empty `[Unreleased]`
// block, and updates the comparison links.
//
// Usage:
//   node scripts/stamp-changelog.mjs <lib> <version> [--source] [--dist]
//
//   <lib>      one of: library | framework | shared
//   <version>  e.g. 1.2.0 (no leading "v")
//   --source   write back to libs/<lib>/CHANGELOG.md (committed to the repo)
//   --dist     write to dist/libs/<lib>/CHANGELOG.md (shipped in the npm package)
//   (no flag)  writes both
//
// The release pipeline runs `--dist` inside each package job (so the published
// package shows the resolved version) and `--source` once in the aggregate job
// (so the single commit back to main carries every stamped changelog).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_URL = 'https://github.com/RicardoZambon/ZLibraries';
const KNOWN_LIBS = new Set(['library', 'framework', 'shared']);

const EMPTY_UNRELEASED = [
  '## [Unreleased]',
  '',
  '### Added',
  '',
  '### Changed',
  '',
  '### Deprecated',
  '',
  '### Removed',
  '',
  '### Fixed',
  '',
  '### ⚠ Breaking Changes / Migration',
  '',
].join('\n');

function fail(message) {
  console.error(`stamp-changelog: ${message}`);
  process.exit(1);
}

const [lib, version, ...flags] = process.argv.slice(2);

if (!lib || !version) {
  fail('expected arguments: <lib> <version> [--source] [--dist]');
}
if (!KNOWN_LIBS.has(lib)) {
  fail(`unknown lib "${lib}" (expected one of: ${[...KNOWN_LIBS].join(', ')})`);
}

const writeSource = flags.includes('--source') || (!flags.includes('--source') && !flags.includes('--dist'));
const writeDist = flags.includes('--dist') || (!flags.includes('--source') && !flags.includes('--dist'));

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(repoRoot, 'libs', lib, 'CHANGELOG.md');
const distPath = resolve(repoRoot, 'dist', 'libs', lib, 'CHANGELOG.md');

if (!existsSync(sourcePath)) {
  fail(`source changelog not found at ${sourcePath}`);
}

const original = readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');

// Remove `### Heading` subsections that have no content (keeps the released
// block tidy — only the sections the author actually filled in survive).
function stripEmptySubsections(body) {
  const lines = body.split('\n');
  const out = [];
  let header = null;
  let buffer = [];

  const flush = () => {
    if (header === null) {
      out.push(...buffer);
    } else if (buffer.some((line) => line.trim() !== '')) {
      out.push(header, ...buffer);
    }
    buffer = [];
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flush();
      header = line;
    } else {
      buffer.push(line);
    }
  }
  flush();

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function stamp(content) {
  const marker = '## [Unreleased]';
  const markerIdx = content.indexOf(marker);
  if (markerIdx === -1) {
    fail(`could not find "${marker}" in ${lib} changelog`);
  }

  const head = content.slice(0, markerIdx);
  const afterMarker = content.slice(markerIdx + marker.length);

  // Everything up to the previous release heading is the curated Unreleased body.
  const nextRelease = afterMarker.match(/\n## \[/);
  const splitAt = nextRelease ? nextRelease.index : afterMarker.length;
  const unreleasedBody = afterMarker.slice(0, splitAt);
  const tail = afterMarker.slice(splitAt); // starts with "\n## [..." (prior releases + links)

  const date = new Date().toISOString().slice(0, 10);
  const tag = `${lib}-v${version}`;
  let releasedBody = stripEmptySubsections(unreleasedBody);
  if (releasedBody === '') {
    releasedBody = '- Maintenance release (no consumer-facing changes were documented).';
  }

  const releasedSection = `## [${version}] - ${date}\n\n${releasedBody}`;

  let result = `${head}${EMPTY_UNRELEASED}\n${releasedSection}\n${tail}`;

  // Refresh link definitions: point [Unreleased] at the new tag and add [version].
  if (/^\[Unreleased\]:.*$/m.test(result)) {
    result = result.replace(/^\[Unreleased\]:.*$/m, `[Unreleased]: ${REPO_URL}/compare/${tag}...HEAD`);
    if (!new RegExp(`^\\[${version.replace(/\./g, '\\.')}\\]:`, 'm').test(result)) {
      result = result.replace(
        /^(\[Unreleased\]:.*\n)/m,
        `$1[${version}]: ${REPO_URL}/releases/tag/${tag}\n`,
      );
    }
  }

  return result.endsWith('\n') ? result : `${result}\n`;
}

const stamped = stamp(original);

if (writeSource) {
  writeFileSync(sourcePath, stamped);
  console.log(`stamped source: ${sourcePath} -> ${version}`);
}

if (writeDist) {
  if (existsSync(distPath)) {
    writeFileSync(distPath, stamped);
    console.log(`stamped dist:   ${distPath} -> ${version}`);
  } else {
    console.warn(`stamp-changelog: dist changelog not found at ${distPath} (skipped)`);
  }
}
