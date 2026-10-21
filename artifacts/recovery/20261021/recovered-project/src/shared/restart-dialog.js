import { escapeHTML as e } from './html.js';
export function confirmRestart({ title = 'Start the module again?', description = 'This clears your saved answers, assignment setup, draft, and Babbage conversation in this browser. Download your guide first if you want to keep it.', confirmLabel = 'Restart module' } = {}) {
  const dialog = document.createElement('dialog');
  dialog.className = 'restart-dialog';
  dialog.setAttribute('aria-labelledby', 'restart-title');
  dialog.setAttribute('aria-describedby', 'restart-description');
  dialog.innerHTML = `
    <h2 id="restart-title">${e(title)}</h2>
    <p id="restart-description">${e(description)}</p>
    <form method="dialog">
      <button type="submit" value="cancel" autofocus>Keep my work</button>
      <button type="submit" class="primary" value="restart" data-action="confirm-restart">${e(confirmLabel)}</button>
    </form>`;
  document.body.append(dialog);
  return new Promise((resolve) => {
    dialog.addEventListener(
      'close',
      () => {
        const confirmed = dialog.returnValue === 'restart';
        dialog.remove();
        resolve(confirmed);
      },
      { once: true },
    );
    dialog.showModal();
  });
}
