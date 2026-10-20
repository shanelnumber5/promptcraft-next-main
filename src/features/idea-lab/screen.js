import { ideas, ideaTags, filterIdeas, findIdea } from './ideas.js';
import { labIcon, ideaVisual } from '../../shared/lab-visuals.js';
import { escapeHTML as e } from '../../shared/html.js';

// Short browsing copy; full forum purposes and steps remain in idea details.
const previews = {
  'decision-clinic': ['An evidence-backed choice, tested and refined through peer exchange.', 'Students need practice explaining a choice, not just sharing opinions.'],
  'failure-file': ['A forum diagnosis that responds to a peer’s analysis before proposing a repair.', 'Students jump to solutions before understanding what went wrong.'],
  'two-audiences': ['Two brief explanations improved through a reader’s forum response.', 'Students know the content but struggle to explain it to different people.'],
  'evidence-detectives': ['A claim, its evidence and limits, and a conclusion informed by peer review.', 'Students accept convincing claims without checking their support.'],
  'shift-change': ['A workplace decision tested against a peer’s competing constraint.', 'Students need practice balancing fairness, resources, and competing needs.'],
  'artifact-story': ['An evidence-based interpretation refined through discussion of a shared artifact.', 'You want students to connect an artifact to disciplinary reasoning.'],
  'ai-cross-exam': ['A course-evidence check of an AI claim, discussed and qualified with peers.', 'Students need to question AI output and verify its claims.'],
  'constraint-remix': ['A proposed solution challenged by a peer’s alternative constraint.', 'Students can repeat a solution but need practice adapting it.'],
  'museum-of-misconceptions': ['A misconception explained, challenged, and corrected through evidence-based replies.', 'A persistent misunderstanding needs more than another explanation.'],
  'community-brief': ['An evidence-backed recommendation refined through stakeholder questions.', 'Students need to turn course knowledge into a decision an audience can use.'],
  'question-upgrade': ['A stronger inquiry question shaped by a peer’s perspective.', 'Discussion questions stop at recall or lead to predictable answers.'],
  'human-ai-editors': ['A revision choice examined with peers and justified in a follow-up post.', 'Students need to judge suggestions while keeping ownership of their work.'],
};
export function renderIdeaCards(query = '', tag = '') {
  const matches = filterIdeas(query, tag);
  return { count: matches.length, html: matches.map(item => `<article class="idea-card">${ideaVisual(item, ideas.indexOf(item))}<div class="idea-card-content"><h2><a href="?view=lab&amp;idea=${e(item.id)}">${e(item.title)}</a></h2><p class="idea-summary">${e(item.summary)}</p><dl class="idea-preview"><div><dt>Forum exchange</dt><dd>${e(previews[item.id][0])}</dd></div><div><dt>Use it when</dt><dd>${e(previews[item.id][1])}</dd></div></dl><p class="idea-tags">${item.tags.slice(0, 2).map(tag => `<span>${e(tag)}</span>`).join('')}</p><span class="idea-label">AI-assisted forum starter</span><a class="action-link" href="?view=lab&amp;idea=${e(item.id)}">Explore this idea ${labIcon('arrow')}</a></div></article>`).join('') || '<p>No ideas match yet. Try a broader search or choose All categories.</p>' };
}
export function renderGallery(query = '', tag = '') {
  const results = renderIdeaCards(query, tag);
  return `<section class="entry-shell gallery-shell" aria-labelledby="entry-title"><header class="gallery-heading"><span class="gallery-kicker">Discussion forum ideas</span><h1 id="entry-title" tabindex="-1">Babbage’s Idea Lab</h1><p>Browse discussion forum ideas. Make one your own.</p><p class="gallery-scope-note">This area focuses on forums; other activity types can have their own space as they are developed.</p></header><div class="gallery-intro-row"><p class="gallery-provenance"><strong>12 illustrative starters</strong><span>AI-assisted examples, not faculty submissions.</span></p><a class="action-link gallery-return" href="?view=workspace">← Return to my discussion workspace</a></div><div class="gallery-controls"><div><label for="idea-search">Search forum ideas</label><input type="search" id="idea-search" value="${e(query)}" placeholder="Try workplace, evidence, questions…"></div><div><label for="idea-category">Category</label><select id="idea-category"><option value="">All categories</option>${ideaTags.map(item => `<option${item === tag ? ' selected' : ''}>${e(item)}</option>`).join('')}</select></div></div><p id="idea-results" role="status" aria-live="polite" aria-atomic="true">${results.count} of ${ideas.length} ideas</p><div class="idea-grid" id="idea-cards">${results.html}</div><aside class="sharing-note"><h2>Shared by educators · a future possibility</h2><p>Faculty sharing is planned, with permission and moderation. Nothing in your private workspace or Course Guide is published.</p></aside></section>`;
}
export function renderIdeaDetail(id, hasWorkspace = false) {
  const item = findIdea(id);
  if (!item) return `<section class="entry-shell"><h1 id="entry-title" tabindex="-1">That idea is unavailable</h1><a href="?view=lab">Browse the Idea Lab</a></section>`;
  return `<section class="entry-shell idea-detail" aria-labelledby="entry-title"><a class="back-link" href="?view=lab">← Back to ideas</a>${ideaVisual(item, ideas.indexOf(item))}<span class="idea-label">Illustrative AI-assisted forum starter · not a faculty submission</span><h1 id="entry-title" tabindex="-1">${e(item.title)}</h1><p>${e(item.summary)}</p><h2>Learning purpose</h2><p>${e(item.purpose)}</p><h2>Discussion forum flow</h2><ol>${item.actions.map(action => `<li>${e(action)}</li>`).join('')}</ol><h2>Where it could fit</h2><p>${e(item.contexts)}</p><p class="idea-tags">${item.tags.map(tag => `<span>${e(tag)}</span>`).join('')}</p><a class="action-link primary" href="?view=workspace&amp;adapt=${e(item.id)}">Adapt this forum with Babbage ${labIcon('arrow')}</a><p>${hasWorkspace ? 'Use this as inspiration in your current workspace. Your starting material and draft stay intact; Babbage’s previous conversation and approval will reset for the new inspiration.' : 'Start a private discussion design from this idea, then make it fit your course.'} No AI request is sent until you ask Babbage.</p></section>`;
}
