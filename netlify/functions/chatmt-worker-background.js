import { getAnalysisContract_ } from './babbage.js';
import { handleChatmt } from './lib/chatmt.js';
import { JOB_LIFETIME_MS, previewHost, jobStore, validJobId, digest } from './lib/chatmt-jobs.js';

export default async function handler(request) {
  if (!previewHost(new URL(request.url).hostname) || request.method !== 'POST') return;
  const { id, input } = await request.json();
  if (!validJobId(id) || typeof input !== 'string') return;
  const store = jobStore();
  const record = await store.getWithMetadata(id, { type: 'json' });
  if (!record || record.data.status !== 'pending' || Date.now() - record.data.createdAt > JOB_LIFETIME_MS || record.data.inputHash !== await digest(input)) return;
  const claimed = await store.setJSON(id, { ...record.data, status: 'running' }, { onlyIfMatch: record.etag });
  if (!claimed.modified) return;
  try {
    const result = await handleChatmt({ httpMethod: 'POST', body: input }, getAnalysisContract_,
      (statusCode, body) => ({ statusCode, body: JSON.stringify(body) }), id, { timeoutMs: 240000 });
    await store.setJSON(id, { createdAt: record.data.createdAt, result });
  } catch {
    await store.setJSON(id, { createdAt: record.data.createdAt, result: { statusCode: 502, body: JSON.stringify({ error: { message: 'ChatMT could not complete this consultation. Please retry.' } }) } });
  }
  // Remove abandoned output as well as results acknowledged by the browser.
  // The request content itself is never written to the store.
  while (Date.now() - record.data.createdAt < JOB_LIFETIME_MS) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    if (!await store.get(id)) return;
  }
  await store.delete(id);
}
