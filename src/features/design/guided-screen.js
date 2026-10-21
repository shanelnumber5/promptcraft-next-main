import { characterArt } from '../../shared/character-art.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderField } from '../../shared/form-fields.js';
import { renderDirectionsEditor } from '../../shared/directions-editor.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderPagedDirections, renderPageNavigation } from '../../shared/paged-directions.js';
import { renderDesignRationale } from '../../shared/design-evidence.js';
import { renderAiPanel } from './conversation-view.js';
import { renderLoading } from './loading.js';
import { currentDesignPanel } from './panels.js';
import { designSteps, exchangeOptions } from './content.js';

const button = (panel, label, primary = false) => `<button type="button"${primary ? ' class="primary"' : ''} data-action="design-panel" data-design-panel="${panel}">${label}</button>`;
const pixel = (text, expression = 'confident') => `<div class="babbage-prompt"><span class="pixel-suggests-frame" aria-hidden="true"><img class="pixel-suggests-portrait" src="${characterArt.pixel[expression]}" alt="" width="84" height="92"></span><p><strong class="babbage-says-label">Professor Pixel suggests</strong>${e(text)}</p></div>`;
const context = (label, text) => `<div class="guided-context"><strong>${label}</strong><p>${e(text || 'Not specified yet.')}</p></div>`;

