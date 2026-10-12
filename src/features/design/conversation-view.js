import { renderLoading } from './loading.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { escapeHTML as e } from '../../shared/html.js';
import { conversationDefaults, assignmentContext } from './babbage-client.js';
export const aiContext = assignmentContext;
export function renderAiPanel(state, ai) {
  const conversation = state.babbage ?? conversationDefaults(),
    dev = conversation.mode === 'dev';
  const available = dev || ai.configured === true,
    hasDirections = Boolean(state.teacher.directions.trim());
  const answersReady =
    conversation.questions.length > 0 &&
    conversation.questions.every((q) => conversation.answers[q.id]?.trim());
  return `<section class="ai-panel" aria-labelledby="ai-title"><div class="ai-panel-heading"><div class="babbage-identity"><img src="assets/brand/babbage-mark.svg" alt="" width="64" height="64"><div><span class="babbage-eyebrow">Your discussion design partner</span><h2 id="ai-title">Design with Babbage</h2></div></div><span class="babbage-mode${dev ? ' babbage-mode--dev' : ''}">${dev ? 'Dev testing fallback — simulated Babbage; no API call' : 'Live Babbage'}</span></div><div class="babbage-workspace"><p>${dev ? 'Use this simulated conversation to test the screens and guide. Its example revision is not an AI analysis.' : 'Use your assignment and answers to develop a revision. Sent details are shared with the PromptCraft Babbage service and OpenAI.'}</p>${!dev && ai.configured === false ? '<p class="ai-setup-message">The existing Babbage service is unavailable or not configured. Retry the connection or use the labeled Dev fallback.</p><button type="button" data-action="retry-babbage">Retry connection</button>' : ''}${!hasDirections ? '<p>Add the current assignment directions in Edit setup first.</p>' : ''}${ai.pending ? renderLoading(ai, dev) : ''}<p class="ai-status" role="status" aria-live="polite">${e(ai.error || (ai.pending ? '' : !dev && ai.configured === null ? 'Checking the Babbage connection…' : ''))}</p>${
    conversation.history.length
      ? `<div class="babbage-history" aria-label="Clarification conversation">${conversation.history
          .slice(-4)
          .map(
            (turn) =>
              `<article class="babbage-turn babbage-turn--${turn.role}"><strong>${turn.role === 'assistant' ? 'Babbage' : 'Your answers'}</strong><p>${e(turn.display || turn.content)}</p></article>`,
          )
          .join('')}</div>`
      : ''
  }${!ai.suggestion ? `${conversation.questions.length ? `<div class="babbage-questions"><h3>A few details before drafting</h3><p>Answer each question, then send your answers. Babbage may ask a follow-up before you generate a revision.</p>${conversation.questions.map((q) => `<label for="${e(q.id)}">${e(q.text)}</label><textarea id="${e(q.id)}" data-clarification-answer="${e(q.id)}" rows="3"${ai.pending ? ' disabled' : ''}>${e(conversation.answers[q.id] || '')}</textarea>`).join('')}<button type="button" class="primary" data-action="send-clarification"${available && answersReady && !ai.pending ? '' : ' disabled'}>Send answers</button></div>` : conversation.ready ? `<p class="babbage-ready">The clarification check is complete. You can now ask for a revision.</p><button type="button" class="primary" data-action="generate-ai"${available && !ai.pending ? '' : ' disabled'}>${ai.pending ? 'Babbage is thinking…' : 'Generate revision'}</button>` : `<button type="button" class="primary" data-action="ask-ai"${hasDirections && available && !ai.pending ? '' : ' disabled'}>${ai.pending ? 'Babbage is thinking…' : 'Check assignment details'}</button>`}` : ''}${ai.suggestion ? `<div class="ai-suggestion"><h3>${dev ? 'Simulated directions' : 'Suggested directions'}</h3><div class="suggested-assignment"><div class="assignment-document-label">Student-facing assignment · Suggested version</div><div class="assignment-directions">${renderAssignmentDirections(ai.suggestion.revision)}</div></div><h3>Reason for the change</h3><p>${e(ai.suggestion.reason)}</p><p>Applying this replaces your draft directions and reason. Your original assignment stays saved.</p><div class="ai-suggestion-actions"><button type="button" class="primary" data-action="apply-ai">Use these directions in my draft</button><button type="button" data-action="dismiss-ai">Keep my draft</button></div></div>` : ''}<div class="babbage-mode-actions"><button type="button" data-action="toggle-dev"${ai.pending ? ' disabled' : ''}>${dev ? 'Use live Babbage' : 'Use Dev testing fallback'}</button></div></div></section>`;
}
