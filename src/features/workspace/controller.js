import { mountWorkspacePopup } from './popups.js';
import { emptyRubric, generateRubric, downloadRubric, rubricForState } from './rubric.js';
import { requestConversationRevision } from './conversation-revision.js';
import {
  saveFeedbackAnswer,
  savedFeedbackNotes,
  emptyFeedbackConversation,
} from '../design/feedback-conversation.js';
import { createAiWaiting } from '../design/ai-waiting.js';
import { designRoute } from './routes.js';
import { currentFeedbackQuestions, clarificationNotes } from './feedback-questions.js';
import { applyTeachingNoteSuggestion } from './teaching-notes.js';
import { isUncertainAnswer } from '../design/input-quality.js';
import { applySuggestedDraft } from './draft.js';
import { clarificationLimitReached } from '../design/turn-state.js';
import { adaptIdea } from '../idea-lab/adapt.js';
import { fitWorkspace } from './layout.js';
import { invalidateWorkspaceApproval } from './approval.js';
import { reviewFingerprint, reviewEligible, emptyReview, shouldOpenMaya } from './review-ai.js';
import { createWorkspaceReviewController } from './review-controller.js';
import {
  MAX_WORKSPACE_TEXT,
  MAX_SAVED_ALTERNATIVES,
  workspacePlanningFields,
  workspacePanelIds,
} from './config.js';
import { workspaceViews } from './views.js';
import { downloadProjectFile, parseProjectFile, MAX_PROJECT_BYTES } from './project-file.js';
import { combineDirections } from './creative.js';
import { exploreWorkspace } from './exploration-controller.js';
import { renderClosing } from '../design/closing.js';
import { isTestLessonKeyword, fillTestLesson } from '../../shared/test-lesson.js';
import { renderWorkspace } from './screen.js';
import { freshWorkspace } from './storage.js';
import { findIdea } from '../idea-lab/ideas.js';
import { createDesignController } from '../design/controller.js';
import { conversationDefaults, assignmentContext } from '../design/babbage-client.js';
import {
  finalCheckDefaults,
  finalCheckContext,
  finalCheckReady,
  syncDraftAssignment,
} from '../design/content.js';
import { serializeDirectionsEditor } from '../../shared/directions-editor.js';
import { bindDirectionsEditorControls } from '../../shared/directions-editor-controls.js';
import { showBabbageCameo } from '../../shared/babbage-cameo.js';
import { openMayaDialog } from '../design/maya-dialog.js';
import { openGuidePreview } from '../design/guide-preview.js';
import { downloadGuide } from '../design/guide.js';
import { confirmRestart } from '../../shared/restart-dialog.js';
import { openReferences } from '../../shared/reference-dialog.js';

