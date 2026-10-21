import { loadState, STORAGE_KEY } from '../../app/storage.js';
import { discussionOpening } from '../opening/content.js';
import { readWorkspace } from '../workspace/storage.js';
import { openGuidePreview } from '../design/guide-preview.js';

// Read existing snapshots only. Visiting the guide never changes progress or the resume path.
export function mountCourseGuide(app, storage = window.localStorage) {
  const entries = [];
  let notice = '';
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    if (raw) {
      if (raw.version !== 1 || raw.scenarioId !== discussionOpening.id ||
        raw.contentVersion !== discussionOpening.contentVersion ||
        !discussionOpening.scenes.some(scene => scene.id === raw.sceneId)) throw Error('Invalid save');
      entries.push({ path: 'play', title: 'Guided scenario', state: loadState(discussionOpening, storage) });
    }
  } catch {
    notice = 'Your scenario save could not be read. It has not been changed.';
  }
  const workspace = readWorkspace(storage);
  if (workspace.exists) entries.push({ path: 'workspace', title: 'Assignment workspace', state: workspace.state });
  app.innerHTML = `<section class="entry-shell menu-shell" aria-labelledby="entry-title"><header class="info-heading"><h1 id="entry-title" tabindex="-1">Course Guide</h1></header><div class="menu-board guide-board"><p>Review your teaching ideas, revisions, and reasons for your choices. These guides stay private in this browser.</p><p>Each path keeps its current design. Download a finished guide from that path to keep a copy before replacing it.</p><div class="entry-grid">${entries.map((entry, index) => `<article class="path-card"><h2>${entry.title}</h2><p>${entry.state.finalCheck.approved ? 'Saved final design' : 'Work in progress · draft preview'}</p><button type="button" class="action-link" data-guide-index="${index}">Preview ${entry.title.toLowerCase()} guide</button><a class="action-link" href="?view=${entry.path}">Return to ${entry.title.toLowerCase()}</a></article>`).join('')}</div>${entries.length ? '' : '<p>No readable saved designs yet. Play the scenario or bring an assignment to start your guide.</p>'}<p role="status" data-guide-notice></p></div></section>`;
  app.querySelector('[data-guide-notice]').textContent = [notice, workspace.error].filter(Boolean).join(' ');
  app.addEventListener('click', event => {
    const button = event.target.closest('[data-guide-index]');
    if (!button) return;
    openGuidePreview(entries[Number(button.dataset.guideIndex)].state, app);
    document.querySelector('.guide-preview')?.addEventListener('close', () => button.focus(), { once: true });
  });
}
