import { renderStudioPage } from './page-frame.js';
import { renderRubric, renderAssessmentSetup } from './rubric.js';
import { renderLoading } from '../design/loading.js';
import { renderFeedbackClarifications } from './feedback-questions.js';
import { renderBabbagePresence, renderBabbageMessage } from '../../shared/babbage-feedback.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderWorkspaceDisclosure } from './disclosure.js';
import { renderBabbageCameo } from '../../shared/babbage-cameo.js';
import { reviewFingerprint, reviewEligible } from './review-ai.js';
import { renderSectionFrame } from './section-frame.js';
import { separateRationaleReferences } from '../../shared/design-evidence.js';
import { renderGuideHelp } from '../../shared/guide-help.js';
import { finalCheckReady } from '../design/content.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderFinalChecks } from './final-checks.js';

export function renderReview(state, ai, page, preview, ui = {}) {
  if (page === 'guide') page = 'checks'; // Preserve existing navigation targets and saved approval flow.
  const ready = finalCheckReady(state);
  const review = state.creative.review;
  const pending = ai.pending || review.status === 'pending';
  const current = review.fingerprint === reviewFingerprint(state);
  const hasDraft = reviewEligible(state);
  const feedback = review.feedback
    ? `${renderBabbageCameo(state, review.feedback)}<div class="workspace-review-feedback">${current ? '' : '<p class="workspace-review-version">Earlier draft</p>'}${renderBabbageMessage(review.feedback)}</div>`
    : '';
  let supportsTeachingNotes = false;
  try {
    supportsTeachingNotes = Boolean(JSON.parse(review.feedback)?.teaching_notes);
  } catch {
    /* Legacy prose review. */
  }
  const aiReview = `<section class="workspace-ai-review" aria-labelledby="review-title" aria-busy="${pending}">${renderWorkspaceDisclosure(state)}${pending ? renderLoading({ pending: true, stage: 'working', intent: 'review' }, state.babbage.mode === 'dev') : ''}${feedback}${review.error ? `<p role="alert">${e(review.error)}</p>` : ''}${!hasDraft ? '<p>Add directions in Build to request a review.</p>' : ''}${!pending && !review.feedback && hasDraft && !review.error ? (review.manualOnly ? '<p>Another reading is optional. Your requested edit is ready to review in Build and the guide.</p>' : '<p>Your first review will begin automatically.</p>') : ''}<div class="workspace-project-actions">${!pending && hasDraft && (review.error || (review.feedback && !current) || (review.manualOnly && !review.feedback)) ? `<button type="button" class="primary" data-action="check-workspace-revision">${review.error ? 'Retry Babbage review' : 'Check My Revision'}</button>` : ''}${!pending && hasDraft && review.feedback && current && !supportsTeachingNotes ? '<button type="button" data-action="check-workspace-revision">Refresh Babbage feedback</button>' : ''}${!pending && hasDraft && review.feedback ? `<button type="button" data-action="continue-to-maya">Hear Maya and Pixel’s perspectives</button>` : ''}${!pending && hasDraft && review.error ? '<button type="button" data-action="continue-to-maya">Hear Maya without Babbage’s review</button>' : ''}</div></section>`;
  let title,
    content,
    actions = '',
    back,
    next;
  const sections = [
    ['rationale', 'Feedback'],
    ['reasoning', 'Your reasoning'],
    ['rubric', 'Rubric (optional)'],
    ['checks', 'Final checks & guide'],
  ];
  if (page === 'rubric') {
    title = 'Assessment rubric';
    content =
      ui.rubricPart === 'criteria'
        ? renderAssessmentSetup(state) +
          '<button type="button" data-action="view-rubric">Back to rubric</button>'
        : renderRubric(state, pending, { page: ui.rubricCriterion || 0 });
    actions = `<button type="button" class="primary" data-action="rubric-continue"${!state.creative.rubric?.rows.length || pending ? ' disabled' : ''}>Continue to review</button>`;
  } else if (page === 'checks') {
    title = 'Final checks & Course Guide';
    content = renderFinalChecks(state, ready);
    actions =
      state.finalCheck.approved && ready
        ? '<button type="button" class="primary" data-action="finish-workspace">Finish with Pixel</button><button type="button" data-action="download-guide">Download guide</button><button type="button" data-action="preview-guide">Preview guide</button>'
        : `<button type="button" class="primary" data-action="approve-version"${!ready ? ' disabled' : ''}>Save final design</button><button type="button" data-action="preview-guide">Preview guide</button><button type="button" data-action="download-guide"${!state.design.revision.trim() ? ' disabled' : ''}>Download draft guide</button>`;
  } else if (page === 'clarify') {
    title = 'Saved conversation answers';
    content = renderFeedbackClarifications(state, pending);
    actions = `<button type="button" class="primary" data-action="revise-from-feedback"${pending || !hasDraft ? ' disabled' : ''}>Revise with my answers</button><button type="button" data-action="edit-draft">Edit activity</button>`;
  } else if (page === 'help') {
    title = 'Using your downloaded guide';
    content = `<div class="guide-download-actions"><button type="button" class="primary" data-action="download-guide"${!hasDraft ? ' disabled' : ''}>${state.finalCheck.approved ? 'Download guide' : 'Download draft guide'}</button><button type="button" data-action="preview-guide">Preview guide</button></div>${state.creative.rubric?.rows.length ? '<div class="guide-download-actions"><button type="button" data-action="download-rubric-csv">Download Canvas rubric CSV</button><button type="button" data-action="download-rubric-html">Download visual rubric</button></div>' : ''}${renderGuideHelp()}`;
    actions =
      '<button type="button" class="primary" data-review-page="guide">Back to your guide</button>';
  } else {
    title = 'Babbage’s perspective';
    content = aiReview;
    actions = `<button type="button" data-action="edit-draft">Edit activity</button><button type="button" class="primary" data-review-page="reasoning"${pending ? ' disabled' : ''}>Explain your choice</button>`;
  }
  if (page === 'reasoning') {
    title = 'Why did you choose this design?';
    content = `<div class="workspace-reason" data-design-form><label for="reason">Your design rationale</label><p id="reason-help" class="field-help">Explain what you changed, why it helps, and what student work would show you it worked.</p><textarea id="reason" name="reason" aria-describedby="reason-help" rows="4">${e(separateRationaleReferences(state.design.reason).prose)}</textarea></div>`;
    actions = `<button type="button" data-action="edit-draft">Edit activity</button><button type="button" class="primary" data-review-page="checks"${pending ? ' disabled' : ''}>Check your design</button>`;
  }
  if (page === 'rationale') {
    back = '<button type="button" data-design-page="draft">Back</button>';
    next = `<button type="button" class="primary" data-review-page="reasoning"${pending ? ' disabled' : ''}>Continue</button>`;
    actions = '';
  } else if (page === 'reasoning') {
    back = '<button type="button" data-review-page="rationale">Back</button>';
    next = `<button type="button" class="primary" data-review-page="${state.creative.rubric.requested || state.creative.rubric.rows.length ? 'rubric' : 'checks'}"${pending ? ' disabled' : ''}>Continue</button>`;
    actions = '';
  } else if (page === 'rubric') {
    back = '<button type="button" data-review-page="reasoning">Back</button>';
    next = '<button type="button" class="primary" data-review-page="checks">Continue</button>';
    actions = '';
  } else if (page === 'checks') {
    back = `<button type="button" data-review-page="${state.creative.rubric.requested || state.creative.rubric.rows.length ? 'rubric' : 'reasoning'}">Back</button>`;
    next =
      state.finalCheck.approved && ready
        ? '<button type="button" class="primary" data-action="finish-workspace">Continue with Pixel</button>'
        : `<button type="button" class="primary" data-action="approve-version"${!ready ? ' disabled' : ''}>Save final design</button>`;
    actions = ''; // Guide actions stay in the visible download group.
  } else {
    back = '<button type="button" data-review-page="checks">Back</button>';
  }
  const index = sections.findIndex(([id]) => id === page);
  const contentView = `<div class="workspace-design workspace-design--focused review-layout">${renderStudioPage(
    {
      title,
      titleId: 'review-title',
      content,
      actions,
      back,
      next,
      step: index >= 0 ? `Review · Step ${index + 1} of ${sections.length}` : 'Review',
      className: 'workspace-context review-card',
      headingClass: page === 'rationale' ? 'partner-heading' : '',
      headingExtra: page === 'rationale' ? renderBabbagePresence() : '',
      bodyClass: `review-content${page === 'reasoning' ? ' review-content--reasoning' : page === 'checks' ? ' review-content--final' : ''}`,
      actionClass: 'design-page-nav review-actions',
      actionLabel: 'Review actions',
      saveStatus: false,
    },
  )}</div>`;
  return renderSectionFrame(sections, page, 'data-review-page', contentView, 'Review sections');
}
