import { renderFinalCheck } from './final-check.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderAiPanel } from './conversation-view.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderField } from '../../shared/form-fields.js';
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
  const step = state.designStep,
    item = designSteps[step],
    teacher = state.teacher,
    design = state.design;
  const exchange = exchangeOptions.find(([id]) => id === design.exchange)?.[1] || 'Not chosen yet';
  const context =
    step === 0
      ? teacher.directions
      : step === 1
        ? design.concern
        : [
            teacher.mustStay,
            teacher.workTime ? 'Student work time: ' + teacher.workTime : '',
            teacher.daysAvailable ? 'Available days: ' + teacher.daysAvailable : '',
          ]
            .filter(Boolean)
            .join('\n');
  const contextLabel =
    step === 0
      ? 'Your current directions'
      : step === 1
        ? 'The concern you named'
        : 'Requirements to keep';
  const review = step === 3;
  const final = step === 4;
  const body = final
    ? renderFinalCheck(state)
    : review
      ? `<div class="design-comparison"><section class="comparison-card comparison-card--original"><header><span class="comparison-label">Before</span><h2>Original assignment</h2></header><div class="comparison-content">${renderDirections(teacher.directions, 'No original directions entered.')}</div></section><section class="comparison-card comparison-card--revised"><header><span class="comparison-label">After</span><h2>Revised assignment</h2></header><div class="comparison-content">${renderDirections(design.revision, 'No revised directions entered yet. Use Back to write a draft.')}</div></section></div><div class="design-review"><p><strong>Learning goal:</strong> ${e(teacher.learningGoal || 'Not specified yet.')}</p><p><strong>What students do in a reply:</strong> ${e(exchange)}</p><p><strong>Why you made this change:</strong> ${e(design.reason || 'Not specified yet.')}</p><p><strong>Check:</strong> Do students know what to post, how to reply, and what to do next? Does the assignment still fit the time available and keep your requirements?</p></div><button type="button" data-action="copy-draft"${design.revision.trim() ? '' : ' disabled'}>Copy revised directions</button>`
      : `<div class="babbage-prompt"><span class="pixel-suggests-frame" aria-hidden="true"><img class="pixel-suggests-portrait" src="assets/characters/pixel/encouraging.png" alt="" width="84" height="92"></span><p><strong class="babbage-says-label">Professor Pixel suggests</strong>${e(item.prompt)}</p></div><div class="design-context"><strong>${e(contextLabel)}</strong><p>${e(context || 'Not specified yet. You can return to your setup to add it.')}</p>${step === 0 ? `<p><strong>Learning goal:</strong> ${e(teacher.learningGoal || 'Not specified yet.')}</p>` : ''}</div>${step === 2 ? renderAiPanel(state, ai) : ''}${step === 2 ? `<button type="button" class="design-starter" data-action="use-starter">${design.revision ? 'Append a starter exchange' : 'Use a starter draft'}</button>` : ''}${step === 2 && design.previousRevision ? `<section class="previous-assignment-draft"><h2>Earlier draft · different original assignment</h2><p>Your original directions changed, so this draft is kept separately. Write or generate a revision for your current assignment below.</p><label for="previous-revision">Saved earlier directions</label><textarea id="previous-revision" readonly rows="4">${e(design.previousRevision)}</textarea></section>` : ''}<div class="design-fields">${item.fields.map((field) => renderField(field, design)).join('')}</div>`;
  return `<section class="setup-shell design-shell" aria-labelledby="setup-title"><header class="setup-header"><span>Design with Babbage</span><strong>Step ${step + 1} of ${designSteps.length}</strong></header><form class="setup-form" data-design-form><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(item.title)}</h1><p>${e(item.intro)}</p></div><div class="design-body">${body}</div><nav class="setup-actions" aria-label="Design navigation"><button type="button" class="nav-button nav-button--back" data-action="design-back"><span aria-hidden="true">←</span><span>Back</span></button><span>${final ? (state.finalCheck.approved ? '' : 'Three checks before you use this assignment') : review ? 'Draft saved in this browser' : 'One change to your assignment'}</span>${final ? `<button type="button" data-action="edit-draft">Edit directions</button><button type="button" class="primary nav-button nav-button--next" data-action="approve-version"${finalCheckReady(state) ? '' : ' disabled'}><span>${state.finalCheck.approved ? 'Finish module' : 'Go to assignment guide'}</span><span aria-hidden="true">→</span></button>` : `<button type="button" class="primary nav-button nav-button--next" data-action="design-next"><span>${review ? 'Final check' : step === 2 ? 'Review draft' : 'Continue'}</span><span aria-hidden="true">→</span></button>`}</nav></form><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status">${e(state.saveNotice)}</p></section>`;
}
