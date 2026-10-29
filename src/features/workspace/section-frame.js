import { escapeHTML as e } from '../../shared/html.js';

// One visible section chooser. Hidden buttons keep the existing controller's
// event path intact, so page navigation and saved edits behave as before.
export function renderSectionFrame(items, current, attribute, content, label) {
  if (attribute === 'data-design-page' || attribute === 'data-review-page') {
    const buttons = items.map(([id, title]) => `<button type="button" ${attribute}="${e(id)}"${id === current ? ' aria-current="page"' : ''}>${e(title)}</button>`).join('');
    return `<div class="workspace-section-frame workspace-section-frame--sidebar"><nav class="workspace-section-sidebar" aria-label="${e(label)}">${buttons}</nav><div class="workspace-section-main">${content}</div></div>`;
  }
  const options = items.map(([id, title]) => `<option value="${e(id)}"${id === current ? ' selected' : ''}>${e(title)}</option>`).join('');
  const targets = `<nav hidden aria-label="${e(label)} navigation targets">${items.map(([id]) => `<button type="button" ${attribute}="${e(id)}">${e(id)}</button>`).join('')}</nav>`;
  return `<div class="workspace-section-frame workspace-section-frame--simple"><div class="workspace-section-rail workspace-section-rail--simple"><label for="workspace-section-picker">${e(label)}</label><select id="workspace-section-picker" data-workspace-section-picker="${attribute}">${options}</select>${targets}</div><div class="workspace-section-main">${content}</div></div>`;
}
