import { designRoute } from './routes.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderPartner } from './partner-view.js';
import { renderReview } from './review-view.js';
import { renderUtility } from './views.js';
import { renderBuildPage } from './build-view.js';
import { workspaceStages } from './config.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderWorkspace(
  state,
  ai,
  error = '',
  designPage = 'start',
  partnerPage = 'work',
  reviewPage = 'rationale',
  ui = { screen: 'work' },
) {
  const route = designRoute(state.experience);
  if (error)
    return `<section class="entry-shell"><h1 id="setup-title" tabindex="-1">${e(route.heading)} needs attention</h1><p role="status">${e(error)}</p><button type="button" data-action="reset-workspace">${e(route.restartLabel)}</button><a href="?view=home">Return home</a></section>`;
  const panel = state.designPanel;
  const tabs = workspaceStages;
  let body = renderUtility(state, ai, ui);
  if (ui.screen === 'preview')
    body = `<section class="workspace-view workspace-page"><header class="design-page-heading"><h2 id="workspace-view-title" tabindex="-1">${workspacePreview(state, designPage).label}</h2></header><div class="workspace-view-body">${renderWorkspacePreview(state, designPage, ui)}</div><footer class="workspace-action-bar workspace-view-back"><button type="button" data-workspace-view="work">Back to my work</button></footer></section>`;
  if (!body && panel === 'babbage') body = renderPartner(state, ai, partnerPage, '', ui);
  else if (!body && panel === 'reason') body = renderReview(state, ai, reviewPage, '');
  else if (!body) body = renderBuildPage(state, ai, designPage);
  if (state.saveNotice)
    body = body.replaceAll('Saved in this browser.</span>', 'Not saved in this browser.</span>');
  return `<section class="workspace-shell workspace-shell--focused" aria-labelledby="setup-title"><div class="workspace-tabs" role="tablist" aria-label="${e(route.navigation)}">${tabs.map(([id, label]) => `<button type="button" role="tab" id="workspace-tab-${id}" aria-controls="workspace-panel" aria-selected="${panel === id}" tabindex="${panel === id ? 0 : -1}" data-workspace-panel="${id}">${label}</button>`).join('')}<button type="button" class="workspace-tabs-option" data-workspace-view="options" aria-label="${e(route.options)}">Options</button></div><header class="workspace-heading"><h1 id="setup-title" tabindex="-1">${e(route.heading)}</h1></header><div class="workspace-messages"><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status" aria-live="polite">${e(state.saveNotice)}</p></div><div id="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-${panel}">${body}</div><p class="workspace-privacy">Saved in this browser.</p></section>`;
}
export function renderDraftPreview(text, empty = 'Write directions to see them here.') {
  return text.trim() ? renderAssignmentDirections(text) : `<p>${e(empty)}</p>`;
}
export function workspacePreview(state, designPage) {
  const starting =
    state.designPanel !== 'reason' &&
    ((state.designPanel === 'revision' && designPage === 'start') ||
      (!state.design.revision.trim() && designPage !== 'draft'));
  return starting
    ? {
        text: state.teacher.directions,
        label: state.workspace.sourceKind === 'idea' ? 'Starting idea' : 'Starting directions',
      }
    : { text: state.design.revision, label: 'Working draft' };
}
export function renderWorkspacePreview(state, designPage, ui = {}) {
  const model = workspacePreview(state, designPage);
  const context = [
    [
      'Course & learners',
      [state.teacher.subject, state.teacher.learnerLevel].filter(Boolean).join(' · '),
    ],
    ['Learning goal', state.teacher.learningGoal],
    [
      'Time available',
      [state.teacher.workTime, state.teacher.daysAvailable].filter(Boolean).join(' · '),
    ],
    ['Required elements', state.teacher.mustStay],
    ['Student AI use', state.teacher.aiUse],
    ['Student contribution', state.workspace.studentContribution],
    ['Peer interaction', state.workspace.peerInteraction],
    ['Creative direction', state.workspace.creativeCore],
    ['Instructor interaction', state.workspace.instructorPlan],
  ];
  return `<div class="workspace-draft-overview"><aside class="workspace-draft-context" aria-label="Design context"><h3>Design context</h3><p>These details guide Babbage. They are separate from the student-facing directions.</p><dl>${context
    .filter(([, text]) => text?.trim())
    .map(([label, text]) => `<div><dt>${e(label)}</dt><dd>${e(text)}</dd></div>`)
    .join(
      '',
    )}</dl></aside><section class="workspace-draft-document" aria-label="${e(model.label)}"><h3>Activity directions</h3><div class="workspace-reading-preview" data-live-preview>${renderDraftPreview(model.text, 'No working draft yet. Your setup is saved; select Build my activity to put your choices together with Babbage.')}</div></section></div>`;
}
