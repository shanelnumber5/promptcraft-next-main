import { renderLoading } from './loading.js';
import { characterArt } from '../../shared/character-art.js';
import { buildMayaRequest, mayaContext, mayaExcerptPreview, requestMayaResponse, normalizeMayaScene, mayaSceneBeats, mayaFailureHeading } from './maya-client.js';

// Session-only readings: not participant data, not a new saved/research schema.
const readings = new WeakMap();
const reviewContext = state => JSON.stringify([state.teacher,state.design.revision,state.workspace || null]);
export function mayaFeedbackReference(state) {
  const reading = readings.get(state)?.findLast(entry => entry.reviewContext === reviewContext(state));
  if (!reading) return null;
  try { return normalizeMayaScene(reading.response, state.design.revision); } catch { return null; }
}
// Prepare without opening a second loading scene. Reuse the normal session cache.
export async function prepareMayaReading(state, {signal, fetchImpl} = {}) {
  const context = mayaContext(state);
  const previous = readings.get(state) || [];
  if (previous.some(reading => reading.context === context)) return;
  const snapshot = structuredClone(state);
  const text = await requestMayaResponse(snapshot, previous, {signal, ...(fetchImpl ? {fetchImpl} : {})});
  if (context !== mayaContext(state)) throw Error('Your draft has changed. Read the latest version again.');
  readings.set(state, [...previous, {context, reviewContext:reviewContext(state), response:text,
    assignment:buildMayaRequest(snapshot).messages[0].content}].slice(-2));
}

