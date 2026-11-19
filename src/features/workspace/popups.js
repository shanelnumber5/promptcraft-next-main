import { escapeHTML as e } from '../../shared/html.js';
import {
  renderAssessmentSetup,
  renderRubricTable,
  rubricForState,
  assignmentName,
} from './rubric.js';
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
    choice = ui.popup === 'rubric-choice',
    rubric = rubricForState(state),
    editing = ui.rubricPart === 'edit';
  const dialog = document.createElement('dialog');
  dialog.className = 'workspace-popup' + (!ai && !choice ? ' workspace-popup--rubric' : '');
  dialog.setAttribute(
    'aria-label',
    ai ? 'Student AI use' : choice ? 'Include an assignment rubric?' : 'Assignment rubric',
  );
  let content;
  if (ai)
    content = `<fieldset data-setup-form><legend>Choose what students may use AI for</legend>${aiUseOptions.map(([value, label]) => `<label class="workspace-popup-choice"><input type="radio" name="aiUse" value="${e(value)}" ${(state.workspace.aiUseChoice || state.teacher.aiUse) === value ? 'checked' : ''}><span>${e(label)}</span></label>`).join('')}</fieldset>`;
  else if (choice)
    content = `<p>Would you like Babbage to create an assessment rubric from your assignment and learning goal?</p><p>The rubric will be ready at Final checks. You can edit it and download a Canvas import file with your guide.</p><div class="rubric-choice-actions"><button type="button" class="primary" data-action="include-rubric">Yes, create a rubric automatically</button><button type="button" data-action="skip-rubric">Continue without a rubric</button></div>`;
  else if (editing)
    content = `<div class="rubric-edit-settings"><label>Assignment title<input data-workspace-meta="assignmentTitle" value="${e(state.workspace.assignmentTitle || '')}" placeholder="Name your assignment"></label><label>Total points<input type="number" min="1" max="10000" data-rubric-param="total" value="${e(rubric.total)}"></label><button type="button" data-action="rubric-edit-criteria">Change criteria</button><button type="button" data-action="generate-rubric">Regenerate from assignment</button></div><p>Edit any criterion or descriptor below. Your changes save as you type. Regenerating replaces the descriptors and recalculates points.</p>${renderRubricTable(rubric, { editable: true })}`;
  else if (ui.rubricPart === 'criteria')
    content =
      renderAssessmentSetup(state) +
      '<button type="button" class="primary" data-action="generate-rubric">Update rubric</button>';
  else
    content = rubric.rows.length
      ? `${rubric.basis !== state.design.revision ? '<p class="rubric-stale">The assignment has changed. Review this rubric or choose Edit rubric to regenerate it.</p>' : ''}<p class="rubric-import-help">Download the CSV to import this rubric into Canvas, then attach it to your assignment.</p>${renderRubricTable(rubric)}`
      : '<p>Babbage will draft the criteria and performance descriptions from your activity.</p><button type="button" data-action="generate-rubric">Create rubric</button>';
  dialog.innerHTML = `<header class="workspace-popup-heading"><h2>${ai ? 'Student AI use' : choice ? 'Include an assignment rubric?' : e(assignmentName(state)) + ' rubric'}</h2><button type="button" data-action="close-workspace-popup">Close</button></header><div class="workspace-popup-body">${content}<p data-rubric-notice role="status"></p></div><footer class="workspace-popup-footer">${!ai && !choice ? `<button type="button" data-action="download-rubric-csv" ${rubric.rows.length ? '' : 'disabled'}>Download rubric for Canvas import (.csv)</button><button type="button" data-action="${editing || ui.rubricPart === 'criteria' ? 'view-rubric' : 'edit-rubric'}">${editing || ui.rubricPart === 'criteria' ? 'Done editing' : 'Edit rubric'}</button>` : '<span>Saved in this browser.</span>'}<button type="button" class="primary" data-action="close-workspace-popup">${ai || choice ? 'Done' : 'Close rubric'}</button></footer>`;
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    onClose();
  });
  app.append(dialog);
  dialog.showModal();
  dialog.querySelector('button').focus();
}
