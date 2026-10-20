import { labIcon } from '../../shared/lab-visuals.js';
import { renderField } from '../../shared/form-fields.js';
import { renderDirectionsEditor } from '../../shared/directions-editor.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderAiPanel } from '../design/conversation-view.js';
import { renderFinalCheck } from '../design/final-check.js';
import { designSteps, finalCheckReady } from '../design/content.js';
import { teacherSetup } from '../setup/content.js';
import { findIdea } from '../idea-lab/ideas.js';
import { escapeHTML as e } from '../../shared/html.js';

const teacherField = (state, id) => {
  const field = teacherSetup.steps.flatMap(step => step.fields).find(field => field.id === id);
  const compact = { subject: { label: 'Course or subject', help: '', unsure: false }, learningGoal: { label: 'What should students learn?', help: '', rows: 2 } };
  return renderField({ ...field, ...compact[id] }, state.teacher);
};
export function renderWorkspace(state, ai, error = '') {
  if (error) return `<section class="entry-shell"><h1 id="setup-title" tabindex="-1">Your workspace needs attention</h1><p role="status">${e(error)}</p><button type="button" data-action="reset-workspace">Reset this workspace</button><a href="?view=home">Return home</a></section>`;
  const panel = state.designPanel;
  const inspiration = findIdea(state.workspace.ideaId);
  const tabs = [['revision', 'Design'], ['babbage', 'Babbage'], ['reason', 'Review & Course Guide']];
  let body;
  if (panel === 'babbage') body = `<p>Your draft stays yours. Explore an alternative, review its tradeoffs, and choose what to keep.</p>${inspiration ? `<p><strong>Inspiration:</strong> ${e(inspiration.title)}</p>` : ''}${renderAiPanel(state, ai)}`;
  else if (panel === 'reason') body = `<section><h2>${state.workspace.sourceKind === 'idea' ? 'Starting idea' : 'Original assignment'}</h2><div class="workspace-original">${renderAssignmentDirections(state.teacher.directions || 'Add your starting point in Design.')}</div></section><div data-design-form>${renderField(designSteps[2].fields.find(field => field.id === 'reason'), state.design)}</div><button type="button" data-action="hear-maya"${!state.design.revision.trim() || ai.pending ? ' disabled' : ''}>Hear Maya’s first read (optional)</button><p>A simulated student perspective to consider before you approve your design.</p>${renderFinalCheck(state)}<button type="button" class="primary" data-action="approve-version"${!finalCheckReady(state) || state.finalCheck.approved ? ' disabled' : ''}>${state.finalCheck.approved ? 'Saved to your Course Guide' : 'Save final design to Course Guide'}</button><p>Before saving: include a starting point, learning goal, rationale, revised directions, and the three checks.</p>`;
  else body = `<div class="workspace-design">
    <section class="workspace-context" data-setup-form aria-labelledby="starting-title">
      <h2 id="starting-title">Your starting point</h2>
      <fieldset><legend>What are you bringing?</legend>${[['existing', 'An existing assignment'], ['idea', 'A rough idea']].map(([value, label]) => `<label><input type="radio" name="sourceKind" data-workspace-meta="sourceKind" value="${value}"${state.workspace.sourceKind === value ? ' checked' : ''}> ${label}</label>`).join('')}</fieldset>
      <div class="setup-field"><label for="directions">${state.workspace.sourceKind === 'idea' ? 'Describe your starting idea' : 'Current assignment directions'}</label><p id="directions-help" class="field-help">Paste directions or sketch an idea. Your draft stays separate.</p><textarea id="directions" name="directions" aria-describedby="directions-help" rows="4">${e(state.teacher.directions)}</textarea></div>
      ${teacherField(state, 'subject')}${teacherField(state, 'learningGoal')}
      ${inspiration ? `<aside class="workspace-inspiration"><h3>Idea Lab inspiration</h3><p>${e(inspiration.title)}</p><small>Illustrative starter, adapted by you.</small></aside>` : ''}
    </section>
    <section class="workspace-draft" aria-labelledby="draft-title"><h2 id="draft-title">Your assignment draft</h2><p class="ai-status" role="status" aria-live="polite">${e(ai.error || '')}</p>${renderDirectionsEditor(state.design.revision)}${state.design.previousRevision ? `<section class="workspace-earlier"><h3>Earlier draft from before your starting point changed</h3>${renderAssignmentDirections(state.design.previousRevision)}<button type="button" data-action="restore-earlier">Restore earlier draft</button></section>` : ''}</section>
  </div>
  <div class="workspace-settings">
    <section class="workspace-section" data-setup-form aria-labelledby="learners-title"><h2 id="learners-title">Learners & timing</h2>${teacherField(state, 'learnerLevel')}${teacherField(state, 'workTime')}${teacherField(state, 'daysAvailable')}<div class="setup-field"><label for="student-needs">General learner needs (optional)</label><p id="student-needs-help" class="field-help">Describe learning or access needs without identifying anyone.</p><textarea id="student-needs" data-workspace-meta="studentNeeds" aria-describedby="student-needs-help" rows="3">${e(state.workspace.studentNeeds)}</textarea></div></section>
    <section class="workspace-section" data-setup-form aria-labelledby="requirements-title"><h2 id="requirements-title">Requirements & AI use</h2>${teacherField(state, 'mustStay')}<div class="setup-field"><label for="aiUse">Student AI use</label><p id="aiUse-help" class="field-help">What should students do themselves? What AI help is appropriate?</p><textarea id="aiUse" name="aiUse" aria-describedby="aiUse-help" rows="3">${e(state.teacher.aiUse)}</textarea></div></section>
    <section class="workspace-section" data-design-form aria-labelledby="purpose-title"><h2 id="purpose-title">What you want to improve</h2>${renderField({ id: 'concern', label: 'Your design focus (optional)', help: 'Name a concern, purpose, or possibility to explore with Babbage.', type: 'textarea', rows: 4 }, state.design)}</section>
  </div>`;
  return `<section class="workspace-shell" aria-labelledby="setup-title"><header class="workspace-heading"><div><span class="eyebrow">Great Falls College · Your design studio</span><h1 id="setup-title" tabindex="-1">Create an Assignment</h1></div><a class="action-link" href="?view=lab">${labIcon('spark')} Babbage’s Idea Lab</a></header><p>Bring your starting point, shape a draft, and add any context Babbage should consider.</p><div class="workspace-tabs" role="tablist" aria-label="Assignment workspace">${tabs.map(([id, label]) => `<button type="button" role="tab" id="workspace-tab-${id}" aria-controls="workspace-panel" aria-selected="${panel === id}" tabindex="${panel === id ? 0 : -1}" data-workspace-panel="${id}">${label}</button>`).join('')}</div><div id="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-${e(panel)}">${body}</div><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status" aria-live="polite">${e(state.saveNotice)}</p><p>Progress saves privately in this browser. Workspace activity is not formal research participation.</p></section>`;
}
