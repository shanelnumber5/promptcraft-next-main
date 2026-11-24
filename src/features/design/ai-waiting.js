import { renderLoading } from './loading.js';

// One modal waiting surface keeps navigation behind it inert, with cancellation.
export function createAiWaiting({ onCancel }) {
  let dialog = null;
  let opener = null;
  const suspended = new Map();
  const restore = () => {
    for (const [element, inert] of suspended) element.inert = inert;
    suspended.clear();
    document.body.classList.remove('ai-waiting-open');
  };
  return function sync(ai, dev = false) {
    if (!ai.pending) {
      if (dialog) {
        const current = dialog;
        dialog = null;
        current.close();
        current.remove();
        restore();
        const target = opener?.isConnected ? opener : document.querySelector('#ai-title, #review-title, [aria-selected="true"]');
        target?.focus({ preventScroll: true });
      }
      return;
    }
    ai = { ...ai, stage: ai.stage === 'complete' ? 'received' : ai.stage };
    if (!dialog) {
      opener = document.activeElement;
      dialog = document.createElement('dialog');
      dialog.className = 'ai-waiting-dialog';
      dialog.setAttribute('aria-label', 'Preparing your feedback');
      dialog.innerHTML = '<div data-ai-waiting-content></div><button type="button" class="text-action">Cancel</button>';
      dialog.querySelector('button').addEventListener('click', onCancel);
      dialog.addEventListener('cancel', event => { event.preventDefault(); onCancel(); });
      document.body.append(dialog);
      for (const element of document.body.children) {
        if (element === dialog) continue;
        suspended.set(element, element.inert);
        element.inert = true;
      }
      document.body.classList.add('ai-waiting-open');
      dialog.addEventListener('close', restore, { once: true });
      dialog.querySelector('[data-ai-waiting-content]').innerHTML = renderLoading(ai, dev);
      dialog.showModal();
      dialog.querySelector('button').focus();
    } else dialog.querySelector('[data-ai-waiting-content]').innerHTML = renderLoading(ai, dev);
  };
}
