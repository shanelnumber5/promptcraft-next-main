import { getDeployStore } from '@netlify/blobs';

export const JOB_LIFETIME_MS = 5 * 60 * 1000;
export const previewHost = host => /^deploy-preview-\d+--promptcraft-discussion\.netlify\.app$/.test(host);
export const jobStore = () => getDeployStore({ name: 'chatmt-pending-feedback', consistency: 'strong' });
export const validJobId = id => /^[a-f0-9]{32}$/.test(id || '');
export const digest = async text => Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))).toString('hex');

export function jsonReply(status, body) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
