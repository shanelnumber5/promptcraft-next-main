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
  const jobId = 'a'.repeat(32);
  const calls = [];
  const completed = await postJSON('/jobs', body, {
    ...options,
    fetchImpl: async (url, request = {}) => {
      calls.push({ url, method: request.method || 'GET' });
      if (request.method === 'POST') return new Response(JSON.stringify({ job_id: jobId }), { status: 202 });
      if (request.method === 'DELETE') return new Response(null, { status: 204 });
      return new Response(JSON.stringify({ result: 'background feedback' }));
    },
  });
  assert.equal(completed.result, 'background feedback');
  assert.deepEqual(calls.map(call => call.method), ['POST', 'GET', 'DELETE']);
  assert.equal(calls[1].url, '/jobs?job=' + jobId);
  const cancelledJob = new AbortController();
  const cancelledWait = postJSON('/jobs', body, {
    ...options,
    signal: cancelledJob.signal,
    fetchImpl: async () => new Response(JSON.stringify({ job_id: jobId }), { status: 202 }),
  });
  setTimeout(() => cancelledJob.abort(), 20);
  await assert.rejects(cancelledWait, error => error.name === 'AbortError');
  console.log('PASS: JSON transport, signal forwarding, HTTP errors, unreadable responses, network and cancellation errors.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
