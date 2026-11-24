import { finalCheckItems } from '../design/content.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderFinalChecks(state, ready) {
  const route = state.experience === 'scenario' ? 'scenario' : 'workspace';
  const destinations = {
    instructions: ['draft', 'design-page-title'],
    learning: ['subject', 'learningGoal'],
    requirements: ['ai-use', 'mustStay'],
  };
  const checks = finalCheckItems
    .map((item, index) => {
      const [page, field] = destinations[item.id];
      const description =
        item.id === 'instructions'
          ? 'Students can tell what to do and submit.'
          : item.id === 'learning'
            ? 'Students practice the learning goal.'
            : 'Required elements are kept or confirmed unnecessary.';
      return `<div class="final-check-page" data-reading-page="${index}" tabindex="-1"${index ? ' hidden' : ''}><div class="workspace-check-item"><label class="workspace-check"><input type="checkbox" data-final-check="${item.id}"${state.finalCheck[item.id] ? ' checked' : ''}${!state.design.revision.trim() || (item.id === 'learning' && !state.teacher.learningGoal.trim()) ? ' disabled' : ''}><span><strong>${e(item.title)}</strong><span>${description}</span></span></label><a class="text-action" href="?view=${route}&amp;build=${page}" data-design-page="${page}" data-focus-field="${field}" aria-label="Review ${e(item.title.toLowerCase())}">Review this</a></div></div>`;
    })
    .join('');
  return `<div class="workspace-final-review" data-local-tabs data-selected="checks"><div class="local-tabs final-tools-tabs" role="tablist" aria-label="Final review tools"><button type="button" role="tab" id="final-checks-tab" data-local-tab="checks" aria-controls="final-checks-panel" aria-selected="true">Checks</button><button type="button" role="tab" id="final-edit-tab" data-local-tab="edit" aria-controls="final-edit-panel" aria-selected="false" tabindex="-1">Review &amp; edit</button><button type="button" role="tab" id="final-download-tab" data-local-tab="download" aria-controls="final-download-panel" aria-selected="false" tabindex="-1">Downloads</button></div><section class="final-tool-group" id="final-edit-panel" role="tabpanel" aria-labelledby="final-edit-tab" data-local-panel="edit" hidden><h3>Review and edit</h3><div class="final-tool-links"><button type="button" data-workspace-view="preview">Review activity directions</button><button type="button" data-design-page="presence">Edit instructor interaction</button>${state.creative.rubric?.rows.length ? '<button type="button" data-review-page="rubric">Review visual rubric</button>' : ''}</div></section><section class="final-tool-group" id="final-download-panel" role="tabpanel" aria-labelledby="final-download-tab" data-local-panel="download" hidden><h3>Preview and download</h3><div class="final-tool-links"><button type="button" data-action="preview-guide">Preview Course Guide</button><button type="button" data-action="download-guide">Download Course Guide</button>${state.creative.rubric?.rows.length ? '<button type="button" data-action="download-rubric-csv">Download Canvas rubric (.csv)</button>' : ''}</div></section><section class="workspace-check-tools" id="final-checks-panel" role="tabpanel" aria-labelledby="final-checks-tab" data-local-panel="checks"><p>Confirm these three points before saving your design.</p><div class="workspace-checks" data-reading-pages aria-label="Final checks">${checks}<nav class="reading-page-nav final-check-pager" aria-label="Final check pages"><button type="button" data-reading-move="-1" disabled>Previous check</button><span data-reading-count aria-live="polite">1 of 3</span><button type="button" data-reading-move="1">Next check</button></nav></div><p class="final-check-status" role="status">${state.finalCheck.approved ? 'This version is saved and ready to download.' : ready ? 'Ready to save this design.' : 'Complete the three checks, learning goal and reasoning.'}</p></section></div>`;
}