// Shared Scenario/Workspace composition: route, session state, services, and delegated UI events.
export function mountWorkspace(app, params, { scenario = false } = {}) {
  const route = designRoute(scenario ? 'scenario' : 'workspace');
  const saveWorkspace = route.save,
    resetWorkspace = route.reset;
  const restored = route.read();
  if (scenario && restored.needsIntro && !restored.error) {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'play');
    window.location.replace(url);
    return;
  }
  let state = restored.state,
    readError = restored.error;
  let designPage = restored.designPage || (state.design.revision.trim() ? 'draft' : 'start'),
    partnerPage = 'work',
    reviewPage =
      state.finalCheck.approved || state.creative.review.manualOnly ? 'guide' : 'rationale';
  let showingWrapUp = scenario && restored.wrapUp;
  let closingStage = scenario ? 'board' : 'dialogue';
  let closingPage = 0;
  if (!scenario && params.get('build') === 'start') {
    state.designPanel = 'revision';
    designPage = 'start';
  }
  let reworkForReview = false;
  let draftDestination = 'review';
  let ui = workspaceViews();
  const ai = { pending: false, configured: null, suggestion: null, error: '', context: '' };
  if (params.get('mockBabbage') === '1') state.babbage.mode = 'dev';
  const idea = scenario ? null : findIdea(params.get('adapt'));
  if (idea && !readError) {
    adaptIdea(state, idea);
    designPage = 'subject';
    saveWorkspace(state);
  }
  if (params.has('adapt')) {
    const url = new URL(window.location.href);
    url.searchParams.delete('adapt');
    history.replaceState(null, '', url);
  }
  const saveSafely = () => !readError && saveWorkspace(state);
  const syncFinalCheck = () => {
    if (scenario) {
      state.design.instructorPlan = state.workspace.instructorPlan || '';
      state.design.feedbackClarifications = state.workspace.openQuestions || '';
    }
    const context = finalCheckContext(state.teacher, state.design);
    if (state.finalCheck.context !== context)
      state.finalCheck = { ...finalCheckDefaults(), context };
  };
  const syncWaiting = createAiWaiting({
    onCancel() {
      ai.requestController?.abort();
      reviews.cancel();
      ai.pending = false;
      ai.error = '';
      render();
      document.getElementById('setup-title')?.focus({ preventScroll: true });
    },
  });
  const render = ({ focus = false } = {}) => {
    app.innerHTML = showingWrapUp
      ? renderClosing(state, closingStage, closingPage)
      : renderWorkspace(state, ai, readError, designPage, partnerPage, reviewPage, ui);
    fitWorkspace(app);
    if (ui.popup && !ai.pending)
      mountWorkspacePopup(app, state, ui, () => {
        ui.popup = '';
        render();
      });
    if (state.designPanel !== 'reason') showBabbageCameo(state, app);
    syncWaiting(
      {
        ...ai,
        pending: ai.pending || state.creative.review.status === 'pending',
        stage:
          state.creative.review.status === 'pending'
            ? state.creative.review.stage || 'working'
            : ai.stage,
        intent: state.creative.review.status === 'pending' ? 'review' : ai.intent,
      },
      state.babbage.mode === 'dev',
    );
    if (focus) document.getElementById('setup-title')?.focus({ preventScroll: true });
  };
  function focusTask() {
    const target =
      app.querySelector('#workspace-view-title') ||
      app.querySelector('#design-page-title') ||
      app.querySelector('#review-title') ||
      app.querySelector('.partner-content h3') ||
      app.querySelector('#setup-title');
    target?.setAttribute('tabindex', '-1');
    target?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const controller = createDesignController({
    app,
    getState: () => state,
    ai,
    render,
    saveSafely,
    syncFinalCheck,
    onSuggestion(source, suggestion) {
      if (
        !reworkForReview ||
        source !== state ||
        state.designPanel !== 'babbage' ||
        ai.context !== assignmentContext(state)
      )
        return false;
      reworkForReview = false;
      applySuggestedDraft(state, suggestion);
      ai.suggestion = null;
      state.creative.review = emptyReview();
      const draftNotes =
        state.babbage.history.findLast((turn) => turn.role === 'assistant')?.display || '';
      if (draftNotes.trim())
        Object.assign(state.creative.review, {
          feedback: draftNotes,
          fingerprint: reviewFingerprint(state),
          status: 'complete',
        });
      syncFinalCheck();
      controller.syncBabbage();
      if (draftDestination === 'draft') {
        designPage = 'draft';
        setPanel('revision');
        app.querySelector('.design-notice').textContent =
          'Your activity was compiled from your Build choices. Review the directions and edit anything you want to change.';
      } else enterReview();
      showBabbageCameo(
        state,
        app,
        state.babbage.history.findLast((turn) => turn.role === 'assistant')?.display || '',
      );
      return true;
    },
  });
  function saveAlternative(direction) {
    const exists = state.creative.alternatives.some(
      (item) => JSON.stringify(item) === JSON.stringify(direction),
    );
    if (!exists && state.creative.alternatives.length >= MAX_SAVED_ALTERNATIVES) {
      app.querySelector('.design-notice').textContent =
        'Thirty possibilities are already saved. Your current work is unchanged.';
      return false;
    }
    if (!exists) state.creative.alternatives.push(structuredClone(direction));
    if (!saveSafely()) {
      app.querySelector('.design-notice').textContent =
        'This possibility is kept in the open workspace, but could not be saved in this browser.';
      updateApproval();
      return false;
    }
    app.querySelector('.design-notice').textContent = exists
      ? 'This possibility is already saved.'
      : 'Possibility saved for later. Your draft is unchanged.';
    return true;
  }
  function developDirection(direction) {
    if (state.workspace.selectedDirection && !saveAlternative(state.workspace.selectedDirection))
      return;
    state.workspace.selectedDirection = structuredClone(direction);
    state.workspace.creativeCore = direction.core;
    state.finalCheck = finalCheckDefaults();
    // Choosing a sketch adds context; it must not erase already answered questions.
    state.babbage.context = assignmentContext(state);
    ai.suggestion = null;
    controller.syncBabbage();
    designPage = 'subject';
    setPanel('revision');
    document.getElementById('creative-core')?.focus();
  }
  async function exploreDirections() {
    if (
      ai.pending ||
      state.babbage.mode === 'dev' ||
      ai.configured !== true ||
      !state.teacher.directions.trim()
    )
      return;
    const initialExploration =
      !state.creative.directions.length &&
      !state.creative.alternatives.length &&
      !state.workspace.selectedDirection &&
      !state.design.revision.trim();
    if (initialExploration && state.babbage.questions.length) {
      state.babbage = { ...conversationDefaults(), mode: state.babbage.mode };
    }
    await exploreWorkspace({
      getState: () => state,
      ai,
      onStart: () => {
        partnerPage = 'work';
        state.designPanel = 'babbage';
        ui = workspaceViews();
        render();
      },
      onStage: () => {
        if (state.designPanel === 'babbage') render();
      },
      onComplete: () => {
        partnerPage = 'ideas';
      },
      onFinish: () => {
        saveSafely();
        if (state.designPanel !== 'revision') {
          render();
          if (state.designPanel === 'babbage') {
            document.getElementById('possibilities-title')?.focus({ preventScroll: true });
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }
      },
    });
  }

  function updateApproval() {
    app.querySelectorAll('[data-final-check]').forEach((control) => {
      control.checked = state.finalCheck[control.dataset.finalCheck];
    });
    const approve = app.querySelector('[data-action="approve-version"]');
    if (approve) {
      approve.disabled = !finalCheckReady(state) || state.finalCheck.approved;
      approve.textContent = state.finalCheck.approved
        ? 'Saved to your Course Guide'
        : 'Save final design';
    }
    const download = app.querySelector('[data-action="download-guide"]');
    if (download) download.disabled = !state.design.revision.trim();
    app.querySelectorAll('.workspace-save-status').forEach((status) => {
      status.textContent = state.saveNotice
        ? 'Not saved in this browser.'
        : 'Saved in this browser.';
    });
    const status = app.querySelector('.final-check-status');
    if (status)
      status.textContent = state.finalCheck.approved
        ? 'This design is approved for your Course Guide.'
        : finalCheckReady(state)
          ? 'Ready to save. Select Save final design.'
          : 'Include your rationale and review all three checks before saving.';
    const notice = app.querySelector('.save-notice');
    if (notice) notice.textContent = state.saveNotice;
  }
  // Form edits keep saved context, AI suggestions, and approval in sync.
  function input(control) {
    if (readError) return;
    if (control.dataset?.rubricCriterion !== undefined) {
      state.creative.rubric ||= emptyRubric();
      const names = state.creative.rubric.criteria.split('\n');
      names[Number(control.dataset.rubricCriterion)] = control.value.slice(0, 200);
      state.creative.rubric.criteria = names.join('\n');
      state.creative.rubric.confirmed = false;
      saveSafely();
      return;
    }
    if (control.dataset?.rubricParam) {
      state.creative.rubric ||= emptyRubric();
      const key = control.dataset.rubricParam;
      if (['title', 'submission', 'total', 'criteria'].includes(key)) {
        state.creative.rubric[key] = control.value.slice(0, 2000);
        state.creative.rubric.confirmed = false;
        saveSafely();
      }
      return;
    }
    if (control.dataset?.rubricRow) {
      const row = state.creative.rubric?.rows[Number(control.dataset.rubricRow)];
      if (!row) return;
      const field = control.dataset.rubricField;
      if (field === 'ratings')
        row.ratings[Number(control.dataset.rubricRating)] = control.value.slice(0, 2000);
      else if (['name', 'description'].includes(field)) row[field] = control.value.slice(0, 2000);
      saveSafely();
      return;
    }
    if (control.closest('[data-setup-form]') && isTestLessonKeyword(control)) {
      ai.requestController?.abort();
      reviews.cancel();
      const previousPanel = state.designPanel;
      const previewJoke = control.value.trim().toLowerCase() === 'joke';
      fillTestLesson(state, control.value);
      state.designPanel = previousPanel;
      reworkForReview = false;
      state.creative.review = emptyReview();
      Object.assign(ai, {
        configured: null,
        pending: false,
        suggestion: null,
        error: '',
        context: '',
      });
      partnerPage = 'work';
      reviewPage = 'rationale';
      saveSafely();
      render({ focus: true });
      if (previewJoke) {
        showBabbageCameo(
          state,
          app,
          'The printer applied for management. It already knows how to keep everyone in a jam.',
          { preview: true },
        );
      }
      controller.refreshBabbageConnection();
      return;
    }
    if (control.name === 'aiUseDetails' && control.closest('[data-setup-form]')) {
      const previousContext = assignmentContext(state);
      state.teacher.aiUse = control.value;
      invalidateWorkspaceApproval(state, previousContext);
      syncFinalCheck();
      controller.syncBabbage();
      saveSafely();
      updateApproval();
      return;
    }
    if (control.dataset?.creativeField === 'feedback') {
      state.creative.feedback = control.value.slice(0, MAX_WORKSPACE_TEXT);
      saveSafely();
      return;
    }
    if (control.dataset?.feedbackAnswer !== undefined) {
      const record = (state.creative.conversation ||= emptyFeedbackConversation());
      if (control.dataset.feedbackAnswer === 'other') record.other = control.value.slice(0, 1000);
      else {
        const question = currentFeedbackQuestions(state)[Number(control.dataset.feedbackAnswer)];
        if (question) saveFeedbackAnswer(state, question, control.value);
      }
      saveSafely();
      return;
    }
    if (control.dataset?.clarificationAnswer || control.dataset?.clarificationChoice)
      return controller.updateClarificationAnswer(control);
    const previousContext = assignmentContext(state);
    let movedDraft = false;
    if (control.dataset?.workspaceMeta) {
      state.workspace[control.dataset.workspaceMeta] = control.value.slice(0, MAX_WORKSPACE_TEXT);
      if (control.dataset.workspaceMeta === 'assignmentTitle')
        state.creative.rubric.title = rubricForState(state).title;
      if (workspacePlanningFields.includes(control.dataset.workspaceMeta)) {
        state.babbage.context = assignmentContext(state);
        ai.suggestion = null;
      }
    } else if (control.closest('[data-assignment-editor]'))
      state.design.revision = serializeDirectionsEditor(
        control.closest('[data-assignment-editor]'),
      );
    else if (control.closest('[data-design-form]') && Object.hasOwn(state.design, control.name))
      state.design[control.name] = control.value;
    else if (control.closest('[data-setup-form]') && Object.hasOwn(state.teacher, control.name)) {
      const previousAI = state.teacher.aiUse;
      state.teacher[control.name] = control.type === 'checkbox' ? control.checked : control.value;
      if (control.name === 'aiUse') {
        const oldChoice = state.workspace.aiUseChoice;
        state.workspace.aiUseChoice = control.value;
        const detail =
          oldChoice && previousAI.startsWith(oldChoice)
            ? previousAI.slice(oldChoice.length).trim()
            : previousAI;
        if (detail) state.teacher.aiUse = control.value + '\n' + detail;
        if (ui.popup === 'ai-use') {
          ui.popup = '';
          queueMicrotask(() => {
            render();
            app.querySelector('[data-action="open-ai-use-popup"]')?.focus();
          });
        }
        const details = app.querySelector('#aiUseDetails');
        if (details) details.value = state.teacher.aiUse;
      }
      if (control.value.trim() && Object.hasOwn(state.teacher, control.name + 'Unsure'))
        state.teacher[control.name + 'Unsure'] = false;
      movedDraft =
        state.design.revision.trim() && state.design.sourceDirections !== state.teacher.directions;
      syncDraftAssignment(state.teacher, state.design);
    } else return;
    invalidateWorkspaceApproval(state, previousContext);
    syncFinalCheck();
    controller.syncBabbage();
    saveSafely();
    if (control.dataset?.workspaceMeta === 'sourceKind' || movedDraft) {
      const id = control.id,
        start = control.selectionStart,
        end = control.selectionEnd;
      render();
      const target = id
        ? document.getElementById(id)
        : app.querySelector('input[name="sourceKind"]:checked');
      target?.focus({ preventScroll: true });
      if (typeof start === 'number') target?.setSelectionRange(start, end);
    }
    const useStarting = app.querySelector('[data-action=use-starting]');
    if (useStarting) {
      useStarting.hidden = Boolean(state.design.revision.trim());
      useStarting.disabled = !state.teacher.directions.trim();
    }
    updateApproval();
  }
  // Editor behavior is shared and survives replacement of the rendered form.
  bindDirectionsEditorControls(app);
  app.addEventListener('submit', (event) => event.preventDefault());
  app.addEventListener('input', (event) => input(event.target));
  app.addEventListener('change', (event) => {
    if (event.target.matches?.('[data-editor-style]')) return;
    if (event.target.matches('[data-workspace-section-picker]')) {
      const attribute = event.target.dataset.workspaceSectionPicker;
      if (!['data-design-page', 'data-review-page'].includes(attribute)) return;
      const control = Array.from(app.querySelectorAll('[' + attribute + ']')).find(
        (button) => button.getAttribute(attribute) === event.target.value,
      );
      control?.click();
      app.querySelector('[data-workspace-section-picker]')?.focus({ preventScroll: true });
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
  // Review services own cancellation; this mount owns navigation, focus, and dialogs.
  const reviews = createWorkspaceReviewController({
    getState: () => state,
    canReview: () => !readError && !showingWrapUp && !ai.pending,
    save: saveSafely,
    render,
    onMayaReady({ source, review, isCurrent }) {
      const open = () => {
        if (!isCurrent() || showingWrapUp || !shouldOpenMaya(source)) return;
        review.offeredMaya = review.fingerprint;
        saveSafely();
        openMayaDialog(source, document.getElementById('review-title'), {
          autoStart: true,
          onReturn: returnFromMaya,
          onSave: saveSafely,
          onRevise: reviseFromConversation,
        });
      };
      const cameo = document.querySelector('.babbage-cameo-dialog[open]');
      if (cameo) cameo.close();
      open();
    },
  });
  async function createRubric(action = 'generate-rubric') {
    if (ai.pending || reviews.pending) return;
    const source = state,
      basis = state.design.revision,
      request = new AbortController();
    const snapshot = structuredClone(state);
    if (action === 'draft-rubric-criteria') snapshot.creative.rubric.criteria = '';
    Object.assign(ai, {
      pending: true,
      requestController: request,
      intent: 'review',
      stage: 'sending',
      error: '',
    });
    render();
    try {
      const rows = await generateRubric(snapshot, {
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(180000)]),
        onProgress: (stage) => {
          if (source === state && ai.requestController === request && !request.signal.aborted) {
            ai.stage = stage;
            render();
          }
        },
      });
      if (source !== state || request.signal.aborted || ai.requestController !== request) return;
      if (basis !== state.design.revision)
        throw Error('Your assignment changed. Create the rubric again for the current draft.');
      Object.assign(state.creative.rubric, {
        title: rubricForState(snapshot).title,
        submission: rubricForState(snapshot).submission,
      });
      ui.rubricPart = 'rubric';
      state.creative.rubric.rows = rows;
      if (!snapshot.creative.rubric.criteria.trim())
        state.creative.rubric.criteria = rows.map((row) => row.name).join('\n');
      state.creative.rubric.basis = basis;
      state.creative.rubric.confirmed = true;
      if (!state.workspace.assignmentTitle?.trim() && rows.assignmentTitle)
        state.workspace.assignmentTitle = rows.assignmentTitle;
      state.creative.rubric.title = rubricForState(state).title;
      saveSafely();
    } catch (error) {
      if (source === state && !request.signal.aborted) ai.error = error.message;
    } finally {
      if (ai.requestController === request) {
        ai.pending = false;
        ai.requestController = null;
        render();
        const notice = app.querySelector('[data-rubric-notice]');
        if (notice)
          notice.textContent =
            ai.error ||
            (request.signal.aborted
              ? 'Rubric cancelled. Your work is saved.'
              : 'Rubric created. Edit the descriptors, then continue.');
      }
    }
    return;
  }
  function askRubricPreference(resume) {
    if (state.creative.rubric.requested !== null || state.creative.rubric.rows.length) return false;
    ui.popup = 'rubric-choice';
    ui.resumeAction = resume;
    render();
    return true;
  }
  function showRubricAutomatically(force = false) {
    if (state.creative.rubric.requested === false && !force) return;
    if (force) {
      state.creative.rubric.requested = true;
      saveSafely();
    }
    ui.popup = 'rubric';
    ui.rubricPart = 'preview';
    render();
    if (!state.creative.rubric.rows.length) void createRubric();
  }
  async function startCompilation(action) {
    if (askRubricPreference(action)) return;
    if (ai.pending || reviews.pending || !state.teacher.directions.trim()) return;
    reworkForReview = action !== 'consult-babbage';
    draftDestination = action === 'compile-activity' ? 'draft' : 'review';
    ui = { ...workspaceViews(), task: reworkForReview ? 'draft' : 'explore' };
    partnerPage = 'work';
    state.designPanel = 'babbage';
    controller.syncBabbage();
    if (clarificationLimitReached(state.babbage)) {
      render();
      return;
    }
    if (
      reworkForReview &&
      state.teacher.learningGoal.trim() &&
      !state.teacher.learningGoalUnsure &&
      !isUncertainAnswer(state.teacher.learningGoal) &&
      state.teacher.aiUse.trim() &&
      !isUncertainAnswer(state.teacher.aiUse)
    )
      state.babbage.ready = true;
    await controller.askBabbage(state.babbage.ready ? 'revise' : 'clarify');
  }
  async function reviseFromConversation() {
    const notes = savedFeedbackNotes(state);
    if (!notes) return;
    const previous = assignmentContext(state);
    const existing = state.workspace.openQuestions || '';
    const marker = 'Educator conversation with Maya and Pixel:\n';
    const applied = state.creative.conversation.appliedNotes;
    const preserved = applied ? existing.replace(applied, '').trim() : existing;
    const combined = [preserved, marker + notes].filter(Boolean).join('\n\n');
    if (combined.length > MAX_WORKSPACE_TEXT) {
      render();
      app.querySelector('.design-notice').textContent =
        'Your answers are saved. Shorten the project notes in Build before using them for a revision.';
      return;
    }
    state.workspace.openQuestions = combined;
    state.creative.conversation.appliedNotes = marker + notes;
    invalidateWorkspaceApproval(state, previous);
    syncFinalCheck();
    saveSafely();
    const source = state,
      request = new AbortController();
    const basis = assignmentContext(state);
    const snapshot = structuredClone(state);
    Object.assign(ai, {
      pending: true,
      requestController: request,
      stage: 'working',
      intent: 'revise',
      error: '',
    });
    render();
    try {
      const suggestion = await requestConversationRevision(snapshot, notes, {
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(180000)]),
        onProgress: (stage) => {
          if (source === state && !request.signal.aborted && ai.requestController === request) {
            ai.stage = stage;
            render();
          }
        },
      });
      if (request.signal.aborted || source !== state || ai.requestController !== request) return;
      if (basis !== assignmentContext(state))
        throw Error(
          'Your draft changed while the edit was prepared. Your answers are saved; review your current activity.',
        );
      applySuggestedDraft(state, suggestion);
      state.creative.review.manualOnly = true;
      state.creative.review.status = state.creative.review.feedback ? 'complete' : 'idle';
      syncFinalCheck();
      designPage = 'draft';
      state.designPanel = 'revision';
      ui = workspaceViews();
      saveSafely();
    } catch (error) {
      if (!request.signal.aborted && source === state) ai.error = error.message;
    } finally {
      if (ai.requestController === request) {
        ai.pending = false;
        ai.requestController = null;
        if (source === state) {
          render();
          app.querySelector('.design-notice').textContent = request.signal.aborted
            ? 'Revision cancelled. Your draft and answers are saved.'
            : ai.error ||
              'Your requested edit is ready in Build. Review it, then open Review for the guide. Another AI reading is optional.';
        }
      }
    }
  }
  function returnFromMaya({ completed = false } = {}) {
    if (state.designPanel !== 'reason' || showingWrapUp) return;
    if (completed) {
      state.creative.review.perspectivesComplete = true;
      saveSafely();
    }
    reviewPage = completed ? 'reasoning' : 'rationale';
    render();
    document.getElementById('review-title')?.focus({ preventScroll: true });
  }
  function requirePerspectives(destination = 'reasoning') {
    const review = state.creative.review;
    if (destination === 'rubric') return false;
    if (
      destination === 'rationale' ||
      state.finalCheck.approved ||
      review.manualOnly ||
      review.perspectivesComplete ||
      !state.design.revision.trim()
    )
      return false;
    if (reviews.pending || ai.pending) return true;
    if (review.feedback) {
      review.offeredMaya = reviewFingerprint(state);
      saveSafely();
      openMayaDialog(state, app.querySelector('#workspace-tab-reason'), {
        autoStart: true,
        onReturn: returnFromMaya,
        onSave: saveSafely,
        onRevise: reviseFromConversation,
      });
    } else void reviews.runAutomatic();
    return true;
  }
  function enterReview() {
    if (askRubricPreference('enter-review')) return;
    ui = workspaceViews();
    state.designPanel = 'reason';
    reviewPage = state.creative.review.manualOnly
      ? state.design.reason.trim()
        ? 'checks'
        : 'reasoning'
      : 'rationale';
    saveSafely();
    render();
    document.getElementById('workspace-tab-reason')?.focus();
    if (!requirePerspectives()) {
      if (reviewPage === 'checks') showRubricAutomatically();
      else void reviews.runAutomatic();
    }
  }
  const setPanel = (panel) => {
    reworkForReview = false;
    if (panel === 'reason') return enterReview();
    ui = workspaceViews();
    state.designPanel = panel;
    saveSafely();
    render();
    document.getElementById('workspace-tab-' + panel)?.focus();
  };
  app.addEventListener('keydown', (event) => {
    const tab = event.target.closest('[data-workspace-panel]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const panels = workspacePanelIds;
    const index = panels.indexOf(tab.dataset.workspacePanel);
    const offset = event.key === 'ArrowRight' ? 1 : panels.length - 1;
    setPanel(
      panels[
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? panels.length - 1
            : (index + offset) % panels.length
      ],
    );
  });
  async function reset() {
    if (!(await confirmRestart(route.resetDialog))) return;
    ai.requestController?.abort();
    reviews.cancel();
    const mode = state.babbage.mode;
    if (!resetWorkspace()) {
      state.saveNotice = 'This browser could not reset the workspace.';
      updateApproval();
      return;
    }
    if (scenario) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'play');
      window.location.replace(url);
      return;
    }
    showingWrapUp = false;
    ui = workspaceViews();
    state = freshWorkspace();
    designPage = 'start';
    partnerPage = 'work';
    reviewPage = 'rationale';
    state.babbage.mode = mode;
    readError = '';
    Object.assign(ai, { pending: false, suggestion: null, error: '', context: '' });
    saveSafely();
    render({ focus: true });
  }
  app.addEventListener('change', async (event) => {
    if (!event.target.matches('[data-project-file-input]')) return;
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file || ai.pending) return;
    const notice = app.querySelector('.design-notice');
    if (file.size > MAX_PROJECT_BYTES) {
      if (notice) notice.textContent = 'Project file is too large.';
      return;
    }
    let imported;
    try {
      imported = parseProjectFile(await file.text());
      if ((imported.experience === 'scenario') !== scenario)
        throw Error(
          'Open this project in its original path: ' +
            (imported.experience === 'scenario' ? 'Scenario 1.' : 'Creative Workspace.'),
        );
    } catch (error) {
      if (notice) notice.textContent = error.message;
      return;
    }
    if (
      !window.confirm(
        'Open this project? It will replace your current browser workspace. Download your current project first if you want to keep it.',
      )
    )
      return;
    if (!saveWorkspace(imported)) {
      if (notice) notice.textContent = imported.saveNotice;
      return;
    }
    reviews.cancel();
    state = imported;
    readError = '';
    showingWrapUp = false;
    designPage = state.design.revision.trim() ? 'draft' : 'start';
    partnerPage = 'work';
    reviewPage =
      state.finalCheck.approved || state.creative.review.manualOnly ? 'guide' : 'rationale';
    ui = workspaceViews();
    Object.assign(ai, { pending: false, suggestion: null, error: '', context: '' });
    render({ focus: true });
    app.querySelector('.design-notice').textContent =
      'Project opened. Your editable work has been restored.';
    if (
      state.designPanel === 'reason' &&
      !askRubricPreference('enter-review') &&
      !requirePerspectives()
    )
      void reviews.runAutomatic();
  });
  // Delegated navigation and actions remain bound while render replaces page contents.
  app.addEventListener('click', async (event) => {
    const route = event.target.closest('[data-workspace-view]');
    if (route && !readError) {
      const screen = route.dataset.workspaceView;
      if (screen === 'preview' && ai.pending) return;
      const allowed = [
        'work',
        'options',
        'sections',
        'preview',
        'saved',
        'combine',
        'feedback',
        'earlier',
        'maya',
        'review-options',
      ];
      if (!allowed.includes(screen)) return;
      const active = document.activeElement;
      const returning = screen === 'work';
      const opener = returning ? ui.opener : active?.id;
      const selection = returning
        ? ui.selection
        : typeof active?.selectionStart === 'number'
          ? [active.selectionStart, active.selectionEnd]
          : null;
      ui = { ...workspaceViews(), screen, opener, selection };
      render();
      const target = returning && opener ? document.getElementById(opener) : null;
      if (target) {
        target.focus({ preventScroll: true });
        if (selection && target.setSelectionRange) target.setSelectionRange(...selection);
      } else focusTask();
      return;
    }
    const directionView = event.target.closest('[data-view-direction]');
    if (directionView && !readError) {
      ui = {
        ...workspaceViews(),
        screen: 'idea',
        index: Number(directionView.dataset.viewDirection),
        saved: directionView.hasAttribute('data-saved-direction'),
        opener: directionView.id,
      };
      render();
      focusTask();
      return;
    }
    const part = event.target.closest('[data-idea-part]');
    if (part) {
      ui.part = part.dataset.ideaPart;
      render();
      focusTask();
      return;
    }
    const savedPage = event.target.closest('[data-saved-page]');
    if (savedPage) {
      ui.index = Math.max(0, Number(savedPage.dataset.savedPage) || 0);
      render();
      focusTask();
      return;
    }
    const history = event.target.closest('[data-history-index]');
    if (history) {
      ui.historyIndex = Number(history.dataset.historyIndex);
      render();
      focusTask();
      return;
    }
    const feedbackPage = event.target.closest('[data-feedback-page]');
    if (feedbackPage) {
      ui.feedbackPage = Number(feedbackPage.dataset.feedbackPage);
      ui.clarifyNow = false;
      render();
      return;
    }
    if (event.target.closest('[data-clarify-now]')) {
      ui.clarifyNow = true;
      render();
      app.querySelector('[data-clarification-answer]')?.focus();
      return;
    }
    const partner = event.target.closest('[data-partner-page]');
    if (partner) {
      ui = workspaceViews();
      partnerPage = partner.dataset.partnerPage;
      state.designPanel = 'babbage';
      saveSafely();
      render();
      document.getElementById('ai-title')?.focus({ preventScroll: true });
      return;
    }
    const review = event.target.closest('[data-review-page]');
    if (review) {
      const destination = review.dataset.reviewPage;
      if (destination === 'rubric') {
        showRubricAutomatically(true);
        return;
      }
      if (requirePerspectives(destination)) return;
      if (['checks', 'guide', 'help'].includes(destination) && !state.design.reason.trim()) {
        reviewPage = 'reasoning';
        render();
        document.getElementById('reason')?.focus();
        return;
      }
      const show = () => {
        ui = workspaceViews();
        state.designPanel = 'reason';
        reviewPage = destination;
        render();
        document.getElementById('review-title')?.focus({ preventScroll: true });
      };
      if (destination === 'checks' && !state.finalCheck.approved) {
        if (!state.design.revision.trim()) {
          app.querySelector('.design-notice').textContent =
            'Add your activity in Build before checking the design.';
          return;
        }
        show();
      } else show();
      if (destination === 'checks') showRubricAutomatically();
      if (destination === 'help') openGuidePreview(state, app);
      return;
    }
    const page = event.target.closest('[data-design-page]');
    if (page) {
      ui = workspaceViews();
      state.designPanel = 'revision';
      designPage = page.dataset.designPage;
      if (designPage === 'ai-use') ui.popup = 'ai-use';
      saveSafely();
      render();
      document.getElementById('design-page-title')?.focus({ preventScroll: true });
      return;
    }
    const tab = event.target.closest('[data-workspace-panel]');
    if (tab) return setPanel(tab.dataset.workspacePanel);
    const directionControl = event.target.closest(
      '[data-develop-direction], [data-save-direction]',
    );
    if (directionControl && !readError && !ai.pending) {
      const saving = directionControl.hasAttribute('data-save-direction');
      const index = Number(
        saving ? directionControl.dataset.saveDirection : directionControl.dataset.developDirection,
      );
      const direction = (
        directionControl.hasAttribute('data-saved-direction')
          ? state.creative.alternatives
          : state.creative.directions
      )[index];
      if (!direction) return;
      if (saving) {
        saveAlternative(direction);
        const notice = app.querySelector('.design-notice').textContent;
        render();
        app.querySelector('.design-notice').textContent = notice;
        const savedControl = app.querySelector('[data-save-direction="' + index + '"]');
        savedControl?.focus();
        return;
      }
      developDirection(direction);
      return;
    }
    let action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'open-ai-use-popup' || action === 'open-rubric-popup') {
      if (action === 'open-rubric-popup') {
        showRubricAutomatically(true);
        return;
      }
      ui.popup = 'ai-use';
      render();
      return;
    }
    if (action === 'include-rubric' || action === 'skip-rubric') {
      const resume = ui.resumeAction;
      state.creative.rubric.requested = action === 'include-rubric';
      ui.popup = '';
      saveSafely();
      if (resume === 'enter-review') enterReview();
      else if (resume) await startCompilation(resume);
      else render();
      return;
    }
    if (action === 'edit-rubric') {
      ui.rubricPart = 'edit';
      render();
      return;
    }
    if (action === 'view-rubric') {
      ui.rubricPart = 'preview';
      render();
      return;
    }
    if (action === 'rubric-edit-criteria') {
      ui.rubricPart = 'criteria';
      render();
      return;
    }
    if (action === 'close-workspace-popup') {
      ui.popup = '';
      render();
      return;
    }
    const criterionPage = event.target.closest('[data-rubric-criterion-page]');
    if (criterionPage) {
      ui.rubricCriterion = Number(criterionPage.dataset.rubricCriterionPage);
      render();
      return;
    }

    if (action === 'save-project-file' && !readError) {
      downloadProjectFile(state);
      app.querySelector('.design-notice').textContent =
        'Project download started. Keep the JSON file to reopen this work later.';
      return;
    }
    if (action === 'open-project-file' && !readError) {
      app.querySelector('[data-project-file-input]')?.click();
      return;
    }
    if (action === 'reset-workspace') return reset();
    if (readError) return;
    if (action === 'finish-workspace' && state.finalCheck.approved && finalCheckReady(state)) {
      reviews.cancel();
      showingWrapUp = true;
      closingStage = scenario ? 'board' : 'dialogue';
      closingPage = 0;
      if (scenario) {
        state.phase = 'closing';
        saveSafely();
      }
      render({ focus: true });
      return;
    }
    if (action === 'closing-pixel' && showingWrapUp) {
      closingStage = 'dialogue';
      closingPage = 0;
      render({ focus: true });
      return;
    }
    if (action === 'workspace-home' && showingWrapUp) {
      window.location.href = '?view=home';
      return;
    }
    if (action === 'closing-next' && showingWrapUp) {
      closingPage++;
      render({ focus: true });
      return;
    }
    if (action === 'closing-previous' && showingWrapUp) {
      closingPage--;
      render({ focus: true });
      return;
    }
    if (action === 'preview-guide' && showingWrapUp) {
      // Put the saved guide behind its preview before opening it. Closing the
      // dialog should never reveal the final character frame or navigate away.
      showingWrapUp = false;
      if (scenario) {
        state.phase = 'design';
        saveSafely();
      }
      ui = workspaceViews();
      reviewPage = 'guide';

      render();
      openGuidePreview(state, app, {
        onClose: () => {
          window.location.href = '?view=home';
        },
      });
      return;
    }
    if (action === 'return-assignment' && showingWrapUp) {
      showingWrapUp = false;
      if (scenario) {
        state.phase = 'design';
        saveSafely();
      }
      ui = workspaceViews();
      reviewPage = 'guide';

      render();
      document.getElementById('review-title')?.focus({ preventScroll: true });
      return;
    }
    if (action === 'toggle-teaching-notes') {
      ui.showTeachingNotes = !ui.showTeachingNotes;
      render();
      return;
    }
    if (action === 'apply-teaching-note') {
      if (reviews.pending || ai.pending) return;
      const button = event.target.closest('[data-teaching-note]');
      const field = button?.dataset.teachingNote;
      const edits = Array.from(app.querySelectorAll('[data-teaching-note-proposal]')).map(
        (control) => [control.dataset.teachingNoteProposal, control.value],
      );
      const proposal = Array.from(app.querySelectorAll('[data-teaching-note-proposal]')).find(
        (control) => control.dataset.teachingNoteProposal === field,
      );
      if (!applyTeachingNoteSuggestion(state, field, proposal?.value)) {
        app.querySelector('.design-notice').textContent =
          'This suggestion is no longer current, or its wording is empty. Review your current notes before applying it.';
        return;
      }
      ai.suggestion = null;
      syncFinalCheck();
      controller.syncBabbage();
      saveSafely();
      render();
      for (const [name, value] of edits) {
        if (name === field) continue;
        const remaining = Array.from(app.querySelectorAll('[data-teaching-note-proposal]')).find(
          (control) => control.dataset.teachingNoteProposal === name,
        );
        if (remaining) remaining.value = value;
      }
      app.querySelector('.design-notice').textContent =
        'Your teaching note was updated. Review the final checks before saving the guide.';
      document.getElementById('review-title')?.focus({ preventScroll: true });
      return;
    }
    if (
      action === 'add-rubric-criterion' ||
      event.target.closest('[data-remove-rubric-criterion]')
    ) {
      const names = state.creative.rubric.criteria.split('\n');
      const remove = event.target.closest('[data-remove-rubric-criterion]');
      if (remove) names.splice(Number(remove.dataset.removeRubricCriterion), 1);
      else if (names.length < 8) names.push('');
      state.creative.rubric.criteria = names.join('\n');
      state.creative.rubric.confirmed = false;
      saveSafely();
      render();
      return;
    }
    if (action === 'generate-rubric' || action === 'draft-rubric-criteria') {
      await createRubric(action);
      return;
    }
    if (action === 'rubric-continue') {
      if (!state.creative.rubric?.rows.length) return;
      state.creative.rubric.confirmed = true;
      saveSafely();
      enterReview();
      return;
    }
    if (action === 'download-rubric-csv' || action === 'download-rubric-html') {
      if (state.creative.rubric?.rows.length)
        downloadRubric(rubricForState(state), action.endsWith('csv') ? 'csv' : 'html');
      return;
    }
    if (action === 'check-workspace-revision') {
      await reviews.check();
      return;
    }
    if (action === 'continue-to-maya') {
      if (reviews.pending || ai.pending || !reviewEligible(state)) return;
      const fingerprint = reviewFingerprint(state);
      state.creative.review.offeredMaya = fingerprint;
      saveSafely();
      if (!state.creative.mayaPaused)
        openMayaDialog(state, event.target.closest('[data-action]'), {
          autoStart: true,
          onReturn: returnFromMaya,
          onSave: saveSafely,
          onRevise: reviseFromConversation,
        });
      else {
        app.querySelector('.design-notice').textContent =
          'Maya is paused. You can continue to the final checks.';
      }
      return;
    }
    if (action === 'revise-from-feedback') {
      if (reviews.pending || ai.pending) return;
      const answers = Object.fromEntries(
        Array.from(app.querySelectorAll('[data-feedback-answer]')).map((control) => [
          control.dataset.feedbackAnswer,
          control.value,
        ]),
      );
      try {
        const notes = clarificationNotes(currentFeedbackQuestions(state), answers);
        const combined = [state.workspace.openQuestions || '', notes].filter(Boolean).join('\n\n');
        if (combined.length > MAX_WORKSPACE_TEXT)
          throw Error(
            'Your project notes are full. Shorten the open questions in Build before adding these answers.',
          );
        const previous = assignmentContext(state);
        state.workspace.openQuestions = combined;
        invalidateWorkspaceApproval(state, previous);
        syncFinalCheck();
        saveSafely();
        action = 'compile-activity';
      } catch (error) {
        app.querySelector('.design-notice').textContent = error.message;
        return;
      }
    }
    if (['compile-activity', 'review-my-design', 'consult-babbage'].includes(action)) {
      await startCompilation(action);
      return;
    }
    if (action === 'explore-directions') {
      await exploreDirections();
      return;
    }
    if (action === 'combine-directions' && !ai.pending) {
      const choices = [...app.querySelectorAll('[data-combine-direction]:checked')]
        .map((control) => state.creative.directions[Number(control.dataset.combineDirection)])
        .filter(Boolean);
      try {
        developDirection(combineDirections(choices));
      } catch (error) {
        app.querySelector('.design-notice').textContent = error.message;
      }
      return;
    }
    if (action === 'pause-maya' || action === 'resume-maya') {
      state.creative.mayaPaused = action === 'pause-maya';
      saveSafely();
      render();
      focusTask();
      return;
    }
    if (action === 'edit-draft') {
      designPage = 'draft';
      setPanel('revision');
      document.getElementById('revision')?.focus();
    } else if (action === 'use-starting') {
      if (state.design.revision.trim() || !state.teacher.directions.trim()) return;
      state.design.revision = state.teacher.directions;
      state.design.sourceDirections = state.teacher.directions;
      syncFinalCheck();
      controller.syncBabbage();
      designPage = 'draft';
      setPanel('revision');
      document.getElementById('revision')?.focus();
    } else if (action === 'ask-ai') {
      partnerPage = 'work';
      await controller.askBabbage();
    } else if (action === 'next-question') controller.moveQuestion(1);
    else if (action === 'previous-question') controller.moveQuestion(-1);
    else if (action === 'send-clarification') {
      ui = { ...workspaceViews(), task: reworkForReview ? 'draft' : 'explore' };
      partnerPage = 'work';
      state.designPanel = 'babbage';
      await controller.askBabbage('clarify', true);
    } else if (action === 'generate-ai') {
      ui = workspaceViews();
      partnerPage = 'work';
      state.designPanel = 'babbage';
      await controller.askBabbage('revise');
    } else if (action === 'retry-babbage') await controller.refreshBabbageConnection();
    else if (action === 'toggle-dev') {
      if (ai.pending) return;
      state.babbage = {
        ...conversationDefaults(),
        mode: state.babbage.mode === 'dev' ? 'live' : 'dev',
        context: assignmentContext(state),
      };
      ai.suggestion = null;
      ai.error = '';
      partnerPage = 'work';
      saveSafely();
      render();
      if (state.babbage.mode === 'live') await controller.refreshBabbageConnection();
    } else if (action === 'apply-ai') {
      if (!ai.suggestion || ai.context !== assignmentContext(state)) return;
      applySuggestedDraft(state, ai.suggestion);
      ai.suggestion = null;
      syncFinalCheck();
      controller.syncBabbage();
      designPage = 'draft';
      setPanel('revision');
      document.getElementById('revision')?.focus();
      app.querySelector('.design-notice').textContent =
        'Babbage’s suggested draft is now in Your activity. Review and adapt it before approving.';
    } else if (action === 'dismiss-ai') {
      ai.suggestion = null;
      ai.error = 'Your draft is unchanged.';
      partnerPage = 'work';
      render();
      app.querySelector('[data-action="generate-ai"]')?.focus();
    } else if (action === 'hear-maya' && state.design.revision.trim() && !ai.pending)
      openMayaDialog(state, event.target.closest('[data-action]'), {
        autoStart: true,
        onReturn: returnFromMaya,
        onSave: saveSafely,
        onRevise: reviseFromConversation,
      });
    else if (action === 'restore-earlier') {
      ui = workspaceViews();
      designPage = 'draft';
      state.designPanel = 'revision';
      state.design.revision = state.design.previousRevision;
      state.design.reason = state.design.previousReason;
      syncFinalCheck();
      controller.syncBabbage();
      saveSafely();
      render();
    } else if (action === 'edit-context') {
      designPage = 'start';
      setPanel('revision');
    } else if (action === 'preview-guide') openGuidePreview(state, app);
    else if (action === 'approve-version' && finalCheckReady(state)) {
      state.finalCheck.approved = state.finalCheck.completed = true;
      reviewPage = 'guide';

      saveSafely();
      render();
      document.getElementById('review-title')?.focus({ preventScroll: true });
    } else if (action === 'download-guide' && state.design.revision.trim()) {
      try {
        downloadGuide(state.design, {
          approved: state.finalCheck.approved && finalCheckReady(state),
          teacher: state.teacher,
          workspace: state.workspace,
          conversationNotes: savedFeedbackNotes(state),
          rubric: rubricForState(state),
        });
        app.querySelector('.design-notice').textContent = 'Your Course Guide download has started.';
      } catch (error) {
        app.querySelector('.design-notice').textContent =
          error.message || 'The guide could not be downloaded. Your work is saved.';
      }
    } else if (action === 'read-final-directions' || action === 'return-final-checks') {
      const target = app.querySelector(
        action === 'read-final-directions' ? '.comparison-card h2' : '.final-check-list h2',
      );
      target?.setAttribute('tabindex', '-1');
      target?.focus();
    }
  });
  document
    .querySelector('[data-action="open-references"]')
    ?.addEventListener('click', (event) => openReferences(event.currentTarget));
  const restart = document.querySelector('[data-action="restart-module"]');
  if (restart) {
    restart.hidden = false;
    restart.textContent = route.restartLabel;
    restart.addEventListener('click', reset);
  }
  document.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="?"]') && !readError && !saveSafely()) {
      event.preventDefault();
      updateApproval();
    }
  });
  window.addEventListener('resize', () => fitWorkspace(app));
  document.fonts?.ready.then(() => fitWorkspace(app));
  window.addEventListener('pagehide', () => {
    ai.requestController?.abort();
    reviews.cancel();
  });
  render();
  if (
    state.designPanel === 'reason' &&
    !askRubricPreference('enter-review') &&
    !requirePerspectives()
  )
    void reviews.runAutomatic();
  if (!readError && state.babbage.mode !== 'dev') controller.refreshBabbageConnection();
}
