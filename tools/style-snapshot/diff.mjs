// Diffs two snapshots from capture.mjs and prints what moved.
//
//   node tools/style-snapshot/diff.mjs before.json after.json [--full]
//
// Without --full the output is grouped by property and capped, because a framework upgrade that
// changes one default touches hundreds of elements with one cause. The grouping is the point: it
// turns "2690 elements differ" into the handful of decisions behind them.

import { readFileSync } from 'node:fs';

const [, , beforeFile, afterFile, ...flags] = process.argv;
const full = flags.includes('--full');

const before = JSON.parse(readFileSync(beforeFile, 'utf8'));
const after = JSON.parse(readFileSync(afterFile, 'utf8'));

const storyIds = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
const byProperty = new Map();
let changedElements = 0;
let comparedElements = 0;
const structural = [];

for (const id of storyIds) {
  const a = before[id];
  const b = after[id];
  if (!a || !b) {
    structural.push(`${id}: story ${a ? 'removed' : 'added'}`);
    continue;
  }
  if (a.length !== b.length) {
    structural.push(`${id}: element count ${a.length} -> ${b.length}`);
  }

  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    if (a[i].path !== b[i].path || a[i].tag !== b[i].tag) {
      structural.push(`${id} @${a[i].path}: ${a[i].tag} -> ${b[i].tag} (${b[i].path})`);
      continue;
    }
    comparedElements += 1;
    let elementChanged = false;
    for (const prop of Object.keys(a[i].styles)) {
      const from = a[i].styles[prop];
      const to = b[i].styles[prop];
      if (from === to) continue;
      elementChanged = true;
      if (!byProperty.has(prop)) byProperty.set(prop, new Map());
      const transitions = byProperty.get(prop);
      const key = `${from}  ->  ${to}`;
      if (!transitions.has(key)) transitions.set(key, []);
      transitions.get(key).push(`${id} @${a[i].path} <${a[i].tag}>`);
    }
    if (elementChanged) changedElements += 1;
  }
}

console.log(`stories: ${storyIds.length}   elements compared: ${comparedElements}   changed: ${changedElements}`);

if (structural.length > 0) {
  console.log(`\n=== structural differences (${structural.length}) ===`);
  for (const line of structural.slice(0, full ? Infinity : 20)) console.log(`  ${line}`);
  if (!full && structural.length > 20) console.log(`  ...and ${structural.length - 20} more`);
}

if (byProperty.size === 0) {
  console.log('\nNo computed style differences.');
  process.exit(0);
}

const properties = [...byProperty.entries()].sort(
  (x, y) => [...y[1].values()].reduce((n, v) => n + v.length, 0) - [...x[1].values()].reduce((n, v) => n + v.length, 0),
);

console.log(`\n=== changed properties (${properties.length}) ===`);
for (const [prop, transitions] of properties) {
  const total = [...transitions.values()].reduce((n, v) => n + v.length, 0);
  console.log(`\n${prop}  (${total} element${total === 1 ? '' : 's'}, ${transitions.size} distinct)`);
  const sorted = [...transitions.entries()].sort((x, y) => y[1].length - x[1].length);
  for (const [transition, where] of sorted.slice(0, full ? Infinity : 6)) {
    console.log(`  ${transition}   x${where.length}`);
    if (full) for (const w of where) console.log(`      ${w}`);
    else console.log(`      e.g. ${where[0]}`);
  }
  if (!full && sorted.length > 6) console.log(`  ...and ${sorted.length - 6} more distinct changes`);
}

process.exitCode = changedElements > 0 ? 1 : 0;
