import { needsInitialExploration } from './creative.js';
import { renderReading } from './views.js';
import { renderPossibilities, renderPossibilityActions } from './creative-view.js';
import { renderQuestion, renderQuestionActions } from '../design/conversation-view.js';
import { renderLoading } from '../design/loading.js';
import { renderDesignRationale } from '../../shared/design-evidence.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderPartner(state, ai, page, preview, ui = {readingPage:0}) {
  const conversation = state.babbage;
  const dev = conversation.mode === 'dev';
  const available = dev || ai.configured === true;
  const offline = !dev && ai.configured === false;
  const hasDirections = Boolean(state.teacher.directions.trim());
  const hasIdeas = state.creative.directions.length || state.creative.alternatives.length;
  const initialExploration = page === 'work' && hasDirections && needsInitialExploration(state);
  const utilityPage = page === 'history' || page === 'options';
  let content, actions = '', welcome = false;
  if (page === 'history') {
    const index=Math.max(0,Math.min(ui.historyIndex ?? conversation.history.length-1,conversation.history.length-1));
    const turn=conversation.history[index];
    content=`<h3>Earlier conversation</h3>${turn?`<p>${turn.role==='assistant'?'Babbage':'Your answers'}</p>${renderReading(turn.display||turn.content,ui.readingPage)}<nav class="workspace-reading-nav"><button type="button" data-history-index="${index-1}"${index===0?' disabled':''}>Earlier message</button><span>${index+1} / ${conversation.history.length}</span><button type="button" data-history-index="${index+1}"${index===conversation.history.length-1?' disabled':''}>Later message</button></nav>`:'<p>No earlier messages yet.</p>'}`;
    actions = '';
  } else if (page === 'options') {
    content = `<h3>AI connection</h3><p>${dev ? 'Sample simulation uses fixed examples and makes no AI calls.' : 'Requests share your activity, design context, and answers with the PromptCraft Babbage service and OpenAI.'}</p><p>${offline ? 'The connection is currently unavailable.' : dev ? 'Creative sketches require a live connection.' : ai.configured === true ? 'Babbage is connected.' : 'Checking the connection…'}</p>`;
    actions = `${!dev ? '<button type="button" class="primary" data-action="retry-babbage">Retry connection</button>' : ''}`;
  } else if (page === 'rationale' && ai.suggestion) {
    content = `<h3>Why this design?</h3>${renderReading(ai.suggestion.reason,ui.readingPage,renderDesignRationale)}`;
    actions = '<button type="button" data-partner-page="work">Back to the suggestion</button>';
  } else if (page === 'ideas') {
    content = renderPossibilities(state, ai, '', false);
    actions = renderPossibilityActions(state, ai, '<button type="button" data-partner-page="work">Back to exploration</button><button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button><span class="workspace-save-status">Saved in this browser.</span>');
  } else if (ai.pending) {
    content = renderLoading(ai, dev);
  } else if (ai.suggestion) {
    content=`<h3>A draft to consider</h3><div class="partner-suggestion" data-suggestion-preview>${renderReading(ai.suggestion.revision,ui.readingPage)}</div>`;
    actions = '<button type="button" class="primary" data-action="apply-ai">Use this draft</button><button type="button" data-action="dismiss-ai">Keep my draft</button><button type="button" data-partner-page="rationale">Design reasoning</button>';
  } else if (offline) {
    content = '<h3>You can keep designing.</h3><p>Babbage is unavailable right now. Continue with your idea in Build, or try the connection again.</p>';
    actions = '<button type="button" class="primary" data-action="edit-context">Continue in Build</button><button type="button" data-action="retry-babbage">Retry connection</button>';
    if (hasIdeas) actions += '<button type="button" data-partner-page="ideas">View ideas</button>';
  } else if (!hasDirections) {
    welcome = true;
    content = '<span class="workspace-welcome-label">Explore with Babbage</span><h3>What could your discussion become?</h3><p>Bring an activity or a rough idea. Explore three possibilities, combine what works, and make the design your own.</p>';
    actions = '<button type="button" class="primary" data-action="edit-context">Add a starting point</button>';
  } else if (initialExploration) {
    welcome = true;
    content = '<span class="workspace-welcome-label">Explore with Babbage</span><h3>Give your discussion a new purpose.</h3><p>Explore three possibilities for your activity. Keep what matters, challenge the familiar parts, and shape a design of your own.</p>';
    actions = `<button type="button" class="primary" data-action="explore-directions"${available ? '' : ' disabled'}>Start exploring</button>`;
  } else if (conversation.questions.length) {
    const previewAction = `<button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button><span class="workspace-save-status">Saved in this browser.</span>`;
    content = renderQuestion(conversation, available, false, true, previewAction, true);
    actions = renderQuestionActions(conversation, available, false, previewAction);
  } else if (conversation.ready && state.workspace.selectedDirection) {
    content = `<h3>Build on your chosen idea</h3><p>${e(state.workspace.selectedDirection.title)}</p><p>${e(state.workspace.creativeCore || state.workspace.selectedDirection.core)}</p>`;
    actions = `<button type="button" class="primary" data-action="generate-ai"${available ? '' : ' disabled'}>Develop a draft</button><button type="button" data-partner-page="ideas">Other ideas</button>`;
  } else if ((conversation.ready || hasIdeas) && !dev) {
    content = renderPossibilities(state, ai, '', false);
    actions = renderPossibilityActions(state, ai, '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button><span class="workspace-save-status">Saved in this browser.</span>');
  } else if (conversation.ready) {
    content = '<h3>Try a sample draft</h3><p>Dev simulation checks the workflow with fixed examples.</p>';
    actions = '<button type="button" class="primary" data-action="generate-ai">Generate sample revision</button>';
  } else {
    welcome = true;
    content = '<span class="workspace-welcome-label">Explore with Babbage</span><h3>Give your discussion a new purpose.</h3><p>Explore three possibilities for your activity. Keep what matters, challenge the familiar parts, and shape a design of your own.</p>';
    actions = `<button type="button" class="primary" data-action="explore-directions"${available ? '' : ' disabled'}>Start exploring</button>`;
  }
  const hasPreviewAction = welcome && (hasDirections || state.design.revision.trim());
  if(hasPreviewAction) actions += '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View starting point</button><span class="workspace-save-status">Saved in this browser.</span>';
  if(page !== 'ideas' && !welcome && !hasIdeas && (hasDirections || state.design.revision.trim()) && !conversation.questions.length) actions += '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button><span class="workspace-save-status">Saved in this browser.</span>';
  if (!actions && !utilityPage) actions = '<span class="workspace-save-status">Saved in this browser.</span>';
  const status = ai.error || (!dev && ai.configured === null ? 'Checking the Babbage connection…' : '');
  return `<div class="workspace-design workspace-design--focused partner-layout partner-layout--focused${utilityPage ? ' partner-layout--utility' : ''}"><section class="workspace-context workspace-page partner-card ai-panel${welcome ? ' partner-card--welcome' : ''}" aria-labelledby="ai-title"><header class="partner-heading ai-panel-heading"><h2 class="sr-only" id="ai-title" tabindex="-1">Explore with Babbage</h2>${dev ? '<p class="partner-mode">Sample simulation · no AI call</p>' : ''}</header><div class="design-page-fields partner-content"><p class="ai-status" role="status" aria-live="polite">${e(status)}</p>${content}</div>${actions && !utilityPage ? `<footer class="partner-actions">${actions}</footer>` : ''}</section>${utilityPage && page !== 'ideas' ? `<footer class="workspace-view-back">${actions}<button type="button" data-partner-page="work">Back to exploration</button></footer>` : ''}</div>`;
}
