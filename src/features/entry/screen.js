import { escapeHTML as e } from '../../shared/html.js';
import { characterArt } from '../../shared/character-art.js';

export function renderHome(resume = '') {
  const paths = [
    [
      'play&story=1',
      'Guided Scenario',
      'Join Pixel and Maya in the classroom. Try a teaching challenge, with dialogue and optional audio, then design your activity.',
    ],
    [
      'workspace',
      'Creative Workspace',
      'Bring an activity or rough idea. Explore possibilities, build your activity, and review the design.',
    ],
  ];
  return `<section class="entry-shell home-shell menu-shell" aria-labelledby="entry-title">
    <header class="info-heading"><h1 id="entry-title" tabindex="-1">Welcome to PromptCraft</h1></header>
    <div class="home-board menu-board home-studio">
      <div class="home-studio-intro">
        <p class="home-eyebrow">The Prompt Lab</p>
        <h2>Give your discussion<br>a reason to happen.</h2>
        <p>Explore. Question. Create. Turn a familiar online discussion into a learning experience worth joining.</p>
        <figure class="home-classroom" aria-label="Maya and Professor Pixel in the PromptCraft classroom">
          <img class="home-maya" src="${e(characterArt.maya.friendly)}" alt="Maya" width="832" height="1177">
          <img class="home-pixel" src="${e(characterArt.pixel.warm)}" alt="Professor Pixel" width="832" height="1177">
          <figcaption>Meet Maya &amp; Professor Pixel</figcaption>
        </figure>
      </div>
      <div class="home-choices">
        <h2 class="home-menu-label">How will you begin?</h2>
        ${resume ? `<div class="home-resume"><a class="action-link" href="?view=${e(resume)}">Continue your saved work <span aria-hidden="true">→</span></a><p>Your saved activity stays here while you explore.</p></div>` : ''}
        <nav class="home-paths" aria-label="Choose your experience">${paths.map(([view, title, description], i) => `<a class="home-path home-path--${i === 0 ? 'story' : 'workspace'}" href="?view=${e(view)}"><span class="home-path-copy"><strong>${title}</strong><span>${description}</span><span class="home-path-action">${i === 0 ? 'Start with the story' : 'Create your activity'} <span aria-hidden="true">→</span></span></span></a>`).join('')}</nav>
        <nav class="home-tools" aria-label="Optional tools"><a href="?view=lab">Babbage’s Idea Lab</a><a href="?view=guide">Your Course Guide</a></nav>
      </div>
    </div>
  </section>`;
}
