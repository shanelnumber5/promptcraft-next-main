import { currentDesignPanel } from '../features/design/panels.js';
// Highlight one available next action, including buttons enabled after typing.
export function highlightNextAction(app, state, ai) {
  app.querySelectorAll('.suggested-next').forEach((button) => {
    button.classList.remove('suggested-next');
    button.removeAttribute('aria-description');
  });
  let actions;
  if (state.phase === 'opening') actions = ['reveal-board', 'reveal-question', 'next', 'start-setup'];
  else if (state.phase === 'setup') actions = ['setup-next'];
  else if (state.phase === 'summary') actions = ['start-design'];
  else if (state.phase === 'closing') actions = ['preview-guide'];
  else if (state.designStep === 2) {
    if (ai.pending) return;
    const panel = currentDesignPanel(state);
    actions = panel === 'route' ? ['draft-route'] : panel !== 'babbage' ? ['design-next'] : !state.teacher.directions.trim()
      ? ['edit-context']
      : ai.suggestion
      ? ['apply-ai']
      : state.babbage.questions.length
        ? ['next-question', 'send-clarification', 'previous-question']
        : state.babbage.ready
            ? ['generate-ai']
            : ['ask-ai', 'use-starter', 'retry-babbage'];
  } else if (state.designStep === 4)
    actions = state.finalCheck.approved ? ['download-guide', 'approve-version'] : ['approve-version', 'read-final-directions'];
  else actions = ['design-next'];
  for (const action of actions) {
    const button = app.querySelector(action === 'draft-route' ? '.guided-route [data-design-panel="babbage"]' : `[data-action="${action}"]:not(:disabled)`);
    if (!button || button.closest('details:not([open])')) continue;
    button.classList.add('suggested-next');
    button.setAttribute('aria-description', 'Suggested next action');
    return;
  }
}
