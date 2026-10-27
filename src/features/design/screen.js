import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderFinalCheck } from './final-check.js';
import { renderGuidedDesign } from './guided-screen.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderDesignRationale } from '../../shared/design-evidence.js';
import { designSteps, exchangeOptions, finalCheckReady } from './content.js';

export function renderDesign(
  state,
  ai = { configured: false, pending: false, suggestion: null, error: '' },
) {
  if (state.designStep < 3) return renderGuidedDesign(state, ai);
  const step = state.designStep,
    item = designSteps[step],
    design = state.design;
  const exchange = exchangeOptions.find(([id]) => id === design.exchange)?.[1] || 'Not chosen yet';
  const review = step === 3;
  const final = step === 4;
  const body = final
    ? renderFinalCheck(state)
    : review
      ? renderReview(state,exchange)
      : '';
  return `<section class="setup-shell design-shell${review || final ? ' design-shell--review' : ''}${final ? ' design-shell--final-reference' : ''}" aria-labelledby="setup-title"><header class="setup-header"><span>Design with Babbage</span><strong>Step ${step + 1} of ${designSteps.length}</strong></header><form class="setup-form" data-design-form><div class="setup-intro"><h1 id="setup-title" tabindex="-1">${e(final ? 'Check your discussion-board component' : review ? 'Review your design' : item.title)}</h1><p>${e(final ? 'Review each point, then save your checked version and open the guide.' : review ? 'Read your directions, compare the original, and check your reasoning.' : item.intro)}</p></div><div class="design-body">${body}</div><nav class="setup-actions" aria-label="Design navigation"><button type="button" class="nav-button nav-button--back" data-action="design-back"><span>Back</span></button><span>${final ? '<button type="button" class="final-edit-link" data-action="edit-draft">Edit directions</button>' : 'Focused forum draft saved in this browser'}</span>${final ? `<button type="button" class="primary nav-button nav-button--next" data-action="approve-version"${finalCheckReady(state) ? '' : ' disabled'}><span>${state.finalCheck.approved ? 'Finish module' : 'Assignment guide'}</span></button>` : `<button type="button" class="primary nav-button nav-button--next" data-action="design-next"${step === 2 && !design.revision.trim() && !ai.suggestion ? ' disabled' : ''}><span>${review ? 'Final check' : step === 2 ? 'Review draft' : 'Continue'}</span></button>`}</nav></form><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status">${e(state.saveNotice)}</p></section>`;
}

function renderReview(state,exchange) {
  const tabs=[['revised','Revised directions'],['original','Original assignment'],['notes','Design notes']];
  const active=tabs.some(([id])=>id===state.designReviewTab) ? state.designReviewTab : 'revised';
  const documents=active==='notes' ? [
    {label:'Learning goal',html:'<h4>Learning goal</h4><p>'+e(state.teacher.learningGoal || 'Not specified yet.')+'</p>'},
    {label:'The reply action',html:'<h4>What students do in a reply</h4><p>'+e(exchange)+'</p>'},
    {label:'Your reasoning',html:'<h4>Why you made this change</h4>'+renderDesignRationale(state.design.reason || 'Not specified yet.')}
  ] : renderAssignmentDirections(active==='original' ? state.teacher.directions : state.design.revision).split(/(?=<h4>)/).filter(Boolean).map((html,index)=>({label:html.match(/<h4>(.*?)<\/h4>/)?.[1]?.replace(/<[^>]*>/g,'') || (index===0?'Overview':'Section '+(index+1)),html}));
  if(!documents.length) documents.push({label:'Overview',html:'<p>No directions entered yet.</p>'});
  const page=Math.max(0,Math.min(state.designReadPage || 0,documents.length-1));
  return '<div class="review-reader"><nav class="review-tabs reference-tabs" aria-label="Review documents">'+tabs.map(([id,label])=>'<button type="button" data-action="review-tab" data-review-tab="'+id+'" aria-pressed="'+(active===id)+'">'+label+'</button>').join('')+'</nav><div class="review-reference-content reference-content"><aside class="reference-topics"><nav aria-label="Document sections">'+documents.map((doc,index)=>'<button type="button" data-action="review-section" data-review-section="'+index+'"'+(index===page?' aria-current="true"':'')+'>'+doc.label+'</button>').join('')+'</nav><label class="reference-picker-label" for="review-section-picker">Section</label><select id="review-section-picker" data-reading-section aria-label="Draft section">'+documents.map((doc,index)=>'<option value="'+index+'"'+(index===page?' selected':'')+'>'+doc.label+'</option>').join('')+'</select></aside><section class="review-reading reference-entry" aria-label="'+tabs.find(([id])=>id===active)[1]+'">'+documents[page].html+'</section></div></div>';
}
