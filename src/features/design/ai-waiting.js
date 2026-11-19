import { renderLoading } from './loading.js';

// One modal waiting surface keeps navigation behind it inert, with cancellation.
export function createAiWaiting({ onCancel }) {
  let dialog = null;
  return function sync(ai, dev = false) {
    if (!ai.pending) {
      if (dialog) { const current = dialog; dialog = null; current.close(); current.remove(); }
      return;
    }
    ai = { ...ai, stage: ai.stage === 'complete' ? 'received' : ai.stage };
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'ai-waiting-dialog';
      dialog.setAttribute('aria-label', 'Preparing your feedback');
      dialog.innerHTML = '<div data-ai-waiting-content></div><button type="button">Cancel and return to my work</button>';
      dialog.querySelector('button').addEventListener('click', onCancel);
      dialog.addEventListener('cancel', event => { event.preventDefault(); onCancel(); });
      document.body.append(dialog);
      dialog.querySelector('[data-ai-waiting-content]').innerHTML = renderLoading(ai, dev);
      dialog.showModal();
      dialog.querySelector('button').focus();
    } else dialog.querySelector('[data-ai-waiting-content]').innerHTML = renderLoading(ai, dev);
  };
}
