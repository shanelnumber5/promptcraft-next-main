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
  return `<section class="entry-shell home-shell menu-shell" aria-labelledby="entry-title">
    <div class="home-hero">
      <header class="info-heading"><h1 id="entry-title" tabindex="-1">Rethink<br>teaching.</h1><p>Turn a familiar online discussion into a more purposeful learning experience. Explore ideas, question AI suggestions, and make the design your own.</p></header>
      <div class="home-studio-intro">
        <figure class="home-classroom" aria-label="Maya and Professor Pixel in the PromptCraft classroom">
          <img class="home-pixel" src="${e(characterArt.pixel.explaining)}" alt="Professor Pixel" width="832" height="1177">
          <img class="home-maya" src="${e(characterArt.maya.friendly)}" alt="Maya" width="832" height="1177">
          <figcaption>Meet Maya &amp; Professor Pixel</figcaption>
        </figure>
      </div>
    </div>
    <div class="home-board menu-board home-studio">
      <div class="home-choices">
        <nav class="home-paths" aria-label="Choose your experience">${resume ? `<a class="home-path home-path--resume" href="?view=${e(resume)}">Continue your saved work</a>` : ''}${paths.map(([view, title, description], i) => `<a class="home-path home-path--${['story', 'workspace', 'lab', 'guide'][i]}${i > 1 ? ' home-path--secondary' : ''}" href="?view=${e(view)}"><strong>${title}</strong><span class="home-path-description">${description}</span></a>`).join('')}</nav>
      </div>
    </div>
  </section>`;
}
