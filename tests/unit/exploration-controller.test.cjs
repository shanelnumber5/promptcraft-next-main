const assert = require('node:assert/strict');
(async () => {
  const { exploreWorkspace } = await import(
    '../../src/features/workspace/exploration-controller.js'
  );
  const { freshWorkspace } = await import('../../src/features/workspace/storage.js');
  let state = freshWorkspace();
  state.teacher.directions = 'Compare two sources and defend a claim.';
  const ai = {};
  const pending = [];
  let finished = 0;
  const run = () =>
    exploreWorkspace({
      getState: () => state,
      ai,
      onStart() {},
      onStage() {},
      onComplete() {},
      onFinish() {
        finished++;
      },
      requestDirections: (snapshot, options) =>
        new Promise((resolve, reject) => pending.push({ resolve, reject, options })),
    });
  const first = run();
  const old = ai.requestController;
  old.abort();
  ai.pending = false;
  const second = run();
  const current = ai.requestController;
  pending[0].options.onRefinementFailure('Stale failure');
  pending[0].resolve(['old']);
  await first;
  assert.equal(ai.requestController, current);
  assert.equal(ai.pending, true);
  assert.equal(ai.error, '');
  assert.equal(finished, 0, 'Old request cannot clear a newer request');
  pending[1].resolve(['current']);
  await second;
  assert.deepEqual(state.creative.directions, ['current']);
  assert.equal(finished, 1);
  const changed = run();
  state.teacher.directions += ' New requirement.';
  pending[2].resolve(['outdated']);
  await changed;
  assert.deepEqual(state.creative.directions, ['current']);
  assert.match(ai.error, /context changed/);
  const replaced = run();
  state = freshWorkspace();
  pending[3].resolve(['wrong project']);
  await replaced;
  assert.deepEqual(state.creative.directions, []);
  assert.equal(finished, 2, 'Imported projects ignore former project callbacks');
  console.log(
    'PASS: exploration request ownership, cancellation, overlapping retries, edited context and replaced projects.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
