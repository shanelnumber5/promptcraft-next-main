import { showBabbageCameo } from '../shared/babbage-cameo.js';
import { isTestLessonKeyword, fillTestLesson } from '../shared/test-lesson.js';
import { createDesignController } from '../features/design/controller.js';
import { openGuidePreview } from '../features/design/guide-preview.js';
import { renderClosing } from '../features/design/closing.js';
import { discussionOpening as scenario } from '../features/opening/content.js';
import { teacherSetup } from '../features/setup/content.js';
import { renderScene } from '../features/opening/screen.js';
import { renderTeacherStep, renderTeacherSummary, applyExample } from '../features/setup/screen.js';
import { renderDesign } from '../features/design/screen.js';
import { currentDesignPanel, designDestination, designPanels, introducePixelAdvice } from '../features/design/panels.js';
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
import { openReferences } from '../shared/reference-dialog.js';
import { highlightNextAction } from '../shared/next-action.js';
import { renderAssignmentDirections } from '../shared/directions.js';
import { serializeDirectionsEditor, formatDirectionsEditor } from '../shared/directions-editor.js';
import { openMayaDialog } from '../features/design/maya-dialog.js';

const app = document.getElementById('app');
app.addEventListener('submit', (event) => event.preventDefault());
app.addEventListener('keydown', (event) => {
  const tab = event.target.closest('[data-summary-section]');
  if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tabs = [...app.querySelectorAll('[data-summary-section]')];
  const index = tabs.indexOf(tab);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
    : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next]?.click();
});
let state,
  summarySection = 0;
const ai = { configured: null, pending: false, suggestion: null, error: '', context: '' };
app.addEventListener('toggle', () => highlightNextAction(app, state, ai), true);
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
const { updateClarificationAnswer, moveQuestion, syncBabbage, askBabbage, refreshBabbageConnection } =
  createDesignController({ app, getState: () => state, ai, render, saveSafely, syncFinalCheck });
