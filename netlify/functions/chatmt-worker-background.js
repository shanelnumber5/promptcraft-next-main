import { getAnalysisContract_ } from './lib/analysis-contracts.js';
import { handleChatmt } from './lib/chatmt.js';
import { JOB_LIFETIME_MS, previewHost, jobStore, validJobId, digest } from './lib/chatmt-jobs.js';

export function createWorker({
  getStore = jobStore,
  consult = handleChatmt,
  wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
} = {}) {
  return async function handler(request) {
    if (!previewHost(new URL(request.url).hostname) || request.method !== 'POST') return;
    let payload;
    try {
      payload = await request.json();
    } catch {
      return;
    }
    const { id, input } = payload || {};
    if (!validJobId(id) || typeof input !== 'string') return;
    const store = getStore();
    const record = await store.getWithMetadata(id, { type: 'json' });
    if (
      !record ||
      record.data.status !== 'pending' ||
      Date.now() - record.data.createdAt > JOB_LIFETIME_MS ||
      record.data.inputHash !== (await digest(input))
    )
      return;
    const claimed = await store.setJSON(
      id,
      { ...record.data, status: 'running' },
      { onlyIfMatch: record.etag },
    );
    if (!claimed.modified) return;
    try {
      const result = await consult(
        { httpMethod: 'POST', body: input },
        getAnalysisContract_,
        (statusCode, body) => ({ statusCode, body: JSON.stringify(body) }),
        id,
        { timeoutMs: 240000 },
      );
      const saved = await store.setJSON(
        id,
        { createdAt: record.data.createdAt, result },
        { onlyIfMatch: claimed.etag },
      );
      if (!saved.modified) return;
    } catch {
      const saved = await store.setJSON(
        id,
        {
          createdAt: record.data.createdAt,
          result: {
            statusCode: 502,
            body: JSON.stringify({
              error: { message: 'Chat MT AI could not complete this consultation. Please retry.' },
            }),
          },
        },
        { onlyIfMatch: claimed.etag },
      );
      if (!saved.modified) return;
    }
    // Remove abandoned output as well as results acknowledged by the browser.
    // The request content itself is never written to the store.
    while (Date.now() - record.data.createdAt < JOB_LIFETIME_MS) {
      await wait(5000);
      if (!(await store.get(id))) return;
    }
    await store.delete(id);
  };
}

export default createWorker();