export function openMayaDialog(state, opener, {autoStart=false,onComplete=null,novel=false,initialError=null,onReturn=null} = {}) {
  let completed = false;
  const reviewedContext = reviewContext(state);
  const context = mayaContext(state);
  const snapshot = structuredClone(state);
  const previous = readings.get(state) || [];
  const cached = previous.findLast((reading) => reading.context === context);
  const dev = state.babbage.mode === 'dev';
  const dialog = document.createElement('dialog');
  dialog.className = 'maya-dialog' + (novel ? ' maya-dialog--novel' : '') + (state.workspace ? ' maya-dialog--workspace' : '');
  if(novel) window.scrollTo({top:0,behavior:'instant'});
  if(novel) dialog.style.setProperty('--maya-header-height',(document.querySelector('.app-header')?.getBoundingClientRect().height || 80)+'px');
  dialog.setAttribute('aria-labelledby', 'maya-title');
  dialog.innerHTML = `<header>${novel ? '<span class="maya-scene-label">Student perspective</span>' : ''}<div><h2 id="maya-title" class="${novel ? 'sr-only' : ''}">Maya’s first read</h2></div><button type="button" data-maya-close aria-label="${novel ? 'Skip reading and return to explanation' : 'Close Maya’s response'}">${novel ? 'Skip reading' : onComplete ? 'Back to draft' : 'Close'}</button></header><div class="maya-stage"><div class="maya-actor" aria-hidden="true" hidden><img data-maya-portrait src="${characterArt.maya.neutral}" alt=""></div><div class="maya-state"><div data-maya-loading hidden></div><h3 data-maya-state-title>Read your draft with Maya</h3><p data-maya-state-copy>Start a reading to hear Maya’s reaction and then Pixel’s teaching perspective.</p></div><section class="maya-dialogue" aria-label="Dialogue" hidden><h3 id="maya-speaker" data-maya-speaker>Maya’s first read</h3><div data-maya-response role="region" aria-labelledby="maya-speaker" aria-live="polite" aria-atomic="true" tabindex="-1"></div></section></div><div class="maya-body"><p class="sr-only" data-maya-status role="status" aria-live="polite" aria-atomic="true"></p><nav class="maya-scene-nav" aria-label="Dialogue navigation" hidden><button type="button" data-maya-back>Back</button><button type="button" class="primary" data-maya-next>Next</button></nav><div class="maya-actions"><button type="button" class="primary" data-maya-ask>${dev ? 'Preview assignment excerpts' : 'Ask Maya to read this draft'}</button></div>${novel ? `<p class="maya-reading-note">${dev ? 'Excerpt preview only · no AI interpretation or API call.' : 'AI request: draft and notes shared with PromptCraft and OpenAI.'}</p>` : ''}</div>`;
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
    heading.textContent=novel && kind==='loading' ? 'Preparing your feedback' : 'Maya’s first read';
    const engine=dialog.querySelector('[data-maya-loading]');
    engine.hidden=!(novel && kind==='loading');
    engine.innerHTML=engine.hidden ? '' : renderLoading({pending:true,stage:'working',intent:'review'},dev);
    dialog.querySelector('[data-maya-state-title]').hidden=!engine.hidden;
    dialog.querySelector('[data-maya-state-copy]').hidden=!engine.hidden;
    dialog.querySelector('[data-maya-state-title]').textContent=title;
    dialog.querySelector('[data-maya-state-copy]').textContent=message;
    status.textContent=message;
    ask.hidden=kind === 'loading';
    if (kind === 'error') { ask.textContent='Retry reading'; ask.classList.add('primary'); }
  };
  const navigation = dialog.querySelector('.maya-scene-nav');
  const back = dialog.querySelector('[data-maya-back]');
  const next = dialog.querySelector('[data-maya-next]');
  let beats = [], beatIndex = 0;
  const showBeat = () => {
    const beat = beats[beatIndex];
    dialog.dataset.speaker = beat.speaker;
    dialog.dataset.emotion = beat.emotion;
    portrait.src = characterArt[beat.speaker][beat.emotion];
    heading.textContent = beat.speaker === 'maya' ? 'Maya’s first read' : 'Pixel’s perspective';
    speaker.textContent = beat.speaker === 'maya' ? 'Maya' : 'Professor Pixel';
    response.querySelectorAll('[data-dialogue-beat]').forEach((el, index) => { el.hidden = index !== beatIndex; });
    back.disabled = beatIndex === 0;
    next.textContent = beatIndex === beats.length - 1 ? (novel ? 'Explain the change' : onComplete ? 'Continue to design checks' : onReturn ? 'Clarify feedback' : 'Return to your draft') : novel ? 'Continue' : 'Next';
  };
  const showScene = text => {
    const scene = normalizeMayaScene(text, snapshot.design.revision);
    if (onComplete && !scene.pixel) throw Error('The reading did not include Pixel’s explanation. Please retry before continuing to the checks.');
    beats = mayaSceneBeats(scene); beatIndex = 0;
    response.replaceChildren(...beats.map(beat => {
      const line = document.createElement('p');
      line.dataset.dialogueBeat = ''; line.textContent = beat.text; return line;
    }));
    stateCard.hidden=true; actor.hidden=false; dialogue.hidden=false; navigation.hidden=false;
    dialog.dataset.state='dialogue'; ask.hidden=Boolean(onComplete) || novel;
    ask.textContent = 'Read this draft again';
    ask.classList.remove('primary');
    response.tabIndex = 0;
    showBeat();
  };
  back.addEventListener('click', () => { if (beatIndex > 0) { beatIndex--; showBeat(); } });
  next.addEventListener('click', () => {
    if (beatIndex === beats.length - 1) {
      if (context !== mayaContext(state)) { showState('error','Your draft has changed','Return to your draft and check the latest version again.'); return; }
      completed=true; dialog.close();
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
    catch (error) { showState('error',mayaFailureHeading(error),error.message); }
  }
  if (initialError && !cached) showState('error',mayaFailureHeading(initialError),initialError.message);
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
        context, reviewContext: reviewedContext, response: text,
        assignment: buildMayaRequest(snapshot).messages[0].content,
      }].slice(-2));
      status.textContent = 'Your dialogue is ready. You decide what to use.';
    } catch (error) {
      if (!dialog.open || requestController.signal.aborted) return;
      const message = error.name === 'TimeoutError'
        ? 'Maya took too long. Your draft is unchanged. Try again.'
        : error instanceof TypeError ? 'The AI connection is unavailable. Your draft is saved. Retry when the service is available, or return to your draft.' : error.message;
      showState('error',mayaFailureHeading(error),message.replace(' or use the excerpt preview',''));
    } finally {
      if (controller === requestController) {
        response.removeAttribute('aria-busy');
        ask.disabled = false;
      }
    }
  });
  dialog.querySelector('[data-maya-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    controller?.abort();
    dialog.remove();
    if (completed && onComplete) onComplete();
    else if (opener?.isConnected) opener.focus();
    else if (novel) document.getElementById('setup-title')?.focus({preventScroll:true});
    onReturn?.();
  }, { once: true });
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('[data-maya-close]').focus();
  if (autoStart && !cached && !initialError) ask.click();
}