const restartButton = document.querySelector('[data-action="restart-module"]');
document.querySelector('[data-action="open-references"]')?.addEventListener('click', (event) => openReferences(event.currentTarget));
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
  document.querySelector('.skip-link')?.setAttribute('href', state.phase === 'opening' ? '#scene-title' : '#setup-title');
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
  highlightNextAction(app, state, ai);
  showBabbageCameo(state, app);
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
  state.storyStage = delta < 0 ? (scenario.scenes[next].choice ? 'question' : 'board') : 'dialogue';
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
let editorFormatRange = null;
function rememberEditorRange() {
  const editor=app.querySelector('[data-assignment-editor]'), selection=window.getSelection?.();
  if(selection?.rangeCount && editor?.contains(selection.getRangeAt(0).commonAncestorContainer)) editorFormatRange=selection.getRangeAt(0).cloneRange();
}
app.addEventListener('focusin', event => { if(event.target.matches?.('[data-editor-style]')) rememberEditorRange(); });
app.addEventListener('change', (event) => {
  if(event.target.matches?.('[data-final-topic-picker]')) {
    const index=Number(event.target.value);
    if(!Number.isInteger(index) || index<0 || index>=event.target.options.length) return;
    state.finalReviewTopic=index; render();
    app.querySelector('[data-final-topic-picker]')?.focus({preventScroll:true}); return;
  }
  if(event.target.matches?.('[data-reading-section]')) {
    const index=Number(event.target.value);
    if(!Number.isInteger(index) || index<0 || index>=event.target.options.length) return;
    state.designReadPage=index; saveSafely(); render();
    app.querySelector('[data-reading-section]')?.focus({preventScroll:true});
    return;
  }
  if(event.target.matches?.('[data-editor-style]')) {
    const editor=app.querySelector('[data-assignment-editor]'), value=event.target.value;
    if(editor && ['p','h4'].includes(value)) {
      editor.focus({preventScroll:true});
      if(editorFormatRange && editor.contains(editorFormatRange.commonAncestorContainer)) {
        const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(editorFormatRange);
      }
      formatDirectionsEditor(editor,'formatBlock',value);
    }
    event.target.value=''; return;
  }
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
    next.querySelector('span').textContent = 'Assignment guide';
    const download = app.querySelector('[data-action="download-guide"]');
    if (download) download.disabled = true;
    const guideHint = app.querySelector('.guide-access-actions p');
    if (guideHint)
      guideHint.textContent = 'Complete the three checks, then go to your assignment guide.';
    app.querySelector('.final-check-status').textContent = finalCheckReady(state)
      ? 'All three points are checked. Select Assignment guide to save your checks and continue.'
      : 'Check each point after reviewing the directions.';
    highlightNextAction(app, state, ai);
  showBabbageCameo(state, app);
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
    ? 'Look for how peer input shapes a decision.'
    : 'Choose a response, then use the feedback to reconsider.';
  app.querySelector('.save-notice').textContent = state.saveNotice;
  highlightNextAction(app, state, ai);
  showBabbageCameo(state, app);
});
app.addEventListener('input', (event) => {
  if (event.target.closest('[data-setup-form]') && isTestLessonKeyword(event.target)) {
    ai.requestController?.abort();
    fillTestLesson(state, event.target.value);
    Object.assign(ai, {configured:null,pending:false,suggestion:null,error:'',context:''});
    saveSafely(); render({focus:true}); void refreshBabbageConnection().then(() => { if (state.phase === 'design' && state.designPanel === 'babbage' && !state.babbage.history.length && ai.configured === true) void askBabbage(); }); return;
  }
  const editor = event.target.closest('[data-assignment-editor]');
  if (editor) {
    updateDesignField({ name: 'revision', value: serializeDirectionsEditor(editor) });
    return;
  }
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

app.addEventListener('pointerdown', (event) => {
  if(event.target.matches?.('[data-editor-style]')) rememberEditorRange();
  if (event.target.closest('[data-editor-command]')) event.preventDefault();
});
app.addEventListener('paste', (event) => {
  const editor = event.target.closest('[data-assignment-editor]');
  if (!editor) return;
  event.preventDefault();
  formatDirectionsEditor(editor, 'insertHTML', renderAssignmentDirections(event.clipboardData.getData('text/plain')));
});
app.addEventListener('drop', (event) => {
  const editor = event.target.closest('[data-assignment-editor]');
  if (!editor) return;
  event.preventDefault();
  const text = event.dataTransfer.getData('text/plain');
  if (text) formatDirectionsEditor(editor, 'insertHTML', renderAssignmentDirections(text));
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
  const review = app.querySelector('[data-action="design-next"]');
  if (review && state.designStep === 2 && ['revision', 'reason'].includes(currentDesignPanel(state))) review.disabled = !state.design.revision.trim();
  if (ai.suggestion && ai.context !== aiContext(state)) {
    ai.suggestion = null;
    ai.error = 'Your draft changed. Ask Babbage again to use the latest version.';
    app.querySelector('.ai-suggestion')?.remove();
    const status = app.querySelector('.ai-status');
    if (status) status.textContent = ai.error;
  }
  highlightNextAction(app, state, ai);
  showBabbageCameo(state, app);
}

function moveDesign(delta) {
  if (delta > 0 && ai.pending) return;
  const panel = currentDesignPanel(state);
  const introduceMaya = delta > 0 && panel === 'advice' && state.designReturnPanel === 'reason' && state.design.revision.trim();
  if (delta > 0 && state.designStep === 2 && ['revision', 'reason'].includes(panel) && !state.design.revision.trim() && !ai.suggestion) {
    app.querySelector('.design-notice').textContent = 'Write a draft or use Babbage’s suggestion before reviewing.';
    return;
  }
  if (delta > 0 && state.designStep === 2 && panel === 'babbage' && ai.suggestion) {
    ai.error =
      'Choose Use this draft to include the suggestion in your review, or Keep my draft to review your current directions.';
    render();
    app.querySelector('.ai-suggestion')?.scrollIntoView({ block: 'nearest' });
    return;
  }
  if (delta < 0 && state.designStep === 0 && panel === 'concern') {
    state.phase = 'summary';
  } else if (['original', 'requirements', 'history', 'rationale', 'earlier', 'advice', 'tools', 'feedback'].includes(panel) && state.designReturnPanel) {
    state.designPanel = state.designReturnPanel;
    state.designReturnPanel = '';
  } else [state.designStep, state.designPanel] = designDestination(state, delta);
  if (delta > 0 && !['original','requirements','history','rationale','earlier','advice','tools','feedback'].includes(panel)) introducePixelAdvice(state);
  state.designReadPage = 0;
  syncFinalCheck();
  syncBabbage();
  saveSafely();
  render({ focus: true });
  if (delta > 0 && state.phase === 'design' && state.designStep === 2 && state.designPanel === 'babbage' && !state.babbage.history.length && !ai.pending && (state.babbage.mode === 'dev' || ai.configured === true)) {
    void askBabbage();
  }
  if (introduceMaya) openMayaDialog(state, document.getElementById('setup-title'), {autoStart:true,novel:true});
}
async function copyDraft() {
  const notice = app.querySelector('.design-notice');
  try {
    const documentCopy = document.createElement('div');
    documentCopy.innerHTML = renderAssignmentDirections(state.design.revision);
    await navigator.clipboard.writeText(serializeDirectionsEditor(documentCopy, { formatted: false }));
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
  const livePreview = app.querySelector('[data-setup-live-preview]');
  if (livePreview && control.name === 'directions')
    livePreview.innerHTML = state.teacher.directions.trim()
      ? renderAssignmentDirections(state.teacher.directions)
      : '<p class="setup-preview-empty">Your discussion directions will appear here as you enter them.</p>';
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
    state.storyStage = 'board';
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
  const formatButton = event.target.closest('[data-editor-command]');
  if (formatButton) {
    const editor = app.querySelector('[data-assignment-editor]');
    if (editor) formatDirectionsEditor(editor, formatButton.dataset.editorCommand, formatButton.dataset.editorValue || null);
    return;
  }
  const summaryTarget = event.target.closest('[data-summary-section]');
  if (summaryTarget) {
    summarySection = Number(summaryTarget.dataset.summarySection);
    render();
    document.querySelector(`[data-summary-section="${summarySection}"]`)?.focus();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'reveal-board' || action === 'reveal-question') {
    state.storyStage = action === 'reveal-question' ? 'question' : 'board';
    saveSafely();
    render({ focus: true });
  } else if (action === 'next') move(1);
  else if (action === 'back') {
    if (state.storyStage === 'board' || state.storyStage === 'question') {
      state.storyStage = state.storyStage === 'question' ? 'board' : 'dialogue';
      saveSafely();
      render({ focus: true });
    } else move(-1);
  }
  else if (action === 'start-setup') startSetup();
  else if (action === 'start-design') {
    if (!state.teacher.directions.trim()) {
      summarySection = 1;
      render();
      app.querySelector('.save-notice').textContent = 'Add your original assignment directions here, then select Design with Babbage. Your other answers stay saved.';
      document.getElementById('directions')?.focus();
      return;
    }
    state.phase = 'design';
    introducePixelAdvice(state);
    saveSafely();
    render({ focus: true });
  } else if (action === 'return-assignment') {
    state.phase = 'design';
    state.designStep = 4;
    saveSafely();
    render({ focus: true });
  } else if (action === 'final-tab' || action === 'final-topic') {
    if(state.designStep!==4) return;
    if(action==='final-tab') {
      const tab=event.target.closest('[data-final-tab]')?.dataset.finalTab;
      if(!['checks','directions','guide'].includes(tab)) return;
      state.finalReviewTab=tab; state.finalReviewTopic=0;
    } else {
      const index=Number(event.target.closest('[data-final-topic]')?.dataset.finalTopic);
      if(!Number.isInteger(index) || index<0 || index>=app.querySelectorAll('[data-final-topic]').length) return;
      state.finalReviewTopic=index;
    }
    render();
    app.querySelector(action==='final-tab' ? '[data-final-tab="'+state.finalReviewTab+'"]' : '[data-final-topic="'+state.finalReviewTopic+'"]')?.focus({preventScroll:true});
  } else if (action === 'review-section') {
    const index=Number(event.target.closest('[data-review-section]')?.dataset.reviewSection);
    if(state.designStep!==3 || !Number.isInteger(index) || index<0 || index>=app.querySelectorAll('[data-review-section]').length) return;
    state.designReadPage=index;
    render();
    app.querySelector('[data-review-section="'+index+'"]')?.focus({preventScroll:true});
  } else if (action === 'review-tab') {
    const tab=event.target.closest('[data-review-tab]')?.dataset.reviewTab;
    if (state.designStep!==3 || !['original','revised','notes'].includes(tab)) return;
    state.designReviewTab=tab;
    state.designReadPage=0;
    render();
    app.querySelector('[data-review-tab="'+tab+'"]')?.focus();
  } else if (action === 'design-panel') {
    const panel = event.target.closest('[data-design-panel]')?.dataset.designPanel;
    if (!designPanels[state.designStep]?.includes(panel)) return;
    state.designReturnPanel = ['original', 'requirements', 'history', 'rationale', 'earlier', 'advice', 'tools', 'feedback'].includes(panel) ? currentDesignPanel(state) : '';
    state.designPanel = panel === 'route' ? 'babbage' : panel;
    if(panel !== 'advice') introducePixelAdvice(state);
    state.designReadPage = 0;
    saveSafely();
    render({ focus: true });
  } else if (action === 'read-previous' || action === 'read-next') {
    const index = Number(app.querySelector('.document-pages')?.dataset.pageIndex ?? state.designReadPage);
    state.designReadPage = Math.max(0, index + (action === 'read-next' ? 1 : -1));
    saveSafely();
    render();
  } else if (action === 'design-next') moveDesign(1);
  else if (action === 'design-back') moveDesign(-1);
  else if (action === 'ask-ai') await askBabbage();
  else if (action === 'next-question') moveQuestion(1);
  else if (action === 'previous-question') moveQuestion(-1);
  else if (action === 'send-clarification') await askBabbage('clarify', true);
  else if (action === 'generate-ai') await askBabbage('revise');
  else if (action === 'hear-maya') {
    if (ai.pending || !state.design.revision.trim()) return;
    openMayaDialog(state, event.target.closest('[data-action]'));
  }
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
    state.designPanel = 'revision';
    state.designReadPage = 0;
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
    state.designPanel = 'revision';
    state.designReadPage = 0;
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
    state.finalReviewTab = 'guide';
    state.finalReviewTopic = 0;
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
    state.designPanel = 'revision';
    state.designReturnPanel = '';
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
window.addEventListener?.('pagehide', () => ai.requestController?.abort());

if (state.babbage.mode !== 'dev') refreshBabbageConnection();
