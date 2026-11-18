import { renderBabbageEngine } from './loading-illustration.js';

export const loadingStage = stage => stage==='complete'?4:stage==='received'?3:stage==='sending'?1:2;
const stageText = stage => ['','Sending your request','Preparing the response','Response received','Ready'][loadingStage(stage)];
export function updateLoadingStage(root, stage) {
 const bar=root?.querySelector('.babbage-progress');if(!bar)return;
 const step=loadingStage(stage);
 bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','4');bar.setAttribute('aria-valuenow',String(step));
 bar.setAttribute('aria-label','Step '+step+' of 4: '+stageText(stage));
 bar.style?.setProperty('--stage-width',(step*25)+'%');
 const note=root.querySelector('.babbage-loading-note');if(note)note.textContent='Step '+step+' of 4 · '+stageText(stage);
}
export function renderLoading(ai, dev) {
  const complete = ai.stage === 'complete';
  const step=loadingStage(ai.stage);
  const waitingLabel='Step '+step+' of 4 · '+stageText(ai.stage);
  return `<div class="babbage-loading" role="status" aria-live="polite">${renderBabbageEngine()}<div class="babbage-loading-copy"><div class="babbage-loading-heading"><strong>${ai.intent === 'perspectives' ? 'Preparing Maya and Pixel’s feedback' : ai.intent === 'review' ? 'Reviewing your activity' : ai.intent === 'explore' ? 'Exploring possibilities' : ai.intent === 'revise' ? 'Preparing your revision' : 'Reviewing your assignment details'}</strong><span>${dev ? 'Dev simulation' : complete ? 'Ready' : ai.intent === 'perspectives' ? 'Reading your activity' : 'Babbage is working'}</span></div><div class="babbage-progress" style="--stage-width:${step*25}%" role="progressbar" aria-label="${waitingLabel}" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${step}"><span></span></div><p>${dev ? 'Preparing the simulated response…' : complete ? 'Your response is ready to display.' : ai.stage === 'received' ? 'The response has arrived. Preparing your screen…' : 'Your work is saved. Please wait here or cancel to return to your activity.'}</p><span class="babbage-loading-note">${dev ? 'Dev simulation · ' : ''}${waitingLabel}</span></div></div>`;
}
