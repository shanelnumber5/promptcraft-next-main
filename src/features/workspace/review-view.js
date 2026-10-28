import { renderBabbageCameo } from '../../shared/babbage-cameo.js';
import { reviewFingerprint, reviewEligible } from './review-ai.js';
import { renderSectionFrame } from './section-frame.js';
import { separateRationaleReferences } from '../../shared/design-evidence.js';
import { renderGuideHelp } from '../../shared/guide-help.js';
import { finalCheckItems, finalCheckReady } from '../design/content.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderReview(state, ai, page, preview) {
  const ready = finalCheckReady(state);
  const review = state.creative.review;
  const current = review.fingerprint === reviewFingerprint(state);
  const hasDraft = reviewEligible(state);
  const feedback = review.feedback ? `${renderBabbageCameo(state, review.feedback)}<div class="workspace-review-feedback"><h3>Babbage's perspective${current ? '' : ' · Earlier draft'}</h3><p>${e(review.feedback)}</p></div>` : '';
  const aiReview = `<section class="workspace-ai-review" aria-labelledby="babbage-review-title"><h3 id="babbage-review-title">Babbage's review</h3><p class="field-help">Opening Review with a new draft sends its content to the connected AI service and OpenAI. Your work remains yours.</p>${ai.pending ? '<p role="status">Babbage is reviewing your design…</p>' : ''}${feedback}${review.error ? `<p role="alert">${e(review.error)}</p>` : ''}${!hasDraft ? '<p>Add directions in Build to request a review.</p>' : ''}${!ai.pending && !review.feedback && hasDraft && !review.error ? '<p>Your first review will begin automatically.</p>' : ''}${!ai.pending && hasDraft && (review.error || (review.feedback && !current)) ? `<button type="button" class="primary" data-action="check-workspace-revision">${review.error ? 'Retry Babbage review' : 'Check My Revision'}</button>` : ''}${!ai.pending && hasDraft && review.feedback ? '<button type="button" data-action="continue-to-maya">Continue to Maya’s perspective</button>' : ''}${!ai.pending && hasDraft && review.error ? '<button type="button" data-action="continue-to-maya">Continue without Babbage</button>' : ''}</section>`;
  let title, content, actions;
  if (page === 'checks') {
    title = 'Check your design';
    const references = { learning: state.teacher.learningGoal || 'Add a learning goal in Design.', requirements: state.teacher.mustStay || 'Confirm whether any elements must stay the same.' };
    content = `<div class="workspace-checks">${finalCheckItems.map(item => `<label class="workspace-check"><input type="checkbox" data-final-check="${item.id}"${state.finalCheck[item.id] ? ' checked' : ''}${!state.design.revision.trim() || (item.id === 'learning' && !state.teacher.learningGoal.trim()) ? ' disabled' : ''}><span><strong>${e(item.title)}</strong><span>${e(item.id === 'instructions' ? 'Students can tell what to do, what to produce, and how to complete the activity.' : item.label)}</span>${references[item.id] ? `<small>${e(references[item.id].slice(0,180))}</small>` : ''}</span></label>`).join('')}</div><p class="final-check-status" role="status" aria-live="polite">${ready ? 'Ready to save this design.' : 'Include a draft, learning goal, rationale, and all three checks.'}</p>`;
    actions = `<button type="button" class="primary" data-action="approve-version"${!ready || state.finalCheck.approved ? ' disabled' : ''}>${state.finalCheck.approved ? 'Saved to your Course Guide' : 'Save final design to Course Guide'}</button>${state.finalCheck.approved ? '<button type="button" data-review-page="guide">Open Course Guide</button>' : ''}`;
  } else if (page === 'help') {
    title = 'Using your downloaded guide';
    content = renderGuideHelp();
    actions = '<button type="button" class="primary" data-review-page="guide">Back to your guide</button>';
  } else if (page === 'guide') {
    title = 'Your Course Guide';
    content = `<p class="final-check-status" role="status" aria-live="polite">${state.finalCheck.approved ? 'This version is saved to your Course Guide.' : 'Review and save your design before downloading.'}</p><div class="course-guide-actions"><button type="button" data-action="preview-guide">Preview guide</button><button type="button" class="primary" data-action="download-guide"${state.finalCheck.approved && ready ? '' : ' disabled'}>Download guide</button></div>`;
    actions = state.finalCheck.approved && ready
      ? '<button type="button" class="primary" data-action="finish-workspace">Finish with Pixel</button><button type="button" data-workspace-panel="revision">Keep editing</button>'
      : '<button type="button" data-review-page="checks">Complete final checks</button><button type="button" data-workspace-panel="revision">Keep editing</button>';
  } else {
    title = 'Your design reasoning';
    content = aiReview + `<div class="workspace-reason" data-design-form><label for="reason">Why did you choose this design?</label><p id="reason-help" class="field-help">Explain what you changed, why it helps, and what student work would show you it worked.</p><textarea id="reason" name="reason" aria-describedby="reason-help" rows="4">${e(separateRationaleReferences(state.design.reason).prose)}</textarea></div>`;
    actions = `<button type="button" data-action="edit-context">Edit discussion</button><button type="button" class="primary" data-review-page="checks"${ai.pending ? ' disabled' : ''}>Check your design</button>`;
  }
  const contentView = `<div class="workspace-design workspace-design--focused review-layout"><section class="workspace-context workspace-page review-card" aria-labelledby="review-title"><header class="design-page-heading"><h2 id="review-title" tabindex="-1">${title}</h2></header><div class="design-page-fields review-content">${content}</div><nav class="design-page-nav review-actions" aria-label="Review sections">${actions}<span class="workspace-save-status">Saved in this browser.</span></nav></section></div>`;
  return renderSectionFrame([['rationale','Your reasoning'],['checks','Final checks'],['guide','Your guide'],['help','Using your guide']],page,'data-review-page',contentView,'Review sections');
}
