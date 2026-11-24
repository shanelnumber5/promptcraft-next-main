const assert = require('node:assert/strict');
(async () => {
  const { initialState, saveState, loadState, STORAGE_KEY } = await import(
    '../../src/app/storage.js'
  );
  const { discussionOpening } = await import('../../src/features/opening/content.js');
  const { mountOpening } = await import('../../src/features/opening/controller.js');
  const { designRoute } = await import('../../src/features/workspace/routes.js');
  const records = new Map();
  const storage = {
    getItem: (k) => records.get(k) || null,
    setItem: (k, v) => records.set(k, v),
    removeItem: (k) => records.delete(k),
  };
  const main = initialState(discussionOpening);
  main.sceneId = discussionOpening.scenes.at(-1).id;
  main.storyStage = 'board';
  for (const scene of discussionOpening.scenes)
    if (scene.choice)
      main.answers[scene.id] = scene.choice.options.find((option) => option.correct).id;
  main.teacher.directions = 'Preserve existing directions.';
  saveState(main, storage);
  const handlers = {};
  const focus = { focus() {}, setAttribute() {}, classList: { add() {} } };
  const app = {
    innerHTML: '',
    addEventListener: (name, handler) => (handlers[name] = handler),
    querySelectorAll: () => [],
    querySelector: (selector) => (selector === '.character--right' ? null : focus),
  };
  const previous = global.document;
  global.document = { querySelector: () => null, getElementById: () => focus };
  let navigated = '';
  const firstChoice = discussionOpening.scenes.find((scene) => scene.id === 'spot-hole');
  const trial = initialState(discussionOpening);
  trial.sceneId = firstChoice.id;
  trial.storyStage = 'question';
  saveState(trial, storage);
  const disposeTrial = mountOpening(app, {
    storage,
    location: { href: 'https://example.test/?view=play' },
    navigate: (url) => (navigated = url),
  });
  assert.match(app.innerHTML, /data-action="next" disabled/);
  assert.match(app.innerHTML, /smartboard-stage/);
  assert.match(app.innerHTML, /smartboard-cast--left/);
  assert.match(app.innerHTML, /smartboard-cast--right/);
  handlers.click({ target: { closest: () => ({ dataset: { action: 'next' } }) } });
  assert.equal(loadState(discussionOpening, storage).sceneId, firstChoice.id);
  for (const value of ['drink', 'length']) {
    handlers.change({ target: { name: 'scene-choice', value } });
    assert.match(app.innerHTML, />Maya</);
    assert.match(app.innerHTML, />Pixel</);
    assert.match(app.innerHTML, value === 'drink' ? /cups run out/ : /three people arrive at once/);
    assert.match(app.innerHTML, /feedback--narrative/);
    assert.match(app.innerHTML, /feedback-turn--maya/);
    assert.match(app.innerHTML, /feedback-turn--pixel/);
    assert.match(app.innerHTML, value === 'drink' ? /maya_skeptical/ : /maya_explaining/);
    assert.doesNotMatch(app.innerHTML, /data-action="next" disabled/);
  }
  handlers.change({ target: { name: 'scene-choice', value: 'roles' } });
  assert.match(app.innerHTML, /tests a specific choice against the supplied facts/);
  assert.match(app.innerHTML, /feedback--narrative/);
  assert.match(app.innerHTML, /feedback-turn--maya/);
  assert.match(app.innerHTML, /feedback-turn--pixel/);
  assert.match(app.innerHTML, />Pixel</);
  assert.doesNotMatch(app.innerHTML, /data-action="next" disabled/);
  handlers.change({ target: { name: 'scene-choice', value: 'length' } });
  handlers.click({ target: { closest: () => ({ dataset: { action: 'next' } }) } });
  assert.equal(loadState(discussionOpening, storage).storyStage, 'response-maya');
  handlers.click({ target: { closest: () => ({ dataset: { action: 'hear-pixel' } }) } });
  assert.equal(loadState(discussionOpening, storage).storyStage, 'response-pixel');
  assert(app.innerHTML.includes(firstChoice.choice.checkIn));
  handlers.click({ target: { closest: () => ({ dataset: { action: 'next' } }) } });
  assert.equal(loadState(discussionOpening, storage).sceneId, 'peer-question');
  assert.equal(loadState(discussionOpening, storage).answers[firstChoice.id], 'length');
  disposeTrial();
  saveState(main, storage);
  const dispose = mountOpening(app, {
    storage,
    location: { href: 'https://example.test/?view=play&mockBabbage=1' },
    navigate: (url) => (navigated = url),
  });
  assert(app.innerHTML.includes('Design my activity'));
  assert(
    !app.innerHTML.includes('data-setup-form') && !app.innerHTML.includes('Assignment context'),
  );
  handlers.click({ target: { closest: () => ({ dataset: { action: 'start-design-studio' } }) } });
  assert.equal(new URL(navigated).searchParams.get('view'), 'scenario');
  assert.equal(new URL(navigated).searchParams.get('mockBabbage'), '1');
  const design = loadState(discussionOpening, storage);
  assert.equal(design.phase, 'design');
  assert.equal(design.designStep, 2);
  assert.equal(design.teacher.directions, main.teacher.directions);
  dispose();
  const { finalCheckContext } = await import('../../src/features/design/content.js');
  design.teacher.learningGoal = 'Explain a decision.';
  design.design.revision = 'Saved approved activity.';
  design.design.reason = 'Show the reasoning.';
  design.finalCheck = {
    instructions: true,
    learning: true,
    requirements: true,
    completed: true,
    approved: true,
    context: finalCheckContext(design.teacher, design.design),
  };
  for (const phase of ['design', 'closing']) {
    design.phase = phase;
    saveState(design, storage);
    assert.equal(
      loadState(discussionOpening, storage).phase,
      phase,
      'Replay fixture retains its approved completion state',
    );
    records.set('promptcraft_scenario_studio_v1', 'preserve scenario extras exactly');
    records.set('promptcraft_workspace_v1', 'preserve independent workspace exactly');
    const before = [...records.entries()];
    navigated = '';
    const closeReplay = mountOpening(app, {
      storage,
      location: { href: 'https://example.test/?view=play&story=1' },
      navigate: (url) => (navigated = url),
    });
    assert.match(app.innerHTML, /Story replay/);
    assert.match(app.innerHTML, /Maya/);
    for (let i = 0; i < discussionOpening.scenes.length; i++) {
      const scene = discussionOpening.scenes[i];
      handlers.click({ target: { closest: () => ({ dataset: { action: 'reveal-board' } }) } });
      if (scene.choice) {
        handlers.click({ target: { closest: () => ({ dataset: { action: 'reveal-question' } }) } });
        handlers.change({
          target: { name: 'scene-choice', value: scene.choice.options.find((o) => o.correct).id },
        });
        handlers.click({ target: { closest: () => ({ dataset: { action: 'hear-maya' } }) } });
        handlers.click({ target: { closest: () => ({ dataset: { action: 'hear-pixel' } }) } });
      }
      handlers.click({
        target: {
          closest: () => ({
            dataset: {
              action: i === discussionOpening.scenes.length - 1 ? 'start-design-studio' : 'next',
            },
          }),
        },
      });
    }
    assert.equal(new URL(navigated).searchParams.get('view'), 'scenario');
    assert.equal(new URL(navigated).searchParams.has('story'), false);
    assert.deepEqual(
      [...records.entries()],
      before,
      'A complete replay preserves all saved records byte for byte',
    );
    closeReplay();
  }
  let failedNavigation = false;
  const blocked = {
    getItem: (k) => records.get(k) || null,
    setItem: () => {
      throw Error('quota');
    },
  };
  mountOpening(app, {
    storage: blocked,
    location: { href: 'https://example.test/?view=play' },
    navigate: () => (failedNavigation = true),
  });
  assert.equal(failedNavigation, false, 'Failed handoff saves never silently navigate away');
  assert(app.innerHTML.includes('Progress cannot be saved'));
  global.document = previous;
  assert.notEqual(designRoute('scenario').save, designRoute('workspace').save);
  assert.equal(designRoute('scenario').navigation, 'Scenario design stages');
  assert.equal(designRoute('workspace').heading, 'Creative Workspace');
  assert.equal(designRoute('unknown'), designRoute('workspace'));
  console.log(
    'PASS: direct story-to-studio handoff, preserved context, no duplicate intake forms, route labels, and blocked-storage handling. Offline only.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
