const assert = require('node:assert/strict');
const http = require('node:http');

(async () => {
  const { createAppServer } = await import('../../server/index.js');
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const file of [
      '/',
      '/src/app/app.js',
      '/src/styles/base.css',
      '/assets/backgrounds/classroom.png',
    ]) {
      const response = await fetch(base + file);
      assert.equal(response.status, 200, file);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    }
    const head = await fetch(base, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const file of [
      '/.env',
      '/server/index.js',
      '/package.json',
      '/docs/project-map.md',
      '/api/ai/status',
      '/api/ai/suggest',
      '/src/%2eenv',
      '/src/%2e%2e%5c.env',
      '/src/%zz',
    ]) {
      assert.equal((await fetch(base + file)).status, 404, file);
    }
    assert.equal((await fetch(base, { method: 'POST' })).status, 405);
    assert.equal((await fetch(base, { headers: { Origin: 'https://other.example' } })).status, 403);
    const invalidHostStatus = await new Promise((resolve, reject) => {
      const request = http.get(base, { headers: { Host: 'other.example' } }, (response) => {
        response.resume();
        resolve(response.statusCode);
      });
      request.on('error', reject);
    });
    assert.equal(invalidHostStatus, 403);
    console.log(
      'PASS: static hosting, HEAD, private-file protection, traversal, retired endpoints, origin and host checks.',
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
