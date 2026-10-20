import { labIcon } from '../../shared/lab-visuals.js';
import { renderField } from '../../shared/form-fields.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderPartner } from './partner-view.js';
import { renderReview } from './review-view.js';
import { teacherSetup } from '../setup/content.js';
import { escapeHTML as e } from '../../shared/html.js';

const teacherField = (state, id) => {
  const field = teacherSetup.steps.flatMap(step => step.fields).find(field => field.id === id);
  const compact = { subject: { label: 'Course or subject', help: '', unsure: false }, learningGoal: { label: 'What should students learn?', help: '', rows: 2 }, mustStay: { label: 'What must stay the same?', help: '', rows: 2 }, workTime: { label: 'Work time per student', help: '' }, daysAvailable: { label: 'Days to finish', help: '' }, learnerLevel: { label: 'Who are your learners?', help: '' } };
  return renderField({ ...field, unsure: false, ...compact[id] }, state.teacher);
};
export function renderWorkspace(state, ai, error = '', designPage = 'start', partnerPage = 'work', reviewPage = 'rationale') {
  if (error) return `<section class="entry-shell"><h1 id="setup-title" tabindex="-1">Your workspace needs attention</h1><p role="status">${e(error)}</p><button type="button" data-action="reset-workspace">Reset this workspace</button><a href="?view=home">Return home</a></section>`;
  const panel = state.designPanel;
  const tabs = [['revision', 'Design'], ['babbage', 'Babbage'], ['reason', 'Review & Course Guide']];
  let body;
  if (panel === 'babbage') body = renderPartner(state, ai, partnerPage, renderWorkspacePreview(state, designPage));
  else if (panel === 'reason') body = renderReview(state, ai, reviewPage, renderWorkspacePreview(state, designPage));
  else {
    const pages = [['start', 'Starting point'], ['learners', 'Learning & learners'], ['time', 'Time'], ['requirements', 'Requirements'], ['draft', 'Write your draft']];
    const index = Math.max(0, pages.findIndex(([id]) => id === designPage));
    let fields;
    if (designPage === 'learners') fields = `<div data-setup-form>${teacherField(state, 'learningGoal')}${teacherField(state, 'learnerLevel')}<div class="setup-field"><label for="student-needs">Learner needs (optional)</label><textarea id="student-needs" data-workspace-meta="studentNeeds" rows="2" placeholder="General access or learning needs; no identifying details.">${e(state.workspace.studentNeeds)}</textarea></div></div>`;
    else if (designPage === 'time') fields = `<div data-setup-form>${teacherField(state, 'workTime')}${teacherField(state, 'daysAvailable')}</div>`;
    else if (designPage === 'requirements') fields = `<div data-setup-form>${teacherField(state, 'mustStay')}<div class="setup-field"><label for="aiUse">Student AI use</label><textarea id="aiUse" name="aiUse" rows="2" placeholder="What AI help is appropriate?">${e(state.teacher.aiUse)}</textarea></div></div><div data-design-form>${renderField({ id: 'concern', label: 'What would you like to improve? (optional)', help: '', type: 'textarea', rows: 1 }, state.design)}</div>`;
    else if (designPage === 'draft') fields = `<div class="workspace-writing" data-design-form><label for="revision">Assignment directions</label><p id="revision-help" class="field-help">Write or paste your directions. The preview styles headings, paragraphs, and numbered steps as you type.</p><textarea id="revision" name="revision" aria-describedby="revision-help" placeholder="Write directions here, or collaborate with Babbage for a starting point.">${e(state.design.revision)}</textarea></div>${state.design.previousRevision ? `<section class="workspace-earlier"><h3>Earlier draft</h3>${renderAssignmentDirections(state.design.previousRevision)}<button type="button" data-action="restore-earlier">Restore earlier draft</button></section>` : ''}`;
    else fields = `<fieldset><legend>What are you bringing?</legend>${[['existing', 'An existing assignment'], ['idea', 'A rough idea']].map(([value, label]) => `<label><input type="radio" name="sourceKind" data-workspace-meta="sourceKind" value="${value}"${state.workspace.sourceKind === value ? ' checked' : ''}> ${label}</label>`).join('')}</fieldset><div data-setup-form><div class="setup-field"><label for="directions">${state.workspace.sourceKind === 'idea' ? 'Your starting idea' : 'Current directions'}</label><textarea id="directions" name="directions" rows="3">${e(state.teacher.directions)}</textarea></div>${teacherField(state, 'subject')}</div>`;
    body = `<div class="workspace-design workspace-design--focused"><section class="workspace-context workspace-page" aria-labelledby="design-page-title"><header class="design-page-heading"><h2 id="design-page-title" tabindex="-1">${pages[index][1]}</h2><span>${index + 1} / ${pages.length}</span></header><div class="design-page-fields">${fields}</div><nav class="design-page-nav" aria-label="Design sections">${index ? `<button type="button" data-design-page="${pages[index - 1][0]}">← Back</button>` : '<span></span>'}${index < pages.length - 1 ? `<button type="button" class="primary" data-design-page="${pages[index + 1][0]}">Next: ${pages[index + 1][1]} →</button>` : '<button type="button" class="primary" data-workspace-panel="babbage">Collaborate with Babbage →</button>'}</nav></section>${renderWorkspacePreview(state, designPage)}</div>`;
  }
  return `<section class="workspace-shell workspace-shell--focused" aria-labelledby="setup-title"><header class="workspace-heading"><div><span class="eyebrow">Great Falls College · Your design studio</span><h1 id="setup-title" tabindex="-1">Create an Assignment</h1></div><a class="action-link" href="?view=lab">${labIcon('spark')} Babbage’s Idea Lab</a></header><div class="workspace-tabs" role="tablist" aria-label="Assignment workspace">${tabs.map(([id, label]) => `<button type="button" role="tab" id="workspace-tab-${id}" aria-controls="workspace-panel" aria-selected="${panel === id}" tabindex="${panel === id ? 0 : -1}" data-workspace-panel="${id}">${label}</button>`).join('')}</div><div id="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-${e(panel)}">${body}</div><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status" aria-live="polite">${e(state.saveNotice)}</p><p class="workspace-privacy">Saves in this browser · Private workspace, separate from research participation.</p></section>`;
}

