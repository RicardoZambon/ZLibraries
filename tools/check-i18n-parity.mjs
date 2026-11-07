/*
 * Fails when the shipped translation files disagree on their keys.
 *
 *   node tools/check-i18n-parity.mjs
 *
 * Every folder under libs/ui/src/i18n holds one JSON file per language. A key present in one
 * language and missing in another shows the raw key to that language's users, and nothing else
 * would notice. Empty values count as missing.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'libs/ui/src/i18n';
const problems = [];
let folders = 0;

function walk(dir) {
  const entries = readdirSync(dir);
  const languages = entries.filter((name) => name.endsWith('.json'));
  if (languages.length) {
    folders++;
    const keys = Object.fromEntries(
      languages.map((file) => {
        const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
        return [file, new Set(Object.keys(data).filter((key) => key !== '' && String(data[key]).trim() !== ''))];
      }),
    );
    const all = new Set(Object.values(keys).flatMap((set) => [...set]));
    for (const [file, set] of Object.entries(keys)) {
      for (const key of all) if (!set.has(key)) problems.push(`${join(dir, file)}: missing "${key}"`);
    }
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
  }
}

walk(ROOT);

if (problems.length) {
  console.error(`i18n parity: ${problems.length} missing key(s)\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`i18n parity: ${folders} folders, every language has every key`);
