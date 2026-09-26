/*
 * Fails when one package's peer range on a sibling @zambon-dev package excludes the version that
 * sibling has actually been released at.
 *
 * These ranges are hand-written and go stale silently. Nothing here notices, because the workspace
 * resolves siblings from dist rather than from the registry -- the build, the tests and the
 * Storybooks are all green with a range no consumer can satisfy. It surfaces as an ERESOLVE in the
 * application, after the release.
 *
 * It has happened twice: once when the three packages moved to Angular 22 while their ranges still
 * named the previous majors, and again on 2026-09-26, when shared 5.0.0 shipped peering
 * framework@^3.0.0 hours after framework reached 4.0.0.
 *
 * The released version is read from the git tags semantic-release writes, because the version in
 * each package.json is a placeholder it replaces at publish time. A shallow clone has no tags, so
 * CI must check out with fetch-depth: 0 -- it already does.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gtr, rcompare, satisfies, valid, validRange } from 'semver';

const LIBS = 'libs';

/** The highest version tagged for a package, or undefined when it has never been released. */
function releasedVersion(directory) {
  const tags = execFileSync('git', ['tag', '--list', `${directory}-v*`], { encoding: 'utf8' })
    .split('\n')
    .map((tag) => tag.trim().slice(`${directory}-v`.length))
    .filter((version) => valid(version));

  return tags.sort(rcompare)[0];
}

const packages = new Map();

for (const entry of readdirSync(LIBS, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  try {
    packages.set(entry.name, JSON.parse(readFileSync(join(LIBS, entry.name, 'package.json'), 'utf8')));
  } catch {
    // Not a publishable library; nothing to check.
  }
}

const directoryByName = new Map([...packages].map(([directory, manifest]) => [manifest.name, directory]));

let failed = false;
let checked = 0;

for (const [directory, manifest] of packages) {
  for (const [peer, range] of Object.entries(manifest.peerDependencies ?? {})) {
    const siblingDirectory = directoryByName.get(peer);
    if (!siblingDirectory) continue;

    if (!validRange(range)) {
      failed = true;
      console.error(`libs/${directory}: "${peer}": "${range}" is not a valid semver range.`);
      continue;
    }

    const version = releasedVersion(siblingDirectory);
    if (!version) {
      console.log(`libs/${directory}: "${peer}" has no release tag yet, nothing to compare against.`);
      continue;
    }

    checked += 1;

    if (satisfies(version, range)) {
      continue;
    }

    // A range *ahead* of the last release is a coordinated bump: the same pull request majors the
    // sibling, and its tag only exists once the release runs. Failing on that would make the two
    // impossible to land together. A range *behind* it is the stale one, and the one that breaks
    // an install.
    if (gtr(version, range)) {
      failed = true;
      console.error(
        `libs/${directory}: peers "${peer}": "${range}", but ${peer} is released at ${version} — ` +
          'an application installing both gets ERESOLVE.',
      );
    } else {
      console.log(
        `libs/${directory}: peers "${peer}": "${range}", ahead of the released ${version} — ` +
          'assumed to be a coordinated bump.',
      );
    }
  }
}

if (failed) {
  console.error('\nWiden the range in the offending libs/<package>/package.json.');
  process.exit(1);
}

console.log(`${checked} @zambon-dev peer range(s) admit their sibling's released version.`);