export function renderGuidedDesign(state, ai) {
  const step = state.designStep, panel = currentDesignPanel(state), item = designSteps[step];
  const exchange = exchangeOptions.find(([id]) => id === state.design.exchange)?.[1] || 'Not chosen yet';
  const field = (id) => renderField(item.fields.find((entry) => entry.id === id), state.design);
  const screenLabels = { concern: 'Name the concern', original: 'Read your current assignment', exchange: 'Choose the reply action', notes: 'Optional prediction', route: 'Choose how to draft', babbage: 'Work with Babbage', revision: 'Write discussion-board directions', reason: 'Explain the change', requirements: 'Read your requirements', history: 'Earlier conversation', rationale: 'Why Babbage suggests this change', earlier: 'Earlier saved draft' };
  let body;
  if (panel === 'concern') body = `${pixel('Name one problem in the discussion. You can read your current directions before deciding.', 'thoughtful')}<div class="guided-reference-actions">${button('original', 'Read current directions')}<span><strong>Learning goal:</strong> ${e(state.teacher.learningGoal || 'Not specified yet.')}</span></div><div class="design-fields">${field('concern')}</div>`;
  else if (panel === 'original') body = `${renderPagedDirections(state.teacher.directions, state.designReadPage)}<button type="button" data-action="edit-context">Edit setup</button>`;
  else if (panel === 'exchange') body = `${pixel(item.prompt)}${context('The concern you named', state.design.concern)}<div class="design-fields">${field('exchange')}</div>`;
  else if (panel === 'notes') body = `${pixel('Before drafting, what might this reply help students notice? A brief prediction is enough, and you can leave this blank.', 'thoughtful')}${context('The reply action you chose', exchange)}<div class="design-fields">${field('notes')}</div>`;
  else if (panel === 'route') body = `${pixel('Choose a starting point. Work with Babbage, write your own directions, or use a starter and edit it.', 'pleasant')}<div class="guided-reference-actions">${button('requirements', 'Read requirements')}${state.design.previousRevision ? button('earlier', 'Read earlier saved draft') : ''}</div><div class="guided-route"><section><h2>Develop a draft with Babbage</h2><p>Answer one question at a time, then review the suggested directions.</p>${button('babbage', 'Work with Babbage', true)}</section><section><h2>Write your own directions</h2><p>Write the first post, reply, and follow-up in your own words.</p>${button('revision', state.design.revision ? 'Edit my directions' : 'Write my directions')}<button type="button" data-action="use-starter">${state.design.revision ? 'Append a starter exchange' : 'Use a starter draft'}</button></section></div>`;
  else if (panel === 'requirements') body = `${context('Learning goal', state.teacher.learningGoal)}${context('Required elements', state.teacher.mustStay)}${context('Time available', [state.teacher.workTime, state.teacher.daysAvailable].filter(Boolean).join(' · '))}<button type="button" data-action="edit-context">Edit setup</button>`;
  else if (panel === 'babbage') body = renderAiPanel(state, ai, { compact: true });
  else if (panel === 'revision') body = `<div class="guided-reference-actions">${button('requirements', 'Read requirements')}${button('babbage', 'Get Babbage help')}<button type="button" data-action="use-starter">${state.design.revision ? 'Append a starter exchange' : 'Use a starter draft'}</button></div>${ai.pending ? renderLoading(ai, state.babbage.mode === 'dev') : ''}<p class="ai-status" role="status">${e(ai.error || '')}</p><div class="guided-revision-layout"><div class="guided-editor" data-draft-editor>${renderDirectionsEditor(state.design.revision)}</div><section class="guided-live-preview" aria-labelledby="guided-preview-title"><h2 id="guided-preview-title">Live preview</h2><div class="guided-document" data-guided-live-preview role="region" aria-label="Formatted discussion directions preview">${state.design.revision.trim() ? renderAssignmentDirections(state.design.revision) : '<p class="guided-preview-empty">Your formatted directions will appear here as you write.</p>'}</div></section></div>`;
  else if (panel === 'reason') body = `${pixel('Make this explanation your own: why choose this change, and what would you look for in student work to see whether it helped?', 'thoughtful')}${context('Learning goal', state.teacher.learningGoal)}<div class="guided-reference-actions"><button type="button" data-action="hear-maya"${state.design.revision.trim() ? '' : ' disabled'}>Hear Maya’s first read (optional)</button><span>You can return to Edit directions after considering her response.</span></div><div class="design-fields">${field('reason')}</div>`;
  else if (panel === 'rationale') body = `<div class="guided-document design-rationale">${renderDesignRationale(ai.suggestion?.reason || state.design.reason || 'No rationale available yet.')}</div>`;
  else if (panel === 'earlier') body = `<p>Your original assignment changed. This earlier draft is saved separately.</p>${renderPagedDirections(state.design.previousRevision, state.designReadPage)}`;
  else if (panel === 'history') {
    const history = state.babbage.history, index = Math.max(0, Math.min(state.designReadPage || 0, history.length - 1));
    const turn = history[index];
    body = turn ? `<article class="guided-document"><h2>${turn.role === 'assistant' ? 'Babbage' : 'Your answers'}</h2><p class="conversation-text">${e(turn.display || turn.content)}</p></article>${renderPageNavigation(index, history.length, 'Message')}` : '<p>No earlier conversation yet.</p>';
  }
  const nextLabel = panel === 'reason' ? 'Review draft' : panel === 'revision' ? 'Explain change' : ['history', 'rationale'].includes(panel) ? 'Return to Babbage' : panel === 'original' ? 'Name the concern' : ['requirements', 'earlier'].includes(panel) ? state.designReturnPanel === 'revision' ? 'Edit directions' : 'Drafting choices' : ['route', 'babbage'].includes(panel) ? 'Write directions' : 'Continue';
  const disabled = ai.pending || ['revision', 'reason'].includes(panel) && !state.design.revision.trim();
  const stages = step === 0 ? ['concern'] : step === 1 ? ['exchange', 'notes'] : ['route', 'babbage', 'revision', 'reason'];
  const part = !stages.includes(panel) ? 'Reference screen' : step === 1 ? `Screen ${stages.indexOf(panel) + 1} of ${stages.length}` : '';
  return `<section class="setup-shell design-shell design-shell--guided guided-panel--${panel}" aria-labelledby="setup-title"><header class="setup-header"><span>Design with Babbage</span><strong>Step ${step + 1} of ${designSteps.length}${part ? ' · ' + part : ''}</strong></header><form class="setup-form" data-design-form><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(item.title)}</h1><p>${e(screenLabels[panel])}</p></div><div class="design-body guided-screen">${body}</div><nav class="setup-actions" aria-label="Design navigation"><button type="button" class="nav-button nav-button--back" data-action="design-back"><span>Back</span></button><span>${e(screenLabels[panel])}</span><button type="button" class="primary nav-button nav-button--next" data-action="design-next"${disabled ? ' disabled' : ''}><span>${nextLabel}</span></button></nav></form><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status">${e(state.saveNotice)}</p></section>`;
}
