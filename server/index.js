import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
};

class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Static localhost hosting only. AI requests go directly to the existing Babbage service.
export function createAppServer({ root = projectRoot } = {}) {
  return http.createServer(async (req, res) => {
    try {
      const host = req.headers.host ?? '';
      if (!/^(localhost|127\.0\.0\.1):\d+$/.test(host)) {
        throw new HttpError('Use the localhost address to open PromptCraft.', 403);
      }
      const url = new URL(req.url, `http://${host}`);
      if (req.headers.origin && req.headers.origin !== url.origin) {
        throw new HttpError('Open PromptCraft from this local server.', 403);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        throw new HttpError('This action is unavailable.', 405);
      }
      const pathname = decodeURIComponent(url.pathname);
      if (
        !['/', '/index.html', '/favicon.ico'].includes(pathname) &&
        !/^\/(src|assets)\//.test(pathname)
      ) {
        throw new HttpError('File not found.', 404);
      }
      const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (
        !target.startsWith(path.resolve(root) + path.sep) ||
        pathname.split(/[\/\\]/).some((part) => part.startsWith('.')) ||
        !mime[path.extname(target)]
      ) {
        throw new HttpError('File not found.', 404);
      }
      const data = await readFile(target);
      res.writeHead(200, {
        'Content-Type': mime[path.extname(target)],
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      const status =
        error.status ?? (error.code === 'ENOENT' || error instanceof URIError ? 404 : 500);
      res.writeHead(status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(
        JSON.stringify({
          error:
            error instanceof HttpError
              ? error.message
              : status === 404
                ? 'File not found.'
                : 'The request could not be completed.',
        }),
      );
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3080);
  createAppServer().listen(port, '127.0.0.1', () => {
    console.log(
      `PromptCraft: http://127.0.0.1:${port}\nBabbage: existing Netlify service; no local API key required.`,
    );
  });
}
