import { renderClosing } from '../design/closing.js';
import { isTestLessonKeyword, fillTestLesson } from '../../shared/test-lesson.js';
import { renderWorkspace, renderDraftPreview, workspacePreview } from './screen.js';
import { readWorkspace, freshWorkspace, saveWorkspace, resetWorkspace } from './storage.js';
import { findIdea } from '../idea-lab/ideas.js';
import { createDesignController } from '../design/controller.js';
import { conversationDefaults, assignmentContext } from '../design/babbage-client.js';
import { finalCheckDefaults, finalCheckContext, finalCheckReady, syncDraftAssignment } from '../design/content.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { serializeDirectionsEditor, formatDirectionsEditor } from '../../shared/directions-editor.js';
import { openMayaDialog, requireMayaReview, hasMayaReview } from '../design/maya-dialog.js';
import { openGuidePreview } from '../design/guide-preview.js';
import { downloadGuide, loadGuideLogo } from '../design/guide.js';
import { confirmRestart } from '../../shared/restart-dialog.js';
import { openReferences } from '../../shared/reference-dialog.js';

export function mountWorkspace(app, params) {
  const restored = readWorkspace();
  let state = restored.state, readError = restored.error;
  let designPage = state.design.revision.trim() ? 'draft' : 'start', partnerPage = 'work', reviewPage = state.finalCheck.approved ? 'guide' : 'rationale';
  let showingWrapUp = false;
  const ai = { pending: false, configured: null, suggestion: null, error: '', context: '' };
  if (params.get('mockBabbage') === '1') state.babbage.mode = 'dev';
  const idea = findIdea(params.get('adapt'));
  if (idea && !readError) {
    const changedInspiration = state.workspace.ideaId !== idea.id;
    state.workspace.ideaId = idea.id;
    if (!state.teacher.directions.trim()) {
      state.workspace.sourceKind = 'idea';
      state.teacher.directions = idea.summary + '\n\nPossible student activity:\n' + idea.actions.join('\n');
      state.design.sourceDirections = state.teacher.directions;
    }
    state.designPanel = 'babbage';
    if (changedInspiration) {
      state.babbage = { ...conversationDefaults(), mode: state.babbage.mode };
      state.finalCheck = finalCheckDefaults();
    }
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
    if (reviewPage === 'checks' && !state.finalCheck.approved && !hasMayaReview(state)) reviewPage='rationale';
    app.innerHTML = showingWrapUp ? renderClosing(state) : renderWorkspace(state, ai, readError, designPage, partnerPage, reviewPage);
    if (focus) document.getElementById('setup-title')?.focus({ preventScroll: true });
  };
  const controller = createDesignController({ app, getState: () => state, ai, render, saveSafely, syncFinalCheck });
  function updateApproval() {
    app.querySelectorAll('[data-final-check]').forEach(control => { control.checked = state.finalCheck[control.dataset.finalCheck]; });
    const approve = app.querySelector('[data-action="approve-version"]');
    if (approve) {
      approve.disabled = !finalCheckReady(state) || state.finalCheck.approved;
      approve.textContent = state.finalCheck.approved ? 'Saved to your Course Guide' : 'Save final design to Course Guide';
    }
    const download = app.querySelector('[data-action="download-guide"]');
    if (download) download.disabled = !state.finalCheck.approved;
    const status = app.querySelector('.final-check-status');
    if (status) status.textContent = state.finalCheck.approved ? 'This design is approved for your Course Guide.'
      : finalCheckReady(state) ? 'Ready to save. Select Save final design to Course Guide.' : 'Include your rationale and review all three checks before saving.';
    const notice = app.querySelector('.save-notice');
    if (notice) notice.textContent = state.saveNotice;
  }
  function input(control) {
    if (readError) return;
    if (control.closest('[data-setup-form]') && isTestLessonKeyword(control)) {
      ai.requestController?.abort(); fillTestLesson(state, control.value);
      Object.assign(ai, {configured:null,pending:false,suggestion:null,error:'',context:''});
      designPage='start'; partnerPage='work'; reviewPage='rationale';
      saveSafely(); render({focus:true}); controller.refreshBabbageConnection(); return;
    }
    if (control.dataset?.clarificationAnswer) return controller.updateClarificationAnswer(control);
    let movedDraft = false;
    if (control.dataset?.workspaceMeta) {
      state.workspace[control.dataset.workspaceMeta] = control.value.slice(0, 6000);
      state.finalCheck = finalCheckDefaults();
    } else if (control.closest('[data-assignment-editor]')) state.design.revision = serializeDirectionsEditor(control.closest('[data-assignment-editor]'));
    else if (control.closest('[data-design-form]') && Object.hasOwn(state.design, control.name)) state.design[control.name] = control.value;
    else if (control.closest('[data-setup-form]') && Object.hasOwn(state.teacher, control.name)) {
      state.teacher[control.name] = control.type === 'checkbox' ? control.checked : control.value;
      if (control.value.trim() && Object.hasOwn(state.teacher, control.name + 'Unsure')) state.teacher[control.name + 'Unsure'] = false;
      movedDraft = state.design.revision.trim() && state.design.sourceDirections !== state.teacher.directions;
      syncDraftAssignment(state.teacher, state.design);
    } else return;
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
    const preview = app.querySelector('[data-live-preview]');
    if (preview) {
      const model = workspacePreview(state, designPage);
      preview.innerHTML = renderDraftPreview(model.text, model.empty);
      app.querySelector('[data-preview-label]').textContent = model.label;
    }
    const useStarting = app.querySelector('[data-action=use-starting]');
    if (useStarting) { useStarting.hidden = Boolean(state.design.revision.trim()); useStarting.disabled = !state.teacher.directions.trim(); }
    updateApproval();
  }
  app.addEventListener('submit', event => event.preventDefault());
  app.addEventListener('input', event => input(event.target));
  app.addEventListener('change', event => {
    const key = event.target.dataset.finalCheck;
    if (!key) return input(event.target);
    if (!['instructions', 'learning', 'requirements'].includes(key)) return;
    syncFinalCheck();
    state.finalCheck[key] = event.target.checked;
    state.finalCheck.approved = state.finalCheck.completed = false;
    saveSafely();
    updateApproval();
  });
  const setPanel = panel => { state.designPanel = panel; saveSafely(); render(); document.getElementById('workspace-tab-' + panel)?.focus(); };
  app.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-workspace-panel]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const panels = ['revision', 'babbage', 'reason'];
    const index = panels.indexOf(tab.dataset.workspacePanel);
    setPanel(panels[event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]);
  });
  app.addEventListener('pointerdown', event => { if (event.target.closest('[data-editor-command]')) event.preventDefault(); });
  for (const kind of ['paste', 'drop']) app.addEventListener(kind, event => {
    const editor = event.target.closest('[data-assignment-editor]');
    if (!editor) return;
    event.preventDefault();
    formatDirectionsEditor(editor, 'insertHTML', renderAssignmentDirections((event.clipboardData || event.dataTransfer).getData('text/plain')));
  });
  async function reset() {
    if (!(await confirmRestart({ title: 'Reset this discussion workspace?', description: 'This clears only the private workspace, including its draft, inspiration, and conversation. Scenario 1 progress stays saved.', confirmLabel: 'Reset workspace' }))) return;
    ai.requestController?.abort();
    const mode = state.babbage.mode;
    if (!resetWorkspace()) { state.saveNotice = 'This browser could not reset the workspace.'; updateApproval(); return; }
    showingWrapUp = false;
    state = freshWorkspace();
    designPage = 'start'; partnerPage = 'work'; reviewPage = 'rationale';
    state.babbage.mode = mode;
    readError = '';
    Object.assign(ai, { pending: false, suggestion: null, error: '', context: '' });
    saveSafely();
    render({ focus: true });
  }
  app.addEventListener('click', async event => {
    const partner = event.target.closest('[data-partner-page]');
    if (partner) { partnerPage = partner.dataset.partnerPage; render(); document.getElementById('ai-title')?.focus({ preventScroll: true }); return; }
    const review = event.target.closest('[data-review-page]');
    if (review) {
      const destination = review.dataset.reviewPage;
      const show = () => { reviewPage=destination; render(); document.getElementById('review-title')?.focus({preventScroll:true}); };
      if (destination === 'checks' && !state.finalCheck.approved) {
        if (!state.design.revision.trim() || !state.design.reason.trim()) {
          app.querySelector('.design-notice').textContent='Add your draft and design reasoning before checking the design.'; return;
        }
        requireMayaReview(state,review,show);
      } else show();
      return;
    }
    const page = event.target.closest('[data-design-page]');
    if (page) { designPage = page.dataset.designPage; render(); document.getElementById('design-page-title')?.focus({ preventScroll: true }); return; }
    const tab = event.target.closest('[data-workspace-panel]');
    if (tab) return setPanel(tab.dataset.workspacePanel);
    const format = event.target.closest('[data-editor-command]');
    if (format) return formatDirectionsEditor(app.querySelector('[data-assignment-editor]'), format.dataset.editorCommand, format.dataset.editorValue || null);
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'reset-workspace') return reset();
    if (readError) return;
    if (action === 'finish-workspace' && state.finalCheck.approved && finalCheckReady(state)) {
      showingWrapUp = true; render({focus:true}); return;
    }
    if (action === 'workspace-home' && showingWrapUp) { window.location.href='?view=home'; return; }
    if (action === 'return-assignment' && showingWrapUp) {
      showingWrapUp = false; reviewPage='guide'; render();
      document.getElementById('review-title')?.focus({preventScroll:true}); return;
    }
    if (action === 'edit-draft') { designPage = 'draft'; setPanel('revision'); document.getElementById('revision')?.focus(); }
    else if (action === 'use-starting') {
      if (state.design.revision.trim() || !state.teacher.directions.trim()) return;
      state.design.revision = state.teacher.directions; state.design.sourceDirections = state.teacher.directions;
      syncFinalCheck(); controller.syncBabbage(); designPage = 'draft'; setPanel('revision'); document.getElementById('revision')?.focus();
    } else if (action === 'ask-ai') { partnerPage = 'work'; await controller.askBabbage(); }
    else if (action === 'next-question') controller.moveQuestion(1);
    else if (action === 'previous-question') controller.moveQuestion(-1);
    else if (action === 'send-clarification') await controller.askBabbage('clarify', true);
    else if (action === 'generate-ai') await controller.askBabbage('revise');
    else if (action === 'retry-babbage') await controller.refreshBabbageConnection();
    else if (action === 'toggle-dev') {
      if (ai.pending) return;
      state.babbage = { ...conversationDefaults(), mode: state.babbage.mode === 'dev' ? 'live' : 'dev', context: assignmentContext(state) };
      ai.suggestion = null; ai.error = ''; partnerPage = 'work';
      saveSafely(); render();
      if (state.babbage.mode === 'live') await controller.refreshBabbageConnection();
    } else if (action === 'apply-ai') {
      if (!ai.suggestion || ai.context !== assignmentContext(state)) return;
      state.design.revision = ai.suggestion.revision;
      state.design.reason = ai.suggestion.reason;
      ai.suggestion = null;
      syncFinalCheck(); controller.syncBabbage();
      designPage = 'draft';
      setPanel('revision');
      document.getElementById('revision')?.focus();
    } else if (action === 'dismiss-ai') { ai.suggestion = null; ai.error = 'Your draft is unchanged.'; partnerPage = 'work'; render(); app.querySelector('[data-action="generate-ai"]')?.focus(); }
    else if (action === 'hear-maya' && state.design.revision.trim() && !ai.pending) openMayaDialog(state, event.target.closest('[data-action]'));
    else if (action === 'restore-earlier') {
      state.design.revision = state.design.previousRevision;
      state.design.reason = state.design.previousReason;
      syncFinalCheck(); controller.syncBabbage(); saveSafely(); render();
    } else if (action === 'edit-context') { designPage = 'start'; setPanel('revision'); }
    else if (action === 'preview-guide') openGuidePreview(state, app);
    else if (action === 'approve-version' && finalCheckReady(state) && hasMayaReview(state)) {
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
  window.addEventListener('pagehide', () => ai.requestController?.abort());
  render();
  if (!readError && state.babbage.mode !== 'dev') controller.refreshBabbageConnection();
}
