import { postJSON } from '../../shared/json-request.js';
import { instructions } from './babbage-prompt.js';
import { workspaceInstructions } from '../workspace/prompt.js';
import { findIdea } from '../idea-lab/ideas.js';
export const BABBAGE_ENDPOINT = 'https://promptcraft-discussion.netlify.app/.netlify/functions/babbage';
export const conversationDefaults = () => ({
  context: '',
  history: [],
  questions: [],
  answers: {},
  questionIndex: 0,
  ready: false,
  mode: 'live',
});
export const assignmentContext = (state) =>
  JSON.stringify({ teacher: state.teacher, design: state.design, ...(state.workspace ? { workspace: state.workspace } : {}) });

export function buildBabbageRequest(state, intent) {
  const conversation = state.babbage ?? conversationDefaults();
  const { concern, exchange, notes, revision, reason } = state.design;
  return {
    analysis_type: 'scenario1',
    max_output_tokens: intent === 'revise' ? 3500 : 1600,
    system: state.workspace ? workspaceInstructions : instructions,
    messages: [
      {
        role: 'user',
        content: JSON.stringify({
          teacher: state.teacher,
          design: { concern, exchange, notes, revision, reason },
          ...(state.workspace ? { workspace: { ...state.workspace, idea: findIdea(state.workspace.ideaId) || null } } : {}),
        }),
      },
      ...conversation.history.map(({ role, content }) => ({ role, content })),
      { role: 'user', content: JSON.stringify({ request_intent: intent }) },
    ],
  };
}
export function normalizeBabbageResponse(data, intent) {
  const a = data?.analysis;
  if (
    !a ||
    typeof a.feedback_summary !== 'string' ||
    typeof a.input_quality?.usable !== 'boolean' ||
    !Array.isArray(a.input_quality.concerns) ||
    a.input_quality.concerns.length > 6 ||
    a.input_quality.concerns.some((q) => typeof q !== 'string' || q.length > 3000)
  )
    throw Error('Babbage returned an unreadable response. Your draft is unchanged.');
  const questions = a.input_quality.concerns
    .filter((q) => q.trim())
    .slice(0, 3)
    .map((text, index) => ({ id: 'question-' + (index + 1), text, field: '' }));
  const ready = a.input_quality.usable && questions.length === 0;
  const revision =
    typeof a.revised_discussion_prompt === 'string' ? a.revised_discussion_prompt : '';
  const reason =
    typeof a.revision_review?.why_these_changes === 'string'
      ? a.revision_review.why_these_changes
      : '';
  if (intent === 'revise' && ready && (!revision.trim() || !reason.trim()))
    throw Error('Babbage returned an incomplete revision. Your draft is unchanged.');
  return {
    message: a.feedback_summary,
    questions,
    ready,
    suggestion: intent === 'revise' && ready ? { revision, reason, questions: '' } : null,
  };
}
export async function checkBabbage({ fetchImpl = fetch, signal } = {}) {
  const response = await fetchImpl(BABBAGE_ENDPOINT, { signal });
  if (!response.ok) throw Error('Babbage is unavailable.');
  const data = await response.json();
  return data.configured === true;
}
export async function requestBabbageTurn(state, intent, { fetchImpl = fetch, signal } = {}) {
  const data = await postJSON(BABBAGE_ENDPOINT, buildBabbageRequest(state, intent), {
    fetchImpl,
    signal,
    httpError: (status) =>
      Error(
        status === 429
          ? 'Babbage has reached a usage limit. Try again later or continue editing your draft.'
          : 'Babbage could not respond. Your draft is unchanged. Retry or continue editing your draft.',
      ),
    unreadableMessage: 'Babbage returned an unreadable response. Your draft is unchanged.',
  });
  return normalizeBabbageResponse(data, intent);
}
export function devBabbageTurn(state, intent) {
  const conversation = state.babbage ?? conversationDefaults();
  if (intent === 'clarify' && !conversation.history.some((turn) => turn.role === 'user'))
    return {
      message:
        state.workspace ? 'This simulated check asks about the activity and constraints. It does not analyze your assignment with AI.' : 'This simulated check asks about the reply and follow-up. It does not analyze your assignment with AI.',
      questions: [
        {
          id: 'dev-reply',
          text: state.workspace ? 'What should students produce or decide in this activity?' : 'What should a classmate’s reply help the student reconsider?',
          field: '',
        },
        { id: 'dev-followup', text: state.workspace ? 'Which practical constraint should the activity preserve?' : 'What should students do after receiving a reply?', field: '' },
      ],
      ready: false,
      suggestion: null,
    };
  if (intent === 'clarify')
    return {
      message:
        'Your answers are saved. You can generate a simulated revision to test the workflow.',
      questions: [],
      ready: true,
      suggestion: null,
    };
  return {
    message: 'Simulated revision for testing. Review and edit it before approval.',
    questions: [],
    ready: true,
    suggestion: {
      revision: state.design.revision || state.teacher.directions,
      reason:
        state.design.reason ||
        (state.workspace ? 'Dev testing example: explain a design decision and look for evidence in student work.' : 'Dev testing example: use peer feedback to reconsider a choice, then revise or defend it with reasons.'),
      questions: '',
    },
  };
}
