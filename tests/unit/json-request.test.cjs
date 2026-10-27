const assert = require('node:assert/strict');

(async () => {
  const { postJSON } = await import('../../src/shared/json-request.js');
  const controller = new AbortController();
  const options = {
    signal: controller.signal,
    httpError: (status) => Object.assign(Error('Service unavailable'), { status }),
    unreadableMessage: 'Unreadable service response',
  };
  const body = { messages: [{ role: 'user', content: 'Assignment details' }] };
  assert.deepEqual(await postJSON('/service', body, {
    ...options,
    fetchImpl: async (url, request) => {
      assert.equal(url, '/service');
      assert.equal(request.method, 'POST');
      assert.deepEqual(request.headers, { 'Content-Type': 'application/json' });
      assert.deepEqual(JSON.parse(request.body), body);
      assert.equal(request.signal, controller.signal);
      return new Response(JSON.stringify({ result: 'ok' }));
    },
  }), { result: 'ok' });
  await assert.rejects(postJSON('/service', body, {
    ...options,
    fetchImpl: async () => ({
      ok: false,
      status: 429,
      json: () => { throw Error('Provider details must not be read'); },
    }),
  }), (error) => error.status === 429 && error.message === 'Service unavailable');
  await assert.rejects(postJSON('/service', body, {
    ...options,
    fetchImpl: async () => new Response('sensitive invalid response'),
  }), { message: options.unreadableMessage });
  for (const failure of [new TypeError('Network unavailable'), new DOMException('Cancelled', 'AbortError')]) {
    await assert.rejects(postJSON('/service', body, {
      ...options,
      fetchImpl: async () => { throw failure; },
    }), (error) => error === failure);
  }
  console.log('PASS: JSON transport, signal forwarding, HTTP errors, unreadable responses, network and cancellation errors.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
