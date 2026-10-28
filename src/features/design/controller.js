import { updateLoadingStage } from './loading.js';
import { aiContext, renderAiPanel } from './conversation-view.js';
import {
  conversationDefaults,
  assignmentContext,
  checkBabbage,
  requestBabbageTurn,
  devBabbageTurn,
} from './babbage-client.js';
import { syncDraftAssignment } from './content.js';
import { answerIssue } from './input-quality.js';
import {
  applyBabbageTurn,
  hasCompleteClarificationAnswers,
  prepareClarificationAnswers,
} from './turn-state.js';
import { highlightNextAction } from '../../shared/next-action.js';

// Keeps asynchronous conversation work separate from app navigation.
export function createDesignController({ app, getState, ai, render, saveSafely, syncFinalCheck }) {
  function updateClarificationAnswer(control) {
    const state = getState();
    const id = control.dataset.clarificationAnswer;
    if (!state.babbage.questions.some((q) => q.id === id)) return;
    state.babbage.answers[id] = control.value.slice(0, 24000);
    saveSafely();
    const send = app.querySelector('[data-action="send-clarification"]');
    if (send) send.disabled = ai.pending || (state.babbage.mode !== 'dev' && ai.configured !== true) || !hasCompleteClarificationAnswers(state.babbage);
    const guidance = app.querySelector('.answer-guidance');
    if (guidance) guidance.textContent = hasCompleteClarificationAnswers(state.babbage) ? 'Ready to send.' : 'Please answer each question before continuing.';
    highlightNextAction(app, state, ai);
  }

  function moveQuestion(delta) {
    const state = getState();
    const current = state.babbage.questions[state.babbage.questionIndex || 0];
    if (ai.pending || !current) return;
    if (delta > 0 && answerIssue(state.babbage.answers[current.id] || '')) return;
    state.babbage.questionIndex = Math.max(0, Math.min(
      state.babbage.questions.length - 1, (state.babbage.questionIndex || 0) + delta,
    ));
    saveSafely();
    render();
    const control = app.querySelector('[data-clarification-answer]');
    control?.focus({ preventScroll: true });
    control?.closest('.babbage-questions')?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }

  function syncBabbage() {
    const state = getState();
    if (syncDraftAssignment(state.teacher, state.design)) syncFinalCheck();
    const context = assignmentContext(state);
    if (state.babbage.context !== context) {
      state.babbage = { ...conversationDefaults(), mode: state.babbage.mode, context };
      ai.suggestion = null;
      app.querySelector('.ai-suggestion')?.remove();
      const panel = app.querySelector('.ai-panel');
      if (panel) {
        if (state.workspace) render();
        else panel.outerHTML = renderAiPanel(state, ai, { compact: true });
      }
    }
  }

  async function askBabbage(intent = 'clarify', sendAnswers = false) {
    const state = getState();
    const dev = state.babbage.mode === 'dev';
    if (ai.pending || (!dev && ai.configured !== true) || !state.teacher.directions.trim()) return;
    syncBabbage();
    if (intent === 'revise' && !state.babbage.ready) return;
    const history = [...state.babbage.history];
    let autoDraft = false;
    if (sendAnswers) {
      const clarification = prepareClarificationAnswers(state.babbage, state.teacher);
      if (!clarification) return;
      if (clarification.hasTeacherFieldAnswers) syncFinalCheck();
      state.babbage.context = assignmentContext(state);
      history.push(clarification.historyEntry);
    }
    ai.pending = true;
    ai.requestController = new AbortController();
    ai.stage = 'waiting';
    ai.intent = intent;
    const started = performance.now();
    const keepLoadingVisible = () =>
      new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, 900 - (performance.now() - started))),
      );
    ai.error = '';
    ai.suggestion = null;
    ai.context = aiContext(state);
    const context = ai.context;
    const requestState = { ...state, babbage: { ...state.babbage, history } };
    render();
    app
      .querySelector('.babbage-loading')
      ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    try {
      const turn = dev
        ? devBabbageTurn(requestState, intent)
        : await requestBabbageTurn(requestState, intent, {
            signal: AbortSignal.any([ai.requestController.signal, AbortSignal.timeout(90000)]),
          });
      if (state !== getState()) return;
      ai.stage = 'received';
      updateLoadingStage(app, ai.stage);
      await keepLoadingVisible();
      if (state !== getState()) return;
      if (context !== aiContext(state)) {
        ai.error =
          'Your assignment changed while Babbage was working. Ask again to use the latest details.';
        return;
      }
      ai.suggestion = applyBabbageTurn(state.babbage, history, turn, state.teacher);
      autoDraft = intent === 'clarify' && state.babbage.ready && !state.babbage.questions.length;
      state.designReadPage = 0;
      if (intent === 'revise') ai.error = turn.message;
      ai.stage = 'complete';
      updateLoadingStage(app, ai.stage);
      await new Promise((resolve) => setTimeout(resolve, 400));
    } catch (error) {
      if (state !== getState()) return;
      ai.error =
        error.name === 'TimeoutError'
          ? 'Babbage took too long to respond. Your draft is unchanged; try again.'
          : error instanceof TypeError
            ? 'The Babbage connection is unavailable. Retry or use the labeled Dev fallback.'
            : error.message;
    } finally {
      await keepLoadingVisible();
      if (state === getState()) {
        ai.pending = false;
        ai.requestController = null;
        saveSafely();
        if (autoDraft && state.phase === 'design' && state.designStep === 2 && state.designPanel === 'babbage') {
          queueMicrotask(() => { if (state === getState() && !ai.pending && state.designPanel === 'babbage') void askBabbage('revise'); });
        }
        if (state.phase === 'design' && state.designStep === 2) {
          if (state.designPanel === 'revision') {
            // A response must not replace the editor DOM while the educator is typing.
            app.querySelector('.babbage-loading')?.remove();
            const status = app.querySelector('.ai-status');
            if (status) status.textContent = ai.error;
            const next = app.querySelector('[data-action="design-next"]');
            if (next) next.disabled = !state.design.revision.trim();
            highlightNextAction(app, state, ai);
            return;
          }
          const restoreFocus = app.contains?.(document.activeElement) || document.activeElement === document.body;
          render();
          if (restoreFocus && state.designPanel === 'babbage')
            app.querySelector('[data-clarification-answer], [data-action="apply-ai"], [data-action="generate-ai"], [data-action="ask-ai"]')?.focus({ preventScroll: true });
        }
      }
    }
  }

  async function refreshBabbageConnection() {
    const state = getState();
    ai.configured = null;
    try {
      ai.configured = await checkBabbage({ signal: AbortSignal.timeout(10000) });
    } catch {
      ai.configured = false;
    }
    if (state === getState() && state.phase === 'design' && !ai.pending && (!state.workspace || state.designPanel === 'babbage')) render();
  }
  return { updateClarificationAnswer, moveQuestion, syncBabbage, askBabbage, refreshBabbageConnection };
}
