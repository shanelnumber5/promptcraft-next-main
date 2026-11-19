import { escapeHTML as e } from '../../shared/html.js';
import { renderAssessmentSetup, renderRubric, assignmentName } from './rubric.js';
export const aiUseOptions = [
  ['No student AI use', 'No AI: students complete the activity themselves'],
  [
    'Brainstorming or feedback only; students write their own work.',
    'Ideas or feedback: students write their own work',
  ],
  [
    'AI drafting allowed; students verify claims and revise the output.',
    'Drafting allowed: students check and revise AI output',
  ],
  ['Not sure yet', 'Not sure yet: help me decide appropriate limits'],
];
export function renderAiUseSummary(state) {
  return `<section class="workspace-choice-summary"><strong>Student AI use</strong><p>${e(state.workspace.aiUseChoice || state.teacher.aiUse || 'Choose an option')}</p><button type="button" data-action="open-ai-use-popup">Choose or change AI use</button></section>`;
}
export function mountWorkspacePopup(app, state, ui, onClose) {
  const ai = ui.popup === 'ai-use',
    dialog = document.createElement('dialog');
  dialog.className = 'workspace-popup';
  dialog.setAttribute('aria-label', ai ? 'Student AI use' : 'Assignment rubric');
  dialog.innerHTML = `<header class="workspace-popup-heading"><h2>${ai ? 'Student AI use' : e(assignmentName(state)) + ' rubric'}</h2><button type="button" data-action="close-workspace-popup">Close</button></header><div class="workspace-popup-body">${ai ? `<fieldset data-setup-form><legend>Choose what students may use AI for</legend>${aiUseOptions.map(([value, label], i) => `<label class="workspace-popup-choice"><input type="radio" name="aiUse" value="${e(value)}" ${(state.workspace.aiUseChoice || state.teacher.aiUse) === value ? 'checked' : ''}><span>${e(label)}</span></label>`).join('')}</fieldset>` : `<label>Assignment title<input data-workspace-meta="assignmentTitle" value="${e(state.workspace.assignmentTitle || '')}" placeholder="Babbage can suggest a title from your directions"></label><label>Total assignment points<input type="number" min="1" max="10000" data-rubric-param="total" value="${e(state.creative.rubric.total)}"></label><p>The rubric title follows your assignment title. Babbage can draft criteria from your directions and learning goal.</p>${ui.rubricPart === 'criteria' ? renderAssessmentSetup(state) : renderRubric(state, false, { page: ui.rubricCriterion || 0 })}`}</div><footer class="workspace-popup-footer"><span>Saved in this browser.</span><button type="button" data-action="close-workspace-popup">Done</button></footer>`;
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    onClose();
  });
  app.append(dialog);
  dialog.showModal();
  dialog.querySelector('button').focus();
}
