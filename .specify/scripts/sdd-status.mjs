#!/usr/bin/env node
// Show the Spec Kit step chain for a feature with a colour-coded status.
//   node .specify/scripts/sdd-status.mjs [specs/NNN-name] [--json] [--no-color]
// Default feature: feature_directory in .specify/feature.json.
//
// Staleness: a step is stale when any artifact upstream of it changed after it did.
// Times come from the last git commit that touched the file, or from the file's
// mtime when it has uncommitted changes (or is untracked).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const useColor = !asJson && !args.includes('--no-color') && !process.env.NO_COLOR && process.stdout.isTTY !== false;
const positional = args.filter((a) => !a.startsWith('--'));

let featureDir = positional[0];
if (!featureDir) {
  try {
    featureDir = JSON.parse(readFileSync('.specify/feature.json', 'utf8')).feature_directory;
  } catch {
    console.error('No feature directory given and .specify/feature.json is missing.');
    process.exit(2);
  }
}
featureDir = featureDir.replace(/\/$/, '');
if (!existsSync(featureDir)) {
  console.error(`Feature directory not found: ${featureDir}`);
  process.exit(2);
}

const git = (...a) => {
  try {
    return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

/** Change time in ms: git commit time if clean, else mtime. */
function changed(path) {
  const mtime = statSync(path).mtimeMs;
  if (git('status', '--porcelain', '--', path)) return mtime;
  const t = Number(git('log', '-1', '--format=%ct', '--', path));
  return t ? t * 1000 : mtime;
}

const latest = (paths) => (paths.length ? Math.max(...paths.map(changed)) : 0);
const listMd = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => join(dir, f)) : [];
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const count = (text, re) => (text.match(re) || []).length;

const f = (name) => join(featureDir, name);
const specFiles = existsSync(f('spec.md')) ? [f('spec.md')] : [];
const planFiles = ['plan.md', 'research.md', 'data-model.md', 'quickstart.md']
  .map(f)
  .filter(existsSync)
  .concat(existsSync(f('contracts')) ? readdirSync(f('contracts')).map((n) => join(f('contracts'), n)) : []);
const taskFiles = existsSync(f('tasks.md')) ? [f('tasks.md')] : [];
const checklistFiles = listMd(f('checklists'));

const spec = read(f('spec.md'));
const tasks = read(f('tasks.md'));
const openMarkers = count(spec, /\[NEEDS CLARIFICATION/g);
const clarified = /^#{2,3}\s+Clarifications/m.test(spec);
const done = count(tasks, /^\s*- \[[xX]\]/gm);
const todo = count(tasks, /^\s*- \[ \]/gm);
const ckDone = checklistFiles.reduce((n, p) => n + count(read(p), /^\s*- \[[xX]\]/gm), 0);
const ckTodo = checklistFiles.reduce((n, p) => n + count(read(p), /^\s*- \[ \]/gm), 0);

// Upstream step ids for each step.
const steps = [
  { id: 'specify', cmd: '/speckit-specify', files: specFiles, up: [] },
  { id: 'clarify', cmd: '/speckit-clarify', files: specFiles, up: ['specify'], virtual: true },
  { id: 'plan', cmd: '/speckit-plan', files: planFiles, up: ['specify'] },
  { id: 'tasks', cmd: '/speckit-tasks', files: taskFiles, up: ['specify', 'plan'] },
  { id: 'checklist', cmd: '/speckit-checklist', files: checklistFiles, up: ['specify', 'plan'] },
  { id: 'analyze', cmd: '/speckit-analyze', files: [], up: ['specify', 'plan', 'tasks'], virtual: true },
  { id: 'implement', cmd: '/speckit-implement', files: taskFiles, up: ['tasks'], virtual: true },
];

const at = {};
// clarify edits spec.md itself, so downstream steps compare against the spec file time.
for (const s of steps) at[s.id] = s.virtual ? 0 : latest(s.files);

for (const s of steps) {
  const staleBy = s.files.length && !s.virtual ? s.up.filter((u) => at[u] > at[s.id]) : [];
  s.state = 'ok';
  s.note = '';
  if (s.id === 'specify') {
    if (!specFiles.length) [s.state, s.note] = ['missing', 'no spec.md'];
    else if (openMarkers) [s.state, s.note] = ['warn', `${openMarkers} NEEDS CLARIFICATION marker(s)`];
  } else if (s.id === 'clarify') {
    if (!specFiles.length) [s.state, s.note] = ['missing', ''];
    else if (openMarkers) [s.state, s.note] = ['todo', `${openMarkers} open question(s)`];
    else [s.state, s.note] = clarified ? ['ok', 'Clarifications section present'] : ['skipped', 'no Clarifications section'];
  } else if (s.id === 'analyze') {
    // analyze is read-only and leaves no artifact, so we can only tell if its inputs changed.
    if (!taskFiles.length) [s.state, s.note] = ['missing', 'needs tasks'];
    else [s.state, s.note] = ['unknown', 'leaves no artifact; rerun if spec/plan/tasks changed since'];
  } else if (s.id === 'implement') {
    if (!taskFiles.length) [s.state, s.note] = ['missing', 'needs tasks'];
    else if (todo === 0 && done > 0) [s.state, s.note] = ['ok', `${done}/${done} tasks`];
    else [s.state, s.note] = [done ? 'todo' : 'missing', `${done}/${done + todo} tasks`];
  } else if (s.id === 'checklist') {
    if (!checklistFiles.length) [s.state, s.note] = ['skipped', 'none'];
    else if (ckTodo) [s.state, s.note] = ['todo', `${ckDone}/${ckDone + ckTodo} items`];
    else [s.state, s.note] = ['ok', `${ckDone}/${ckDone} items`];
  } else if (!s.files.length) {
    [s.state, s.note] = ['missing', 'not run'];
  }
  if (staleBy.length && s.state !== 'missing') {
    s.state = 'stale';
    s.note = `${staleBy.join(', ')} changed after this step`;
  }
}

// Cascade: a stale step makes everything downstream of it stale too.
const stale = new Set(steps.filter((s) => s.state === 'stale').map((s) => s.id));
for (const s of steps) {
  const via = s.up.filter((u) => stale.has(u));
  if (via.length && !['stale', 'missing', 'skipped'].includes(s.state) && s.id !== 'analyze') {
    s.state = 'stale';
    s.note = `upstream ${via.join(', ')} is stale`;
    stale.add(s.id);
  }
}
const analyze = steps.find((s) => s.id === 'analyze');
if (analyze.state === 'unknown' && [...stale].some((id) => analyze.up.includes(id))) {
  analyze.state = 'stale';
  analyze.note = 'inputs are stale';
}

const fix = steps.find((s) => s.state === 'stale');
const first = steps.find((s) => ['missing', 'todo', 'warn'].includes(s.state));
let next;
if (fix) next = `Rerun ${fix.cmd} (${fix.note}), then each stale step after it.`;
else if (first) next = `Next: ${first.cmd}${first.note ? ` (${first.note})` : ''}.`;
else next = 'Everything is up to date.';

if (asJson) {
  console.log(JSON.stringify({ featureDir, steps: steps.map(({ id, cmd, state, note }) => ({ id, cmd, state, note })), next }, null, 2));
  process.exit(0);
}

const style = {
  ok: ['32', '●'],
  warn: ['33', '▲'],
  todo: ['33', '◐'],
  stale: ['31', '✖'],
  missing: ['90', '○'],
  skipped: ['90', '–'],
  unknown: ['36', '?'],
};
const paint = (state, text) => {
  const [code] = style[state];
  return useColor ? `\x1b[${code}m${text}\x1b[0m` : text;
};

console.log(`Feature: ${featureDir}\n`);
console.log(steps.map((s) => paint(s.state, `${style[s.state][1]} ${s.id}`)).join('  →  '));
console.log('');
for (const s of steps) {
  console.log(`  ${paint(s.state, style[s.state][1])} ${s.id.padEnd(10)} ${s.state.padEnd(8)} ${s.note}`);
}
console.log(`\n${next}`);
console.log('Legend: ● done  ▲ warning  ◐ in progress  ✖ stale  ○ not run  – skipped  ? cannot tell');
