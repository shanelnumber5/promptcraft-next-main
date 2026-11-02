// Native dialog owns keyboard containment and Escape. Keep removal and focus
// restoration consistent, including dialogs whose opener was re-rendered.
export function showModal(dialog, { opener = document.activeElement, fallback, onClose } = {}) {
  dialog.addEventListener('close', () => {
    dialog.remove();
    const target = opener?.isConnected ? opener : fallback?.();
    target?.focus({ preventScroll: true });
    onClose?.();
  }, { once: true });
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}
