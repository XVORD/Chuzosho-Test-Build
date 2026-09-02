import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4360);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

http.createServer((request, response) => {
  const requestTarget = request.url?.startsWith('//')
    ? `/${request.url.replace(/^\/+/, '')}`
    : request.url || '/';
  let urlPath;
  try {
    urlPath = decodeURIComponent(
      new URL(requestTarget, `http://${request.headers.host || `127.0.0.1:${port}`}`).pathname,
    );
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  let filePath = path.resolve(root, `.${urlPath}`);
  if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
  if (!path.extname(filePath) && fs.existsSync(`${filePath}.html`)) filePath = `${filePath}.html`;
  const isInsideRoot = filePath === root || filePath.startsWith(`${root}${path.sep}`);
  if (!isInsideRoot || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Chuzosho preview: http://127.0.0.1:${port}/`);
});
