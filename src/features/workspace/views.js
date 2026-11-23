import { buildPages } from './build-view.js';
// Preserve the existing import path for callers and extensions.
export { buildPages } from './build-view.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderStudioPage } from './page-frame.js';
import { designRoute } from './routes.js';

export const workspaceViews = () => ({ screen: 'work', index: 0, saved: false, part: 'overview' });
export function renderReading(text, renderer = renderAssignmentDirections) {
  return `<div class="workspace-reading">${renderer(text)}</div>`;
}
export function renderUtility(state, ai, ui) {
  let title, body;
  if (ui.screen === 'options') {
    title = 'Project tools';
    const connectionDescription =
      ai.configured === true
        ? 'Babbage is connected. View details or retry the connection.'
        : ai.configured === false
          ? 'Babbage is unavailable. View details and retry the connection.'
          : 'Check the connection status or retry Babbage.';
    body = `
      <div class="workspace-welcome-board workspace-project-menu">
        <section class="workspace-welcome-choices" aria-labelledby="workspace-backup-title">
          <h3 id="workspace-backup-title">Keep your work</h3>
          <p>Your work saves in this browser. Download an editable backup to move it or keep a copy.</p>
          <div class="workspace-welcome-actions">
            <button type="button" data-action="save-project-file">Download project</button>
            <button type="button" data-action="open-project-file"${ai.pending ? ' disabled' : ''}>Open project</button>
          </div>
        </section>
        <section class="workspace-welcome-intro" aria-labelledby="workspace-tools-title">
          <h3 id="workspace-tools-title">Additional tools</h3>
          <p>${connectionDescription}</p>
          <nav class="workspace-project-actions" aria-label="Additional tools">
            ${state.experience === 'scenario' ? '<a class="action-link" href="?view=play&amp;story=1">Revisit Pixel &amp; Maya’s story</a>' : ''}
            <button type="button" data-partner-page="history">Earlier conversation</button>
            ${state.creative.alternatives.length ? '<button type="button" data-workspace-view="saved">Saved ideas</button>' : ''}
            <button type="button" data-partner-page="options">AI connection</button>
            <button type="button" data-action="open-references">Sources &amp; samples</button>
            <button type="button" data-action="reset-workspace">${e(designRoute(state.experience).restartLabel)}</button>
          </nav>
        </section>
      </div>
      <input type="file" data-project-file-input accept=".json,application/json" aria-label="Choose a saved PromptCraft project" hidden>`;
  } else if (ui.screen === 'sections') {
    title = 'What would you like to work on?';
    body = `<nav class="workspace-build-menu" aria-label="Build sections">${buildPages.map(([id, label]) => `<button type="button" data-design-page="${id}">${label}</button>`).join('')}</nav>`;
  } else if (ui.screen === 'idea') {
    const item = (ui.saved ? state.creative.alternatives : state.creative.directions)[ui.index];
    if (!item) return null;
    title = item.title;
    const parts = [
      ['overview', 'The experience'],
      ['learning', 'Learning & core'],
      ['online', 'Online approach'],
    ];
    const text =
      ui.part === 'learning'
        ? `${item.learning}\n\nCreative core: ${item.core}`
        : ui.part === 'online'
          ? item.online
          : `${item.description}\n\n${item.experience}`;
    body = `<nav class="workspace-part-nav workspace-project-actions" aria-label="Idea sections">${parts.map(([id, label]) => `<button type="button" data-idea-part="${id}"${ui.part === id ? ' aria-current="page"' : ''}>${label}</button>`).join('')}</nav><div class="workspace-idea-layout"><div>${renderReading(text)}<div class="workspace-idea-actions"><button type="button" class="primary" data-develop-direction="${ui.index}"${ui.saved ? ' data-saved-direction' : ''}>Develop this idea</button>${!ui.saved ? `<button type="button" data-save-direction="${ui.index}">Save for later</button>` : ''}</div></div><aside class="workspace-idea-details" aria-label="Idea at a glance"><dl><div><dt>Learning goal</dt><dd>${e(item.learning)}</dd></div><div><dt>Creative core</dt><dd>${e(item.core)}</dd></div><div><dt>Online approach</dt><dd>${e(item.online)}</dd></div></dl></aside></div>`;
  } else if (ui.screen === 'saved') {
    title = 'Saved ideas';
    const start = Math.max(
      0,
      Math.min(ui.index, Math.max(0, state.creative.alternatives.length - 1)),
    );
    body = state.creative.alternatives.length
      ? `<div class="workspace-short-list">${state.creative.alternatives
          .slice(start, start + 3)
          .map(
            (item, offset) =>
              `<article><h3>${e(item.title)}</h3><p>${e(item.description.slice(0, 140))}</p><button type="button" data-view-direction="${start + offset}" data-saved-direction>View idea</button></article>`,
          )
          .join(
            '',
          )}</div><nav class="workspace-reading-nav" aria-label="Saved ideas"><button type="button" data-saved-page="${Math.max(0, start - 3)}"${start === 0 ? ' disabled' : ''}>Earlier ideas</button><span>${start + 1}–${Math.min(start + 3, state.creative.alternatives.length)} of ${state.creative.alternatives.length}</span><button type="button" data-saved-page="${start + 3}"${start + 3 >= state.creative.alternatives.length ? ' disabled' : ''}>More ideas</button></nav>`
      : '<p>No alternatives saved yet.</p>';
  } else if (ui.screen === 'combine') {
    title = 'Combine ideas';
    body = `<p>Choose the mechanisms you want to bring together.</p><div class="workspace-combine-list">${state.creative.directions.map((item, index) => `<label><input type="checkbox" data-combine-direction="${index}"><span><strong>${e(item.title)}</strong><span>${e(item.description.slice(0, 140))}</span></span></label>`).join('')}</div><div class="workspace-project-actions"><button type="button" class="primary" data-action="combine-directions">Develop a combination</button></div>`;
  } else if (ui.screen === 'feedback') {
    title = 'What should we try next?';
    body = `<label for="creative-feedback">A preference, change, or different direction</label><textarea id="creative-feedback" data-creative-field="feedback" rows="3">${e(state.creative.feedback)}</textarea><div class="workspace-project-actions"><button type="button" class="primary" data-action="explore-directions"${ai.pending || ai.configured !== true || state.babbage.mode === 'dev' ? ' disabled' : ''}>Explore three possibilities</button></div>`;
  } else if (ui.screen === 'earlier') {
    title = 'Earlier draft';
    body = `${renderReading(state.design.previousRevision)}<div class="workspace-project-actions"><button type="button" data-action="restore-earlier">Restore this draft</button></div>`;
  } else if (ui.screen === 'maya') {
    title = 'Student perspective';
    body = `<p>Maya offers a fictional first reading of your current draft. You can keep designing without it.</p><div class="workspace-project-actions"><button type="button" class="primary" data-action="hear-maya"${!state.design.revision.trim() || ai.pending ? ' disabled' : ''}>Hear Maya’s first read</button><button type="button" data-action="${state.creative.mayaPaused ? 'resume-maya' : 'pause-maya'}">${state.creative.mayaPaused ? 'Enable student perspectives' : 'Pause student perspectives'}</button></div>`;
  } else if (ui.screen === 'review-options') {
    title = 'Keep working';
    body = `<nav class="workspace-utility-list"><button type="button" data-review-page="checks">Review checks</button><button type="button" data-action="edit-context">Edit the activity</button><button type="button" data-action="finish-workspace"${!state.finalCheck.approved ? ' disabled' : ''}>Finish with Pixel</button></nav>`;
  } else return null;
  return renderStudioPage({
    title,
    className: ui.screen === 'idea' ? 'workspace-page--idea' : '',
    content: body,
    back: '<button type="button" data-workspace-view="work">Back</button>',
    actionClass: 'workspace-view-back',
  });
}
