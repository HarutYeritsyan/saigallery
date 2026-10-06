#!/usr/bin/env node
// Claude Code hook: show the SDD step chain in the chat via `systemMessage`.
//   node .claude/hooks/sdd-status.mjs prompt  (UserPromptSubmit) -> only for /speckit-* prompts
//   node .claude/hooks/sdd-status.mjs stop    (Stop)             -> only if the status changed since last shown
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const mode = process.argv[2];
let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  // best-effort
}

if (mode === 'prompt' && !/^\s*\/speckit[-.]/.test(input.prompt ?? '')) process.exit(0);
if (mode === 'stop' && input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const script = join(root, '.specify/scripts/sdd-status.mjs');
if (!existsSync(script)) process.exit(0);

let out;
try {
  out = execFileSync('node', [script, '--no-color'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch {
  process.exit(0);
}
if (!out) process.exit(0);

const stateFile = join(tmpdir(), `sdd-status-${createHash('sha1').update(root).digest('hex').slice(0, 12)}`);
const hash = createHash('sha1').update(out).digest('hex');
if (mode === 'stop') {
  let last = '';
  try {
    last = readFileSync(stateFile, 'utf8');
  } catch {
  // best-effort
}
  if (last === hash) process.exit(0);
}
try {
  writeFileSync(stateFile, hash);
} catch {
  // best-effort
}

process.stdout.write(JSON.stringify({ systemMessage: out }));
