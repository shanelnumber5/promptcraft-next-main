import { renderAssignmentDirections } from './directions.js';

export function renderPageNavigation(index, count, label = 'Section') {
  return `<nav class="document-pages" data-page-index="${index}" aria-label="${label} navigation"><button type="button" data-action="read-previous"${index === 0 ? ' disabled' : ''}>Previous</button><span>${label} ${index + 1} of ${count}</span><button type="button" data-action="read-next"${index === count - 1 ? ' disabled' : ''}>Next</button></nav>`;
}
export function renderPagedDirections(text, index = 0) {
  const html = renderAssignmentDirections(text);
  const pages = html.split(/(?=<h4>)/).filter(Boolean);
  const page = Math.max(0, Math.min(index, pages.length - 1));
  return `<div class="guided-document assignment-directions">${pages[page] || '<p>No directions entered yet.</p>'}</div>${pages.length > 1 ? renderPageNavigation(page, pages.length) : ''}`;
}
