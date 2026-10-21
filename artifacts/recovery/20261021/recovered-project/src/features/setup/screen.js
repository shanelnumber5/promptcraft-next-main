import { renderField } from '../../shared/form-fields.js';
// Reusable guided-form components. Scenario wording and examples stay in the feature module.
import { escapeHTML as e } from '../../shared/html.js';
import { renderAssignmentDirections } from '../../shared/directions.js';

function renderTeacherField(field, values) {
  const labels = { subject: 'Course or subject', learnerLevel: 'Learners' };
  return renderField({ ...field, label: labels[field.id] || field.label }, values);
}

function navigation(step, total, summary = false) {
  return `<nav class="setup-actions" aria-label="Teacher setup navigation"><button type="button" class="nav-button nav-button--back" data-action="setup-back"><span>Back</span></button><span>${summary ? 'Review and edit your information' : `Step ${step + 1} of ${total}`}</span><button type="button" class="primary nav-button nav-button--next" data-action="${summary ? 'start-design' : 'setup-next'}"><span>${summary ? 'Design with Babbage' : step === total - 1 ? 'Review summary' : 'Continue'}</span></button></nav>`;
}

function livePreview(directions) {
  return `<aside class="setup-live-preview" aria-labelledby="setup-preview-title"><h2 id="setup-preview-title">Discussion-board design</h2><p>Original assignment for context · The forum will be one focused component, not an all-in-one replacement.</p><div class="setup-preview-content" data-setup-live-preview tabindex="0" role="region" aria-label="Formatted original assignment directions for context">${directions.trim() ? renderAssignmentDirections(directions) : '<p class="setup-preview-empty">Add the larger assignment directions for context. Your focused discussion-board component will be designed next.</p>'}</div></aside>`;
}

export function renderTeacherStep(setup, step, values, saveNotice = '') {
  const item = setup.steps[step];
  return `<section class="setup-shell setup-shell--teacher setup-step setup-step--${e(item.id)}" aria-labelledby="setup-title"><header class="setup-header"><span>${e(setup.title)}</span><strong>${e(item.label)}</strong></header><form class="setup-form" data-setup-form><div class="setup-columns"><div class="setup-main"><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(item.title)}</h1><p>${e(item.intro)}</p></div>${item.example ? `<div class="setup-example"><span>Exploring without an assignment?</span><button type="button" data-action="use-example">Use an example assignment</button></div>` : ''}<div class="setup-fields">${item.fields.map((field) => renderTeacherField(field, values)).join('')}</div></div>${livePreview(values.directions)}${navigation(step, setup.steps.length)}</div></form><p class="save-notice" role="status">${e(saveNotice)}</p></section>`;
}

export function renderTeacherSummary(setup, values, saveNotice = '', activeSection = 0) {
  const step = setup.steps[activeSection] || setup.steps[0];
  return `<section class="setup-shell setup-shell--teacher summary-shell summary-section--${e(step.id)}" aria-labelledby="setup-title"><header class="setup-header"><span>${e(setup.title)}</span><strong>Summary</strong></header><form class="setup-form" data-setup-form><div class="setup-columns"><div class="setup-main"><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(setup.summaryTitle)}</h1><p>Review the larger assignment context for one focused discussion-board component.</p></div><div class="summary-tabs" role="tablist" aria-label="Summary sections">${setup.steps.map((item, index) => `<button type="button" role="tab" id="summary-tab-${index}" aria-controls="summary-panel" aria-selected="${index === activeSection}" tabindex="${index === activeSection ? 0 : -1}" data-summary-section="${index}">${e(item.tabLabel || item.title)}</button>`).join('')}</div><div class="summary-sections"><section id="summary-panel" role="tabpanel" aria-labelledby="summary-tab-${activeSection}"><h2 id="summary-section-title">${e(step.title)}</h2>${step.fields.map((field) => renderTeacherField(field, values)).join('')}</section></div></div>${livePreview(values.directions)}${navigation(0, setup.steps.length, true)}</div></form><p class="save-notice" role="status">${e(saveNotice)}</p></section>`;
}

export function applyExample(example, values) {
  return {
    ...values,
    directions: example.directions,
    learningGoal: example.learning,
    learningGoalUnsure: false,
  };
}
