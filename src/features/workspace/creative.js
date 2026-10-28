import { postJSON } from '../../shared/json-request.js';
import { BABBAGE_ENDPOINT, buildBabbageRequest, assignmentContext } from '../design/babbage-client.js';

const fields = ['title', 'description', 'experience', 'learning', 'online', 'core'];
export const creativeDefaults = () => ({ directions: [], alternatives: [], feedback: '', basis: '', mayaPaused: false });
// A saved draft or clarification from an older session must not skip Phase 1.
export function needsInitialExploration(state) {
  return !state.creative.directions.length && !state.creative.alternatives.length &&
    !state.workspace.selectedDirection;
}
export function normalizeDirection(value) {
  if (!value || fields.some(key => typeof value[key] !== 'string' || !value[key].trim() || value[key].length > 2000))
    throw Error('Babbage returned an incomplete creative sketch. Your work is unchanged. Try again.');
  return Object.fromEntries(fields.map(key => [key, value[key].trim()]));
}
export function restoreCreative(value) {
  const result = creativeDefaults();
  if (!value) return result;
  for (const key of ['directions', 'alternatives']) {
    if (!Array.isArray(value[key]) || value[key].length > (key === 'directions' ? 3 : 30)) throw Error('Invalid saved possibilities');
    result[key] = value[key].map(normalizeDirection);
  }
  result.feedback = typeof value.feedback === 'string' ? value.feedback.slice(0, 6000) : '';
  result.basis = typeof value.basis === 'string' ? value.basis : '';
  result.mayaPaused = value.mayaPaused === true;
  return result;
}
export function normalizeCreativeResponse(data) {
  let result;
  try { result = JSON.parse(data?.analysis?.feedback_summary); } catch { /* Validated below. */ }
  if (result?.version !== 1 || !Array.isArray(result.directions) || result.directions.length !== 3)
    throw Error('Babbage did not return three readable possibilities. Your work is unchanged. Try again.');
  const directions = result.directions.map(normalizeDirection);
  if (new Set(directions.map(item => item.title.toLowerCase())).size !== 3 || new Set(directions.map(item => item.experience.toLowerCase())).size !== 3)
    throw Error('Babbage repeated a possibility. Your work is unchanged. Ask for different ideas.');
  return directions;
}
export function buildCreativeRequest(state) {
  const request = buildBabbageRequest(state, 'clarify');
  return { ...request, max_output_tokens: 5000,
    system: request.system + `\nThe latest request has explore_three_directions true. For this turn, explore possibilities rather than draft an assignment and do not ask clarification questions. Return the existing scenario1 response envelope. In feedback_summary return ONLY JSON: {"version":1,"directions":[{"title":"...","description":"...","experience":"...","learning":"...","online":"...","core":"..."}]}. Supply exactly THREE short sketches with genuinely different student actions, decision structures, or interaction mechanisms. A change of title or topic alone is insufficient. Each field is a short plain-text string. core names the distinctive learning mechanism to protect. Use the educator's stated learning purpose when one is supplied, but do not invent, imply, or silently finalize a learning objective when it is absent. If the purpose is incomplete, let it remain open and make the learning field a tentative possibility for educator review rather than a claimed outcome. Do not require student AI-use policy or other optional context for these sketches. Distinguish obligations from preferences and conventions. Preserve bold ideas while explaining a plausible asynchronous approach. Do not repeat fixed mystery/decision/relay templates. Honor the educator's feedback, including rejection or combinations. No official outcomes, policies, compliance claims, or invented disciplinary evidence. These are suggestions for educator review, not applied changes. Set input_quality.usable true, concerns to [], and leave revised_discussion_prompt and revision_review.why_these_changes empty.`,
    messages: [...request.messages.slice(0, -1), { role: 'user', content: JSON.stringify({ request_intent: 'clarify', explore_three_directions: true, educator_feedback: state.creative.feedback, previous_possibilities: state.creative.directions }) }],
  };
}
export async function requestCreativeDirections(state, { fetchImpl = fetch, signal } = {}) {
  const data = await postJSON(BABBAGE_ENDPOINT, buildCreativeRequest(state), {
    fetchImpl,
    signal,
    httpError: () =>
      Error('Babbage could not explore new directions. Your work is unchanged. Retry or keep designing.'),
    unreadableMessage: 'Babbage returned an unreadable response. Your work is unchanged.',
  });
  return normalizeCreativeResponse(data);
}
export const creativeBasis = state => JSON.stringify([assignmentContext(state), state.creative.feedback]);
export function combineDirections(directions) {
  if (directions.length < 2) throw Error('Choose at least two possibilities to combine.');
  return Object.fromEntries(fields.map(key => [key, directions.map(item => item[key]).join(key === 'title' ? ' + ' : '\n\n').slice(0, 2000)]));
}
