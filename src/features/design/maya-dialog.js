import { characterArt } from '../../shared/character-art.js';
import { buildMayaRequest, mayaContext, mayaExcerptPreview, requestMayaResponse, normalizeMayaScene, mayaSceneBeats } from './maya-client.js';

// Session-only readings: not participant data, not a new saved/research schema.
const readings = new WeakMap();
const reviewed = new WeakMap();
const reviewContext = state => JSON.stringify([state.teacher,state.design.revision,state.workspace || null]);
export const hasMayaReview = state => reviewed.get(state) === reviewContext(state);
export function requireMayaReview(state, opener, onComplete) {
  if (hasMayaReview(state)) return onComplete();
  openMayaDialog(state, opener, {autoStart:true,onComplete});
}

export function openMayaDialog(state, opener, {autoStart=false,onComplete=null} = {}) {
  let completed = false;
  const reviewedContext = reviewContext(state);
  const context = mayaContext(state);
  const snapshot = structuredClone(state);
  const previous = readings.get(state) || [];
  const cached = previous.findLast((reading) => reading.context === context);
  const dev = state.babbage.mode === 'dev';
  const dialog = document.createElement('dialog');
  dialog.className = 'maya-dialog';
  dialog.setAttribute('aria-labelledby', 'maya-title');
  dialog.innerHTML = `<header><div><h2 id="maya-title">Maya’s first read</h2></div><button type="button" data-maya-close aria-label="Close Maya’s response">${onComplete ? 'Back to draft' : 'Close'}</button></header><div class="maya-stage"><div class="maya-actor" aria-hidden="true" hidden><img data-maya-portrait src="${characterArt.maya.neutral}" alt=""></div><div class="maya-state"><h3 data-maya-state-title>Read your draft with Maya</h3><p data-maya-state-copy>Start a reading to hear Maya’s reaction and then Pixel’s teaching perspective.</p></div><section class="maya-dialogue" aria-label="Dialogue" hidden><h3 id="maya-speaker" data-maya-speaker>Maya’s first read</h3><div data-maya-response role="region" aria-labelledby="maya-speaker" aria-live="polite" aria-atomic="true" tabindex="-1"></div></section></div><div class="maya-body"><p class="sr-only" data-maya-status role="status" aria-live="polite" aria-atomic="true"></p><nav class="maya-scene-nav" aria-label="Dialogue navigation" hidden><button type="button" data-maya-back>Back</button><button type="button" class="primary" data-maya-next>Next</button></nav><div class="maya-actions"><button type="button" class="primary" data-maya-ask>${dev ? 'Preview assignment excerpts' : 'Ask Maya to read this draft'}</button>${dev || onComplete ? '' : '<button type="button" data-maya-preview>Preview excerpts without AI</button>'}</div><details class="maya-notice"><summary>About this reading</summary><p>This is a fictional perspective, not a grade or evidence of real student learning.</p><p>${dev ? 'Dev mode uses an excerpt preview only; no API call.' : 'Ask Maya sends your assignment, design notes, and up to two earlier readings from this session to the existing PromptCraft Babbage service and OpenAI.'} Readings are not saved across refresh. Your assignment is unchanged.</p></details></div>`;
  const portrait = dialog.querySelector('[data-maya-portrait]');
  const status = dialog.querySelector('[data-maya-status]');
  const response = dialog.querySelector('[data-maya-response]');
  const ask = dialog.querySelector('[data-maya-ask]');
  const speaker = dialog.querySelector('[data-maya-speaker]');
  const actor = dialog.querySelector('.maya-actor');
  const dialogue = dialog.querySelector('.maya-dialogue');
  const stateCard = dialog.querySelector('.maya-state');
  const heading = dialog.querySelector('#maya-title');
  const showState = (kind, title, message) => {
    dialog.dataset.state = kind;
    actor.hidden=true; dialogue.hidden=true; stateCard.hidden=false; navigation.hidden=true;
    heading.textContent='Maya’s first read';
    dialog.querySelector('[data-maya-state-title]').textContent=title;
    dialog.querySelector('[data-maya-state-copy]').textContent=message;
    status.textContent=message;
    ask.hidden=kind === 'loading';
    if (kind === 'error') { ask.textContent='Retry reading'; ask.classList.add('primary'); }
  };
  const navigation = dialog.querySelector('.maya-scene-nav');
  const back = dialog.querySelector('[data-maya-back]');
  const next = dialog.querySelector('[data-maya-next]');
  let beats = [], beatIndex = 0, hasPixel = false;
  const showBeat = () => {
    const beat = beats[beatIndex];
    dialog.dataset.speaker = beat.speaker;
    dialog.dataset.emotion = beat.emotion;
    portrait.src = characterArt[beat.speaker][beat.emotion];
    heading.textContent = beat.speaker === 'maya' ? 'Maya’s first read' : 'Pixel’s perspective';
    speaker.textContent = beat.speaker === 'maya' ? 'Maya' : 'Professor Pixel';
    response.querySelectorAll('[data-dialogue-beat]').forEach((el, index) => { el.hidden = index !== beatIndex; });
    back.disabled = beatIndex === 0;
    next.textContent = beatIndex === beats.length - 1 ? (onComplete ? 'Continue to design checks' : 'Return to your draft') : 'Next';
  };
  const showScene = text => {
    const scene = normalizeMayaScene(text, snapshot.design.revision);
    if (onComplete && !scene.pixel) throw Error('The reading did not include Pixel’s explanation. Please retry before continuing to the checks.');
    hasPixel = Boolean(scene.pixel);
    beats = mayaSceneBeats(scene); beatIndex = 0;
    response.replaceChildren(...beats.map(beat => {
      const line = document.createElement('p');
      line.dataset.dialogueBeat = ''; line.textContent = beat.text; return line;
    }));
    stateCard.hidden=true; actor.hidden=false; dialogue.hidden=false; navigation.hidden=false;
    dialog.dataset.state='dialogue'; ask.hidden=Boolean(onComplete);
    ask.textContent = 'Read this draft again';
    ask.classList.remove('primary');
    response.tabIndex = 0;
    showBeat();
  };
  back.addEventListener('click', () => { if (beatIndex > 0) { beatIndex--; showBeat(); } });
  next.addEventListener('click', () => {
    if (beatIndex === beats.length - 1) {
      if (context !== mayaContext(state)) { showState('error','Your draft has changed','Return to your draft and check the latest version again.'); return; }
      completed=true; if (hasPixel) reviewed.set(state,reviewedContext); dialog.close();
    }
    else { beatIndex++; showBeat(); }
  });
  let controller;
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const stops = [...dialog.querySelectorAll('button:not(:disabled), summary, [tabindex="0"]')].filter(el => el.getClientRects().length);
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
    try { showScene(cached.response); status.textContent = 'Maya’s earlier response to this version. You decide what to use.'; }
    catch (error) { showState('error','The reading is unavailable',error.message); }
  }
  const showPreview = () => {
    portrait.src = characterArt.maya.neutral;
    controller?.abort();
    response.removeAttribute('aria-busy');
    navigation.hidden=true; stateCard.hidden=true; actor.hidden=true; dialogue.hidden=false; ask.hidden=false;
    speaker.textContent = 'Assignment excerpts';
    delete dialog.dataset.emotion; delete dialog.dataset.speaker;
    response.textContent = mayaExcerptPreview(snapshot);
    response.tabIndex = 0;
    status.textContent = 'Excerpt preview only · no AI interpretation or API call.';
    ask.disabled = false;
  };
  ask.addEventListener('click', async () => {
    if (dev && !onComplete) return showPreview();
    if (dev) { showState('error','The reading needs an AI connection','Return to your draft and use the normal AI connection to continue.'); return; }
    const requestController = new AbortController();
    controller = requestController;
    ask.disabled = true;
    portrait.src = characterArt.maya.neutral;
    response.textContent = '';
    showState('loading','Preparing Maya’s reading…','Your draft is being read. Maya’s dialogue will appear here when it is ready.');
    delete dialog.dataset.emotion; delete dialog.dataset.speaker;
    response.tabIndex = -1;
    response.setAttribute('aria-busy', 'true');
    status.textContent = 'Maya is reading this draft. You can close this window to cancel.';
    try {
      const text = await requestMayaResponse(snapshot, previous, {
        signal: AbortSignal.any([requestController.signal, AbortSignal.timeout(90000)]),
      });
      if (!dialog.open || requestController.signal.aborted) return;
      if (context !== mayaContext(state)) {
        showState('error','Your draft has changed','Return to your draft and check the latest version again.');
        return;
      }
      showScene(text);
      readings.set(state, [...previous, {
        context, response: text,
        assignment: buildMayaRequest(snapshot).messages[0].content,
      }].slice(-2));
      status.textContent = 'Your dialogue is ready. You decide what to use.';
    } catch (error) {
      if (!dialog.open || requestController.signal.aborted) return;
      const message = error.name === 'TimeoutError'
        ? 'Maya took too long. Your draft is unchanged. Try again.'
        : error instanceof TypeError ? 'The AI connection is unavailable. Your draft is saved. Retry when the service is available, or return to your draft.' : error.message;
      showState('error','Maya’s reading is unavailable',onComplete ? message.replace(' or use the excerpt preview','') : message);
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
    if (completed && onComplete) onComplete();
    else if (opener?.isConnected) opener.focus();
  }, { once: true });
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('[data-maya-close]').focus();
  if (autoStart && !cached) ask.click();
}
