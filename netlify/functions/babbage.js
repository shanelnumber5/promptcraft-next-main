import { handleChatmt } from './lib/chatmt.js';
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
const OPENAI_BASE_URL = String(process.env.OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
const PROMPTCRAFT_BABBAGE_PROXY_VERSION = 'V373';

const CORS_HEADERS = Object.freeze({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store'
});

export { getAnalysisContract_ } from './lib/analysis-contracts.js';
import { getAnalysisContract_ } from './lib/analysis-contracts.js';

function jsonResponse(statusCode, payload) {
  return { statusCode, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(payload) };
}

function requestId_(event) {
  return event?.headers?.['x-nf-request-id'] || event?.headers?.['X-Nf-Request-Id'] || `pc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractOutputText_(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    if (item?.type !== 'message') continue;
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text.trim();
    }
  }
  return '';
}

function parseStructuredOutput_(data) {
  const text = extractOutputText_(data);
  if (!text) throw new Error('OpenAI returned no output_text.');
  return JSON.parse(text);
}

export const handler = async (event = {}) => {
  const requestId = requestId_(event);
  const host = String(event.headers?.host || '').toLowerCase();
  if (/^deploy-preview-\d+--promptcraft-discussion\.netlify\.app$/.test(host)) {
    return handleChatmt(event, getAnalysisContract_, jsonResponse, requestId);
  }
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };

  if (event.httpMethod === 'GET') {
    return jsonResponse(200, {
      status: 'ok',
      service: 'PromptCraft Babbage proxy',
      proxy_version: PROMPTCRAFT_BABBAGE_PROXY_VERSION,
      provider: 'openai',
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: DEFAULT_OPENAI_MODEL,
      supported_contracts: [
        'scenario1',
        's1_evidence_analysis',
        's1_transfer_plan_analysis',
        's1_canvas_rescue',
        's2_draft', 's2_review', 's2_accessibility_heading_repair',
        's3_draft', 's3_review', 's3_evidence_analysis', 's3_transfer_assessment',
        's4_draft', 's4_review',
        's5_brief', 's5_review'
      ],
      message: process.env.OPENAI_API_KEY ? 'Babbage is configured for OpenAI Responses API.' : 'Babbage proxy is reachable, but OPENAI_API_KEY is unavailable.'
    });
  }

  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: { message: 'Method not allowed.' } });
  if (!process.env.OPENAI_API_KEY) return jsonResponse(503, { error: { message: 'Babbage is not configured. Add OPENAI_API_KEY to the Netlify environment.' } });

  let incoming;
  try { incoming = JSON.parse(event.body || '{}'); }
  catch (_error) { return jsonResponse(400, { error: { message: 'Request body must be valid JSON.' } }); }

  const input = Array.isArray(incoming.messages) ? incoming.messages : [];
  if (!input.length) return jsonResponse(400, { error: { message: 'At least one user message is required.' } });

  const contract = getAnalysisContract_(incoming);
  const startedAt = Date.now();
  const payload = {
    model: DEFAULT_OPENAI_MODEL,
    instructions: String(incoming.system || ''),
    input,
    max_output_tokens: Math.max(1200, Math.min(Number(incoming.max_output_tokens || incoming.max_tokens || 5000), 8000)),
    reasoning: { effort: String(process.env.OPENAI_REASONING_EFFORT || 'low') },
    text: {
      format: {
        type: 'json_schema',
        name: contract.schemaName,
        strict: true,
        schema: contract.schema
      }
    }
  };

  console.log(`[PromptCraft Babbage] ${requestId} start provider=openai model=${payload.model} analysis_type=${contract.analysisType} max_output_tokens=${payload.max_output_tokens}`);

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/v1/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify(payload)
    });
    const elapsedMs = Date.now() - startedAt;
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch (_error) { data = {}; }

    if (!response.ok) {
      const providerMessage = data?.error?.message || raw.slice(0, 800) || `HTTP ${response.status}`;
      console.error(`[PromptCraft Babbage] ${requestId} upstream_error status=${response.status} elapsed_ms=${elapsedMs} message=${providerMessage}`);
      return jsonResponse(response.status, { error: { message: providerMessage }, promptcraft_proxy: { version: PROMPTCRAFT_BABBAGE_PROXY_VERSION, provider: 'openai', model: payload.model, elapsed_ms: elapsedMs, request_id: requestId } });
    }

    let analysis;
    try { analysis = parseStructuredOutput_(data); }
    catch (error) {
      console.error(`[PromptCraft Babbage] ${requestId} parse_error elapsed_ms=${elapsedMs} message=${error.message}`);
      return jsonResponse(502, { error: { message: 'Babbage received an OpenAI response but could not parse the structured analysis.' }, promptcraft_proxy: { version: PROMPTCRAFT_BABBAGE_PROXY_VERSION, provider: 'openai', model: payload.model, elapsed_ms: elapsedMs, request_id: requestId } });
    }

    console.log(`[PromptCraft Babbage] ${requestId} success status=${response.status} elapsed_ms=${elapsedMs} input_tokens=${data?.usage?.input_tokens ?? 'unknown'} output_tokens=${data?.usage?.output_tokens ?? 'unknown'}`);
    return jsonResponse(200, {
      status: 'ok',
      provider: 'openai',
      model: payload.model,
      proxy_version: PROMPTCRAFT_BABBAGE_PROXY_VERSION,
      analysis_schema: contract.schemaVersion,
      analysis_type: contract.analysisType,
      request_id: requestId,
      elapsed_ms: elapsedMs,
      analysis,
      usage: data?.usage || null
    });
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    console.error(`[PromptCraft Babbage] ${requestId} network_error elapsed_ms=${elapsedMs}`, error);
    return jsonResponse(502, { error: { message: 'Babbage could not reach the OpenAI Responses API.' }, promptcraft_proxy: { version: PROMPTCRAFT_BABBAGE_PROXY_VERSION, provider: 'openai', model: DEFAULT_OPENAI_MODEL, elapsed_ms: elapsedMs, request_id: requestId } });
  }
};