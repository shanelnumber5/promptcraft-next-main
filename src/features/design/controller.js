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

// Keeps asynchronous conversation work separate from app navigation.
export function createDesignController({ app, getState, ai, render, saveSafely, syncFinalCheck }) {
  function updateClarificationAnswer(control) {
    const state = getState();
    const id = control.dataset.clarificationAnswer;
    if (!state.babbage.questions.some((q) => q.id === id)) return;
    state.babbage.answers[id] = control.value.slice(0, 24000);
    saveSafely();
    const send = app.querySelector('[data-action="send-clarification"]');
    if (send)
      send.disabled =
        ai.pending || state.babbage.questions.some((q) => !state.babbage.answers[q.id]?.trim());
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
      if (panel) panel.outerHTML = renderAiPanel(state, ai);
    }
  }

  async function askBabbage(intent = 'clarify', sendAnswers = false) {
    const state = getState();
    const dev = state.babbage.mode === 'dev';
    if (ai.pending || (!dev && ai.configured !== true) || !state.teacher.directions.trim()) return;
    syncBabbage();
    if (intent === 'revise' && !state.babbage.ready) return;
    const history = [...state.babbage.history];
    if (sendAnswers) {
      if (
        !state.babbage.questions.length ||
        state.babbage.questions.some((q) => !state.babbage.answers[q.id]?.trim())
      )
        return;
      const answers = state.babbage.questions.map((q) => ({
        question: q.text,
        answer: state.babbage.answers[q.id].trim(),
      }));
      for (const q of state.babbage.questions)
        if (['learningGoal', 'aiUse'].includes(q.field)) {
          state.teacher[q.field] = state.babbage.answers[q.id].trim();
          if (q.field === 'learningGoal') state.teacher.learningGoalUnsure = false;
          syncFinalCheck();
        }
      state.babbage.context = assignmentContext(state);
      history.push({
        role: 'user',
        content: JSON.stringify({ clarification_answers: answers }),
        display: answers.map((a) => a.question + '\n' + a.answer).join('\n\n'),
      });
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
      if (!state.teacher.learningGoal.trim() || state.teacher.learningGoalUnsure) {
        turn.questions.unshift({
          id: 'learning-goal',
          text: 'What should students learn or practice in this assignment?',
          field: 'learningGoal',
        });
        turn.ready = false;
        turn.suggestion = null;
      }
      if (!state.teacher.aiUse?.trim()) {
        turn.questions = turn.questions
          .filter((q) => !/(artificial intelligence|\bAI\b)/i.test(q.text))
          .slice(0, 2);
        turn.questions.unshift({
          id: 'ai-use',
          text: 'How much AI use are you comfortable allowing students in this assignment? For example: none, help with ideas or feedback, or AI-generated drafts. What must students do themselves, and should they explain how they used AI? If you are unsure, say what concerns you.',
          field: 'aiUse',
        });
        turn.ready = false;
        turn.suggestion = null;
      }
      state.babbage.history = [
        ...history,
        {
          role: 'assistant',
          content: JSON.stringify({
            message: turn.message,
            questions: turn.questions,
            ready: turn.ready,
          }),
          display: turn.message,
        },
      ].slice(-20);
      state.babbage.questions = turn.questions;
      state.babbage.answers = {};
      state.babbage.ready = turn.ready;
      ai.suggestion = turn.suggestion;
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
        if (state.phase === 'design' && state.designStep === 2) render();
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
    if (state.phase === 'design' && !ai.pending) render();
  }
  return { updateClarificationAnswer, syncBabbage, askBabbage, refreshBabbageConnection };
}
