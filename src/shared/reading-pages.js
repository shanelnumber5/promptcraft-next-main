import { escapeHTML as e } from './html.js';
import { renderAssignmentDirections } from './directions.js';

// Keep the complete text, including long paragraphs, reachable in short reading steps.
export function readingPages(text, limit = 850) {
  const pages = [];
  let page = '';
  for (const line of String(text || '').split('\n')) {
    const words = line.match(/\S+\s*/g) || [''];
    let part = '';
    for (const word of words) {
      if (part && part.length + word.length > limit) {
        if (page.trim()) pages.push(page.trim());
        pages.push(part.trim());
        page = '';
        part = '';
      }
      part += word;
    }
    if (page && page.length + part.length + 1 > limit) {
      pages.push(page.trim());
      page = '';
    }
    page += (page ? '\n' : '') + part;
  }
  if (page.trim()) pages.push(page.trim());
  return pages.length ? pages : [''];
}

export function renderReadingPages(
  text,
  { label = 'Reading', limit, render = renderAssignmentDirections } = {},
) {
  const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches;
  const pages = readingPages(text, limit || (narrow ? 300 : 850));
  return `<div class="reading-pages" data-reading-pages aria-label="${e(label)}">${pages.map((page, index) => `<div class="reading-page" data-reading-page="${index}" tabindex="-1"${index ? ' hidden' : ''}>${render(page)}</div>`).join('')}${pages.length > 1 ? `<nav class="reading-page-nav" aria-label="${e(label)} pages"><button type="button" data-reading-move="-1" disabled>Previous</button><span data-reading-count aria-live="polite">1 of ${pages.length}</span><button type="button" data-reading-move="1">Next</button></nav>` : ''}</div>`;
}

// Local reading controls never submit work or change the saved design.
export function mountReadingControls(root = document) {
  root.addEventListener('click', (event) => {
    const move = event.target.closest('[data-reading-move]');
    if (move) {
      const reader = move.closest('[data-reading-pages]');
      const pages = [...reader.querySelectorAll(':scope > [data-reading-page]')];
      const current = pages.findIndex((page) => !page.hidden);
      const next = Math.max(
        0,
        Math.min(pages.length - 1, current + Number(move.dataset.readingMove)),
      );
      pages.forEach((page, index) => {
        page.hidden = index !== next;
      });
      reader.querySelector('[data-reading-count]').textContent = `${next + 1} of ${pages.length}`;
      reader.querySelector('[data-reading-move="-1"]').disabled = next === 0;
      reader.querySelector('[data-reading-move="1"]').disabled = next === pages.length - 1;
      pages[next].focus({ preventScroll: true });
      return;
    }
    const tab = event.target.closest('[data-local-tab]');
    if (!tab) return;
    const group = tab.closest('[data-local-tabs]');
    group.dataset.selected = tab.dataset.localTab;
    group.querySelectorAll(':scope > .local-tabs button').forEach((button) => {
      button.setAttribute('aria-selected', String(button === tab));
      button.tabIndex = button === tab ? 0 : -1;
    });
    group.querySelectorAll(':scope > [data-local-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.localPanel !== tab.dataset.localTab;
    });
  });
  root.addEventListener('keydown', (event) => {
    const tab = event.target.closest('[data-local-tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...tab.parentElement.querySelectorAll('[data-local-tab]')];
    const index = tabs.indexOf(tab);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[next].click();
    tabs[next].focus();
  });
}
