// Serves a built docs site the way GitHub Pages does: under /ZLibraries/, with 404.html for
// unknown paths.
//
//   node tools/docs-content/serve.mjs [site-dir] [port]
//
// Defaults to dist/apps/docs/browser on port 4300. Copy a Storybook build into <site>/storybook to
// preview the two together, as the Pages workflow assembles them.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist/apps/docs/browser');
const port = Number(process.argv[3] ?? 4300);
const BASE = '/ZLibraries/';
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
};

async function send(res, file, status = 200) {
  const body = await readFile(file);
  res.writeHead(status, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(body);
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  if (!path.startsWith(BASE)) {
    res.writeHead(302, { location: BASE });
    return res.end();
  }
  const file = normalize(join(root, path.slice(BASE.length)));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    return res.end();
  }
  try {
    const info = await stat(file);
    return await send(res, info.isDirectory() ? join(file, 'index.html') : file);
  } catch {
    try {
      return await send(res, join(root, '404.html'), 404);
    } catch {
      res.writeHead(404);
      return res.end('Not found');
    }
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}${BASE}`));
