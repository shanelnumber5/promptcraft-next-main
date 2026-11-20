// Automatic first drafts are one-shot per assignment snapshot; failures stay manual.
export function createAutomaticRubric({ getState, isBusy, canStart, request, enqueue = queueMicrotask }) {
  let attemptedState = null;
  let attemptedDraft = '';
  let queued = false;
  let generation = 0;
  const eligible = state => state.design.revision.trim() && !state.creative.rubric.rows.length && state.creative.rubric.requested !== false && !(attemptedState === state && attemptedDraft === state.design.revision);
  return {
    schedule() {
      if (queued || isBusy() || !canStart() || !eligible(getState())) return;
      queued = true;
      const token = generation;
      enqueue(() => {
        queued = false;
        if (token !== generation || isBusy() || !canStart()) return;
        const state = getState();
        if (!eligible(state)) return;
        attemptedState = state;
        attemptedDraft = state.design.revision;
        void request();
      });
    },
    cancel() { generation++; queued = false; },
  };
}
