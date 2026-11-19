import { escapeHTML as e } from '../../shared/html.js';
import { characterArt } from '../../shared/character-art.js';

export function renderHome(resume = '') {
  const paths = [
    ['play&story=1', 'Guided Scenario', 'A classroom challenge with Pixel and Maya.'],
    ['workspace', 'Creative Workspace', 'Explore and design your own activity.'],
  ];
  return `<section class="entry-shell home-shell menu-shell" aria-labelledby="entry-title">
    <header class="info-heading"><h1 id="entry-title" tabindex="-1">Choose your path</h1></header>
    <div class="home-board menu-board home-studio">
      <div class="home-studio-intro">
        <figure class="home-classroom" aria-label="Maya and Professor Pixel in the PromptCraft classroom">
          <img class="home-maya" src="${e(characterArt.maya.friendly)}" alt="Maya" width="832" height="1177">
          <img class="home-pixel" src="${e(characterArt.pixel.warm)}" alt="Professor Pixel" width="832" height="1177">
          <figcaption>Meet Maya &amp; Professor Pixel</figcaption>
        </figure>
      </div>
      <div class="home-choices">
        <nav class="home-paths" aria-label="Choose your experience">${resume ? `<a class="home-path home-path--resume" href="?view=${e(resume)}">Continue your saved work</a>` : ''}${paths.map(([view, title, description], i) => `<a class="home-path home-path--${i === 0 ? 'story' : 'workspace'}" href="?view=${e(view)}"><span class="home-path-copy"><strong>${title}</strong><span>${description}</span></span></a>`).join('')}</nav>
      </div>
    </div>
  </section>`;
}
