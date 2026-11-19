import { JOB_LIFETIME_MS, previewHost, jobStore, validJobId, digest, jsonReply } from './lib/chatmt-jobs.js';

export default async function handler(request) {
  const url = new URL(request.url);
  if (!previewHost(url.hostname)) return jsonReply(404, { error: { message: 'Use the Chat MT AI Deploy Preview.' } });
  const missing = ['CHATMT_API_KEY', 'CHATMT_BASE_URL', 'CHATMT_MODEL'].filter(key => !process.env[key]?.trim());
  const id = url.searchParams.get('job');
  if (request.method === 'GET' && !id) return jsonReply(200, { configured: !missing.length, missing, provider: 'chatmt', model: process.env.CHATMT_MODEL || '' });
  if (missing.length) return jsonReply(503, { error: { message: 'Chat MT AI is missing preview settings.' } });
  try {
    const store = jobStore();
    if (request.method === 'GET' || request.method === 'DELETE') {
      if (!validJobId(id)) return jsonReply(400, { error: { message: 'Invalid feedback request.' } });
      if (request.method === 'DELETE') {
        await store.delete(id);
        return new Response(null, { status: 204 });
      }
      const job = await store.get(id, { type: 'json' });
      if (!job) return jsonReply(404, { error: { message: 'Chat MT AI feedback has expired. Please retry.' } });
      if (Date.now() - job.createdAt > JOB_LIFETIME_MS) {
        await store.delete(id);
        return jsonReply(408, { error: { message: 'Chat MT AI feedback took too long. Please retry.' } });
      }
      return job.result
        ? jsonReply(job.result.statusCode, JSON.parse(job.result.body))
        : jsonReply(202, { job_id: id, status: 'pending' });
    }
    if (request.method !== 'POST') return jsonReply(405, { error: { message: 'Use GET or POST.' } });
    const input = await request.text();
    if (Buffer.byteLength(input) > 200000) return jsonReply(413, { error: { message: 'This activity and conversation are too large for one Chat MT AI request. Start a fresh consultation.' } });
    let data;
    try { data = JSON.parse(input); } catch { return jsonReply(400, { error: { message: 'Expected a JSON request.' } }); }
    if (!Array.isArray(data.messages) || !data.messages.length) return jsonReply(400, { error: { message: 'Include the activity to review.' } });
    const jobId = crypto.randomUUID().replaceAll('-', '');
    await store.setJSON(jobId, { createdAt: Date.now(), inputHash: await digest(input), status: 'pending' });
    try {
      const response = await fetch(`${url.origin}/.netlify/functions/chatmt-worker-background`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: jobId, input }), signal: AbortSignal.timeout(10000)
      });
      if (response.status !== 202) throw Error('Background request was rejected.');
    } catch {
      await store.delete(jobId);
      return jsonReply(503, { error: { message: 'Chat MT AI could not start the background request. Please retry.' } });
    }
    return jsonReply(202, { job_id: jobId, status: 'pending' });
  } catch {
    return jsonReply(503, { error: { message: 'Chat MT AI temporary feedback storage is unavailable. Please retry.' } });
  }
}
