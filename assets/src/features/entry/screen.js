import { characterArt } from '../../shared/character-art.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderHome(resume = '') {
  const paths = [
    ['play', 'Play the Scenario', 'Explore a teaching challenge with Pixel and practice a purposeful change.'],
    ['workspace', 'Create an Assignment', 'Bring an assignment or idea and start designing with Babbage.'],
    ['lab', 'Babbage’s Idea Lab', 'Discover curated teaching ideas and adapt one for your classroom.'],
    ['guide', 'Course Guide', 'Review the teaching ideas, revisions, and decisions you have saved.'],
  ];
  return `<section class="entry-shell home-shell menu-shell" aria-labelledby="entry-title"><header class="info-heading"><h1 id="entry-title" tabindex="-1">The Prompt Lab</h1><span class="home-scope">This prototype focuses on discussion forums.</span></header><div class="home-board menu-board"><div class="home-welcome"><div class="home-intro"><div><span class="section-kicker">Make it your own</span><h2>Big ideas.<br><span>Better learning.</span></h2></div><a class="home-qr" href="https://promptcraft-test.netlify.app/" target="_blank" rel="noopener noreferrer" aria-label="Open published PromptCraft site in a new tab"><img src="assets/brand/promptcraft-qr.png" alt="QR code for the published PromptCraft site" width="112" height="112"><span>Scan to play</span></a></div><p>Explore, experiment, and make something meaningful for your students.</p><div class="home-visuals"><div class="home-characters" aria-hidden="true"><span class="home-character-crop"><img src="${characterArt.pixel.pleasant}" alt=""></span><span class="home-character-crop"><img src="${characterArt.maya.explaining}" alt=""></span></div></div></div><div class="home-choices"><div class="home-resume">${resume ? `<a class="action-link primary" href="?view=${e(resume)}">Continue Where You Left Off</a>` : '<p>Choose a place to begin.</p>'}</div><nav class="home-paths" aria-label="Choose your experience">${paths.map(([view, title, description]) => `<a class="home-path" href="?view=${view}"><span class="home-path-copy"><strong>${title}</strong><span>${description}</span></span></a>`).join('')}</nav></div></div></section>`;
}
