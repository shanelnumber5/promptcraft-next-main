import { buildMayaRequest, mayaContext, mayaExcerptPreview, requestMayaResponse } from './maya-client.js';

// Session-only readings: not participant data, not a new saved/research schema.
const readings = new WeakMap();

export function openMayaDialog(state, opener) {
  const context = mayaContext(state);
  const snapshot = structuredClone(state);
  const previous = readings.get(state) || [];
  const cached = previous.findLast((reading) => reading.context === context);
  const dev = state.babbage.mode === 'dev';
  const dialog = document.createElement('dialog');
  dialog.className = 'maya-dialog';
  dialog.setAttribute('aria-labelledby', 'maya-title');
  dialog.innerHTML = `<header><img src="assets/characters/maya/neutral.png" alt="" width="64" height="80"><div><h2 id="maya-title">A first read with Maya</h2><p>Simulated student perspective · optional</p></div><button type="button" data-maya-close aria-label="Close Maya’s response">Close</button></header><div class="maya-body"><p>Maya reads your original assignment and current revision. This is a fictional perspective, not a grade or evidence of real student learning.</p><p>${dev ? 'Dev mode uses an excerpt preview only; no API call.' : 'Ask Maya sends your assignment, design notes, and up to two earlier Maya readings from this session to the existing PromptCraft Babbage service and OpenAI.'} Responses are not saved across refresh; your assignment and rationale still are.</p><p data-maya-status role="status" aria-live="polite" aria-atomic="true"></p><div data-maya-response class="conversation-text" role="region" aria-label="Maya’s response" tabindex="-1"></div><div class="maya-actions"><button type="button" class="primary" data-maya-ask>${dev ? 'Preview assignment excerpts' : 'Ask Maya to read this draft'}</button>${dev ? '' : '<button type="button" data-maya-preview>Preview excerpts without AI</button>'}</div></div>`;
  const status = dialog.querySelector('[data-maya-status]');
  const response = dialog.querySelector('[data-maya-response]');
  const ask = dialog.querySelector('[data-maya-ask]');
  let controller;
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const stops = [...dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
    const first = stops[0], last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  if (cached) {
    response.textContent = cached.response;
    response.tabIndex = 0;
    status.textContent = 'Maya’s earlier response to this version. You decide what to use.';
  }
  const showPreview = () => {
    controller?.abort();
    response.removeAttribute('aria-busy');
    response.textContent = mayaExcerptPreview(snapshot);
    response.tabIndex = 0;
    status.textContent = 'Excerpt preview only · no AI interpretation or API call.';
    ask.disabled = false;
  };
  ask.addEventListener('click', async () => {
    if (dev) return showPreview();
    const requestController = new AbortController();
    controller = requestController;
    ask.disabled = true;
    response.textContent = '';
    response.tabIndex = -1;
    response.setAttribute('aria-busy', 'true');
    status.textContent = 'Maya is reading this draft. You can close this window to cancel.';
    try {
      const text = await requestMayaResponse(snapshot, previous, {
        signal: AbortSignal.any([requestController.signal, AbortSignal.timeout(90000)]),
      });
      if (!dialog.open || requestController.signal.aborted) return;
      if (context !== mayaContext(state)) {
        status.textContent = 'Your assignment changed. Close this window and ask Maya to read the latest draft.';
        return;
      }
      response.textContent = text;
      response.tabIndex = 0;
      readings.set(state, [...previous, {
        context, response: text,
        assignment: buildMayaRequest(snapshot).messages[0].content,
      }].slice(-2));
      status.textContent = 'Maya’s response is ready below. You decide what to use.';
    } catch (error) {
      if (!dialog.open || requestController.signal.aborted) return;
      status.textContent = error.name === 'TimeoutError'
        ? 'Maya took too long. Your draft is unchanged. Try again.'
        : error instanceof TypeError ? 'Maya’s connection is unavailable. Your draft is unchanged. Try again or preview excerpts.' : error.message;
    } finally {
      if (controller === requestController) {
        response.removeAttribute('aria-busy');
        ask.disabled = false;
      }
    }
  });
  dialog.querySelector('[data-maya-preview]')?.addEventListener('click', showPreview);
  dialog.querySelector('[data-maya-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    controller?.abort();
    dialog.remove();
    if (opener?.isConnected) opener.focus();
  }, { once: true });
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('[data-maya-close]').focus();
}
