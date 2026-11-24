import { renderBabbageEngine } from './loading-illustration.js';

export const loadingStage = (stage) =>
  stage === 'complete' ? 4 : stage === 'received' ? 3 : stage === 'sending' ? 1 : 2;
const stageText = (stage) =>
  ['', 'Sending your request', 'Preparing the response', 'Response received', 'Ready'][
    loadingStage(stage)
  ];
export function updateLoadingStage(root, stage) {
  const bar = root?.querySelector('.babbage-progress');
  if (!bar) return;
  const complete = stage === 'complete';
  bar.classList.toggle('is-complete', complete);
  if (complete) bar.setAttribute('aria-valuenow', '100');
  else bar.removeAttribute('aria-valuenow');
  bar.setAttribute('aria-label', stageText(stage));
  const note = root.querySelector('.babbage-loading-note');
  if (note) note.textContent = stageText(stage);
}
export function renderLoading(ai, dev) {
  const complete = ai.stage === 'complete';
  const waitingLabel = stageText(ai.stage);
  return `<div class="babbage-loading" role="status" aria-live="polite">${renderBabbageEngine()}<div class="babbage-loading-copy"><div class="babbage-loading-heading"><strong>${ai.intent === 'rubric' ? 'Creating your assignment rubric' : ai.intent === 'perspectives' ? 'Preparing Maya and Pixel’s feedback' : ai.intent === 'review' ? 'Reviewing your activity' : ai.intent === 'explore' ? 'Exploring possibilities' : ai.intent === 'revise' ? 'Preparing your revision' : 'Reviewing your assignment details'}</strong></div><div class="babbage-progress${complete ? ' is-complete' : ''}" role="progressbar" aria-label="${waitingLabel}"${complete ? ' aria-valuenow="100"' : ''}><span></span></div><span class="babbage-loading-note">${dev ? 'Dev simulation · ' : ''}${waitingLabel}</span><p>${dev ? 'Preparing the simulated response…' : complete ? 'Your response is ready to display.' : ai.stage === 'received' ? 'The response has arrived. Preparing your screen…' : 'Your work is saved. You can cancel and return to your activity.'}</p></div></div>`;
}
