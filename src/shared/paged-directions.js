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

// Full-document reading, shared with the Workspace's continuous draft approach.
export function renderScrollableDirections(text) {
  const html=renderAssignmentDirections(text);
  const titles=[];
  const content=html.replace(/<h4>([\s\S]*?)<\/h4>/g,(_,title)=>{
    const id='suggested-section-'+titles.length;
    titles.push({id,title:title.replace(/<[^>]*>/g,'')});
    return `<h4 id="${id}" tabindex="-1">${title}</h4>`;
  });
  return `${titles.length>1 ? `<nav class="draft-section-jump" aria-label="Draft sections"><label for="suggested-section-picker">Jump to a section</label><select id="suggested-section-picker" data-reading-anchor>${titles.map((item,index)=>`<option value="${item.id}">${index+1}. ${item.title}</option>`).join('')}</select></nav>` : ''}<div class="guided-document assignment-directions suggested-full-document">${content || '<p>No directions entered yet.</p>'}</div>`;
}
