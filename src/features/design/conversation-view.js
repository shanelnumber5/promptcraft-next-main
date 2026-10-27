import { renderCompactAi } from './compact-ai.js';
import { renderLoading } from './loading.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { escapeHTML as e } from '../../shared/html.js';
import { conversationDefaults, assignmentContext } from './babbage-client.js';
import { answerIssue } from './input-quality.js';
import { hasCompleteClarificationAnswers } from './turn-state.js';
import { renderDesignRationale } from '../../shared/design-evidence.js';
import { renderPagedDirections } from '../../shared/paged-directions.js';
export const aiContext = assignmentContext;

export function renderQuestion(conversation, available, pending, compact = false, extraAction = '') {
  const index = Math.max(0, Math.min(conversation.questionIndex || 0, conversation.questions.length - 1));
  const question = conversation.questions[index];
  const answer = conversation.answers[question.id] || '';
  const last = index === conversation.questions.length - 1;
  const ready = last
    ? hasCompleteClarificationAnswers(conversation)
    : !answerIssue(answer);
  return `<div class="babbage-questions"><h3>Question ${index + 1} of ${conversation.questions.length}</h3>${compact ? '' : '<p>Answer this question, then continue. Your earlier answers stay saved.</p>'}<label for="${e(question.id)}">${e(question.text)}</label><textarea id="${e(question.id)}" data-clarification-answer="${e(question.id)}" rows="3" aria-describedby="answer-guidance"${pending ? ' disabled' : ''}>${e(answer)}</textarea><p id="answer-guidance" class="answer-guidance" role="status">${e(answer.trim() ? answerIssue(answer) : 'Unsure? Describe what you need help deciding.')}</p><div class="question-actions">${index ? `<button type="button" data-action="previous-question"${pending ? ' disabled' : ''}>Previous question</button>` : ''}${extraAction}<button type="button" class="primary" data-action="${last ? 'send-clarification' : 'next-question'}"${available && ready && !pending ? '' : ' disabled'}>${last ? 'Send answers to Babbage' : 'Save answer and continue'}</button></div></div>`;
}

export function renderAiPanel(state, ai, { compact = false } = {}) {
  const conversation = state.babbage ?? conversationDefaults();
  const dev = conversation.mode === 'dev';
  const available = dev || ai.configured === true;
  const hasDirections = Boolean(state.teacher.directions.trim());
  const history = conversation.history.length
    ? `<section class="babbage-history"><h3>Earlier conversation</h3>${conversation.history.slice(-4).map((turn) => `<article class="babbage-turn babbage-turn--${turn.role}"><strong>${turn.role === 'assistant' ? 'Babbage' : 'Your answers'}</strong><p>${e(turn.display || turn.content)}</p></article>`).join('')}</section>`
    : '';
  const action = ai.pending && compact ? renderLoading(ai, dev) : compact && ai.suggestion
    ? `<section class="ai-suggestion ai-suggestion--focused" aria-label="Suggested draft"><div class="suggestion-reading">${renderPagedDirections(ai.suggestion.revision,state.designReadPage,{sectionSelect:true})}</div><div class="ai-suggestion-actions"><button type="button" data-action="dismiss-ai">Keep my draft</button></div></section>`
    : ai.suggestion
    ? `<div class="ai-suggestion"><h3>${dev ? 'Simulated directions' : 'Suggested directions'}</h3>${compact ? renderPagedDirections(ai.suggestion.revision, state.designReadPage) : `<div class="suggested-assignment"><div class="assignment-document-label">Student-facing assignment · Suggested version</div><div class="assignment-directions">${renderAssignmentDirections(ai.suggestion.revision)}</div></div>`}${compact ? '<button type="button" data-action="design-panel" data-design-panel="rationale">Read why Babbage suggests this change</button>' : `<section><h3>Why Babbage suggests this change</h3><div class="design-rationale">${renderDesignRationale(ai.suggestion.reason)}</div></section>`}<p>Consider how this suggestion fits your learning goal and students. You can use and adapt it, or keep your draft. Make the explanation your own before approving.</p><div class="ai-suggestion-actions"><button type="button" class="primary" data-action="apply-ai">Use these directions in my draft</button><button type="button" data-action="dismiss-ai">Keep my draft</button></div></div>`
    : conversation.questions.length
      ? renderQuestion(conversation, available, ai.pending, compact)
      : conversation.ready
        ? `<p class="babbage-ready">Your details are ready. Generate a revision, then review it.</p><button type="button" class="primary" data-action="generate-ai"${available && !ai.pending ? '' : ' disabled'}>Generate revision</button>`
        : `<p>Start by checking your assignment details. Babbage will ask one question at a time.</p><button type="button" class="primary" data-action="ask-ai"${hasDirections && available && !ai.pending ? '' : ' disabled'}>Check assignment details</button>`;
  if (compact) return renderCompactAi(state, ai, action);
  return `<section class="ai-panel" aria-labelledby="ai-title"><div class="ai-panel-heading"><div class="babbage-identity"><img src="assets/brand/babbage-mark.svg" alt="" width="64" height="64"><div><span class="babbage-eyebrow">${state.workspace ? 'Your assignment design partner' : 'Your discussion design partner'}</span><h2 id="ai-title">Develop your draft with Babbage</h2></div></div><span class="babbage-mode${dev ? ' babbage-mode--dev' : ''}">${dev ? 'Sample responses · no API call' : 'Live Babbage'}</span></div><div class="babbage-workspace"><p>${dev ? 'Simulated answers for testing the workflow. This mode does not analyze your assignment.' : 'Babbage uses your assignment and answers to suggest a revision. Sent details are shared with the PromptCraft Babbage service and OpenAI.'}</p>${!dev && ai.configured === false ? '<p class="ai-setup-message">Babbage is unavailable. Retry the connection, or write your draft below.</p><button type="button" data-action="retry-babbage">Retry connection</button>' : ''}${!hasDirections ? '<p>Add your starting material before asking Babbage. Your draft stays saved.</p>' : ''}${ai.pending ? renderLoading(ai, dev) : ''}<p class="ai-status" role="status" aria-live="polite">${e(ai.error || (ai.pending ? '' : !dev && ai.configured === null ? 'Checking the Babbage connection…' : ''))}</p>${!ai.pending && conversation.history.length && !ai.suggestion ? `<p class="babbage-latest">${e(conversation.history.at(-1).display)}</p>` : ''}${history}${action}</div></section>`;
}
