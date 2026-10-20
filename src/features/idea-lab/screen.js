import { ideas, ideaTags, filterIdeas, findIdea } from './ideas.js';
import { labIcon, ideaVisual } from '../../shared/lab-visuals.js';
import { escapeHTML as e } from '../../shared/html.js';

// Short browsing copy; full learning purposes and steps remain in activity details.
const previews = {
  'decision-clinic': ['A defended decision, revised after peer feedback.', 'Students need practice explaining a choice, not just sharing opinions.'],
  'failure-file': ['A diagnosis and one proposed repair.', 'Students jump to solutions before understanding what went wrong.'],
  'two-audiences': ['Two explanations of one concept, with notes on their choices.', 'Students know the content but struggle to explain it to different people.'],
  'evidence-detectives': ['An evidence trail and a qualified conclusion.', 'Students accept convincing claims without checking their support.'],
  'shift-change': ['A workplace plan adjusted to a new constraint.', 'Students need practice balancing fairness, resources, and competing needs.'],
  'artifact-story': ['A creative artifact annotated with three design decisions.', 'You want creative work to reveal students’ reasoning.'],
  'ai-cross-exam': ['A fact-checked AI answer with corrections.', 'Students need to question AI output and verify its claims.'],
  'constraint-remix': ['Two versions of a solution and an explanation of the tradeoff.', 'Students can repeat a solution but need practice adapting it.'],
  'museum-of-misconceptions': ['A small exhibit correcting a common misconception.', 'A persistent misunderstanding needs more than another explanation.'],
  'community-brief': ['A concise recommendation supported by evidence.', 'Students need to turn course knowledge into something an audience can use.'],
  'question-upgrade': ['A stronger inquiry question, with reasons for the change.', 'Discussion questions stop at recall or lead to predictable answers.'],
  'human-ai-editors': ['A revised artifact and reasons for accepting or rejecting feedback.', 'Students need to judge suggestions while keeping ownership of their work.'],
};
export function renderIdeaCards(query = '', tag = '') {
  const matches = filterIdeas(query, tag);
  return { count: matches.length, html: matches.map(item => `<article class="idea-card">${ideaVisual(item, ideas.indexOf(item))}<div class="idea-card-content"><h2><a href="?view=lab&amp;idea=${e(item.id)}">${e(item.title)}</a></h2><p class="idea-summary">${e(item.summary)}</p><dl class="idea-preview"><div><dt>Students make</dt><dd>${e(previews[item.id][0])}</dd></div><div><dt>Use it when</dt><dd>${e(previews[item.id][1])}</dd></div></dl><p class="idea-tags">${item.tags.slice(0, 2).map(tag => `<span>${e(tag)}</span>`).join('')}</p><span class="idea-label">AI-assisted starter</span><a class="action-link" href="?view=lab&amp;idea=${e(item.id)}">Explore this idea ${labIcon('arrow')}</a></div></article>`).join('') || '<p>No ideas match yet. Try a broader search or choose All categories.</p>' };
}
export function renderGallery(query = '', tag = '') {
  const results = renderIdeaCards(query, tag);
  return `<section class="entry-shell gallery-shell" aria-labelledby="entry-title"><header class="gallery-heading"><div><h1 id="entry-title" tabindex="-1">Babbage’s Idea Lab</h1><p>Browse an activity. Make it your own.</p></div><a class="action-link gallery-return" href="?view=workspace">← Return to my assignment workspace</a></header><p class="gallery-provenance">12 AI-assisted illustrative starters, not faculty submissions.</p><div class="gallery-controls"><div><label for="idea-search">Search ideas</label><input type="search" id="idea-search" value="${e(query)}" placeholder="Try workplace, evidence, creative…"></div><div><label for="idea-category">Category</label><select id="idea-category"><option value="">All categories</option>${ideaTags.map(item => `<option${item === tag ? ' selected' : ''}>${e(item)}</option>`).join('')}</select></div></div><p id="idea-results" role="status" aria-live="polite" aria-atomic="true">${results.count} of ${ideas.length} ideas</p><div class="idea-grid" id="idea-cards">${results.html}</div><aside class="sharing-note"><h2>Shared by educators · a future possibility</h2><p>Faculty sharing is planned, with permission and moderation. Nothing in your private workspace or Course Guide is published.</p></aside></section>`;
}
export function renderIdeaDetail(id, hasWorkspace = false) {
  const item = findIdea(id);
  if (!item) return `<section class="entry-shell"><h1 id="entry-title" tabindex="-1">That idea is unavailable</h1><a href="?view=lab">Browse the Idea Lab</a></section>`;
  return `<section class="entry-shell idea-detail" aria-labelledby="entry-title"><a class="back-link" href="?view=lab">← Back to ideas</a>${ideaVisual(item, ideas.indexOf(item))}<span class="idea-label">Illustrative AI-assisted starter · not a faculty submission</span><h1 id="entry-title" tabindex="-1">${e(item.title)}</h1><p>${e(item.summary)}</p><h2>Learning purpose</h2><p>${e(item.purpose)}</p><h2>What students do</h2><ol>${item.actions.map(action => `<li>${e(action)}</li>`).join('')}</ol><h2>Where it could fit</h2><p>${e(item.contexts)}</p><p class="idea-tags">${item.tags.map(tag => `<span>${e(tag)}</span>`).join('')}</p><a class="action-link primary" href="?view=workspace&amp;adapt=${e(item.id)}">Adapt with Babbage ${labIcon('arrow')}</a><p>${hasWorkspace ? 'Use this as inspiration in your current workspace. Your starting material and draft stay intact; Babbage’s previous conversation and approval will reset for the new inspiration.' : 'Start a private design from this idea, then make it fit your course.'} No AI request is sent until you ask Babbage.</p></section>`;
}
