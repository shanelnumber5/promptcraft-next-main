import { parseBabbageFeedback } from '../../shared/babbage-feedback.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderWorkspaceDisclosure } from './disclosure.js';
import { renderBabbageCameo } from '../../shared/babbage-cameo.js';
import { reviewFingerprint, reviewEligible } from './review-ai.js';
import { renderSectionFrame } from './section-frame.js';
import { separateRationaleReferences } from '../../shared/design-evidence.js';
import { renderGuideHelp } from '../../shared/guide-help.js';
import { finalCheckItems, finalCheckReady } from '../design/content.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderReview(state, ai, page, preview) {
  if (page === 'guide') page = 'checks'; // Preserve existing navigation targets and saved approval flow.
  const ready = finalCheckReady(state);
  const review = state.creative.review;
  const pending = ai.pending || review.status === 'pending';
  const current = review.fingerprint === reviewFingerprint(state);
  const hasDraft = reviewEligible(state);
  // Older saved reviews may be a single paragraph. Break at sentence boundaries,
  // preserving the exact wording while keeping feedback readable.
  const reviewMessage = parseBabbageFeedback(review.feedback).message;
  const sentences = [...new Intl.Segmenter('en', {granularity:'sentence'}).segment(reviewMessage)].map(part=>part.segment);
  const feedbackText = reviewMessage.includes('\n') ? reviewMessage : sentences.reduce((text, sentence, index)=>text+(index && index%2===0?'\n\n':'')+sentence,'');
  const feedback = review.feedback ? `${renderBabbageCameo(state, review.feedback)}<div class="workspace-review-feedback">${current ? '' : '<p class="workspace-review-version">Earlier draft</p>'}${renderAssignmentDirections(feedbackText)}</div>` : '';
  const aiReview = `<section class="workspace-ai-review" aria-labelledby="babbage-review-title" aria-busy="${pending}"><h3 id="babbage-review-title">Babbage’s perspective</h3>${renderWorkspaceDisclosure(state)}${pending ? '<p role="status">Babbage is working…</p>' : ''}${feedback}${review.error ? `<p role="alert">${e(review.error)}</p>` : ''}${!hasDraft ? '<p>Add directions in Build to request a review.</p>' : ''}${!pending && !review.feedback && hasDraft && !review.error ? '<p>Your first review will begin automatically.</p>' : ''}${!pending && hasDraft && (review.error || (review.feedback && !current)) ? `<button type="button" class="primary" data-action="check-workspace-revision">${review.error ? 'Retry Babbage review' : 'Check My Revision'}</button>` : ''}${!pending && hasDraft && review.feedback ? '<button type="button" data-action="continue-to-maya">Hear Maya’s perspective</button>' : ''}${!pending && hasDraft && review.error ? '<button type="button" data-action="continue-to-maya">Hear Maya without Babbage’s review</button>' : ''}</section>`;
  let title, content, actions;
  if (page === 'checks') {
    title = 'Final checks & Course Guide';
    const references = { instructions: 'check-activity', learning: 'check-goal', requirements: 'check-requirements' };
    content = `<div class="workspace-final-review"><section class="workspace-check-reference" aria-label="Activity reference"><h3 id="check-activity" tabindex="-1">Your activity</h3>${renderAssignmentDirections(state.design.revision)}<h3 id="check-goal" tabindex="-1">Learning goal</h3><p>${e(state.teacher.learningGoal || 'Add a learning goal in Build.')}</p><h3 id="check-requirements" tabindex="-1">What must stay the same?</h3><p>${e(state.teacher.mustStay || 'No protected requirements recorded. Confirm whether this is intentional.')}</p><h3 id="check-reason" tabindex="-1">Why this design?</h3>${renderAssignmentDirections(separateRationaleReferences(state.design.reason).prose || 'Add your reasoning before saving.')}</section><section class="workspace-check-tools" aria-label="Checks and guide"><div class="workspace-checks">${finalCheckItems.map(item => `<div class="workspace-check-item"><label class="workspace-check"><input type="checkbox" data-final-check="${item.id}"${state.finalCheck[item.id] ? ' checked' : ''}${!state.design.revision.trim() || (item.id === 'learning' && !state.teacher.learningGoal.trim()) ? ' disabled' : ''}><span><strong>${e(item.title)}</strong><span>${e(item.id === 'instructions' ? 'Students can tell what to do, what to produce, and how to complete the activity.' : item.id === 'learning' ? 'The tasks give students practice with the learning goal.' : item.label)}</span></span></label><a href="#${references[item.id]}">Read ${item.id === 'instructions' ? 'activity' : item.id === 'learning' ? 'learning goal' : 'protected requirements'}</a></div>`).join('')}</div><p class="final-check-status" role="status" aria-live="polite">${state.finalCheck.approved ? 'This version is saved and ready to download.' : ready ? 'Ready to save this design.' : 'Include a draft, learning goal, rationale, and all three checks.'}</p><div class="workspace-project-actions"><button type="button" data-action="preview-guide">Preview guide</button><button type="button" data-action="download-guide"${state.finalCheck.approved && ready ? '' : ' disabled'}>Download guide</button><button type="button" data-review-page="reasoning">Edit your reasoning</button></div></section></div>`;
    actions = state.finalCheck.approved && ready ? '<button type="button" class="primary" data-action="finish-workspace">Finish with Pixel</button><button type="button" data-action="edit-draft">Edit activity</button>' : `<button type="button" class="primary" data-action="approve-version"${!ready ? ' disabled' : ''}>Save final design to Course Guide</button><button type="button" data-action="edit-draft">Edit activity</button>`;
  } else if (page === 'help') {
    title = 'Using your downloaded guide';
    content = renderGuideHelp();
    actions = '<button type="button" class="primary" data-review-page="guide">Back to your guide</button>';
  } else {
    title = 'Review your design';
    content = aiReview;
    actions = `<button type="button" data-action="edit-draft">Edit activity</button><button type="button" class="primary" data-review-page="reasoning"${pending ? ' disabled' : ''}>Explain your choice</button>`;
  }
  if (page === 'reasoning') {
    title = 'Why did you choose this design?';
    content = `<div class="workspace-reason" data-design-form><label for="reason">Your design rationale</label><p id="reason-help" class="field-help">Explain what you changed, why it helps, and what student work would show you it worked.</p><textarea id="reason" name="reason" aria-describedby="reason-help" rows="4">${e(separateRationaleReferences(state.design.reason).prose)}</textarea></div>`;
    actions = `<button type="button" data-action="edit-draft">Edit activity</button><button type="button" class="primary" data-review-page="checks"${pending ? ' disabled' : ''}>Check your design</button>`;
  }
  const contentView = `<div class="workspace-design workspace-design--focused review-layout"><section class="workspace-context workspace-page review-card" aria-labelledby="review-title"><header class="design-page-heading"><h2 id="review-title" tabindex="-1">${title}</h2></header><div class="design-page-fields review-content${page==='reasoning'?' review-content--reasoning':page==='checks'?' review-content--final':''}">${content}</div><nav class="workspace-action-bar design-page-nav review-actions" aria-label="Review sections">${actions}<span class="workspace-save-status">Saved in this browser.</span></nav></section></div>`;
  return renderSectionFrame([['rationale','Babbage feedback'],['reasoning','Your reasoning'],['checks','Final checks & guide'],['help','Using your guide']],page,'data-review-page',contentView,'Review sections');
}
