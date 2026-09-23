#!/usr/bin/env node
// Minimal static server for the end-to-end tests:
//   node scripts/serve-dist.mjs <dir>:<port> [<dir>:<port> ...]
// Astro 7's `astro preview` detaches into a locked background daemon when it has no terminal,
// which doesn't suit Playwright's webServer, so tests serve the build output with this instead.
// Behaves like a typical static host: directory → index.html, missing → 404.html with status 404.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

async function fileAt(path) {
  try {
    const info = await stat(path);
    if (info.isFile()) return path;
    if (info.isDirectory()) return fileAt(join(path, 'index.html'));
  } catch {
    // not found
  }
  return null;
}

function serve(root, port) {
  createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    const target = normalize(join(root, decodeURIComponent(pathname)));
    if (!target.startsWith(root)) {
      res.writeHead(400).end();
      return;
    }
    const file = await fileAt(target);
    if (file && file.endsWith('index.html') && !pathname.endsWith('/') && !extname(pathname)) {
      res.writeHead(301, { Location: `${pathname}/` }).end();
      return;
    }
    if (!file) {
      const notFound = await fileAt(join(root, '404.html'));
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      if (notFound) createReadStream(notFound).pipe(res);
      else res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  }).listen(port, '127.0.0.1', () => {
    console.log(`Serving ${root} at http://localhost:${port}/`);
  });
}

const pairs = process.argv.length > 2 ? process.argv.slice(2) : ['dist:4321'];
for (const pair of pairs) {
  const [dir, port] = pair.split(':');
  serve(resolve(dir), Number(port));
}
