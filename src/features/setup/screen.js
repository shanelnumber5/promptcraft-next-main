import { renderField } from '../../shared/form-fields.js';
// Reusable guided-form components. Scenario wording and examples stay in the feature module.
import { escapeHTML as e } from '../../shared/html.js';

function navigation(step, total, summary = false) {
  return `<nav class="setup-actions" aria-label="Teacher setup navigation"><button type="button" class="nav-button nav-button--back" data-action="setup-back"><span aria-hidden="true">←</span><span>Back</span></button><span>${summary ? 'Review and edit your information' : `Step ${step + 1} of ${total}`}</span><button type="button" class="primary nav-button nav-button--next" data-action="${summary ? 'start-design' : 'setup-next'}"><span>${summary ? 'Design with Babbage' : step === total - 1 ? 'Review summary' : 'Continue'}</span><span aria-hidden="true">→</span></button></nav>`;
}

export function renderTeacherStep(setup, step, values, saveNotice = '') {
  const item = setup.steps[step];
  return `<section class="setup-shell setup-step setup-step--${e(item.id)}" aria-labelledby="setup-title"><header class="setup-header"><span>${e(setup.title)}</span><strong>${e(item.label)}</strong></header><form class="setup-form" data-setup-form><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(item.title)}</h1><p>${e(item.intro)}</p></div>${item.example ? `<div class="setup-example"><span>Exploring without an assignment?</span><button type="button" data-action="use-example">Use an example assignment</button></div>` : ''}<div class="setup-fields">${item.fields.map((field) => renderField(field, values)).join('')}</div>${navigation(step, setup.steps.length)}</form><p class="save-notice" role="status">${e(saveNotice)}</p></section>`;
}

export function renderTeacherSummary(setup, values, saveNotice = '', activeSection = 0) {
  const step = setup.steps[activeSection] || setup.steps[0];
  return `<section class="setup-shell summary-shell summary-section--${e(step.id)}" aria-labelledby="setup-title"><header class="setup-header"><span>${e(setup.title)}</span><strong>Summary</strong></header><form class="setup-form" data-setup-form><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(setup.summaryTitle)}</h1><p>Edit anything that does not look right. Your pasted directions stay exactly as entered.</p></div><div class="summary-tabs" role="tablist" aria-label="Summary sections">${setup.steps.map((item, index) => `<button type="button" role="tab" id="summary-tab-${index}" aria-controls="summary-panel" aria-selected="${index === activeSection}" tabindex="${index === activeSection ? 0 : -1}" data-summary-section="${index}">${e(item.title)}</button>`).join('')}</div><div class="summary-sections"><section id="summary-panel" role="tabpanel" aria-labelledby="summary-tab-${activeSection}"><h2 id="summary-section-title">${e(step.title)}</h2>${step.fields.map((field) => renderField(field, values)).join('')}</section></div>${navigation(0, setup.steps.length, true)}</form><p class="save-notice" role="status">${e(saveNotice)}</p></section>`;
}

export function applyExample(example, values) {
  return {
    ...values,
    directions: example.directions,
    learningGoal: example.learning,
    learningGoalUnsure: false,
  };
}
