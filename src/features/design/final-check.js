import { renderGuideHelp } from '../../shared/guide-help.js';
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
    instructions: 'Confirm these points in the focused discussion-board directions.',
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
  const mode=['checks','directions','guide'].includes(state.finalReviewTab) ? state.finalReviewTab : 'checks';
  const directions=renderAssignmentDirections(design.revision).split(/(?=<h4>)/).filter(Boolean);
  const topics=mode==='checks' ? finalCheckItems.map(item=>item.title) : mode==='guide' ? ['Your assignment guide'] : directions.map((html,index)=>html.match(/<h4>(.*?)<\/h4>/)?.[1]?.replace(/<[^>]*>/g,'') || (index===0?'Overview':'Section '+(index+1)));
  if(!topics.length) topics.push('Overview');
  const page=Math.max(0,Math.min(state.finalReviewTopic || 0,topics.length-1));
  const tabs=[['checks','Final checks'],['directions','Directions'],['guide','Your guide']];
  const checks=finalCheckItems.map((original,index)=> {
    const item=state.workspace && original.id==='instructions' ? {...original,label:'Students can tell what to do, what to produce, and how to complete the activity.',help:'Check the task sequence, submission details, and instructions that could conflict.'} : original;
    return '<section class="final-check-card"'+(mode==='checks' && page===index?'':' hidden')+'><h4>'+e(item.title)+'</h4><p>'+e(item.help)+'</p>'+(item.id!=='instructions'?'<blockquote>'+e(references[item.id])+'</blockquote>':'')+'<label><input type="checkbox" data-final-check="'+item.id+'"'+(finalCheck[item.id]?' checked':'')+((item.id==='instructions' && !design.revision.trim()) || (item.id==='learning' && !teacher.learningGoal.trim())?' disabled':'')+'><span>'+e(item.label)+'</span></label>'+(item.id!=='instructions'?'<button type="button" class="final-edit-link" data-action="edit-context">Edit setup</button>':'')+'</section>';
  }).join('');
  return '<div class="review-reader"><nav class="review-tabs reference-tabs" aria-label="Final review">'+tabs.map(([id,label])=>'<button type="button" data-action="final-tab" data-final-tab="'+id+'" aria-pressed="'+(mode===id)+'">'+label+'</button>').join('')+'</nav><div class="review-reference-content reference-content"><aside class="reference-topics"><nav aria-label="Final review topics">'+topics.map((topic,index)=>'<button type="button" data-action="final-topic" data-final-topic="'+index+'"'+(index===page?' aria-current="true"':'')+'>'+topic+'</button>').join('')+'</nav><label class="reference-picker-label" for="final-topic-picker">Topic</label><select id="final-topic-picker" data-final-topic-picker>'+topics.map((topic,index)=>'<option value="'+index+'"'+(index===page?' selected':'')+'>'+topic+'</option>').join('')+'</select></aside><div class="review-reading reference-entry">'+checks+'<section'+(mode==='directions'?'':' hidden')+'>'+(directions[page] || '<p>No directions entered yet.</p>')+'</section><section class="guide-access"'+(mode==='guide'?'':' hidden')+' aria-labelledby="guide-access-title"><h4 id="guide-access-title">Your assignment guide</h4><p>Your directions, design choices, and explanation in one document.</p><div class="guide-access-actions"><button type="button" data-action="preview-guide">Preview guide</button><button type="button" class="primary" data-action="download-guide"'+(finalCheck.approved?'':' disabled')+'>Download guide</button></div>'+renderGuideHelp()+'</section><p class="final-check-status" role="status" aria-live="polite">'+(finalCheck.approved?'Your checked version is saved.':finalCheckItems.filter(item=>finalCheck[item.id]).length+' of 3 checks complete.')+'</p></div></div></div>';
}
