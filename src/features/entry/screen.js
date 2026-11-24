import { machineArtwork } from './home-art.js';
import { escapeHTML as e } from '../../shared/html.js';
import { characterArt } from '../../shared/character-art.js';

export function renderHome(resume = '') {
  const paths = [
    [
      'play&story=1',
      'Guided Scenario',
      'Start with Pixel’s teaching challenge, then explore, build, and review your activity in the shared design studio.',
    ],
    [
      'workspace',
      'Creative Workspace',
      'Bring an activity or rough idea. Explore possibilities, build your activity, and review the design.',
    ],
    [
      'lab',
      'Babbage’s Idea Lab',
      'Browse 12 illustrative discussion starters and adapt one for your course.',
    ],
    ['guide', 'Course Guide', 'Revisit your saved activity, teaching notes, and design reasoning.'],
  ];
  return `<section class="entry-shell home-shell menu-shell reference-home" aria-labelledby="entry-title">
    <header class="reference-home-heading"><div class="reference-home-lead"><h1 id="entry-title" tabindex="-1">Rethink <em>teaching.</em></h1><p>Turn a familiar activity into a more purposeful learning experience. Explore ideas, question AI suggestions, and make the design your own.</p><a class="primary" href="?view=${resume ? e(resume) : 'play&amp;story=1'}">${resume ? 'Continue your saved work' : 'Start Guided Scenario'}</a></div><div class="reference-hero-engine" aria-hidden="true">${machineArtwork('home-hero')}</div></header>
    <div class="home-board menu-board home-studio"><nav class="reference-paths" aria-label="Choose your experience">${paths.map(([view, title, description], index) => `<a class="reference-path" href="?view=${e(view)}" data-home-plate="${index + 1}"><strong>${title}</strong><span>${description}</span></a>`).join('')}</nav><figure class="reference-workshop" aria-label="Explore PromptCraft’s design experiences"><div class="reference-art is-active" data-workshop-plate="0">${machineArtwork('home-default')}</div><div class="reference-art reference-art--cast" data-workshop-plate="1"><img src="${e(characterArt.pixel.warm)}" alt="" width="832" height="1177"><img src="${e(characterArt.maya.friendly)}" alt="" width="832" height="1177"></div><div class="reference-art reference-art--workshop" data-workshop-plate="2" aria-hidden="true"><img class="reference-room" src="assets/backgrounds/classroom.webp" alt=""><img class="reference-workshop-pixel" src="${e(characterArt.pixel.explaining)}" alt=""></div><div class="reference-art" data-workshop-plate="3" aria-hidden="true">${machineArtwork('home-lab')}</div><div class="reference-art reference-art--cast reference-art--guide" data-workshop-plate="4" aria-hidden="true"><img src="${e(characterArt.maya.pleased)}" alt="" width="832" height="1177"><img src="${e(characterArt.pixel.pleasant)}" alt="" width="832" height="1177"></div><figcaption data-workshop-caption>A place to experiment with your teaching.</figcaption></figure></div>
  </section>`;
}
