import { renderStudioPage } from './page-frame.js';
import {
  babbageFeedbackPages,
  renderBabbagePresence,
  renderBabbageMessage,
} from '../../shared/babbage-feedback.js';
import { clarificationLimitReached, renderClarificationPause } from '../design/turn-state.js';
import { renderWorkspaceDisclosure } from './disclosure.js';
import { renderBabbageCameo } from '../../shared/babbage-cameo.js';
import { renderReading } from './views.js';
import { renderPossibilities, renderPossibilityActions } from './creative-view.js';
import { renderQuestion } from '../design/conversation-view.js';
import { renderLoading } from '../design/loading.js';
import { renderDesignRationale } from '../../shared/design-evidence.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderPartner(state, ai, page, preview, ui = {}) {
  const conversation = state.babbage;
  const dev = conversation.mode === 'dev';
  const available = dev || ai.configured === true;
  const offline = !dev && ai.configured === false;
  const hasDirections = Boolean(state.teacher.directions.trim());
  const hasIdeas = state.creative.directions.length || state.creative.alternatives.length;
  const initialExploration =
    page === 'work' &&
    ((ui.task !== 'draft' && !conversation.history.length) ||
      (!conversation.questions.length && !conversation.ready)) &&
    hasDirections &&
    !hasIdeas &&
    !state.workspace.selectedDirection &&
    !state.design.revision.trim();
  const utilityPage = page === 'history' || page === 'options';
  let content,
    actions = '',
    welcome = false;
  if (page === 'history') {
    const index = Math.max(
      0,
      Math.min(ui.historyIndex ?? conversation.history.length - 1, conversation.history.length - 1),
    );
    const turn = conversation.history[index];
    content = `<h3>Earlier conversation</h3>${turn ? `<p>${turn.role === 'assistant' ? 'Babbage' : 'Your answers'}</p>${renderBabbageMessage(turn.display || turn.content)}<nav class="workspace-reading-nav"><button type="button" data-history-index="${index - 1}"${index === 0 ? ' disabled' : ''}>Earlier message</button><span>${index + 1} / ${conversation.history.length}</span><button type="button" data-history-index="${index + 1}"${index === conversation.history.length - 1 ? ' disabled' : ''}>Later message</button></nav>` : '<p>No earlier messages yet.</p>'}`;
    actions = '';
  } else if (page === 'options') {
    content = `<h3>Connection status</h3><p>${offline ? 'The connection is currently unavailable.' : dev ? 'Creative sketches require a live connection.' : ai.configured === true ? 'Babbage is connected.' : 'Checking the connection…'}</p>`;
    actions = `${!dev ? '<button type="button" class="primary" data-action="retry-babbage">Retry connection</button>' : ''}`;
  } else if (page === 'rationale' && ai.suggestion) {
    content = `<h3>Why this design?</h3>${renderReading(ai.suggestion.reason, renderDesignRationale)}`;
    actions = '<button type="button" data-partner-page="work">Back to the suggestion</button>';
  } else if (page === 'ideas') {
    content = renderPossibilities(state, ai, '', false);
    actions = renderPossibilityActions(
      state,
      ai,
      '<button type="button" data-partner-page="work">Back to exploration</button><button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button>',
    );
  } else if (ai.pending) {
    content = renderLoading(ai, dev);
  } else if (ai.suggestion) {
    content = `${renderBabbageCameo(state, conversation.history.findLast((turn) => turn.role === 'assistant')?.display)}<h3>Babbage’s suggested draft</h3><p>Compare this suggestion with your activity. Select Use this draft to put it in Build, or keep your current draft.</p><div class="partner-suggestion" data-suggestion-preview>${renderReading(ai.suggestion.revision)}</div>`;
    actions =
      '<button type="button" class="primary" data-action="apply-ai">Use this draft</button><button type="button" data-action="dismiss-ai">Keep my draft</button><button type="button" data-partner-page="rationale">Design reasoning</button>';
  } else if (offline) {
    content =
      '<h3>You can keep designing.</h3><p>Babbage is unavailable right now. Continue with your idea in Build, or try the connection again.</p>';
    actions =
      '<button type="button" class="primary" data-action="edit-context">Continue in Build</button><button type="button" data-action="retry-babbage">Retry connection</button>';
    if (hasIdeas) actions += '<button type="button" data-partner-page="ideas">View ideas</button>';
  } else if (clarificationLimitReached(conversation)) {
    content = renderClarificationPause();
  } else if (!hasDirections) {
    welcome = true;
    content =
      '<h3>What could your activity become?</h3><p>Bring an activity or a rough idea. Explore three possibilities, combine what works, and make the design your own.</p>';
    actions =
      '<button type="button" class="primary" data-action="edit-context">Add a starting point</button>';
  } else if (initialExploration) {
    welcome = true;
    content =
      '<h3>Give your activity a new purpose.</h3><p>Explore three possibilities for your activity. Keep what matters, challenge the familiar parts, and shape a design of your own.</p>';
    actions = `<button type="button" class="primary" data-action="explore-directions"${available ? '' : ' disabled'}>Start exploring</button>`;
  } else if (conversation.questions.length) {
    const questions = renderQuestion(conversation, available, false, true, '', { workspace: true });
    const questionActions = questions.match(/<div class="question-actions">([\s\S]*?)<\/div>/);
    content = questions.replace(/<div class="question-actions">[\s\S]*?<\/div>/, '');
    actions = (questionActions?.[1] || '') + '';
  } else if (state.workspace.selectedDirection) {
    content = `<h3>Build on your chosen idea</h3><p>${e(state.workspace.selectedDirection.title)}</p><p>${e(state.workspace.creativeCore || state.workspace.selectedDirection.core)}</p>`;
    actions = `<button type="button" class="primary" data-action="consult-babbage"${available ? '' : ' disabled'}>Consult Babbage</button><button type="button" data-partner-page="ideas">Other ideas</button>`;
  } else if ((conversation.ready || hasIdeas) && !dev) {
    content = renderPossibilities(state, ai, '', false);
    actions = renderPossibilityActions(
      state,
      ai,
      '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button>',
    );
  } else if (conversation.ready) {
    content =
      '<h3>Try a sample draft</h3><p>Dev simulation checks the workflow with fixed examples.</p>';
    actions =
      '<button type="button" class="primary" data-action="generate-ai">Generate sample revision</button>';
  } else {
    welcome = true;
    content =
      '<h3>Give your activity a new purpose.</h3><p>Explore three possibilities for your activity. Keep what matters, challenge the familiar parts, and shape a design of your own.</p>';
    actions = `<button type="button" class="primary" data-action="explore-directions"${available ? '' : ' disabled'}>Start exploring</button>`;
  }
  const hasPreviewAction = welcome && (hasDirections || state.design.revision.trim());
  if (hasPreviewAction)
    actions +=
      '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View starting point</button>';
  if (
    !utilityPage &&
    !ai.pending &&
    !ai.suggestion &&
    page !== 'ideas' &&
    !welcome &&
    !hasIdeas &&
    (hasDirections || state.design.revision.trim()) &&
    !conversation.questions.length &&
    !actions.includes('data-workspace-view="preview"')
  )
    actions +=
      '<button type="button" id="workspace-show-preview" data-workspace-view="preview">View activity</button>';
  if (utilityPage)
    actions += '<button type="button" data-partner-page="work">Back to exploration</button>';
  if (welcome) {
    content = `<div class="workspace-welcome-board"><div class="workspace-welcome-intro">${content.replace(/<h3>[\s\S]*?<\/h3>/, '')}${renderWorkspaceDisclosure(state)}</div></div>`;
  }
  const latestMessage =
    conversation.history.findLast((turn) => turn.role === 'assistant')?.display || '';
  const feedbackMessage =
    !ai.pending && (ai.error === latestMessage || (!ai.error && conversation.questions.length))
      ? latestMessage
      : '';
  const status = feedbackMessage
    ? ''
    : ai.error || (!dev && ai.configured === null ? 'Checking the Babbage connection…' : '');
  let feedback = feedbackMessage
    ? `<section class="babbage-feedback" aria-label="Babbage feedback">${renderBabbageMessage(feedbackMessage)}</section>`
    : '';
  if (feedbackMessage && conversation.questions.length && !ai.pending) {
    const pages = babbageFeedbackPages(feedbackMessage);
    const index = Math.max(0, Math.min(ui.feedbackPage || 0, pages.length - 1));
    if (!ui.clarifyNow) {
      feedback = `<section class="babbage-feedback" aria-label="Babbage feedback"><p class="feedback-page-count">Babbage’s notes · ${index + 1} of ${pages.length}</p>${renderBabbageMessage(pages[index])}</section>`;
      content = '';
      actions = `${index ? `<button type="button" data-feedback-page="${index - 1}">Previous notes</button>` : ''}${index < pages.length - 1 ? `<button type="button" class="primary" data-feedback-page="${index + 1}">Next notes</button>` : '<button type="button" class="primary" data-clarify-now>Continue to question</button>'}`;
    } else {
      feedback = '';
      actions =
        '<button type="button" data-feedback-page="0">Read Babbage’s notes</button>' + actions;
    }
    if (state.design.revision.trim())
      actions +=
        '<button type="button" data-workspace-panel="reason">Review current draft</button>';
  }
  // These controls are authored interface markup, separate from the scenario's prose.
  const primary =
    actions.match(/<button\b[^>]*class="[^"]*\bprimary\b[^"]*"[^>]*>[\s\S]*?<\/button>/)?.[0] || '';
  const previous =
    actions.match(/<button\b[^>]*data-partner-page="work"[^>]*>Back[^<]*<\/button>/)?.[0] || '';
  actions = actions.replace(primary, '').replace(previous, '');
  const next =
    primary ||
    '<button type="button" class="primary" data-workspace-panel="revision">Continue</button>';
  return `<div class="workspace-design workspace-design--focused partner-layout partner-layout--focused${utilityPage ? ' partner-layout--utility' : ''}">${renderStudioPage(
    {
      title: welcome
        ? 'What could your activity become?'
        : page === 'options'
          ? 'Babbage connection'
          : ui.task === 'draft'
            ? 'Develop your activity with Babbage'
            : 'Explore with Babbage',
      titleId: 'ai-title',
      titleClass: 'workspace-build-title',
      className: `workspace-context partner-card ai-panel${welcome ? ' partner-card--welcome' : ''}`,
      headingClass: 'partner-heading ai-panel-heading',
      headingExtra:
        renderBabbagePresence() +
        (dev ? '<p class="partner-mode">Sample simulation · no AI call</p>' : ''),
      content: `${welcome ? '' : renderWorkspaceDisclosure(state)}${renderBabbageCameo(state, status)}<p class="ai-status" role="status" aria-live="polite">${e(status)}</p>${feedback}${content}`,
      bodyClass: 'partner-content',
      actions,
      next,
      back: previous,
      step: 'Explore · Stage 1 of 3',
      actionClass: 'partner-actions',
      saveStatus: !ai.pending,
    },
  )}</div>`;
}
