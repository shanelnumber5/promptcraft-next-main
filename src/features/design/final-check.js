import { renderAssignmentDirections } from '../../shared/directions.js';
import { escapeHTML as e } from '../../shared/html.js';
import { finalCheckItems } from './content.js';

function renderDirections(text, emptyMessage) {
  return text
    ? renderAssignmentDirections(text)
    : `<p class="comparison-empty">${e(emptyMessage)}</p>`;
}

export function renderFinalCheck(state) {
  const { teacher, design, finalCheck } = state;
  const references = {
    instructions: 'Confirm these points in your revised directions.',
    learning: teacher.learningGoal || 'No learning goal entered. Use Edit setup to add one.',
    requirements: [
      teacher.mustStay ||
        'No required elements entered. Confirm that there are none, or use Edit setup to list them.',
      teacher.workTime ? 'Student work time: ' + teacher.workTime : '',
      teacher.daysAvailable ? 'Days to finish: ' + teacher.daysAvailable : '',
    ]
      .filter(Boolean)
      .join('\n'),
  };
  return `<div class="final-review-links"><button type="button" data-action="read-final-directions">1. Read revised directions</button></div><div class="final-check-layout"><section class="comparison-card comparison-card--revised"><header><h2>Revised assignment</h2></header><div class="comparison-content">${renderDirections(design.revision, 'No revised directions entered. Use Edit directions to write them.')}</div><button type="button" class="final-return" data-action="return-final-checks">Return to the three checks</button></section><div class="final-check-list">${finalCheckItems.map((original) => state.workspace && original.id === 'instructions' ? { ...original, label: 'Students can tell what to do, what to produce, and how to complete the activity.', help: 'Check the task sequence, submission details, and instructions that could conflict.' } : original).map((item) => `<section class="final-check-card"><h2>${e(item.title)}</h2><p>${e(item.help)}</p>${item.id !== 'instructions' ? `<p class="final-check-reference">${e(references[item.id])}</p>` : ''}<label><input type="checkbox" data-final-check="${item.id}"${finalCheck[item.id] ? ' checked' : ''}${(item.id === 'instructions' && !design.revision.trim()) || (item.id === 'learning' && !teacher.learningGoal.trim()) ? ' disabled' : ''}><span>${e(item.label)}</span></label></section>`).join('')}<button type="button" data-action="edit-context">Edit setup</button></div></div><section class="guide-access" aria-labelledby="guide-access-title"><div class="guide-access-copy"><span class="guide-access-label">Keep your work</span><h2 id="guide-access-title">Your assignment guide</h2><p>${state.workspace ? 'Your starting point, chosen design, rationale, and expected evidence of learning.' : 'Your revised directions, the reason for your change, and the lemonade example.'}</p><p class="final-check-status" role="status" aria-live="polite">${finalCheck.approved ? '' : 'Complete the three checks to save this version and download your guide.'}</p></div><div class="guide-access-actions"><button type="button" data-action="preview-guide">Preview guide</button><button type="button" class="primary" data-action="download-guide"${finalCheck.approved ? '' : ' disabled'}>Download guide</button></div></section>`;
}
