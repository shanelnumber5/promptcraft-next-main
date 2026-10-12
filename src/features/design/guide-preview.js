import { createGuide, loadGuideLogo } from './guide.js';
export function openGuidePreview(state, app) {
  const dialog = document.createElement('dialog');
  dialog.className = 'guide-preview';
  dialog.setAttribute('aria-label', 'Assignment guide preview');
  dialog.innerHTML =
    '<div class="guide-preview-toolbar"><strong>Assignment guide preview</strong><button type="button">Close preview</button></div><iframe title="Your assignment guide" sandbox=""></iframe>';
  dialog.querySelector('iframe').srcdoc = createGuide(state.design, {
    approved: state.finalCheck.approved,
    teacher: state.teacher,
  });
  loadGuideLogo().then((logo) => {
    if (dialog.open)
      dialog.querySelector('iframe').srcdoc = createGuide(state.design, {
        approved: state.finalCheck.approved,
        logo,
        teacher: state.teacher,
      });
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
