import { renderBabbageCameo } from '../../shared/babbage-cameo.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderCompactAi(state, ai, action) {
  const conversation=state.babbage, dev=conversation.mode==='dev';
  const offline=!dev && ai.configured===false && !ai.pending && !ai.suggestion;
  const checking=!dev && ai.configured===null && !ai.pending && !ai.suggestion;
  const summary=ai.suggestion && ai.error===conversation.history.at(-1)?.display;
  const status=(summary ? '' : ai.error) || (checking ? 'Checking the connection…' : '');
  const content=offline
    ? '<div class="babbage-offline"><h3>Connection unavailable</h3><p>Your draft is still here. Retry the connection, or choose Write directions below.</p><button type="button" class="primary" data-action="retry-babbage">Retry connection</button></div>'
    : checking ? '' : action;
  return `<section class="ai-panel" aria-labelledby="ai-title"><h2 id="ai-title" class="sr-only">Draft assistant</h2><div class="babbage-workspace">${dev?'<p class="babbage-mode babbage-mode--dev">Sample simulation · no API call</p>':''}<p class="ai-status" role="status" aria-live="polite">${e(status)}</p>${!ai.pending && ai.suggestion ? renderBabbageCameo(state, conversation.history.findLast(turn => turn.role === 'assistant')?.display) : ''}${content}${!ai.pending && !ai.suggestion && conversation.history.length ? '<div class="guided-ai-options"><button type="button" data-action="design-panel" data-design-panel="history">Earlier conversation</button></div>' : ''}${ai.pending ? '<button type="button" data-action="design-panel" data-design-panel="revision">Edit directions while Babbage works</button>':''}</div></section>`;
}
