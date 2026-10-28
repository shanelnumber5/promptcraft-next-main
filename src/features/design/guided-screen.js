import { renderWorkflowNav } from '../../shared/workflow-nav.js';
import { mayaFeedbackReference } from './maya-dialog.js';
import { renderPixelAdviceScene } from './pixel-advice-scene.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderField } from '../../shared/form-fields.js';
import { renderDirectionsEditor } from '../../shared/directions-editor.js';
import { renderPagedDirections, renderPageNavigation } from '../../shared/paged-directions.js';
import { renderDesignRationale, separateRationaleReferences } from '../../shared/design-evidence.js';
import { renderAiPanel } from './conversation-view.js';
import { renderLoading } from './loading.js';
import { currentDesignPanel } from './panels.js';
import { designSteps, exchangeOptions } from './content.js';

const button = (panel, label, primary = false) => `<button type="button"${primary ? ' class="primary"' : ''} data-action="design-panel" data-design-panel="${panel}">${label}</button>`;
const context = (label, text) => `<div class="guided-context"><strong>${label}</strong><p>${e(text || 'Not specified yet.')}</p></div>`;

export function renderGuidedDesign(state, ai) {
  const step = state.designStep, panel = currentDesignPanel(state), item = designSteps[step];
  const exchange = exchangeOptions.find(([id]) => id === state.design.exchange)?.[1] || 'Not chosen yet';
  const field = (id) => renderField(item.fields.find((entry) => entry.id === id), state.design);
  const screenLabels = { concern: 'Name the concern', original: 'Read your current assignment', exchange: 'Choose the reply action', notes: 'Optional prediction', route: 'Choose how to draft', babbage: 'Work with Babbage', revision: 'Write discussion-board directions', reason: 'Explain the change', requirements: 'Read your requirements', history: 'Earlier conversation', rationale: 'Why Babbage suggests this change', earlier: 'Earlier saved draft' };
  const advice = {
    concern: 'Name one problem in the discussion. You do not need to know the solution yet.',
    exchange: item.prompt,
    notes: 'What might this reply help students notice? A brief prediction is enough, and you can leave this blank.',
    route: 'Choose a starting point. Work with Babbage, write your own directions, or use a starter and edit it.',
    reason: 'Maya, how does this new assignment read to you? Tell us what you would do and what you might need clarified.',
  };
  if (panel === 'advice') return renderPixelAdviceScene(state, item.title, advice[state.designReturnPanel] || advice.concern);
  screenLabels.advice = 'Pixel’s advice';
  screenLabels.tools = 'Draft tools';
  screenLabels.feedback = 'Notes to support your explanation';
  screenLabels.babbage = ai.suggestion ? 'Use this draft as a starting point, or keep your current directions.' : 'Develop a draft from your assignment context.';
  let body;
  if (panel === 'concern') body = `${context('Learning goal', state.teacher.learningGoal)}<div class="design-fields">${field('concern')}</div>`;
  else if (panel === 'original') body = `${renderPagedDirections(state.teacher.directions, state.designReadPage)}<button type="button" data-action="edit-context">Edit setup</button>`;
  else if (panel === 'exchange') body = `${context('The concern you named', state.design.concern)}<div class="design-fields">${field('exchange')}</div>`;
  else if (panel === 'notes') body = `${context('The reply action you chose', exchange)}<div class="design-fields">${field('notes')}</div>`;
  else if (panel === 'route') body = `<div class="guided-route guided-route--choices"><button type="button" data-action="design-panel" data-design-panel="babbage"><strong>Draft with Babbage</strong><span>Answer a few questions and review a suggested draft.</span></button><button type="button" data-action="design-panel" data-design-panel="revision"><strong>Write my own</strong><span>Write or edit the first post, reply, and follow-up.</span></button></div>${state.design.previousRevision ? '<div class="guided-route-secondary">'+button('earlier','Read earlier saved draft')+'</div>' : ''}`;
  else if (panel === 'requirements') body = `${context('Learning goal', state.teacher.learningGoal)}${context('Required elements', state.teacher.mustStay)}${context('Time available', [state.teacher.workTime, state.teacher.daysAvailable].filter(Boolean).join(' · '))}<button type="button" data-action="edit-context">Edit setup</button>`;
  else if (panel === 'babbage') body = renderAiPanel(state, ai, { compact: true });
  else if (panel === 'tools') body = `<section class="guided-tools"><h2>Draft tools</h2><p>Choose the support you need, then return to your directions.</p><nav aria-label="Draft tools">${button('requirements','Review requirements')}${button('babbage','Work with Babbage')}<button type="button" data-action="use-starter">${state.design.revision ? 'Add a starter exchange' : 'Use a starter draft'}</button></nav></section>`;
  else if (panel === 'revision') body = `${ai.pending ? renderLoading(ai, state.babbage.mode === 'dev') : ''}<p class="ai-status" role="status">${e(ai.error || '')}</p><div class="guided-revision-layout"><div class="guided-editor" data-draft-editor>${renderDirectionsEditor(state.design.revision)}</div></div>`;
  else if (panel === 'reason') body = '<div class="design-fields">'+renderField({...item.fields.find(entry => entry.id === 'reason'), help:'Explain your choice and what you will look for in student work.'},{...state.design,reason:separateRationaleReferences(state.design.reason).prose})+'</div>';
  else if (panel === 'feedback') {
    const scene = mayaFeedbackReference(state);
    const latest = state.babbage.history.findLast(turn => turn.role === 'assistant' && turn.display);
    const excerpt = text => {
      const sentences = [...new Intl.Segmenter('en', {granularity:'sentence'}).segment(text)].slice(0,2).map(part => part.segment).join('').trim();
      return sentences.length > 480 ? sentences.slice(0,477).trimEnd() + '…' : sentences;
    };
    const note = (name,text) => '<section><h2>'+e(name)+'</h2><p>'+e(excerpt(text))+'</p></section>';
    body = '<div class="guided-feedback">'+context('Learning goal',state.teacher.learningGoal)+'<p class="guided-feedback-caption">Excerpts from the feedback you received. Use what helps explain your design choices.</p>'
      + (scene ? note('Maya · student perspective',scene.maya.text) + (scene.pixel ? note('Pixel · teaching perspective',scene.pixel.text) : '') : '<p>Maya’s reading is not available for this draft in this session.</p>')
      + (latest ? note('Babbage · latest note',latest.display) : '')
      + '</div>';
  }
  else if (panel === 'rationale') body = `<div class="guided-document design-rationale">${renderDesignRationale(ai.suggestion?.reason || state.design.reason || 'No rationale available yet.')}</div>`;
  else if (panel === 'earlier') body = `<p>Your original assignment changed. This earlier draft is saved separately.</p>${renderPagedDirections(state.design.previousRevision, state.designReadPage)}`;
  else if (panel === 'history') {
    const history = state.babbage.history, index = Math.max(0, Math.min(state.designReadPage || 0, history.length - 1));
    const turn = history[index];
    body = turn ? `<article class="guided-document"><h2>${turn.role === 'assistant' ? 'Babbage' : 'Your answers'}</h2><p class="conversation-text">${e(turn.display || turn.content)}</p></article>${renderPageNavigation(index, history.length, 'Message')}` : '<p>No earlier conversation yet.</p>';
  }
  const nextLabel = panel === 'feedback' ? 'Back to explanation' : panel === 'tools' ? 'Back to editor' : panel === 'advice' ? 'Return to my work' : panel === 'reason' ? 'Review draft' : panel === 'revision' ? 'Explain change' : ['history', 'rationale'].includes(panel) ? 'Return to Babbage' : panel === 'original' ? 'Name the concern' : ['requirements', 'earlier'].includes(panel) ? state.designReturnPanel === 'tools' ? 'Back to tools' : state.designReturnPanel === 'revision' ? 'Edit directions' : 'Drafting choices' : ['route', 'babbage'].includes(panel) ? 'Write directions' : 'Continue';
  const disabled = ai.pending || ['revision', 'reason'].includes(panel) && !state.design.revision.trim();
  const forwardControl = panel === 'babbage' && ai.suggestion ? '<button type="button" class="primary nav-button nav-button--next" data-action="apply-ai"><span>Use this draft</span></button>' : panel === 'route' ? '' : `<button type="button" class="primary nav-button nav-button--next" data-action="design-next"${disabled ? ' disabled' : ''}><span>${nextLabel}</span></button>`;
  const stages = step === 0 ? ['concern'] : step === 1 ? ['exchange', 'notes'] : ['route', 'babbage', 'revision', 'reason'];
  const part = !stages.includes(panel) ? 'Reference screen' : step === 1 ? `Screen ${stages.indexOf(panel) + 1} of ${stages.length}` : '';
  return `<section class="setup-shell design-shell design-shell--guided guided-panel--${panel}" aria-labelledby="setup-title"><header class="setup-header"><span>Design with Babbage</span><strong>Step ${step + 1} of ${designSteps.length}${part ? ' · ' + part : ''}</strong></header>${renderWorkflowNav({context:"guided",babbageAction: step === 2 && panel !== "babbage" ? '<button type="button" data-action="design-panel" data-design-panel="babbage">Ask Babbage</button>' : ""})}<form class="setup-form" data-design-form><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(panel==='reason' ? 'Explain the change' : panel==='feedback' ? 'Feedback reference' : panel==='babbage' ? ai.suggestion ? 'Review Babbage’s draft' : 'Work with Babbage' : item.title)}</h1>${panel==='reason' ? '' : '<p>'+e(screenLabels[panel])+'</p>'}${panel==='babbage' && ai.suggestion ? `<button type="button" class="guided-suggestion-why" data-action="design-panel" data-design-panel="rationale">Why this draft?</button>` : ''}${panel==='revision' ? `<button type="button" class="guided-tools-link" data-action="design-panel" data-design-panel="tools">Tools</button>` : ''}</div><div class="design-body guided-screen">${body}</div><nav class="setup-actions" aria-label="Design navigation"><button type="button" class="nav-button nav-button--back" data-action="design-back"><span>Back</span></button><span${panel==='babbage' && state.babbage.mode!=='dev' ? ' class="guided-sharing-note"' : ''}>${panel==='reason' ? '<button type="button" class="guided-feedback-nav" data-action="design-panel" data-design-panel="feedback">Feedback reference</button>' : panel==='babbage' ? state.babbage.mode==='dev' ? '' : 'Requests share your assignment and answers with the PromptCraft Babbage service and OpenAI.' : e(screenLabels[panel])}</span>${forwardControl}</nav></form><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status">${e(state.saveNotice)}</p></section>`;
}
