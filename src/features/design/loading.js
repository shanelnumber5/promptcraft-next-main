import { renderBabbageEngine } from './loading-illustration.js';

const stageText = (stage) =>
  stage === 'complete'
    ? 'Response ready'
    : stage === 'received'
      ? 'Response received · preparing your screen'
      : 'Waiting for Babbage’s response';
export function updateLoadingStage(root, stage) {
  const bar = root.querySelector('.babbage-progress');
  if (!bar) return;
  const complete = stage === 'complete';
  bar.classList.toggle('is-complete', complete);
  bar.setAttribute('aria-label', stageText(stage));
  if (complete) {
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', '100');
  } else
    for (const name of ['aria-valuemin', 'aria-valuemax', 'aria-valuenow'])
      bar.removeAttribute(name);
  root.querySelector('.babbage-loading-note').textContent = stageText(stage);
  root.querySelector('.babbage-loading-heading span').textContent = complete
    ? 'Ready'
    : stage === 'received'
      ? 'Response received'
      : 'Babbage is working';
}
export function renderLoading(ai, dev) {
  const complete = ai.stage === 'complete';
  return `<div class="babbage-loading" role="status" aria-live="polite">${renderBabbageEngine()}<div class="babbage-loading-copy"><div class="babbage-loading-heading"><strong>${ai.intent === 'revise' ? 'Preparing your revision' : 'Reviewing your assignment details'}</strong><span>${dev ? 'Dev simulation' : complete ? 'Ready' : 'Babbage is working'}</span></div><div class="babbage-progress${complete ? ' is-complete' : ''}" role="progressbar" aria-label="${stageText(ai.stage)}"${complete ? ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"' : ''}><span></span></div><p>${dev ? 'Preparing the simulated response…' : 'Babbage is working through your assignment. This may take a minute.'}</p><span class="babbage-loading-note">${dev ? 'Dev simulation · ' : ''}${stageText(ai.stage)}</span></div></div>`;
}
