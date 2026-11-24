import { STORAGE_KEY } from '../../app/storage.js';
import { readScenarioStudio } from '../workspace/scenario-storage.js';
import { discussionOpening } from '../opening/content.js';
import { readWorkspace } from '../workspace/storage.js';
import { openGuidePreview } from '../design/guide-preview.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderDropdown } from '../../shared/dropdown.js';

// Read existing snapshots only. Visiting the guide never changes progress or the resume path.
export function mountCourseGuide(app, storage = window.localStorage) {
  const entries = [];
  let notice = '';
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    if (raw) {
      if (
        raw.version !== 1 ||
        raw.scenarioId !== discussionOpening.id ||
        raw.contentVersion !== discussionOpening.contentVersion ||
        !discussionOpening.scenes.some((scene) => scene.id === raw.sceneId)
      )
        throw Error('Invalid save');
      const scenario = readScenarioStudio(storage);
      if (scenario.error) throw Error(scenario.error);
      entries.push({
        path: scenario.needsIntro ? 'play' : 'scenario&build=draft',
        title: 'Guided scenario',
        state: scenario.state,
      });
    }
  } catch {
    notice = 'Your scenario save could not be read. It has not been changed.';
  }
  const workspace = readWorkspace(storage);
  if (workspace.exists)
    entries.push({ path: 'workspace', title: 'Creative Workspace', state: workspace.state });
  app.innerHTML = `<section class="entry-shell menu-shell course-guide-shell" aria-labelledby="entry-title"><header class="info-heading"><h1 id="entry-title" tabindex="-1">Course Guide</h1></header><div class="menu-board guide-board guide-library"><header class="guide-library-intro"><h2>Your design notebook</h2><p>Revisit your ideas, teaching decisions, and work in progress.</p></header>${
    entries.length
      ? `<div class="guide-list" aria-label="Saved designs">${entries
          .map((entry, index) => {
            const approved = entry.state.finalCheck.approved;
            const title =
              entry.state.workspace?.selectedDirection?.title ||
              entry.state.teacher.subject ||
              entry.title;
            const summary =
              entry.state.teacher.learningGoal ||
              (entry.path === 'workspace'
                ? 'Your discussion design and the reasoning behind it.'
                : 'Your work from Scenario 1 · Give the discussion a job.');
            const options = `<button type="button" data-guide-index="${index}" aria-label="${approved ? 'Open' : 'Preview'} ${e(entry.title)} guide">${approved ? 'Open guide' : 'Preview draft'}</button><a href="?view=${entry.path}" aria-label="Continue designing in ${e(entry.title)}">Continue designing</a>`;
            return `<article class="guide-entry" aria-labelledby="guide-entry-${index}"><div class="guide-entry-copy"><h3 id="guide-entry-${index}">${e(title)}</h3><p class="guide-entry-status${approved ? ' is-approved' : ''}">${e(entry.title)} · ${approved ? 'Approved version' : 'In progress'}</p><p>${e(summary.slice(0, 180))}${summary.length > 180 ? '…' : ''}</p></div><div class="guide-entry-actions">${renderDropdown({ id: `guide-options-${index}`, label: 'Guide options', content: options })}</div></article>`;
          })
          .join(
            '',
          )}</div><footer class="guide-library-note"><p>Saved in this browser. Download a finished HTML guide from your workspace to keep a separate copy.</p></footer>`
      : `<div class="guide-empty"><h3>A place for your next idea</h3><p>Choose Home to start Guided Scenario or Creative Workspace. Your saved work will appear here.</p></div>`
  }<p role="status" data-guide-notice></p></div></section>`;
  app.querySelector('[data-guide-notice]').textContent = [notice, workspace.error]
    .filter(Boolean)
    .join(' ');
  app.addEventListener('click', (event) => {
    const button = event.target.closest('[data-guide-index]');
    if (!button) return;
    openGuidePreview(entries[Number(button.dataset.guideIndex)].state, app);
    document
      .querySelector('.guide-preview')
      ?.addEventListener('close', () => button.focus(), { once: true });
  });
}
