import { rubricForState, downloadRubric } from '../workspace/rubric.js';
import { savedFeedbackNotes } from './feedback-conversation.js';
import { createGuide } from './guide.js';
import { showModal } from '../../shared/modal.js';
export function openGuidePreview(state, app, { onClose = null } = {}) {
  const dialog = document.createElement('dialog');
  dialog.className = 'guide-preview';
  dialog.setAttribute('aria-label', 'Course Guide preview');
  dialog.innerHTML =
    '<header class="guide-preview-toolbar"><strong>Course Guide preview</strong><button type="button" data-guide-close aria-label="Close assignment guide preview">Close</button></header><nav class="guide-preview-sections" aria-label="Guide sections"></nav><iframe title="Your assignment guide" sandbox="allow-downloads allow-popups allow-popups-to-escape-sandbox"></iframe><footer class="guide-preview-actions"><button type="button" data-guide-back>Previous section</button><span data-guide-page></span><button type="button" data-guide-next>Next section</button></footer>';
  const download = document.createElement('button');
  download.type = 'button';
  download.textContent = 'Download Canvas rubric template';
  download.disabled = !state.creative.rubric?.rows.length;
  download.addEventListener('click', () => downloadRubric(rubricForState(state), 'csv'));
  dialog
    .querySelector('.guide-preview-toolbar')
    .insertBefore(download, dialog.querySelector('[data-guide-close]'));
  const html = createGuide(
    { ...state.design },
    {
      approved: state.finalCheck.approved,
      teacher: { ...state.teacher },
      workspace: state.workspace ? { ...state.workspace } : null,
      conversationNotes: savedFeedbackNotes(state),
      rubric: rubricForState(state),
    },
  );
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const sections = [...parsed.querySelectorAll('.guide-section')];
  let page = 0;
  const tabs = dialog.querySelector('.guide-preview-sections');
  sections.forEach((section, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent =
      section.querySelector('h2')?.textContent?.replace(/ · (Draft|Approved version)$/, '') ||
      'Section ' + (index + 1);
    button.addEventListener('click', () => {
      page = index;
      render();
    });
    tabs.append(button);
  });
  function render() {
    [...tabs.children].forEach((button, index) =>
      button.setAttribute('aria-current', index === page ? 'page' : 'false'),
    );
    dialog.querySelector('iframe').srcdoc =
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
