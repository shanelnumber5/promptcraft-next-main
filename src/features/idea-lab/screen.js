import { ideas, ideaTags, filterIdeas, findIdea } from './ideas.js';
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
  return { count: matches.length, html: matches.map(item => `<article class="idea-card"><div class="idea-card-content"><div class="idea-card-heading"><h2>${e(item.title)}</h2><span class="idea-category-label">${e(item.tags.find(tag => tag !== 'Discussion') || 'Discussion design')}</span></div><div class="idea-card-description"><p class="idea-summary">${e(previews[item.id][0])}</p><p class="idea-use"><strong>Try it when:</strong> ${e(previews[item.id][1])}</p></div><a class="idea-open" href="?view=lab&amp;idea=${e(item.id)}" aria-label="Explore ${e(item.title)}">View idea</a></div></article>`).join('') || '<div class="idea-no-results"><h2>No matching ideas yet</h2><p>Try a broader search or choose All categories.</p></div>' };
}
export function renderGallery(query = '', tag = '') {
  const results = renderIdeaCards(query, tag);
  return `<section class="entry-shell gallery-shell idea-library" aria-labelledby="entry-title"><header class="library-heading"><div><h1 id="entry-title" tabindex="-1">Babbage’s Idea Lab</h1><p>Twelve ways to rethink a discussion.</p></div><a class="library-workspace-link" href="?view=workspace">Creative Workspace</a></header><div class="library-toolbar"><div><label for="idea-search">Find an idea</label><input type="search" id="idea-search" value="${e(query)}" placeholder="Search by topic or learning purpose"></div><div><label for="idea-category">Category</label><select id="idea-category"><option value="">All categories</option>${ideaTags.map(item => `<option${item === tag ? ' selected' : ''}>${e(item)}</option>`).join('')}</select></div></div><div class="library-results-heading"><h2>The collection</h2><p id="idea-results" role="status" aria-live="polite" aria-atomic="true">${results.count} of ${ideas.length} ideas</p></div><div class="idea-grid" id="idea-cards">${results.html}</div><footer class="library-note"><p>12 illustrative, AI-assisted starters. Adapt a spark to your course.</p></footer></section>`;
}
export function renderIdeaDetail(id, hasWorkspace = false) {
  const item = findIdea(id);
  if (!item) return `<section class="entry-shell"><h1 id="entry-title" tabindex="-1">That idea is unavailable</h1><a href="?view=lab">Browse the Idea Lab</a></section>`;
  return `<section class="entry-shell idea-detail idea-library" aria-labelledby="entry-title"><nav class="idea-detail-nav" aria-label="Idea navigation"><a class="library-workspace-link" href="?view=lab">Back to ideas</a></nav><header class="library-heading idea-detail-heading"><div><h1 id="entry-title" tabindex="-1">${e(item.title)}</h1><p>${e(item.summary)}</p></div></header><div class="idea-detail-layout"><div class="idea-detail-body"><section aria-labelledby="idea-purpose"><h2 id="idea-purpose">Learning purpose</h2><p>${e(item.purpose)}</p></section><section aria-labelledby="idea-flow"><h2 id="idea-flow">Discussion forum flow</h2><ol>${item.actions.map(action => `<li>${e(action)}</li>`).join('')}</ol></section></div><aside class="idea-detail-aside" aria-label="Use this idea"><h2>Where it could fit</h2><p>${e(item.contexts)}</p><div class="idea-detail-adapt"><h2>Make it your own</h2><a class="action-link primary" href="?view=workspace&amp;adapt=${e(item.id)}">Adapt in Creative Workspace</a><p>${hasWorkspace ? 'Your starting material and draft stay intact. This changes the inspiration for your current workspace and resets its Babbage conversation and approval.' : 'Bring this idea into your private workspace and shape it for your course.'}</p></div></aside></div><footer class="library-note"><p>Illustrative, AI-assisted starter. Adapt it to your course.</p></footer></section>`;
}
