const assert = require('node:assert/strict');
(async () => {
  const { createWorker } = await import('../../netlify/functions/chatmt-worker-background.js');
  const { digest } = await import('../../netlify/functions/lib/chatmt-jobs.js');
  const { getAnalysisContract_ } = await import(
    '../../netlify/functions/lib/analysis-contracts.js'
  );
  const { getAnalysisContract_: publicContract } = await import(
    '../../netlify/functions/babbage.js'
  );
  assert.equal(
    publicContract,
    getAnalysisContract_,
    'Both endpoints share one contract implementation',
  );
  const id = 'a'.repeat(32),
    input = JSON.stringify({ analysis_type: 'scenario1', messages: [] });
  const request = () =>
    new Request(
      'https://deploy-preview-3--promptcraft-discussion.netlify.app/.netlify/functions/chatmt-worker-background',
      {
        method: 'POST',
        body: JSON.stringify({ id, input }),
      },
    );
  let data,
    etag,
    consults = 0,
    writes = 0;
  const reset = async () => {
    data = { createdAt: Date.now(), status: 'pending', inputHash: await digest(input) };
    etag = 'pending';
  };
  const store = {
    getWithMetadata: async () => (data ? { data, etag } : null),
    setJSON: async (key, value, options) => {
      assert.equal(key, id);
      if (!data || options.onlyIfMatch !== etag) return { modified: false };
      writes++;
      data = value;
      etag = 'version-' + writes;
      return { modified: true, etag };
    },
    get: async () => data,
    delete: async () => {
      data = null;
    },
  };
  await reset();
  const worker = createWorker({
    getStore: () => store,
    consult: async () => {
      consults++;
      return { statusCode: 200, body: '{}' };
    },
    wait: async () => {
      assert.equal(data.result.statusCode, 200);
      data = null;
    },
  });
  await worker(request());
  assert.equal(consults, 1);
  assert.equal(writes, 2);
  await reset();
  const cancelled = createWorker({
    getStore: () => store,
    consult: async () => {
      data = null;
      return { statusCode: 200, body: '{}' };
    },
    wait: async () => assert.fail('Deleted job must not be recreated'),
  });
  await cancelled(request());
  assert.equal(data, null, 'Completing a cancelled job cannot restore its feedback');
  await reset();
  data.status = 'running';
  await worker(request());
  assert.equal(consults, 1, 'Duplicate dispatch never calls AI twice');
  await reset();
  data.inputHash = 'invalid';
  await worker(request());
  assert.equal(consults, 1, 'Payload mismatch is rejected');
  console.log(
    'PASS: shared contracts, atomic job claims, completion, cancellation cleanup and duplicate dispatch. Mocked storage and AI.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
