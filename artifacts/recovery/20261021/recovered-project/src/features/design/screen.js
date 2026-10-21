import { renderFinalCheck } from './final-check.js';
import { renderGuidedDesign } from './guided-screen.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderReviewDirections } from '../../shared/review-directions.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderDesignRationale } from '../../shared/design-evidence.js';
import { designSteps, exchangeOptions, finalCheckReady } from './content.js';

function renderDirections(text, emptyMessage) {
  return text
    ? renderAssignmentDirections(text)
    : `<p class="comparison-empty">${e(emptyMessage)}</p>`;
}

export function renderDesign(
  state,
  ai = { configured: false, pending: false, suggestion: null, error: '' },
) {
  if (state.designStep < 3) return renderGuidedDesign(state, ai);
  const step = state.designStep,
    item = designSteps[step],
    teacher = state.teacher,
    design = state.design;
  const exchange = exchangeOptions.find(([id]) => id === design.exchange)?.[1] || 'Not chosen yet';
  const review = step === 3;
  const final = step === 4;
  const body = final
    ? renderFinalCheck(state)
    : review
      ? `<div class="design-comparison"><div class="comparison-original-pane"><section class="comparison-card comparison-card--original"><header><span class="comparison-label">Before</span><h2>Original assignment</h2></header><div class="comparison-content">${renderDirections(teacher.directions, 'No original directions entered.')}</div></section><section class="design-review"><h2>Review design notes</h2><p><strong>Learning goal:</strong> ${e(teacher.learningGoal || 'Not specified yet.')}</p><p><strong>What students do in a reply:</strong> ${e(exchange)}</p><div class="design-rationale"><strong>Why you made this change:</strong>${renderDesignRationale(design.reason || 'Not specified yet.')}</div><p><strong>Check:</strong> Do students know what to post, how to reply, and what to do next? Does this focused forum component support the larger assignment, fit the time available, and keep your requirements?</p></section><button type="button" data-action="copy-draft"${design.revision.trim() ? '' : ' disabled'}>Copy discussion-board directions</button></div><section class="comparison-card comparison-card--revised"><header><span class="comparison-label">Focused forum component</span><h2>Discussion-board directions</h2></header><div class="comparison-content">${design.revision ? renderReviewDirections(design.revision) : renderDirections('', 'No discussion-board directions entered yet. Use Back to write a focused forum component.')}</div></section></div>`
      : '';
  return `<section class="setup-shell design-shell${review ? ' design-shell--review' : ''}" aria-labelledby="setup-title"><header class="setup-header"><span>Design with Babbage</span><strong>Step ${step + 1} of ${designSteps.length}</strong></header><form class="setup-form" data-design-form><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(item.title)}</h1><p>${e(item.intro)}</p></div><div class="design-body">${body}</div><nav class="setup-actions" aria-label="Design navigation"><button type="button" class="nav-button nav-button--back" data-action="design-back"><span>Back</span></button><span>${final ? (state.finalCheck.approved ? '' : 'Three checks for the discussion-board component') : review ? 'Focused forum draft saved in this browser' : 'One focused discussion-board component'}</span>${final ? `<button type="button" data-action="edit-draft">Edit directions</button><button type="button" class="primary nav-button nav-button--next" data-action="approve-version"${finalCheckReady(state) ? '' : ' disabled'}><span>${state.finalCheck.approved ? 'Finish module' : 'Assignment guide'}</span></button>` : `<button type="button" class="primary nav-button nav-button--next" data-action="design-next"${step === 2 && !design.revision.trim() && !ai.suggestion ? ' disabled' : ''}><span>${review ? 'Final check' : step === 2 ? 'Review draft' : 'Continue'}</span></button>`}</nav></form><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status">${e(state.saveNotice)}</p></section>`;
}
