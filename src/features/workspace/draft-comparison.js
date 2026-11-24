import { renderStudioPage } from './page-frame.js';
import { renderReadingPages } from '../../shared/reading-pages.js';
import { renderAssignmentDirections } from '../../shared/directions.js';

const draftText = (text) => renderAssignmentDirections(text).replace(/<(\/?)[hH][1-6]\b/g, '<$1h4');

export function renderDraftComparison(state, suggestion) {
  const current = state.design.revision.trim() || state.teacher.directions;
  return `<div class="workspace-design partner-layout partner-layout--comparison">${renderStudioPage(
    {
      title: 'Compare your activity drafts',
      titleId: 'ai-title',
      className: 'workspace-context partner-card draft-comparison-page',
      content: `<div class="draft-comparison" data-local-tabs data-selected="babbage"><div class="local-tabs comparison-tabs" role="tablist" aria-label="Draft to read"><button type="button" role="tab" id="current-draft-tab" data-local-tab="current" aria-selected="false" aria-controls="current-draft-panel" tabindex="-1">Your current draft</button><button type="button" role="tab" id="babbage-draft-tab" data-local-tab="babbage" aria-selected="true" aria-controls="babbage-draft-panel">Babbage’s draft</button></div><section id="current-draft-panel" role="tabpanel" aria-labelledby="current-draft-tab" data-local-panel="current" hidden><h3>Your current draft</h3>${renderReadingPages(current || 'No current directions yet.', { label: 'Your current draft', render: draftText })}</section><section id="babbage-draft-panel" role="tabpanel" aria-labelledby="babbage-draft-tab" data-local-panel="babbage"><h3>Babbage’s draft</h3>${renderReadingPages(suggestion.revision, { label: 'Babbage draft', render: draftText })}</section></div><div class="studio-content-actions comparison-actions"><button type="button" class="primary" data-action="apply-ai">Use this draft</button><button type="button" class="text-action" data-action="dismiss-ai">Keep mine</button></div>`,
      bodyClass: 'partner-content comparison-content',
      step: 'Explore · Stage 1 of 3',
      saveStatus: false,
    },
  )}</div>`;
}
