import { createDesignController } from '../features/design/controller.js';
import { openGuidePreview } from '../features/design/guide-preview.js';
import { renderClosing } from '../features/design/closing.js';
import { discussionOpening as scenario } from '../features/opening/content.js';
import { teacherSetup } from '../features/setup/content.js';
import { renderScene } from '../features/opening/screen.js';
import { renderTeacherStep, renderTeacherSummary, applyExample } from '../features/setup/screen.js';
import { renderDesign } from '../features/design/screen.js';
import { aiContext } from '../features/design/conversation-view.js';
import { conversationDefaults, assignmentContext } from '../features/design/babbage-client.js';
import { downloadGuide, loadGuideLogo } from '../features/design/guide.js';
import {
  starterDraft,
  hasStarterExchange,
  designSteps,
  finalCheckDefaults,
  finalCheckContext,
  finalCheckReady,
  syncDraftAssignment,
} from '../features/design/content.js';
import { loadState, saveState, clearState, initialState, sceneReady } from './storage.js';
import { confirmRestart } from '../shared/restart-dialog.js';

const app = document.getElementById('app');
app.addEventListener('submit', (event) => event.preventDefault());
let state,
  summarySection = 0;
const ai = { configured: null, pending: false, suggestion: null, error: '', context: '' };
function positionPixelTag() {
  const pixel = app.querySelector('.character--right');
  const pixelImage = pixel?.querySelector('img'),
    pixelTag = pixel?.querySelector('figcaption');
  if (pixelImage && pixelTag && !pixelImage.hidden) {
    const frame = pixel.getBoundingClientRect(),
      image = pixelImage.getBoundingClientRect();
    pixelTag.style.left = `${image.left + image.width * 0.56 - frame.left}px`;
  }
}
new ResizeObserver(() => requestAnimationFrame(positionPixelTag)).observe(app);
try {
  state = loadState(scenario);
} catch {
  state = {
    ...initialState(scenario),
    saveNotice: 'Browser storage is unavailable. This opening still works.',
  };
}
if (new URLSearchParams(window.location?.search || '').get('mockBabbage') === '1')
  state.babbage = { ...conversationDefaults(), mode: 'dev', context: assignmentContext(state) };
const { updateClarificationAnswer, syncBabbage, askBabbage, refreshBabbageConnection } =
  createDesignController({ app, getState: () => state, ai, render, saveSafely, syncFinalCheck });
