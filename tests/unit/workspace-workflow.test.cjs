const assert = require('node:assert/strict');

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

(async () => {
  const { freshWorkspace, saveWorkspace, readWorkspace, WORKSPACE_KEY } = await import(
    '../../src/features/workspace/storage.js'
  );
  const { createProjectFile, parseProjectFile } = await import(
    '../../src/features/workspace/project-file.js'
  );
  const { createWorkspaceReviewController } = await import(
    '../../src/features/workspace/review-controller.js'
  );
  const { renderWorkspace } = await import('../../src/features/workspace/screen.js');
  const { MAX_WORKSPACE_TEXT, workspacePlanningFields } = await import(
    '../../src/features/workspace/config.js'
  );

  const freshReviewState = () => {
    const state = freshWorkspace();
    state.designPanel = 'reason';
    state.design.revision = 'Compare two schedules and justify a choice.';
    return state;
  };
  function harness({ prepareMaya } = {}) {
    let state = freshReviewState();
    let allowed = true;
    const calls = [],
      mayaCalls = [],
      offers = [];
    let saves = 0,
      renders = 0;
    const controller = createWorkspaceReviewController({
      getState: () => state,
      canReview: () => allowed,
      save: () => saves++,
      render: () => renders++,
      requestReview(snapshot, previous, { signal }) {
        const result = deferred();
        calls.push({ snapshot, previous, signal, ...result });
        return result.promise;
      },
      prepareMaya: async (source) => {
        mayaCalls.push(source);
        if (prepareMaya) await prepareMaya(source);
      },
      onMayaReady: (offer) => offers.push(offer),
    });
    return {
      controller,
      calls,
      mayaCalls,
      offers,
      get state() {
        return state;
      },
      set state(value) {
        state = value;
      },
      set allowed(value) {
        allowed = value;
      },
      get saves() {
        return saves;
      },
      get renders() {
        return renders;
      },
    };
  }

  // First-entry review is automatic; edited drafts and failed requests require a click.
  const first = harness();
  first.allowed = false;
  await first.controller.runAutomatic();
  assert.equal(first.calls.length, 0);
  first.allowed = true;
  const initial = first.controller.runAutomatic();
  assert(first.controller.pending);
  await first.controller.runAutomatic();
  assert.equal(first.calls.length, 1, 'Duplicate entries share one pending request');
  assert.notEqual(first.calls[0].snapshot, first.state, 'Services receive an isolated snapshot');
  first.calls[0].resolve('Which evidence will students compare?');
  await initial;
  assert.equal(first.state.creative.review.status, 'complete');
  assert.equal(first.mayaCalls.length, 1);
  assert.equal(first.offers.length, 1);
  assert(first.offers[0].isCurrent());
  first.state.creative.review.offeredMaya = first.state.creative.review.fingerprint;
  await first.controller.runAutomatic();
  assert.equal(first.calls.length, 1, 'A completed review is reused');
  first.state.design.revision += ' Explain a tradeoff.';
  await first.controller.runAutomatic();
  assert.equal(first.calls.length, 1, 'Editing does not silently send another request');
  const revision = first.controller.check();
  assert.equal(first.calls[1].previous.feedback, 'Which evidence will students compare?');
  first.calls[1].resolve('Explain how students will use that tradeoff.');
  await revision;
  assert.equal(
    first.state.creative.review.feedback,
    'Explain how students will use that tradeoff.',
  );
  assert(!first.offers[0].isCurrent(), 'Deferred Maya offers expire when another review starts');

  // Cancellation must isolate old completions even if a service ignores AbortSignal.
  const cancelled = harness();
  const older = cancelled.controller.check();
  cancelled.controller.cancel();
  assert(cancelled.calls[0].signal.aborted);
  assert.equal(cancelled.state.creative.review.status, 'idle');
  const newer = cancelled.controller.check();
  cancelled.calls[0].resolve('Obsolete feedback');
  await older;
  assert(cancelled.controller.pending, 'An old completion cannot clear a newer request');
  assert.equal(cancelled.state.creative.review.feedback, '');
  cancelled.calls[1].resolve('Current feedback');
  await newer;
  assert.equal(cancelled.state.creative.review.feedback, 'Current feedback');
  assert.equal(cancelled.offers.length, 1);
  cancelled.controller.cancel();
  assert(!cancelled.offers[0].isCurrent(), 'Cancel also invalidates a deferred dialog');

  const replaced = harness();
  const pending = replaced.controller.check();
  replaced.state = freshReviewState();
  replaced.calls[0].resolve('Feedback for the old project');
  await pending;
  assert.equal(replaced.state.creative.review.feedback, '');
  assert.equal(replaced.offers.length, 0, 'Imported/reset projects cannot receive old dialogs');
  assert.equal(replaced.saves, 1, 'Only the initial pending state was saved');
  assert.equal(replaced.renders, 1, 'Old completion cannot render the replacement project');

  const edited = harness();
  const editing = edited.controller.check();
  edited.state.design.revision += ' A new instruction.';
  edited.calls[0].resolve('Feedback for the previous draft');
  await editing;
  assert.equal(edited.offers.length, 0, 'Stale feedback cannot trigger Maya');
  assert(renderWorkspace(edited.state, { pending: false }, '', 'draft').includes('Earlier draft'));

  const failed = harness();
  const failure = failed.controller.runAutomatic();
  failed.calls[0].reject(Error('Service unavailable'));
  await failure;
  assert.equal(failed.state.creative.review.status, 'error');
  await failed.controller.runAutomatic();
  assert.equal(failed.calls.length, 1, 'A failed automatic review waits for manual retry');
  const retry = failed.controller.check();
  failed.calls[1].resolve('Recovered feedback');
  await retry;
  assert.equal(failed.state.creative.review.status, 'complete');

  const mayaFailure = Error('Maya unavailable');
  const maya = harness({
    prepareMaya: async () => {
      throw mayaFailure;
    },
  });
  const reading = maya.controller.check();
  maya.calls[0].resolve('A useful current review');
  await reading;
  assert.equal(
    maya.state.creative.review.status,
    'complete',
    'Maya failure preserves Babbage feedback',
  );
  assert.equal(maya.offers[0].error, mayaFailure, 'Maya dialog receives its own recoverable error');
  await maya.controller.runAutomatic();
  assert.equal(
    maya.calls.length,
    1,
    'Returning to an unoffered current review reuses Babbage feedback',
  );
  assert.equal(maya.mayaCalls.length, 2);

  const navigating = harness();
  const away = navigating.controller.check();
  navigating.state.designPanel = 'revision';
  navigating.calls[0].resolve('Feedback received while editing');
  await away;
  assert.equal(navigating.state.creative.review.status, 'complete');
  assert.equal(navigating.offers.length, 0, 'Navigation away suppresses an automatic dialog');
  navigating.state.designPanel = 'reason';
  await navigating.controller.runAutomatic();
  assert.equal(navigating.calls.length, 1);
  assert.equal(navigating.offers.length, 1, 'Returning offers Maya using the completed review');

  const simulated = harness();
  simulated.state.babbage.mode = 'dev';
  await simulated.controller.runAutomatic();
  assert.equal(simulated.calls.length, 0);
  assert.equal(simulated.mayaCalls.length, 0);
  assert.match(simulated.state.creative.review.feedback, /Sample review only/);

  // One record format serves browser autosave and download, including future state fields.
  const recordState = freshWorkspace();
  recordState.saveNotice = 'Transient notice';
  recordState.futureFeature = { enabled: true };
  const records = new Map();
  const storage = {
    getItem: (key) => records.get(key),
    setItem: (key, value) => records.set(key, value),
  };
  assert(saveWorkspace(recordState, storage));
  const browserRecord = JSON.parse(records.get(WORKSPACE_KEY));
  assert.deepEqual(JSON.parse(createProjectFile(recordState)).project, browserRecord);
  assert(!Object.hasOwn(browserRecord.state, 'saveNotice'));
  assert.deepEqual(browserRecord.state.futureFeature, { enabled: true });
  for (const field of workspacePlanningFields)
    recordState.workspace[field] = 'x'.repeat(MAX_WORKSPACE_TEXT + 10);
  assert(saveWorkspace(recordState, storage));
  for (const restored of [
    readWorkspace(storage).state,
    parseProjectFile(createProjectFile(recordState)),
  ]) {
    for (const field of workspacePlanningFields)
      assert.equal(restored.workspace[field].length, MAX_WORKSPACE_TEXT);
  }
  console.log(
    'PASS: review lifecycle, cancellation, stale requests/dialogs, manual retry, simulation, shared save/export format and planning-field restoration. Offline only.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