export function renderDraftPreview(text, empty = 'Write directions to see them here.') {
  return text.trim() ? renderAssignmentDirections(text) : `<p class="preview-empty">${e(empty)}</p>`;
}

export function workspacePreview(state, designPage) {
  const starting = state.designPanel !== 'reason' && ((state.designPanel === 'revision' && designPage === 'start') || (!state.design.revision.trim() && designPage !== 'draft'));
  return starting
    ? { text: state.teacher.directions, label: state.workspace.sourceKind === 'idea' ? 'Starting idea' : 'Starting assignment', empty: 'Add your starting material to see it here.' }
    : { text: state.design.revision, label: 'Your working draft', empty: 'Write directions or use a suggestion from Babbage to see your draft here.' };
}

export function renderWorkspacePreview(state, designPage) {
  const model = workspacePreview(state, designPage);
  return `<section class="workspace-draft workspace-live" aria-labelledby="preview-title"><header><h2 id="preview-title">Live assignment preview</h2><button type="button" data-action="edit-draft">Edit draft</button></header><div class="assignment-paper" tabindex="0" role="region" aria-label="Assignment preview"><span class="assignment-paper-label" data-preview-label>${e(model.label)}</span><div class="assignment-directions" data-live-preview>${renderDraftPreview(model.text, model.empty)}</div></div>${state.designPanel === 'revision' ? `<button type="button" class="use-starting" data-action="use-starting"${state.design.revision.trim() ? ' hidden' : ''}${!state.teacher.directions.trim() ? ' disabled' : ''}>Use starting material in my draft</button>` : ''}</section>`;
}
