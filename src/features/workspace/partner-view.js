import { renderQuestion } from '../design/conversation-view.js';
import { renderLoading } from '../design/loading.js';
import { renderDesignRationale } from '../../shared/design-evidence.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { escapeHTML as e } from '../../shared/html.js';

// Workspace presentation only; the shared controller still owns every AI request.
export function renderPartner(state, ai, page, preview) {
  const conversation = state.babbage;
  const dev = conversation.mode === 'dev';
  const available = dev || ai.configured === true;
  const hasDirections = Boolean(state.teacher.directions.trim());
  let content, actions = '';
  if (page === 'history') {
    content = `<h3>Earlier conversation</h3>${conversation.history.length ? conversation.history.slice(-6).map(turn => `<article class="partner-turn"><strong>${turn.role === 'assistant' ? 'Babbage' : 'Your answers'}</strong><p>${e(turn.display || turn.content)}</p></article>`).join('') : '<p>No earlier messages yet.</p>'}`;
  } else if (page === 'options') {
    content = `<h3>Connection & testing</h3><p>${dev ? 'Dev simulation uses fixed examples. It does not analyze your assignment or call the AI service.' : 'Live requests share your assignment details and answers with the PromptCraft Babbage service and OpenAI.'}</p><button type="button" data-action="toggle-dev"${ai.pending ? ' disabled' : ''}>${dev ? 'Use live Babbage' : 'Use Dev testing fallback'}</button>`;
  } else if (page === 'rationale' && ai.suggestion) {
    content = `<h3>Why this approach?</h3>${renderDesignRationale(ai.suggestion.reason)}`;
  } else if (ai.pending) {
    content = renderLoading(ai, dev);
  } else if (ai.suggestion) {
    content = '<h3>A possible direction</h3><p>Read the suggested assignment beside this conversation. You choose what to keep.</p><button type="button" data-partner-page="rationale">Why this approach?</button>';
    actions = '<button type="button" class="primary" data-action="apply-ai">Use these directions in my draft</button><button type="button" data-action="dismiss-ai">Keep my draft</button>';
  } else if (conversation.questions.length) {
    content = renderQuestion(conversation, available, false, true);
  } else if (conversation.ready) {
    content = '<h3>Ready to explore an alternative</h3><p>Babbage has your details. Generate a revision to consider.</p>';
    actions = `<button type="button" class="primary" data-action="generate-ai"${available ? '' : ' disabled'}>Generate revision</button>`;
  } else {
    content = `<h3>What could this assignment become?</h3><p>Babbage will check your starting point and ask one question at a time.</p>${!hasDirections ? '<p>Add starting material in Design first.</p><button type="button" data-action="edit-context">Add a starting point</button>' : ''}`;
    actions = `<button type="button" class="primary" data-action="ask-ai"${hasDirections && available ? '' : ' disabled'}>Check assignment details</button>`;
  }
  const status = ai.error || (!dev && ai.configured === null ? 'Checking the Babbage connection…' : '');
  const connection = !dev && ai.configured === false ? '<p>Babbage is unavailable. Your work is saved.</p><button type="button" data-action="retry-babbage">Retry connection</button>' : '';
  const document = ai.suggestion
    ? `<section class="workspace-draft workspace-live"><header><h2 id="preview-title">Suggested assignment</h2><span class="preview-source">Not applied</span></header><div class="assignment-paper" tabindex="0" role="region" aria-label="Babbage suggested assignment"><span class="assignment-paper-label">Babbage’s suggestion</span><div class="assignment-directions" data-suggestion-preview>${renderAssignmentDirections(ai.suggestion.revision)}</div></div></section>`
    : preview;
  return `<div class="workspace-design workspace-design--focused partner-layout"><section class="workspace-context workspace-page partner-card ai-panel" aria-labelledby="ai-title"><header class="partner-heading ai-panel-heading"><img src="assets/brand/babbage-mark.svg" alt="" width="42" height="42"><div><h2 id="ai-title" tabindex="-1">Work with Babbage</h2><span class="partner-mode">${dev ? 'Dev simulation · no AI call' : 'Assignment design partner'}</span></div></header><nav class="partner-nav" aria-label="Babbage views">${page !== 'work' ? '<button type="button" data-partner-page="work">← Conversation</button>' : '<button type="button" data-partner-page="history">Earlier conversation</button>'}<button type="button" data-partner-page="options">Connection & testing</button></nav><div class="design-page-fields partner-content"><p class="ai-status" role="status" aria-live="polite">${e(status)}</p>${connection}${content}</div>${actions ? `<footer class="partner-actions">${actions}</footer>` : ''}</section>${document}</div>`;
}
