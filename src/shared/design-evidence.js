import { escapeHTML as e } from './html.js';
import { renderAssignmentDirections } from './directions.js';

// Verified sources for the module's teaching moves; the lemonade story is our illustration.
export const designEvidence = [
  {
    id: 'alignment',
    short: 'Carnegie Mellon Eberly Center',
    citation: 'Carnegie Mellon University, Eberly Center. Why should assessments, learning objectives, and instructional strategies be aligned? (n.d.).',
    url: 'https://www.cmu.edu/teaching/assessment/basics/alignment.html',
    claim: 'Align the activity and assessment with what students should learn.',
    application: 'Ask for a learning goal and preserve requirements when revising directions.',
  },
  {
    id: 'discussion',
    short: 'Darabi et al. (2011)',
    citation: 'Darabi, A., Arrastia, M. C., Nelson, D. W., Cornille, T., & Liang, X. (2011). Cognitive presence in asynchronous online learning: A comparison of four discussion strategies. Journal of Computer Assisted Learning, 27(3), 216–227.',
    url: 'https://doi.org/10.1111/j.1365-2729.2010.00392.x',
    claim: 'Scenario-based discussion strategies produced different patterns of exploration, integration, and resolution.',
    application: 'Give peers a specific decision to examine in the fictional lemonade example.',
  },
  {
    id: 'feedback',
    short: 'Carless & Boud (2018)',
    citation: 'Carless, D., & Boud, D. (2018). The development of student feedback literacy: Enabling uptake of feedback. Assessment & Evaluation in Higher Education, 43(8), 1315–1325.',
    url: 'https://doi.org/10.1080/02602938.2018.1463354',
    claim: 'Their feedback-literacy framework includes making judgments and taking action on feedback.',
    application: 'Ask students to explain how peer input informed a revision or defense.',
  },
];

export function renderDesignEvidence(ids = designEvidence.map((source) => source.id), { expanded = false } = {}) {
  const sources = designEvidence.filter((source) => ids.includes(source.id));
  return `<details class="design-evidence"${expanded ? ' open' : ''}><summary>Why this design? Sources and examples</summary><p>The lemonade story is a fictional illustration. These sources inform the teaching moves; they do not test this module or guarantee outcomes.</p><ul>${sources.map((source) => `<li><p>${e(source.claim)} <a href="${e(source.url)}" target="_blank" rel="noopener noreferrer">${e(source.short)}</a></p><p><strong>How we apply it:</strong> ${e(source.application)}</p>${expanded ? `<p class="evidence-citation">${e(source.citation)}</p>` : ''}</li>`).join('')}</ul></details>`;
}

// Display citations separately; preserve the educator's saved explanation verbatim.
export function separateRationaleReferences(text) {
  const sources=designEvidence.filter(source=>text.includes(source.url));
  let prose=text;
  for(const source of sources) {
    prose=prose.replace(/\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)/g,(match,label,url)=>url===source.url?label:match);
    prose=prose.replace(/\(([^()\n]*)\)/g,(match,inner)=>inner.includes(source.url)?'':match);
    prose=prose.split(source.url).join('');
  }
  if(sources.some(source=>source.id==='feedback')) prose=prose.replace(/\(Carless\s*&\s*Boud,?\s*2018\)/gi,'');
  if(sources.some(source=>source.id==='discussion')) prose=prose.replace(/\(Darabi et al\.,?\s*2011\)/gi,'');
  if(sources.some(source=>source.id==='alignment')) prose=prose.replace(/\(Carnegie Mellon[^()]*,\s*n\.d\.\)/gi,'');
  prose=prose.replace(/[ \t]+([,.;!?])/g,'$1').replace(/:[ \t]*\./g,'.').replace(/[ \t]{2,}/g,' ').trim();
  return { prose, sources };
}

export function renderDesignRationale(text, { showSources = true, paragraphBreaks = false } = {}) {
  let { prose, sources }=separateRationaleReferences(text);
  if(paragraphBreaks) prose=prose.split(/\n\s*\n/).map(paragraph=>{
    // Keep authored lists and existing formatting; only space dense plain prose.
    if(paragraph.length<450 || /\n|^\s*[#*\-]|^\d+[.)]/.test(paragraph)) return paragraph;
    const sentences=[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(paragraph)].map(part=>part.segment.trim());
    return sentences.length>1 ? sentences.join('\n\n') : paragraph;
  }).join('\n\n');
  const references=showSources && sources.length ? '<aside class="rationale-references" aria-label="References for this explanation"><strong>References</strong><ul>'+sources.map(source=>'<li><a href="'+e(source.url)+'" target="_blank" rel="noopener noreferrer">'+e(source.short)+'</a></li>').join('')+'</ul></aside>' : '';
  return '<div class="rationale-prose">'+renderAssignmentDirections(prose)+'</div>'+references;
}

export const evidencePrompt = `Use only these verified sources when explaining the design rationale: ${designEvidence.map((source) => `${source.short}: ${source.claim} ${source.url}`).join('\n')}
These are sources for teaching-design principles, not evidence for the teacher's disciplinary topic. In revision_review.why_these_changes, write a short plain-text reason connecting the change to the learning goal and cite one relevant source by author/year and its supplied URL. Do not put teaching-design references into student-facing directions unless the teacher asks. Do not invent references, statistics, quotations, or course evidence. The lemonade example is a fictional application, not a published study. Do not claim these sources prove that this particular assignment or an AI-supported activity will succeed.`;
