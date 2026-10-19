import { createGuide, loadGuideLogo } from './guide.js';
export function openGuidePreview(state, app) {
  const dialog = document.createElement('dialog');
  dialog.className = 'guide-preview';
  dialog.setAttribute('aria-label', 'Assignment guide preview');
  dialog.innerHTML =
    '<div class="guide-preview-toolbar"><strong>Assignment guide preview</strong><button type="button" aria-label="Close assignment guide preview">Close</button></div><p class="guide-preview-loading" role="status">Preparing your guide…</p><iframe title="Your assignment guide" sandbox="allow-popups allow-popups-to-escape-sandbox" hidden></iframe>';
  // Build once from a snapshot. Loading the logo must not reset an anchor click.
  const design = { ...state.design };
  const options = {
    approved: state.finalCheck.approved,
    teacher: { ...state.teacher },
  };
  loadGuideLogo().then((logo) => {
    if (!dialog.open) return;
    const frame = dialog.querySelector('iframe');
    frame.addEventListener('load', () => {
      if (!dialog.open) return;
      frame.hidden = false;
      frame.dataset.ready = 'true';
      dialog.querySelector('.guide-preview-loading')?.remove();
    }, { once: true });
    // srcdoc inherits the parent URL unless a base is set. Keep TOC links in this guide.
    frame.srcdoc = createGuide(design, { ...options, logo }).replace(
      '<head>', '<head><base href="about:srcdoc">',
    );
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    dialog.remove();
    app.querySelector('[data-action="preview-guide"]')?.focus();
  });
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('button').focus();
}
