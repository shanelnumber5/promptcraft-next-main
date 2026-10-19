import { renderAssignmentDirections } from './directions.js';

// Group the escaped, rendered document by headings; never split a list across columns.
export function renderReviewDirections(text) {
  const html = renderAssignmentDirections(text);
  const blocks = html.split(/(?=<h4>)/).filter(Boolean);
  if (blocks.length < 2) return html;
  const columns = Math.min(3, Math.max(1, blocks.length - (blocks.length >= 4 ? 2 : 1)));
  return `<div class="review-document" style="--review-columns:${columns}">${blocks.map((block, index) => `<div class="review-document-block${index === 0 ? ' review-document-block--intro' : blocks.length >= 4 && index === blocks.length - 1 ? ' review-document-block--wide' : ''}">${block}</div>`).join('')}</div>`;
}
