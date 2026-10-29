import { adaptIdea } from '../idea-lab/adapt.js';
import { fitWorkspace } from './layout.js';
import { invalidateWorkspaceApproval } from './approval.js';
import { reviewFingerprint, reviewEligible, requestWorkspaceReview, emptyReview, shouldOpenMaya } from './review-ai.js';
import { workspaceViews } from './views.js';
import { downloadProjectFile, parseProjectFile, MAX_PROJECT_BYTES } from './project-file.js';
import { requestCreativeDirections, creativeBasis, combineDirections } from './creative.js';
import { renderClosing } from '../design/closing.js';
import { isTestLessonKeyword, fillTestLesson } from '../../shared/test-lesson.js';
import { renderWorkspace } from './screen.js';
import { readWorkspace, freshWorkspace, saveWorkspace, resetWorkspace } from './storage.js';
import { findIdea } from '../idea-lab/ideas.js';
import { createDesignController } from '../design/controller.js';
import { conversationDefaults, assignmentContext } from '../design/babbage-client.js';
import { finalCheckDefaults, finalCheckContext, finalCheckReady, syncDraftAssignment } from '../design/content.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { serializeDirectionsEditor, formatDirectionsEditor } from '../../shared/directions-editor.js';
import { showBabbageCameo } from '../../shared/babbage-cameo.js';
import { openMayaDialog } from '../design/maya-dialog.js';
import { openGuidePreview } from '../design/guide-preview.js';
import { downloadGuide, loadGuideLogo } from '../design/guide.js';
import { confirmRestart } from '../../shared/restart-dialog.js';
import { openReferences } from '../../shared/reference-dialog.js';

