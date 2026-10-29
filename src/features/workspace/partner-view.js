import { clarificationLimitReached, renderClarificationPause } from '../design/turn-state.js';
import { renderWorkspaceDisclosure } from './disclosure.js';
import { renderBabbageCameo } from '../../shared/babbage-cameo.js';
import { renderReading } from './views.js';
import { renderPossibilities, renderPossibilityActions } from './creative-view.js';
import { renderQuestion } from '../design/conversation-view.js';
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
  const initialExploration = page === 'work' && ((ui.task !== 'draft' && !conversation.history.length) || (!conversation.questions.length && !conversation.ready)) && hasDirections && !hasIdeas && !state.workspace.selectedDirection && !state.design.revision.trim();
  const utilityPage = page === 'history' || page === 'options';
  let content, actions = '', welcome = false;
  if (page === 'history') {
    const index=Math.max(0,Math.min(ui.historyIndex ?? conversation.history.length-1,conversation.history.length-1));
    const turn=conversation.history[index];
    content=`<h3>Earlier conversation</h3>${turn?`<p>${turn.role==='assistant'?'Babbage':'Your answers'}</p>${renderReading(turn.display||turn.content,ui.readingPage)}<nav class="workspace-reading-nav"><button type="button" data-history-index="${index-1}"${index===0?' disabled':''}>Earlier message</button><span>${index+1} / ${conversation.history.length}</span><button type="button" data-history-index="${index+1}"${index===conversation.history.length-1?' disabled':''}>Later message</button></nav>`:'<p>No earlier messages yet.</p>'}`;
    actions = '';
  } else if (page === 'options') {
    content = `<h3>Connection status</h3><p>${offline ? 'The connection is currently unavailable.' : dev ? 'Creative sketches require a live connection.' : ai.configured === true ? 'Babbage is connected.' : 'Checking the connection…'}</p>`;
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
    content=`${renderBabbageCameo(state, conversation.history.findLast(turn => turn.role === 'assistant')?.display)}<h3>Babbage’s suggested draft</h3><p>Compare this suggestion with your activity. Select Use this draft to put it in Build, or keep your current draft.</p><div class="partner-suggestion" data-suggestion-preview>${renderReading(ai.suggestion.revision,ui.readingPage)}</div>`;
    actions = '<button type="button" class="primary" data-action="apply-ai">Use this draft</button><button type="button" data-action="dismiss-ai">Keep my draft</button><button type="button" data-partner-page="rationale">Design reasoning</button>';
  } else if (offline) {
    content = '<h3>You can keep designing.</h3><p>Babbage is unavailable right now. Continue with your idea in Build, or try the connection again.</p>';
    actions = '<button type="button" class="primary" data-action="edit-context">Continue in Build</button><button type="button" data-action="retry-babbage">Retry connection</button>';
    if (hasIdeas) actions += '<button type="button" data-partner-page="ideas">View ideas</button>';
  } else if (clarificationLimitReached(conversation)) {
    content = renderClarificationPause();
  } else if (!hasDirections) {
    welcome = true;
    content = '<h3>What could your activity become?</h3><p>Bring an activity or a rough idea. Explore three possibilities, combine what works, and make the design your own.</p>';
    actions = '<button type="button" class="primary" data-action="edit-context">Add a starting point</button>';
  } else if (initialExploration) {
    welcome = true;
    content = '<h3>Give your activity a new purpose.</h3><p>Explore three possibilities for your activity. Keep what matters, challenge the familiar parts, and shape a design of your own.</p>';
    actions = `<button type="button" class="primary" data-action="explore-directions"${available ? '' : ' disabled'}>Start exploring</button>`;
  } else if (conversation.questions.length) {
    const questions = renderQuestion(conversation, available, false, true, '', {workspace:true});
    const questionActions = questions.match(/<div class="question-actions">([\s\S]*?)<\/div>/);
    content = questions.replace(/<div class="question-actions">[\s\S]*?<\/div>/, '');
    actions = (questionActions?.[1] || '') + '<span class="workspace-save-status">Saved in this browser.</span>';
  } else if (state.workspace.selectedDirection) {
    content = `<h3>Build on your chosen idea</h3><p>${e(state.workspace.selectedDirection.title)}</p><p>${e(state.workspace.creativeCore || state.workspace.selectedDirection.core)}</p>`;
    actions = `<button type="button" class="primary" data-action="consult-babbage"${available ? '' : ' disabled'}>Consult Babbage</button><button type="button" data-partner-page="ideas">Other ideas</button>`;
  } else if ((conversation.ready || hasIdeas) && !dev) {
    content = renderPossibilities(state, ai, '', false);
    actions = renderPossibilityActions(state, ai, '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button><span class="workspace-save-status">Saved in this browser.</span>');
  } else if (conversation.ready) {
    content = '<h3>Try a sample draft</h3><p>Dev simulation checks the workflow with fixed examples.</p>';
    actions = '<button type="button" class="primary" data-action="generate-ai">Generate sample revision</button>';
  } else {
    welcome = true;
    content = '<h3>Give your activity a new purpose.</h3><p>Explore three possibilities for your activity. Keep what matters, challenge the familiar parts, and shape a design of your own.</p>';
    actions = `<button type="button" class="primary" data-action="explore-directions"${available ? '' : ' disabled'}>Start exploring</button>`;
  }
  const hasPreviewAction = welcome && (hasDirections || state.design.revision.trim());
  if(hasPreviewAction) actions += '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View starting point</button><span class="workspace-save-status">Saved in this browser.</span>';
  if(!utilityPage && !ai.pending && !ai.suggestion && page !== 'ideas' && !welcome && !hasIdeas && (hasDirections || state.design.revision.trim()) && !conversation.questions.length) actions += '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button><span class="workspace-save-status">Saved in this browser.</span>';
  if (utilityPage) actions += '<button type="button" data-partner-page="work">Back to exploration</button>';
  if (!actions) actions = `<span class="workspace-save-status" role="status">${ai.pending ? '' : 'Saved in this browser.'}</span>`;
  if (welcome) {
    const choices=actions.replace(/<span class="workspace-save-status">.*?<\/span>/g,'');
    content=`<div class="workspace-welcome-board"><div class="workspace-welcome-intro">${content}</div><nav class="workspace-welcome-choices" aria-label="Explore starting points"><h3>Choose where to begin</h3><div class="workspace-welcome-actions">${choices}<button type="button" data-workspace-view="options">Project backup &amp; options</button><a href="?view=lab">Browse Babbage’s Idea Lab</a></div></nav></div>`;
    actions='<span class="workspace-save-status">Saved in this browser.</span>';
  }
  const latestMessage = conversation.history.findLast(turn=>turn.role==='assistant')?.display || '';
  const status = ai.error || (!ai.pending && conversation.questions.length ? latestMessage : '') || (!dev && ai.configured === null ? 'Checking the Babbage connection…' : '');
  return `<div class="workspace-design workspace-design--focused partner-layout partner-layout--focused${utilityPage ? ' partner-layout--utility' : ''}"><section class="workspace-context workspace-page partner-card ai-panel${welcome ? ' partner-card--welcome' : ''}" aria-labelledby="ai-title"><header class="partner-heading ai-panel-heading"><h2 class="workspace-build-title" id="ai-title" tabindex="-1">${page==='options'?'Babbage connection':ui.task==='draft'?'Develop your activity with Babbage':'Explore with Babbage'}</h2>${dev ? '<p class="partner-mode">Sample simulation · no AI call</p>' : ''}</header><div class="design-page-fields partner-content">${renderWorkspaceDisclosure(state)}${renderBabbageCameo(state,status)}<p class="ai-status" role="status" aria-live="polite">${e(status)}</p>${content}</div>${actions ? `<footer class="workspace-action-bar partner-actions">${actions}</footer>` : ''}</section></div>`;
}
