import { renderAssignmentDirections } from './directions.js';

export function renderPageNavigation(index, count, label = 'Section') {
  return `<nav class="document-pages" data-page-index="${index}" aria-label="${label} navigation"><button type="button" data-action="read-previous"${index === 0 ? ' disabled' : ''}>Previous</button><span>${label} ${index + 1} of ${count}</span><button type="button" data-action="read-next"${index === count - 1 ? ' disabled' : ''}>Next</button></nav>`;
}
export function renderPagedDirections(text, index = 0, { sectionSelect = false } = {}) {
  const html = renderAssignmentDirections(text);
  const pages = html.split(/(?=<h4>)/).filter(Boolean);
  const page = Math.max(0, Math.min(index, pages.length - 1));
  return `<div class="guided-document assignment-directions">${pages[page] || '<p>No directions entered yet.</p>'}</div>${pages.length > 1 ? sectionSelect ? `<nav class="document-pages" data-page-index="${page}" aria-label="Draft sections"><select data-reading-section aria-label="Draft section">${pages.map((_,i)=>`<option value="${i}"${i===page?' selected':''}>Section ${i+1} of ${pages.length}</option>`).join('')}</select></nav>` : renderPageNavigation(page, pages.length) : ''}`;
}
