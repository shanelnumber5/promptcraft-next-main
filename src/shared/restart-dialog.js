export function confirmRestart() {
  const dialog = document.createElement('dialog');
  dialog.className = 'restart-dialog';
  dialog.setAttribute('aria-labelledby', 'restart-title');
  dialog.setAttribute('aria-describedby', 'restart-description');
  dialog.innerHTML = `
    <h2 id="restart-title">Start the module again?</h2>
    <p id="restart-description">This clears your saved answers, assignment setup, draft, and Babbage conversation in this browser. Download your guide first if you want to keep it.</p>
    <form method="dialog">
      <button type="submit" value="cancel" autofocus>Keep my work</button>
      <button type="submit" class="primary" value="restart" data-action="confirm-restart">Restart module</button>
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
