import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Minimal frontmatter handling for the curator scripts and the verifier. Exhibit entries only
// use flat `key: value` pairs, so a full YAML parser isn't needed.

export function exhibitsDir() {
  return process.env.EXHIBITS_DIR ?? 'src/content/exhibits';
}

export function parseEntry(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n?---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: null, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) {
      data[`__invalid__${line}`] = line;
      continue;
    }
    let value = kv[2].trim();
    if (/^".*"$/.test(value)) value = JSON.parse(value);
    else if (/^'.*'$/.test(value)) value = value.slice(1, -1).replace(/''/g, "'");
    data[kv[1]] = value;
  }
  return { data, body: match[2] };
}

export async function listEntries(dir = exhibitsDir()) {
  let names;
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  const entries = [];
  for (const name of names.filter((n) => n.endsWith('.md')).sort()) {
    const text = await readFile(join(dir, name), 'utf8');
    entries.push({ name, stem: name.replace(/\.md$/, ''), path: join(dir, name), ...parseEntry(text) });
  }
  return entries;
}

export function pad3(n) {
  return String(n).padStart(3, '0');
}

export const TOMBSTONE = '---\nstatus: unpublished\n---\n';