const restartButton = document.querySelector('[data-action="restart-module"]');
restartButton?.addEventListener('click', async () => {
  if (!(await confirmRestart())) {
    restartButton.focus();
    return;
  }
  const mode = state.babbage.mode;
  ai.requestController?.abort();
  clearState();
  state = initialState(scenario);
  state.babbage = { ...conversationDefaults(), mode, context: assignmentContext(state) };
  summarySection = 0;
  Object.assign(ai, {
    pending: false,
    suggestion: null,
    error: '',
    context: '',
    stage: '',
    intent: '',
  });
  saveSafely();
  render({ focus: true });
});
const index = () => scenario.scenes.findIndex((s) => s.id === state.sceneId);
function render({ focus = false, choiceFocus = null } = {}) {
  app.innerHTML =
    state.phase === 'closing'
      ? renderClosing(state)
      : state.phase === 'design'
        ? renderDesign(state, ai)
        : state.phase === 'summary'
          ? renderTeacherSummary(teacherSetup, state.teacher, state.saveNotice, summarySection)
          : state.phase === 'setup'
            ? renderTeacherStep(teacherSetup, state.setupStep, state.teacher, state.saveNotice)
            : renderScene(scenario, scenario.scenes[index()], state, index());
  app.querySelectorAll('[data-character]').forEach((img) =>
    img.addEventListener('error', () => {
      img.hidden = true;
      img.closest('figure').classList.add('art-unavailable');
    }),
  );
  app
    .querySelectorAll('[data-character]')
    .forEach((img) => img.addEventListener('load', positionPixelTag, { once: true }));
  requestAnimationFrame(positionPixelTag);
  if (choiceFocus)
    app.querySelector(`input[value="${choiceFocus}"]`)?.focus({ preventScroll: true });
  else if (focus) {
    document
      .getElementById(state.phase === 'opening' ? 'scene-title' : 'setup-title')
      ?.focus({ preventScroll: true });
    app.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
function move(delta) {
  if (delta > 0 && !sceneReady(scenario.scenes[index()], state)) return;
  const next = Math.max(0, Math.min(scenario.scenes.length - 1, index() + delta));
  state.sceneId = scenario.scenes[next].id;
  if (next === scenario.scenes.length - 1) state.completed = true;
  saveSafely();
  render({ focus: true });
}
function saveSafely() {
  try {
    saveState(state);
  } catch {
    state.saveNotice = 'Progress cannot be saved. You can still continue.';
  }
}
app.addEventListener('change', (event) => {
  if (event.target.dataset?.clarificationAnswer) {
    updateClarificationAnswer(event.target);
    return;
  }
  if (event.target.matches('[data-final-check]')) {
    syncFinalCheck();
    const key = event.target.dataset.finalCheck;
    if (!['instructions', 'learning', 'requirements'].includes(key)) return;
    state.finalCheck[key] = event.target.checked;
    state.finalCheck.completed = false;
    state.finalCheck.approved = false;
    saveSafely();
    const next = app.querySelector('[data-action="approve-version"]');
    next.disabled = !finalCheckReady(state);
    next.querySelector('span').textContent = 'Go to assignment guide';
    const download = app.querySelector('[data-action="download-guide"]');
    if (download) download.disabled = true;
    const guideHint = app.querySelector('.guide-access-actions p');
    if (guideHint)
      guideHint.textContent = 'Complete the three checks, then go to your assignment guide.';
    app.querySelector('.final-check-status').textContent = finalCheckReady(state)
      ? 'All three points are checked. Select Go to assignment guide to save your checks and continue.'
      : 'Check each point after reviewing the directions.';
    return;
  }
  if (event.target.closest('[data-design-form]')) {
    updateDesignField(event.target);
    return;
  }
  if (event.target.closest('[data-setup-form]')) {
    updateTeacherField(event.target);
    saveSafely();
    return;
  }
  if (event.target.name !== 'scene-choice') return;
  const scene = scenario.scenes[index()],
    answer = event.target.value;
  if (!scene.choice.options.some((o) => o.id === answer)) return;
  state.answers[scene.id] = answer;
  saveSafely();
  // Keep the live region and the focused radio in place when feedback changes.
  app
    .querySelectorAll('.choice')
    .forEach((label) =>
      label.classList.toggle('is-selected', label.querySelector('input').value === answer),
    );
  const feedback = document.getElementById('choice-feedback');
  feedback.classList.add('has-feedback');
  feedback.textContent = scene.choice.options.find((o) => o.id === answer).feedback;
  app.querySelector('[data-action="next"]').disabled = !sceneReady(scene, state);
  app.querySelector('.navigation-hint').textContent = sceneReady(scene, state)
    ? 'Take your time. Nothing is timed.'
    : 'Use the feedback to find a useful concern.';
  app.querySelector('.save-notice').textContent = state.saveNotice;
});
app.addEventListener('input', (event) => {
  if (event.target.dataset?.clarificationAnswer) {
    updateClarificationAnswer(event.target);
    return;
  }
  if (event.target.closest('[data-design-form]')) {
    updateDesignField(event.target);
    return;
  }
  if (
    !event.target.closest('[data-setup-form]') ||
    !['INPUT', 'TEXTAREA'].includes(event.target.tagName)
  )
    return;
  updateTeacherField(event.target);
  saveSafely();
});

function updateDesignField(control) {
  if (!Object.hasOwn(state.design, control.name)) return;
  state.design[control.name] = control.value;
  syncFinalCheck();
  syncBabbage();
  saveSafely();
  const notice = app.querySelector('.save-notice');
  if (notice) notice.textContent = state.saveNotice;
  const copy = app.querySelector('[data-action="copy-draft"]');
  if (copy) copy.disabled = !state.design.revision.trim();
  if (ai.suggestion && ai.context !== aiContext(state)) {
    ai.suggestion = null;
    ai.error = 'Your draft changed. Ask Babbage again to use the latest version.';
    app.querySelector('.ai-suggestion')?.remove();
    const status = app.querySelector('.ai-status');
    if (status) status.textContent = ai.error;
  }
}

function moveDesign(delta) {
  if (delta > 0 && ai.pending) return;
  if (delta > 0 && state.designStep === 2 && ai.suggestion) {
    ai.error =
      'Choose Use these directions in my draft to include the suggestion in your review, or Keep my draft to review your current directions.';
    render();
    app.querySelector('.ai-suggestion')?.scrollIntoView({ block: 'nearest' });
    return;
  }
  if (delta < 0 && state.designStep === 0) {
    state.phase = 'summary';
  } else state.designStep = Math.max(0, Math.min(designSteps.length - 1, state.designStep + delta));
  syncFinalCheck();
  syncBabbage();
  saveSafely();
  render({ focus: true });
}
async function copyDraft() {
  const notice = app.querySelector('.design-notice');
  try {
    await navigator.clipboard.writeText(state.design.revision);
    notice.textContent = 'Revised directions copied.';
  } catch {
    notice.textContent =
      'Copy is unavailable here. Use Back to select and copy the draft from its text box.';
  }
}
function updateTeacherField(control) {
  if (!control.name || !(control.name in state.teacher)) return;
  state.teacher[control.name] = control.type === 'checkbox' ? control.checked : control.value;
  syncDraftAssignment(state.teacher, state.design);
  syncFinalCheck();
  syncBabbage();
}
function syncFinalCheck() {
  const context = finalCheckContext(state.teacher, state.design);
  if (state.finalCheck.context !== context) state.finalCheck = { ...finalCheckDefaults(), context };
}
function startSetup() {
  state.phase = 'setup';
  state.setupStep = 0;
  state.completed = true;
  saveSafely();
  render({ focus: true });
}
function moveSetup(delta) {
  if (delta < 0 && state.setupStep === 0) {
    state.phase = 'opening';
    state.sceneId = scenario.scenes.at(-1).id;
    saveSafely();
    return render({ focus: true });
  }
  if (delta > 0 && state.setupStep === teacherSetup.steps.length - 1) {
    state.phase = 'summary';
    saveSafely();
    return render({ focus: true });
  }
  state.setupStep = Math.max(0, Math.min(teacherSetup.steps.length - 1, state.setupStep + delta));
  saveSafely();
  render({ focus: true });
}
app.addEventListener('click', async (event) => {
  const summaryTarget = event.target.closest('[data-summary-section]');
  if (summaryTarget) {
    summarySection = Number(summaryTarget.dataset.summarySection);
    render();
    document.querySelector(`[data-summary-section="${summarySection}"]`)?.focus();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'next') move(1);
  else if (action === 'back') move(-1);
  else if (action === 'start-setup') startSetup();
  else if (action === 'start-design') {
    state.phase = 'design';
    saveSafely();
    render({ focus: true });
  } else if (action === 'return-assignment') {
    state.phase = 'design';
    state.designStep = 4;
    saveSafely();
    render({ focus: true });
  } else if (action === 'design-next') moveDesign(1);
  else if (action === 'design-back') moveDesign(-1);
  else if (action === 'ask-ai') await askBabbage();
  else if (action === 'send-clarification') await askBabbage('clarify', true);
  else if (action === 'generate-ai') await askBabbage('revise');
  else if (action === 'toggle-dev') {
    if (ai.pending) return;
    state.babbage = {
      ...conversationDefaults(),
      mode: state.babbage.mode === 'dev' ? 'live' : 'dev',
      context: assignmentContext(state),
    };
    ai.suggestion = null;
    ai.error = '';
    saveSafely();
    render();
    if (state.babbage.mode === 'live' && ai.configured === null) await refreshBabbageConnection();
  } else if (action === 'retry-babbage') await refreshBabbageConnection();
  else if (action === 'dismiss-ai') {
    ai.suggestion = null;
    ai.error = 'Your draft is unchanged.';
    render();
  } else if (action === 'apply-ai') {
    if (!ai.suggestion) return;
    if (ai.context !== aiContext(state)) {
      ai.suggestion = null;
      ai.error = 'Your assignment changed. Ask Babbage again before applying a suggestion.';
      render();
      return;
    }
    state.design.revision = ai.suggestion.revision;
    state.design.reason = ai.suggestion.reason;
    ai.suggestion = null;
    ai.error = 'Suggestion applied. You can edit it below, then review and approve it.';
    syncFinalCheck();
    syncBabbage();
    saveSafely();
    render();
    document.getElementById('revision')?.focus({ preventScroll: true });
  } else if (action === 'read-final-directions' || action === 'return-final-checks') {
    const target = app.querySelector(
      action === 'read-final-directions'
        ? '.final-check-layout .comparison-card'
        : '.final-check-list',
    );
    target?.scrollIntoView({ block: 'start', behavior: 'instant' });
    const heading = target?.querySelector('h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  } else if (action === 'edit-draft') {
    state.designStep = 2;
    saveSafely();
    render({ focus: true });
  } else if (action === 'approve-version') {
    if (!finalCheckReady(state)) return;
    if (state.finalCheck.approved) {
      state.phase = 'closing';
      saveSafely();
      render({ focus: true });
      return;
    }
    state.finalCheck.completed = true;
    state.finalCheck.approved = true;
    saveSafely();
    render();
    app.querySelector('.guide-access')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    const title = app.querySelector('#guide-access-title');
    title?.setAttribute('tabindex', '-1');
    title?.focus({ preventScroll: true });
  } else if (action === 'download-guide') {
    if (!state.finalCheck.approved || !finalCheckReady(state)) return;
    try {
      const logo = await loadGuideLogo();
      if (!state.finalCheck.approved || !finalCheckReady(state)) return;
      downloadGuide(state.design, { logo, teacher: state.teacher });
      app.querySelector('.design-notice').textContent =
        'Your guide download has started. Open the HTML file in a browser to read or print it.';
    } catch {
      app.querySelector('.design-notice').textContent =
        'The guide could not be downloaded. Please try again.';
    }
  } else if (action === 'preview-guide') {
    openGuidePreview(state, app);
  } else if (action === 'edit-context') {
    state.phase = 'summary';
    saveSafely();
    render({ focus: true });
  } else if (action === 'copy-draft') copyDraft();
  else if (action === 'use-starter') {
    const exchange = starterDraft({ ...state.teacher, directions: '' }, state.design).trim();
    if (hasStarterExchange(state.design.revision)) {
      app.querySelector('.design-notice').textContent =
        'This starter exchange is already included. You can edit it in the directions box.';
      return;
    }
    state.design.revision = state.design.revision
      ? state.design.revision + '\n\n' + exchange
      : starterDraft(state.teacher, state.design);
    syncFinalCheck();
    syncBabbage();
    saveSafely();
    render();
    document.getElementById('revision')?.focus({ preventScroll: true });
  } else if (action === 'setup-next') moveSetup(1);
  else if (action === 'setup-back')
    state.phase === 'summary'
      ? ((state.phase = 'setup'),
        (state.setupStep = teacherSetup.steps.length - 1),
        saveSafely(),
        render({ focus: true }))
      : moveSetup(-1);
  else if (action === 'use-example') {
    state.teacher = applyExample(teacherSetup.steps[1].example, state.teacher);
    syncFinalCheck();
    syncBabbage();
    saveSafely();
    render();
    document.getElementById('directions')?.focus();
  }
});
render();

if (state.babbage.mode !== 'dev') refreshBabbageConnection();
