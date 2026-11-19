import { createGuide, guideOptions, downloadGuideHTML } from './guide.js';
import { showModal } from '../../shared/modal.js';

export function openGuidePreview(state, app, { onClose = null } = {}) {
  const dialog = document.createElement('dialog');
  dialog.className = 'guide-preview';
  dialog.setAttribute('aria-label', 'Course Guide preview');
  dialog.innerHTML =
    '<header class="guide-preview-toolbar"><strong>Course Guide preview</strong><button type="button" data-guide-download>Download guide</button><button type="button" data-guide-close aria-label="Close assignment guide preview">Close</button></header><div class="guide-preview-section-picker"><label for="guide-section">Guide section</label><select id="guide-section" aria-controls="guide-preview-content"></select></div><iframe id="guide-preview-content" title="Your assignment guide" sandbox="allow-downloads allow-popups allow-popups-to-escape-sandbox"></iframe><footer class="guide-preview-actions"><button type="button" data-guide-back>Previous section</button><span data-guide-page aria-live="polite"></span><button type="button" data-guide-next>Next section</button></footer>';
  // Use one immutable snapshot for every preview section and the complete download.
  const html = createGuide({ ...state.design }, guideOptions(state));
  dialog
    .querySelector('[data-guide-download]')
    .addEventListener('click', () => downloadGuideHTML(html));
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const sections = [...parsed.querySelectorAll('.guide-section')];
  const picker = dialog.querySelector('select');
  const frame = dialog.querySelector('iframe');
  let page = 0;
  sections.forEach((section, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent =
      section.querySelector('h2')?.textContent?.replace(/ · (Draft|Approved version)$/, '') ||
      'Section ' + (index + 1);
    picker.append(option);
  });
  frame.addEventListener('load', () => {
    frame.dataset.ready = 'true';
  });
  function render() {
    delete frame.dataset.ready;
    picker.value = String(page);
    frame.srcdoc =
      '<!doctype html><html lang="en"><head><base href="about:srcdoc"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      parsed.head.querySelector('style').outerHTML +
      '<style>body{padding:20px;background:#fff}main{max-width:80ch;margin:auto}main:has(.assignment-rubric){max-width:none}.guide-section{margin:0}.guide-section>section,.assignment-content{padding:20px}.guide-section>section.assignment{padding:0}</style></head><body class="workspace-guide"><main>' +
      sections[page].outerHTML +
      '</main></body></html>';
    dialog.querySelector('[data-guide-back]').disabled = page === 0;
    dialog.querySelector('[data-guide-next]').textContent =
      page === sections.length - 1 ? 'Close' : 'Next section';
    dialog.querySelector('[data-guide-page]').textContent =
      'Section ' + (page + 1) + ' of ' + sections.length;
  }
  picker.addEventListener('change', () => {
    page = Number(picker.value);
    render();
  });
  dialog.querySelector('[data-guide-back]').addEventListener('click', () => {
    if (page > 0) {
      page--;
      render();
    }
  });
  dialog.querySelector('[data-guide-next]').addEventListener('click', () => {
    if (page < sections.length - 1) {
      page++;
      render();
    } else dialog.close();
  });
  dialog.querySelector('[data-guide-close]').addEventListener('click', () => dialog.close());
  if (onClose) dialog.addEventListener('close', onClose, { once: true });
  render();
  showModal(dialog, { fallback: () => app.querySelector('[data-action="preview-guide"]') });
  dialog.querySelector('[data-guide-close]').focus();
}
