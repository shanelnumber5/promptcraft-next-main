import { escapeHTML as e } from '../../shared/html.js';

// One visible section chooser. Hidden buttons keep the existing controller's
// event path intact, so page navigation and saved edits behave as before.
export function renderSectionFrame(items, current, attribute, content, label) {
  const build = attribute === 'data-design-page';
  const groups = [
    ['Get started', ['start', 'subject']],
    ['Learning and learners', ['learners', 'learner-group', 'needs']],
    ['Practical details', ['time', 'requirements', 'ai-use']],
    ['Develop your idea', ['concern', 'intentions', 'presence', 'questions', 'draft']],
  ];
  const option = ([id, title]) => `<option value="${e(id)}"${id === current ? ' selected' : ''}>${e(title)}</option>`;
  const grouped = build
    ? groups.map(([name, ids]) => `<optgroup label="${e(name)}">${items.filter(([id]) => ids.includes(id)).map(option).join('')}</optgroup>`).join('')
    : items.map(option).join('');
  const targets = `<nav hidden aria-label="${e(label)} navigation targets">${items.map(([id]) => `<button type="button" ${attribute}="${e(id)}">${e(id)}</button>`).join('')}</nav>`;
  return `<div class="workspace-section-frame workspace-section-frame--simple"><div class="workspace-section-rail workspace-section-rail--simple"><label for="workspace-section-picker">${e(label)}</label><select id="workspace-section-picker" data-workspace-section-picker="${attribute}">${grouped}</select><p class="workspace-section-hint">Choose only the details that help your idea. You can return to any section.</p>${targets}</div><div class="workspace-section-main">${content}</div></div>`;
}
