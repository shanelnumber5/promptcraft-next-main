import { escapeHTML as e } from '../../shared/html.js';

export function renderHome(resume = '') {
  const paths = [
    ['play', 'Guided Scenario', 'Start with Pixel’s teaching challenge, then explore, build, and review your activity in the shared design studio.'],
    ['workspace', 'Creative Workspace', 'Bring an activity or rough idea. Explore possibilities, build your activity, and review the design.'],
    ['lab', 'Babbage’s Idea Lab', 'Browse 12 illustrative discussion starters and adapt one for your course.'],
    ['guide', 'Course Guide', 'Revisit your saved activity, teaching notes, and design reasoning.'],
  ];
  return `<section class="entry-shell home-shell menu-shell" aria-labelledby="entry-title"><header class="info-heading"><h1 id="entry-title" tabindex="-1">The Prompt Lab</h1></header><div class="home-board menu-board home-studio"><div class="home-studio-intro"><h2>Rethink teaching.</h2><p>Turn a familiar online discussion into a more purposeful learning experience. Explore ideas, question AI suggestions, and make the design your own.</p><div class="home-resume">${resume ? `<a class="action-link primary" href="?view=${e(resume)}">Continue Where You Left Off</a>` : ''}</div><a class="home-qr" href="https://promptcraft-discussion.netlify.app/?view=home" target="_blank" rel="noopener noreferrer" aria-label="Open published PromptCraft site in a new tab"><img src="assets/brand/promptcraft-qr.png?v=discussion" alt="QR code for the published PromptCraft site" width="144" height="144"><span>Take PromptCraft with you<small>Scan to open the published site</small></span></a></div><div class="home-choices"><h2 class="home-menu-label">Choose where to begin</h2><nav class="home-paths" aria-label="Choose your experience">${paths.map(([view, title, description]) => `<a class="home-path${view === 'workspace' && !resume ? ' home-path--featured' : ''}" href="?view=${view}"><span class="home-path-copy"><strong>${title}</strong><span>${description}</span></span></a>`).join('')}</nav></div></div></section>`;
}
