const SYSTEM = `You are Babbage, an instructional-design collaborator in PromptCraft. Give a brief review with one choice worth keeping, one tradeoff worth considering, and one question that helps the instructor decide. Respect the stated requirements and leave decisions with the instructor. Ground feedback in the draft. Treat participation rates, student motives, and instructor workload as unknown unless supplied. When asked for one targeted change, give one ready-to-use change that fits the constraints.`;
const DRAFT = `Introduction to Graphic Design is an eight-week asynchronous course with 24 students. Several are beginners and some work on phones. Students have five days to create a campus event flyer for a specific audience. The goal is visual hierarchy. Only the flyer and a 150-word reflection are submitted. Paper sketches photographed for upload are allowed. Students identify what their audience needs to notice first, then use AI to brainstorm three approaches and make their own flyer. The reflection asks what viewers should notice first, what idea they chose, and why it suits the audience. The instructor posts an example of two flyers prioritizing different information and can make one class announcement, but cannot give individual draft feedback. AI brainstorming must stay because it helps beginners see more possibilities. Review this draft.`;

function json(statusCode, data) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(data) };
}

export async function handler(event) {
  if (process.env.CONTEXT !== 'deploy-preview') return json(404, { error: 'This test is available in Deploy Previews.' });
  const names = ['CHATMT_API_KEY', 'CHATMT_BASE_URL', 'CHATMT_MODEL'];
  const missing = names.filter(name => !process.env[name]?.trim());
  if (event.httpMethod === 'GET') return json(200, { configured: !missing.length, missing, model: process.env.CHATMT_MODEL || '' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Use GET or POST.' });
  if (missing.length) return json(503, { error: `Missing preview settings: ${missing.join(', ')}` });
  const base = process.env.CHATMT_BASE_URL.trim().replace(/\/+$/, '');
  if (base !== 'https://my.chatmt.ai/bedrock') return json(503, { error: 'Set CHATMT_BASE_URL to https://my.chatmt.ai/bedrock.' });
  const started = Date.now();
  try {
    const response = await fetch(`${base}/v1/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.CHATMT_API_KEY.trim(), 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.CHATMT_MODEL.trim(), max_tokens: 1200, system: SYSTEM, messages: [{ role: 'user', content: DRAFT }] }),
      signal: AbortSignal.timeout(45000)
    });
    if (!response.ok) return json(502, { error: `ChatMT returned HTTP ${response.status}. Check the API key and model ID in preview settings.`, upstream_status: response.status });
    const data = await response.json();
    const feedback = (data.content || []).filter(block => block.type === 'text').map(block => block.text).join('\n\n');
    if (!feedback.trim()) return json(502, { error: 'ChatMT responded without text feedback.' });
    return json(200, { model: data.model || process.env.CHATMT_MODEL, feedback, elapsed_ms: Date.now() - started, stop_reason: data.stop_reason });
  } catch {
    return json(502, { error: 'The ChatMT request failed or exceeded 45 seconds. Try again.' });
  }
}