export function mountWorkspace(app, params) {
  const restored = readWorkspace();
  let state = restored.state, readError = restored.error;
  let designPage = state.design.revision.trim() ? 'draft' : 'start', partnerPage = 'work', reviewPage = state.finalCheck.approved ? 'guide' : 'rationale';
  let showingWrapUp = false;
  let reworkForReview = false;
  // Track offers per draft for this open session; do not alter saved or research state.
  let reviewRequest = null;
  let reviewSequence = 0;
  let ui = workspaceViews();
  const ai = { pending: false, configured: null, suggestion: null, error: '', context: '' };
  if (params.get('mockBabbage') === '1') state.babbage.mode = 'dev';
  const idea = findIdea(params.get('adapt'));
  if (idea && !readError) {
    adaptIdea(state, idea);
    designPage = 'intentions';
    saveWorkspace(state);
  }
  if (params.has('adapt')) {
    const url = new URL(window.location.href);
    url.searchParams.delete('adapt');
    history.replaceState(null, '', url);
  }
  const saveSafely = () => !readError && saveWorkspace(state);
  const syncFinalCheck = () => {
    const context = finalCheckContext(state.teacher, state.design);
    if (state.finalCheck.context !== context) state.finalCheck = { ...finalCheckDefaults(), context };
  };
  const render = ({ focus = false } = {}) => {
    app.innerHTML = showingWrapUp ? renderClosing(state) : renderWorkspace(state, ai, readError, designPage, partnerPage, reviewPage, ui);
    fitWorkspace(app);
    showBabbageCameo(state, app);
    if (focus) document.getElementById('setup-title')?.focus({ preventScroll: true });
  };
  function focusTask() {
    const target=app.querySelector('#workspace-view-title') || app.querySelector('#design-page-title') || app.querySelector('#review-title') || app.querySelector('.partner-content h3') || app.querySelector('#setup-title');
    target?.setAttribute('tabindex','-1'); target?.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
  const controller = createDesignController({ app, getState: () => state, ai, render, saveSafely, syncFinalCheck,
    onSuggestion(source, suggestion) {
      if (!reworkForReview || source !== state || state.designPanel !== 'babbage' || ai.context !== assignmentContext(state)) return false;
      reworkForReview = false;
      state.design.previousRevision = state.design.revision;
      state.design.previousReason = state.design.reason;
      state.design.revision = suggestion.revision;
      state.design.reason = suggestion.reason;
      state.design.sourceDirections = state.teacher.directions;
      ai.suggestion = null;
      state.creative.review = emptyReview();
      syncFinalCheck(); controller.syncBabbage();
      enterReview();
      return true;
    }
  });
  function saveAlternative(direction) {
    const exists = state.creative.alternatives.some(item => JSON.stringify(item) === JSON.stringify(direction));
    if (!exists && state.creative.alternatives.length >= 30) {
      app.querySelector('.design-notice').textContent = 'Thirty possibilities are already saved. Your current work is unchanged.';
      return false;
    }
    if (!exists) state.creative.alternatives.push(structuredClone(direction));
    if (!saveSafely()) {
      app.querySelector('.design-notice').textContent = 'This possibility is kept in the open workspace, but could not be saved in this browser.';
      updateApproval();
      return false;
    }
    app.querySelector('.design-notice').textContent = exists ? 'This possibility is already saved.' : 'Possibility saved for later. Your draft is unchanged.';
    return true;
  }
  function developDirection(direction) {
    if (state.workspace.selectedDirection && !saveAlternative(state.workspace.selectedDirection)) return;
    state.workspace.selectedDirection = structuredClone(direction);
    state.workspace.creativeCore = direction.core;
    state.finalCheck = finalCheckDefaults();
    // Choosing a sketch adds context; it must not erase already answered questions.
    state.babbage.context = assignmentContext(state);
    ai.suggestion = null;
    controller.syncBabbage();
    designPage = 'intentions';
    setPanel('revision');
    document.getElementById('creative-core')?.focus();
  }
  async function exploreDirections() {
    if (ai.pending || state.babbage.mode === 'dev' || ai.configured !== true || !state.teacher.directions.trim()) return;
    const initialExploration = !state.creative.directions.length && !state.creative.alternatives.length &&
      !state.workspace.selectedDirection && !state.design.revision.trim();
    if (initialExploration && state.babbage.questions.length) {
      state.babbage = { ...conversationDefaults(), mode: state.babbage.mode };
    }
    const source = state;
    const basis = creativeBasis(state);
    const snapshot = structuredClone(state);
    const request = new AbortController();
    Object.assign(ai, { pending: true, requestController: request, error: '', stage: 'working' });
    partnerPage = 'work';
    state.designPanel = 'babbage';
    ui = workspaceViews();
    render();
    try {
      const directions = await requestCreativeDirections(snapshot, { signal: AbortSignal.any([request.signal, AbortSignal.timeout(90000)]) });
      if (request.signal.aborted || source !== state) return;
      if (basis !== creativeBasis(state)) { ai.error = 'Your context changed while Babbage was exploring. Ask again for possibilities based on your latest work.'; return; }
      state.creative.directions = directions;
      partnerPage = 'ideas';
      state.creative.basis = basis;
    } catch (error) {
      if (source === state && !request.signal.aborted) ai.error = error.name === 'TimeoutError' ? 'Babbage took too long. Your ideas and draft are unchanged. Try again.' : error.message;
    } finally {
      if (source === state) {
        Object.assign(ai, { pending: false, requestController: null });
        saveSafely();
        if (state.designPanel !== 'revision') {
          render();
          if (state.designPanel === 'babbage') {
            const heading = document.getElementById('possibilities-title');
            heading?.focus({ preventScroll: true });
            window.scrollTo({top:0,behavior:'instant'});
          }
        }
      }
    }
  }
  function updateApproval() {
    app.querySelectorAll('[data-final-check]').forEach(control => { control.checked = state.finalCheck[control.dataset.finalCheck]; });
    const approve = app.querySelector('[data-action="approve-version"]');
    if (approve) {
      approve.disabled = !finalCheckReady(state) || state.finalCheck.approved;
      approve.textContent = state.finalCheck.approved ? 'Saved to your Course Guide' : 'Save final design to Course Guide';
    }
    const download = app.querySelector('[data-action="download-guide"]');
    if (download) download.disabled = !state.finalCheck.approved || !finalCheckReady(state);
    app.querySelectorAll('.workspace-save-status').forEach(status => {
      status.textContent = state.saveNotice ? 'Not saved in this browser.' : 'Saved in this browser.';
    });
    const status = app.querySelector('.final-check-status');
    if (status) status.textContent = state.finalCheck.approved ? 'This design is approved for your Course Guide.'
      : finalCheckReady(state) ? 'Ready to save. Select Save final design to Course Guide.' : 'Include your rationale and review all three checks before saving.';
    const notice = app.querySelector('.save-notice');
    if (notice) notice.textContent = state.saveNotice;
  }
  function input(control) {
    if (readError) return;
    if (control.closest('[data-setup-form]') && isTestLessonKeyword(control)) {
      ai.requestController?.abort();
      reviewRequest?.abort(); reviewRequest=null; reviewSequence++;
      const previousPanel = state.designPanel;
      fillTestLesson(state, control.value);
      state.designPanel = previousPanel;
      reworkForReview = false;
      state.creative.review = emptyReview();
      Object.assign(ai, {configured:null,pending:false,suggestion:null,error:'',context:''});
      partnerPage='work'; reviewPage='rationale';
      saveSafely(); render({focus:true}); controller.refreshBabbageConnection(); return;
    }
    if (control.name === 'aiUseDetails' && control.closest('[data-setup-form]')) {
      const previousContext = assignmentContext(state);
      state.teacher.aiUse = control.value;
      invalidateWorkspaceApproval(state, previousContext);
      syncFinalCheck(); controller.syncBabbage(); saveSafely(); updateApproval(); return;
    }
    if (control.dataset?.creativeField === 'feedback') { state.creative.feedback = control.value.slice(0, 6000); saveSafely(); return; }
    if (control.dataset?.clarificationAnswer) return controller.updateClarificationAnswer(control);
    const previousContext = assignmentContext(state);
    let movedDraft = false;
    if (control.dataset?.workspaceMeta) {
      state.workspace[control.dataset.workspaceMeta] = control.value.slice(0, 6000);
      if (['creativeCore', 'instructorPlan', 'openQuestions'].includes(control.dataset.workspaceMeta)) {
        state.babbage.context = assignmentContext(state);
        ai.suggestion = null;
      }
    } else if (control.closest('[data-assignment-editor]')) state.design.revision = serializeDirectionsEditor(control.closest('[data-assignment-editor]'));
    else if (control.closest('[data-design-form]') && Object.hasOwn(state.design, control.name)) state.design[control.name] = control.value;
    else if (control.closest('[data-setup-form]') && Object.hasOwn(state.teacher, control.name)) {
      state.teacher[control.name] = control.type === 'checkbox' ? control.checked : control.value;
      if (control.name === 'aiUse') {
        const details = app.querySelector('#aiUseDetails');
        if (details) details.value = state.teacher.aiUse;
      }
      if (control.value.trim() && Object.hasOwn(state.teacher, control.name + 'Unsure')) state.teacher[control.name + 'Unsure'] = false;
      movedDraft = state.design.revision.trim() && state.design.sourceDirections !== state.teacher.directions;
      syncDraftAssignment(state.teacher, state.design);
    } else return;
    invalidateWorkspaceApproval(state, previousContext);
    syncFinalCheck();
    controller.syncBabbage();
    saveSafely();
    if (control.dataset?.workspaceMeta === 'sourceKind' || movedDraft) {
      const id = control.id, start = control.selectionStart, end = control.selectionEnd;
      render();
      const target = id ? document.getElementById(id) : app.querySelector('input[name="sourceKind"]:checked');
      target?.focus({ preventScroll: true });
      if (typeof start === 'number') target?.setSelectionRange(start, end);
    }
    const useStarting = app.querySelector('[data-action=use-starting]');
    if (useStarting) { useStarting.hidden = Boolean(state.design.revision.trim()); useStarting.disabled = !state.teacher.directions.trim(); }
    updateApproval();
  }
  let editorFormatRange = null;
  const rememberEditorRange = () => {
    const editor=app.querySelector('[data-assignment-editor]'), selection=window.getSelection?.();
    if(selection?.rangeCount && editor?.contains(selection.getRangeAt(0).commonAncestorContainer)) editorFormatRange=selection.getRangeAt(0).cloneRange();
  };
  app.addEventListener('focusin', event => { if(event.target.matches?.('[data-editor-style]')) rememberEditorRange(); });
  app.addEventListener('submit', event => event.preventDefault());
  app.addEventListener('input', event => input(event.target));
  app.addEventListener('change', event => {
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

    if(event.target.matches('[data-workspace-section-picker]')) {
      const attribute=event.target.dataset.workspaceSectionPicker;
      if(!['data-design-page','data-review-page'].includes(attribute)) return;
      const control=Array.from(app.querySelectorAll('['+attribute+']')).find(button=>button.getAttribute(attribute)===event.target.value);
      control?.click();
      app.querySelector('[data-workspace-section-picker]')?.focus({preventScroll:true});
      return;
    }
    const key = event.target.dataset.finalCheck;
    if (!key) return input(event.target);
    if (!['instructions', 'learning', 'requirements'].includes(key)) return;
    syncFinalCheck();
    state.finalCheck[key] = event.target.checked;
    state.finalCheck.approved = state.finalCheck.completed = false;
    saveSafely();
    updateApproval();
  });
  async function runAutomaticReview() {
    if (readError || showingWrapUp || state.designPanel !== 'reason' || !reviewEligible(state) || ai.pending || reviewRequest) return;
    const savedReview = state.creative.review;
    const fingerprint = reviewFingerprint(state);
    if (savedReview.fingerprint === fingerprint && savedReview.feedback) return;
    // A changed draft is checked only at the educator's request, not on tab re-entry.
    if (savedReview.feedback || savedReview.error || savedReview.status === 'complete') return;
    await checkReview();
  }
  async function checkReview() {
    if (reviewRequest || !reviewEligible(state)) return;
    const source = state;
    const fingerprint = reviewFingerprint(state);
    const previous = source.creative.review.feedback ? {
      feedback: source.creative.review.feedback,
      previous_fingerprint: source.creative.review.fingerprint,
    } : null;
    const abort = new AbortController();
    const sequence = ++reviewSequence;
    reviewRequest = abort;
    const review = source.creative.review;
    review.status = 'pending'; review.error = '';
    saveSafely(); render();
    try {
      const feedback = source.babbage.mode === 'dev'
        ? 'Sample review only; no AI analysis was performed. Consider what students will produce, how you will respond to their thinking, and what changes would make the learning purpose clearer.'
        : await requestWorkspaceReview(structuredClone(source), previous, { signal: AbortSignal.any([abort.signal, AbortSignal.timeout(90000)]) });
      if (sequence !== reviewSequence || source !== state || abort.signal.aborted) return;
      review.fingerprint = fingerprint;
      review.feedback = feedback;
      review.status = 'complete';
      review.error = '';
    } catch (error) {
      if (sequence !== reviewSequence || source !== state || abort.signal.aborted) return;
      review.status = 'error';
      review.error = error.message || 'Review unavailable. Your draft is unchanged.';
    } finally {
      if (sequence === reviewSequence) {
        reviewRequest = null;
        if (source === state) {
          saveSafely();
          if (state.designPanel === 'reason') {
            render();
            if (shouldOpenMaya(state)) {
              review.offeredMaya = review.fingerprint;
              saveSafely();
              openMayaDialog(state, document.getElementById('review-title'), {autoStart:true});
            }
          }
        }
      }
    }
  }
  function enterReview() {
    ui = workspaceViews(); state.designPanel = 'reason'; reviewPage = 'rationale'; saveSafely(); render();
    document.getElementById('workspace-tab-reason')?.focus();
    void runAutomaticReview();
  }
  const setPanel = panel => {
    reworkForReview = false;
    if (panel === 'reason') return enterReview();
    ui = workspaceViews(); state.designPanel = panel; saveSafely(); render();
    document.getElementById('workspace-tab-' + panel)?.focus();
  };
  app.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-workspace-panel]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const panels = ['babbage', 'revision', 'reason'];
    const index = panels.indexOf(tab.dataset.workspacePanel);
    setPanel(panels[event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]);
  });
  app.addEventListener('pointerdown', event => { if(event.target.matches?.('[data-editor-style]')) rememberEditorRange(); if (event.target.closest('[data-editor-command]')) event.preventDefault(); });
  for (const kind of ['paste', 'drop']) app.addEventListener(kind, event => {
    const editor = event.target.closest('[data-assignment-editor]');
    if (!editor) return;
    event.preventDefault();
    formatDirectionsEditor(editor, 'insertHTML', renderAssignmentDirections((event.clipboardData || event.dataTransfer).getData('text/plain')));
  });
  async function reset() {
    if (!(await confirmRestart({ title: 'Reset this activity workspace?', description: 'This clears only the private workspace, including its draft, inspiration, and conversation. Scenario 1 progress stays saved.', confirmLabel: 'Reset workspace' }))) return;
    ai.requestController?.abort();
    reviewRequest?.abort(); reviewRequest = null; reviewSequence++;
    const mode = state.babbage.mode;
    if (!resetWorkspace()) { state.saveNotice = 'This browser could not reset the workspace.'; updateApproval(); return; }
    showingWrapUp = false;
    ui = workspaceViews();
    state = freshWorkspace();
    designPage = 'start'; partnerPage = 'work'; reviewPage = 'rationale';
    state.babbage.mode = mode;
    readError = '';
    Object.assign(ai, { pending: false, suggestion: null, error: '', context: '' });
    saveSafely();
    render({ focus: true });
  }
  app.addEventListener('change', async event => {
    if (!event.target.matches('[data-project-file-input]')) return;
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file || ai.pending) return;
    const notice = app.querySelector('.design-notice');
    if (file.size > MAX_PROJECT_BYTES) { if (notice) notice.textContent = 'Project file is too large.'; return; }
    let imported;
    try { imported = parseProjectFile(await file.text()); }
    catch (error) { if (notice) notice.textContent = error.message; return; }
    if (!window.confirm('Open this project? It will replace your current browser workspace. Download your current project first if you want to keep it.')) return;
    if (!saveWorkspace(imported)) { if (notice) notice.textContent = imported.saveNotice; return; }
    reviewRequest?.abort(); reviewRequest = null; reviewSequence++;
    state = imported;
    readError = '';
    showingWrapUp = false;
    designPage = state.design.revision.trim() ? 'draft' : 'start';
    partnerPage = 'work';
    reviewPage = state.finalCheck.approved ? 'guide' : 'rationale';
    ui = workspaceViews();
    Object.assign(ai, { pending: false, suggestion: null, error: '', context: '' });
    render({ focus: true });
    app.querySelector('.design-notice').textContent = 'Project opened. Your editable work has been restored.';
    if (state.designPanel === 'reason') void runAutomaticReview();
  });
  app.addEventListener('click', async event => {
    const route = event.target.closest('[data-workspace-view]');
    if(route && !readError) {
      const screen=route.dataset.workspaceView;
      if (screen === 'preview' && ai.pending) return;
      const allowed=['work','options','sections','preview','saved','combine','feedback','earlier','maya','review-options'];
      if(!allowed.includes(screen)) return;
      const active=document.activeElement;
      const returning=screen==='work';
      const opener=returning?ui.opener:active?.id;
      const selection=returning?ui.selection:typeof active?.selectionStart==='number'?[active.selectionStart,active.selectionEnd]:null;
      ui={...workspaceViews(),screen,opener,selection};render();
      const target=returning&&opener?document.getElementById(opener):null;
      if(target){target.focus({preventScroll:true});if(selection&&target.setSelectionRange)target.setSelectionRange(...selection);}else focusTask();
      return;
    }
    const directionView=event.target.closest('[data-view-direction]');
    if(directionView&&!readError){ui={...workspaceViews(),screen:'idea',index:Number(directionView.dataset.viewDirection),saved:directionView.hasAttribute('data-saved-direction'),opener:directionView.id};render();focusTask();return;}
    const part=event.target.closest('[data-idea-part]');
    if(part){ui.part=part.dataset.ideaPart;ui.readingPage=0;render();focusTask();return;}
    const reading=event.target.closest('[data-reading-page]');
    if(reading){ui.readingPage=Math.max(0,Number(reading.dataset.readingPage)||0);render();focusTask();return;}
    const savedPage=event.target.closest('[data-saved-page]');
    if(savedPage){ui.index=Math.max(0,Number(savedPage.dataset.savedPage)||0);render();focusTask();return;}
    const history=event.target.closest('[data-history-index]');
    if(history){ui.historyIndex=Number(history.dataset.historyIndex);ui.readingPage=0;render();focusTask();return;}
    const partner = event.target.closest('[data-partner-page]');
    if (partner) { ui=workspaceViews(); partnerPage = partner.dataset.partnerPage; state.designPanel = 'babbage'; saveSafely(); render(); document.getElementById('ai-title')?.focus({ preventScroll: true }); return; }
    const review = event.target.closest('[data-review-page]');
    if (review) {
      const destination = review.dataset.reviewPage;
      const show = () => { ui=workspaceViews(); state.designPanel='reason'; reviewPage=destination; render(); document.getElementById('review-title')?.focus({preventScroll:true}); };
      if (destination === 'checks' && !state.finalCheck.approved) {
        if (!state.design.revision.trim() || !state.design.reason.trim()) {
          app.querySelector('.design-notice').textContent='Add your draft and design reasoning before checking the design.'; return;
        }
        show();
      } else show();
      return;
    }
    const page = event.target.closest('[data-design-page]');
    if (page) { ui=workspaceViews(); state.designPanel='revision'; designPage = page.dataset.designPage; saveSafely(); render(); document.getElementById('design-page-title')?.focus({ preventScroll: true }); return; }
    const tab = event.target.closest('[data-workspace-panel]');
    if (tab) return setPanel(tab.dataset.workspacePanel);
    const format = event.target.closest('[data-editor-command]');
    if (format) return formatDirectionsEditor(app.querySelector('[data-assignment-editor]'), format.dataset.editorCommand, format.dataset.editorValue || null);
    const directionControl = event.target.closest('[data-develop-direction], [data-save-direction]');
    if (directionControl && !readError && !ai.pending) {
      const saving = directionControl.hasAttribute('data-save-direction');
      const index = Number(saving ? directionControl.dataset.saveDirection : directionControl.dataset.developDirection);
      const direction = (directionControl.hasAttribute('data-saved-direction') ? state.creative.alternatives : state.creative.directions)[index];
      if (!direction) return;
      if (saving) { saveAlternative(direction); const notice = app.querySelector('.design-notice').textContent; render(); app.querySelector('.design-notice').textContent = notice; const savedControl = app.querySelector('[data-save-direction="' + index + '"]'); savedControl?.focus(); return; }
      developDirection(direction); return;
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'save-project-file' && !readError) {
      downloadProjectFile(state);
      app.querySelector('.design-notice').textContent = 'Project download started. Keep the JSON file to reopen this work later.';
      return;
    }
    if (action === 'open-project-file' && !readError) { app.querySelector('[data-project-file-input]')?.click(); return; }
    if (action === 'reset-workspace') return reset();
    if (readError) return;
    if (action === 'finish-workspace' && state.finalCheck.approved && finalCheckReady(state)) {
      showingWrapUp = true; render({focus:true}); return;
    }
    if (action === 'workspace-home' && showingWrapUp) { window.location.href='?view=home'; return; }
    if (action === 'return-assignment' && showingWrapUp) {
      showingWrapUp = false; ui=workspaceViews(); reviewPage='guide'; render();
      document.getElementById('review-title')?.focus({preventScroll:true}); return;
    }
    if (action === 'check-workspace-revision') { await checkReview(); return; }
    if (action === 'continue-to-maya') {
      if (reviewRequest || ai.pending || !reviewEligible(state)) return;
      const fingerprint = reviewFingerprint(state);
      state.creative.review.offeredMaya = fingerprint; saveSafely();
      if (!state.creative.mayaPaused) openMayaDialog(state, event.target.closest('[data-action]'), {autoStart:true});
      else { app.querySelector('.design-notice').textContent = 'Maya is paused. You can continue to the final checks.'; }
      return;
    }
    if (action === 'review-my-design' || action === 'consult-babbage') {
      if (ai.pending || reviewRequest || !state.teacher.directions.trim()) return;
      reworkForReview = action === 'review-my-design';
      ui={...workspaceViews(),task:reworkForReview?'draft':'explore'}; partnerPage='work'; state.designPanel='babbage';
      controller.syncBabbage();
      if (reworkForReview && state.teacher.learningGoal.trim() && !state.teacher.learningGoalUnsure &&
          state.teacher.aiUse.trim() && !['Not sure yet','unsure'].includes(state.teacher.aiUse.trim())) state.babbage.ready = true;
      await controller.askBabbage(state.babbage.ready ? 'revise' : 'clarify');
      return;
    }
    if (action === 'explore-directions') { await exploreDirections(); return; }
    if (action === 'combine-directions' && !ai.pending) {
      const choices = [...app.querySelectorAll('[data-combine-direction]:checked')].map(control => state.creative.directions[Number(control.dataset.combineDirection)]).filter(Boolean);
      try { developDirection(combineDirections(choices)); } catch (error) { app.querySelector('.design-notice').textContent = error.message; }
      return;
    }
    if (action === 'pause-maya' || action === 'resume-maya') { state.creative.mayaPaused = action === 'pause-maya'; saveSafely(); render(); focusTask(); return; }
    if (action === 'edit-draft') { designPage = 'draft'; setPanel('revision'); document.getElementById('revision')?.focus(); }
    else if (action === 'use-starting') {
      if (state.design.revision.trim() || !state.teacher.directions.trim()) return;
      state.design.revision = state.teacher.directions; state.design.sourceDirections = state.teacher.directions;
      syncFinalCheck(); controller.syncBabbage(); designPage = 'draft'; setPanel('revision'); document.getElementById('revision')?.focus();
    } else if (action === 'ask-ai') { partnerPage = 'work'; await controller.askBabbage(); }
    else if (action === 'next-question') controller.moveQuestion(1);
    else if (action === 'previous-question') controller.moveQuestion(-1);
    else if (action === 'send-clarification') { ui={...workspaceViews(),task:reworkForReview?'draft':'explore'}; partnerPage='work'; state.designPanel='babbage'; await controller.askBabbage('clarify', true); }
    else if (action === 'generate-ai') { ui=workspaceViews(); partnerPage='work'; state.designPanel='babbage'; await controller.askBabbage('revise'); }
    else if (action === 'retry-babbage') await controller.refreshBabbageConnection();
    else if (action === 'toggle-dev') {
      if (ai.pending) return;
      state.babbage = { ...conversationDefaults(), mode: state.babbage.mode === 'dev' ? 'live' : 'dev', context: assignmentContext(state) };
      ai.suggestion = null; ai.error = ''; partnerPage = 'work';
      saveSafely(); render();
      if (state.babbage.mode === 'live') await controller.refreshBabbageConnection();
    } else if (action === 'apply-ai') {
      if (!ai.suggestion || ai.context !== assignmentContext(state)) return;
      if (state.design.revision.trim()) { state.design.previousRevision = state.design.revision; state.design.previousReason = state.design.reason; }
      state.design.revision = ai.suggestion.revision;
      state.design.reason = ai.suggestion.reason;
      state.design.sourceDirections = state.teacher.directions;
      ai.suggestion = null;
      syncFinalCheck(); controller.syncBabbage();
      designPage = 'draft';
      setPanel('revision');
      document.getElementById('revision')?.focus();
      app.querySelector('.design-notice').textContent = 'Babbage’s suggested draft is now in Write your draft. Review and adapt it before approving.';
    } else if (action === 'dismiss-ai') { ai.suggestion = null; ai.error = 'Your draft is unchanged.'; partnerPage = 'work'; render(); app.querySelector('[data-action="generate-ai"]')?.focus(); }
    else if (action === 'hear-maya' && state.design.revision.trim() && !ai.pending) openMayaDialog(state, event.target.closest('[data-action]'), {autoStart:true});
    else if (action === 'restore-earlier') {
      ui=workspaceViews(); designPage='draft'; state.designPanel='revision';
      state.design.revision = state.design.previousRevision;
      state.design.reason = state.design.previousReason;
      syncFinalCheck(); controller.syncBabbage(); saveSafely(); render();
    } else if (action === 'edit-context') { designPage = 'start'; setPanel('revision'); }
    else if (action === 'preview-guide') openGuidePreview(state, app);
    else if (action === 'approve-version' && finalCheckReady(state)) {
      state.finalCheck.approved = state.finalCheck.completed = true;
      reviewPage = 'guide'; saveSafely(); render(); document.getElementById('review-title')?.focus({ preventScroll: true });
    } else if (action === 'download-guide' && finalCheckReady(state) && state.finalCheck.approved) {
      const context = assignmentContext(state);
      const logo = await loadGuideLogo();
      if (context !== assignmentContext(state) || !state.finalCheck.approved) return;
      downloadGuide(state.design, { teacher: state.teacher, workspace: state.workspace, logo });
      app.querySelector('.design-notice').textContent = 'Your Course Guide download has started.';
    } else if (action === 'read-final-directions' || action === 'return-final-checks') {
      const target = app.querySelector(action === 'read-final-directions' ? '.comparison-card h2' : '.final-check-list h2');
      target?.setAttribute('tabindex', '-1'); target?.focus();
    }
  });
  document.querySelector('[data-action="open-references"]')?.addEventListener('click', event => openReferences(event.currentTarget));
  const restart = document.querySelector('[data-action="restart-module"]');
  if (restart) { restart.hidden = false; restart.textContent = 'Reset workspace'; restart.addEventListener('click', reset); }
  document.addEventListener('click', event => {
    if (event.target.closest('a[href^="?"]') && !readError && !saveSafely()) { event.preventDefault(); updateApproval(); }
  });
  window.addEventListener('resize', () => fitWorkspace(app));
  document.fonts?.ready.then(() => fitWorkspace(app));
  window.addEventListener('pagehide', () => { ai.requestController?.abort(); reviewRequest?.abort(); });
  render();
  if (state.designPanel === 'reason') void runAutomaticReview();
  if (!readError && state.babbage.mode !== 'dev') controller.refreshBabbageConnection();
}
