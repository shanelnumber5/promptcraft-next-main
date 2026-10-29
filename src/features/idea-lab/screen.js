import { ideas, ideaTags, filterIdeas, findIdea } from './ideas.js';
import { escapeHTML as e } from '../../shared/html.js';

// Cards and details share the same plain-language activity description.
const whenToTry = {
  "decision-clinic": "Students give opinions without explaining their choices.",
  "failure-file": "Students suggest fixes before they understand the problem.",
  "two-audiences": "Students struggle to explain familiar content to someone new.",
  "evidence-detectives": "Students accept claims without checking the evidence.",
  "shift-change": "Students need practice making decisions with competing needs.",
  "artifact-story": "Students describe what they see but do not explain what it means.",
  "ai-cross-exam": "Students need practice checking AI-generated information.",
  "constraint-remix": "Students can follow a method but struggle when conditions change.",
  "museum-of-misconceptions": "Students keep making the same mistake or repeating a misunderstanding.",
  "community-brief": "Students need practice giving useful advice to a specific audience.",
  "question-upgrade": "Discussion questions lead to short, predictable answers.",
  "human-ai-editors": "Students accept edits without deciding whether they help."
};
export const categoryColors = {
  'Critical thinking':'#D9EDFA',
  'Communication':'#FFF0CC',
  'Workplace':'#E8E1F5',
  'Research':'#DCEFE2',
  'Responsible AI':'#F7DFE8',
  'Peer feedback':'#DFE8EC',
};
const categoryFor = item => item.tags.find(tag=>tag!=='Discussion') || 'Discussion';
const categoryStyle = item => `--lab-category-color:${categoryColors[categoryFor(item)] || '#F2F2F2'}`;
const PAGE_SIZE = 6;
const browseURL = (query, tag, page=0, id='') => '?'+new URLSearchParams({view:'lab',...(id?{idea:id}:{}),...(query?{q:query}:{}),...(tag?{category:tag}:{}),...(page?{page:String(page)}:{})}).toString();
export function renderIdeaCards(query = '', tag = '', page = 0) {
  const matches = filterIdeas(query, tag);
  const pages = Math.max(1,Math.ceil(matches.length/PAGE_SIZE));
  const current = Math.max(0,Math.min(Number.isFinite(Number(page))?Math.floor(Number(page)):0,pages-1));
  const html = matches.slice(current*PAGE_SIZE,(current+1)*PAGE_SIZE).map(item => `<article class="lab-card" style="${categoryStyle(item)}"><div><span class="lab-category">${e(categoryFor(item))}</span><h2>${e(item.title)}</h2><p>${e(item.summary)}</p><p class="lab-use"><strong>Try it when:</strong> ${e(whenToTry[item.id]||item.purpose)}</p></div><a class="lab-button" href="${e(browseURL(query,tag,current,item.id))}" aria-label="Explore ${e(item.title)}">Explore idea</a></article>`).join('') || '<div class="lab-empty"><h2>No matching ideas</h2><p>Try fewer search words or choose All categories.</p><button type="button" data-lab-clear>Clear filters</button></div>';
  return {count:matches.length,page:current,pages,html};
}
export function renderLabPagination(results) {
  return `<button type="button" data-lab-page="${results.page-1}"${results.page===0?' disabled':''}>Previous ideas</button><span>Page ${results.page+1} of ${results.pages}</span><button type="button" data-lab-page="${results.page+1}"${results.page+1>=results.pages?' disabled':''}>More ideas</button>`;
}
export function renderGallery(query = '', tag = '', page=0) {
  const results = renderIdeaCards(query, tag, page);
  return `<section class="lab-browser" aria-labelledby="entry-title"><header class="lab-heading"><div><h1 id="entry-title" tabindex="-1">Babbage’s Idea Lab</h1><p>Find a spark. Change what students do with one another’s ideas.</p></div><a class="lab-button" href="?view=workspace">Creative Workspace</a></header><div class="lab-filters"><div><label for="idea-search">Find an idea</label><input type="search" id="idea-search" value="${e(query)}" placeholder="Try evidence, workplace, or revision"></div><div><label for="idea-category">Learning focus</label><select id="idea-category"><option value="">All categories</option>${ideaTags.filter(tag=>tag!=='Discussion').map(item=>`<option${item===tag?' selected':''}>${e(item)}</option>`).join('')}</select></div><button type="button" data-lab-clear>Clear filters</button></div><p id="idea-results" class="lab-results" role="status" aria-live="polite">${results.count} of ${ideas.length} ideas</p><div class="lab-grid" id="idea-cards">${results.html}</div><footer class="lab-footer"><p>Illustrative, AI-assisted starters. Adapt them to your course.</p><nav id="lab-pagination" aria-label="Idea pages">${renderLabPagination(results)}</nav></footer></section>`;
}
export function renderIdeaDetail(id, hasWorkspace = false, {query='',tag='',page=0}={}) {
  const item=findIdea(id);
  if(!item) return `<section class="lab-browser"><h1 id="entry-title" tabindex="-1">That idea is unavailable</h1><a class="lab-button" href="?view=lab">Browse the Idea Lab</a></section>`;
  return `<section class="lab-browser" aria-labelledby="entry-title"><header class="lab-heading"><div><span class="lab-category">${e(item.tags.filter(tag=>tag!=='Discussion').join(' · '))}</span><h1 id="entry-title" tabindex="-1">${e(item.title)}</h1><p>${e(item.summary)}</p></div></header><div class="lab-detail"><aside class="lab-context" style="${categoryStyle(item)}"><h2>Why try it?</h2><p>${e(item.purpose)}</p><h3>Where it could fit</h3><p>${e(item.contexts)}</p><h3>Keep it manageable</h3><p>Choose one reading, example, or problem for students to work with. Keep the reply focused on one useful question. Give students an alternative if nobody replies in time.</p><p>${hasWorkspace?'Your starting material and draft stay intact. This changes the inspiration for your current workspace; Babbage will use the new idea when you request a revision.':'Bring this idea into your private workspace and shape it for your course.'}</p></aside><div class="lab-experience"><h2>The learning experience</h2><ol class="lab-phases">${item.actions.map((action,index)=>`<li><h3>${['Share a first response','Respond to a classmate','Revisit your response'][index]}</h3><p>${e(action)}</p></li>`).join('')}</ol><section class="lab-instructor"><h3>Your role as instructor</h3><p>Choose the material and show an example of a useful reply. Step in when students need help with a course concept. Look for how they use a classmate’s response in their final explanation.</p></section></div></div><footer class="lab-footer"><a class="lab-button" href="${e(browseURL(query,tag,page))}">Back to ideas</a><a class="lab-button primary" href="?view=workspace&amp;adapt=${e(item.id)}">Develop in Creative Workspace</a></footer></section>`;
}
