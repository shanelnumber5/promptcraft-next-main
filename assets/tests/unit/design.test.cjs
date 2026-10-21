const assert = require('node:assert/strict');
(async () => {
  const { discussionOpening: scenario } = await import('../../src/features/opening/content.js');
  const { initialState, loadState, saveState, STORAGE_KEY } = await import(
    '../../src/app/storage.js'
  );
  const { starterDraft, removeRepeatedStarterExchanges } = await import(
    '../../src/features/design/content.js'
  );
  const { instructions } = await import('../../src/features/design/babbage-prompt.js');
  const { teacherSetup } = await import('../../src/features/setup/content.js');
  const { renderTeacherStep, renderTeacherSummary } = await import(
    '../../src/features/setup/screen.js'
  );
  assert.equal(teacherSetup.steps.length, 5);
  const previewTeacher = {
    ...initialState(scenario).teacher,
    directions: '### First post\nDescribe your recommendation.',
  };
  const setupPreviews = teacherSetup.steps.map((_, index) =>
    renderTeacherStep(teacherSetup, index, previewTeacher),
  );
  const summaryPreviews = teacherSetup.steps.map((_, index) =>
    renderTeacherSummary(teacherSetup, previewTeacher, '', index),
  );
  for (const screen of [...setupPreviews, ...summaryPreviews]) {
    assert.match(screen, /Discussion-board design/);
    assert.match(screen, /not an all-in-one replacement/);
    assert.match(screen, /data-setup-live-preview/);
    assert.match(screen, /<h4>First post<\/h4>/);
  }
  assert.match(teacherSetup.steps[1].intro, /one focused forum component/);
  assert.match(teacherSetup.steps[1].intro, /not replace it/);
  assert.match(instructions, /one bounded discussion-board component within the larger assignment/);
  assert.match(instructions, /distinctive, feasible forum mechanism that fits this course/);
  assert.match(instructions, /not an all-in-one replacement/);
  const legacySetupRecords = new Map();
  const legacySetupStorage = {
    getItem: (key) => legacySetupRecords.get(key),
    setItem: (key, value) => legacySetupRecords.set(key, value),
  };
  const legacySetup = initialState(scenario);
  delete legacySetup.setupContentVersion;
  legacySetup.phase = 'setup';
  legacySetup.setupStep = 2;
  legacySetup.teacher.directions = 'Original directions stay here.';
  saveState(legacySetup, legacySetupStorage);
  const restoredSetup = loadState(scenario, legacySetupStorage);
  assert.equal(restoredSetup.setupStep, 3, 'Old limits screen maps to the shorter time screen');
  assert.equal(restoredSetup.teacher.directions, legacySetup.teacher.directions);
  const { createGuide, downloadGuide } = await import('../../src/features/design/guide.js');
  const milestoneDesign = {
    concern: 'Replies miss <evidence>',
    revision: 'Compare a peer claim with course evidence.',
    reason: 'I adapted the AI idea. I will look for evidence-based revisions.',
    sourceDirections: 'Reply twice.',
  };
  const milestoneTeacher = { directions: 'Reply twice.', learningGoal: 'Evaluate claims & evidence' };
  const milestone = createGuide(milestoneDesign, { teacher: milestoneTeacher });
  assert(milestone.includes('Approved milestone'));
  assert(milestone.includes('Replies miss &lt;evidence&gt;'));
  assert(milestone.includes('Evaluate claims &amp; evidence'));
  assert(milestone.includes(milestoneDesign.reason));
  assert(milestone.includes('href="#revised-directions"'));
  assert(createGuide(milestoneDesign, { teacher: milestoneTeacher, approved: false }).includes('Draft milestone · awaiting your approval'));
  assert(createGuide({ revision: 'Legacy revision', reason: '' }, { teacher: milestoneTeacher }).includes('Not recorded in this saved version.'));
  const unrelated = {
    revision: teacherSetup.steps[1].example.directions,
    reason: 'Old example reason.',
    sourceDirections: 'Old assignment',
  };
  const currentTeacher = { directions: 'Week 8: Independent-Samples t-Test Report' };
  const protectedGuide = createGuide(unrelated, { teacher: currentTeacher });
  assert.ok(
    !protectedGuide.includes('Choose one recommendation for improving a community space'),
    'Guide excludes an unrelated earlier draft',
  );
  assert.ok(!protectedGuide.includes('Old example reason.'));
  assert.ok(protectedGuide.includes('Your discussion-board component is still in progress'));
  assert.throws(() => downloadGuide(unrelated, { teacher: currentTeacher }), /current assignment/);
  const currentGuide = createGuide(
    {
      ...unrelated,
      revision: '## Week 8: Independent-Samples t-Test Report',
      sourceDirections: currentTeacher.directions,
    },
    { teacher: currentTeacher },
  );
  assert.ok(currentGuide.includes('<h4>Week 8: Independent-Samples t-Test Report</h4>'));
  const { renderDesign } = await import('../../src/features/design/screen.js');
  const { renderAssignmentDirections } = await import('../../src/shared/directions.js');
  const { renderDirectionsEditor } = await import('../../src/shared/directions-editor.js');
  const { renderDesignRationale } = await import('../../src/shared/design-evidence.js');
  const { renderReviewDirections } = await import('../../src/shared/review-directions.js');
  const reviewBlocks = renderReviewDirections('### Assignment\nIntroduction\n### First post\n1. Explain a choice.\n   - Use evidence.\n### Reply\n1. Test a choice.\n### Follow-up\n1. Revise or defend.\n<script>bad</script>');
  assert.equal((reviewBlocks.match(/class="review-document-block/g) || []).length, 4);
  assert(reviewBlocks.includes('<ul><li>Use evidence.</li></ul></li>'));
  assert(reviewBlocks.indexOf('First post') < reviewBlocks.indexOf('Reply'));
  assert(!reviewBlocks.includes('<script>'));
  const formattedEditor = renderDirectionsEditor('```markdown\n### Peer exchange\n1) __Compare:__ Explain your choice.\n```');
  assert.ok(formattedEditor.includes('contenteditable="true"'));
  assert.ok(formattedEditor.includes('<h4>Peer exchange</h4>'));
  assert.ok(formattedEditor.includes('<strong>Compare:</strong>'));
  assert.ok(!formattedEditor.includes('```'));
  assert.ok(!formattedEditor.includes('<textarea'));
  const citedReason = renderDesignRationale('Use feedback (Carless & Boud, 2018): https://doi.org/10.1080/02602938.2018.1463354.');
  assert.ok(citedReason.includes('href="https://doi.org/10.1080/02602938.2018.1463354"'));
  assert.ok(!renderDesignRationale('[Unverified](https://unverified.example)').includes('<a '));
  const report = renderAssignmentDirections(
    '## Week 8: t-Test Report\n\n**Due:** Sunday\n\n### Peer exchange\n1. **First post:** Explain your choice.\n   Use your own output.\n2. Test a peer’s interpretation.\n\n<script>bad</script>',
  );
  assert.ok(report.includes('<h4>Week 8: t-Test Report</h4>'));
  assert.ok(report.includes('<strong>First post:</strong>'));
  assert.ok(report.includes('<br>Use your own output.'));
  assert.ok(!report.includes('<script>'));
  const structuredDiscussion = renderAssignmentDirections(
    'First post: Explain your recommendation.\n\nPeer reply:\nCompare the recommendation with course evidence.\n\nFollow-up: Revise or defend your choice.',
  );
  assert.ok(
    structuredDiscussion.includes('<h4>First post</h4><p>Explain your recommendation.</p>'),
  );
  assert.ok(
    structuredDiscussion.includes(
      '<h4>Peer reply</h4><p>Compare the recommendation with course evidence.</p>',
    ),
  );
  assert.ok(
    structuredDiscussion.includes('<h4>Follow-up</h4><p>Revise or defend your choice.</p>'),
  );
  const nestedReport = renderAssignmentDirections(
    'Week 8 Forum: Independent-Samples *t*-Test\nStep 1: Post your analysis plan\n1. Question\n2. Variable\n3. Groups\n4. Assumption check:\n- Independence\n- Output checks\n1. Current decision\n2. AI disclosure\nStep 2: Investigate a classmate',
  );
  assert.ok(nestedReport.includes('<em>t</em>'));
  assert.ok(nestedReport.includes('<h4>Step 1: Post your analysis plan</h4>'));
  assert.ok(nestedReport.includes('Assumption check:<ul><li>Independence</li>'));
  assert.ok(nestedReport.includes('<li value="5">Current decision</li>'));
  assert.ok(nestedReport.includes('<li value="6">AI disclosure</li>'));
  const formatted = renderAssignmentDirections(
    'Introduction.\n\nPeer exchange (draft)\n1. First step.\n2. Second step.',
    { approved: true },
  );
  assert.ok(formatted.includes('<h4>Peer exchange</h4>'));
  assert.ok(formatted.includes('<li value="2">Second step.</li>'));
  assert.ok(!formatted.includes('(draft)'));
  const guide = createGuide({
    revision: 'Keep exact\n  spaces. <script>bad</script>',
    reason: 'Compare evidence & revise.',
  });
  assert.ok(guide.includes('Keep exact\n  spaces. &lt;script&gt;bad&lt;/script&gt;'));
  assert.ok(guide.includes('Compare evidence &amp; revise.'));
  assert.ok(!guide.includes('<script>'), 'Downloaded guide escapes user text');
  assert.ok(guide.includes('Alex takes payment'));
  assert.ok(guide.includes('Sam serves drinks'));
  assert.ok(guide.includes('href="#design-sources"'));
  assert.ok(guide.includes('Carless, D., &amp; Boud, D. (2018)'));
  assert.ok(guide.includes('fictional illustration'));
  assert.ok(guide.includes('not proof of faster service'));
  assert.ok(
    createGuide({ revision: 'Draft', reason: '' }, { approved: false }).includes(
      'Not yet approved',
    ),
  );
  const emptyGuide = createGuide({ revision: '', reason: '' }, { approved: false });
  assert.ok(
    !emptyGuide.includes('href="#your-assignment"'),
    'Contents omit assignment until it has content',
  );
  assert.ok(
    guide.indexOf('id="lemonade-example"') < guide.indexOf('id="your-assignment"'),
    'Example appears first',
  );
  assert.ok(guide.includes('href="#change-reason"'), 'Contents include the reason when entered');
  const originalOnlyGuide = createGuide(
    { revision: '', reason: '', sourceDirections: 'Original assignment with <script>quoted text</script>' },
    { teacher: { directions: 'Original assignment with <script>quoted text</script>' }, approved: false },
  );
  assert.ok(originalOnlyGuide.includes('href="#original-assignment"'));
  assert.ok(originalOnlyGuide.includes('id="original-assignment"'));
  assert.ok(originalOnlyGuide.includes('Original assignment with &lt;script&gt;quoted text&lt;/script&gt;'));
  assert.ok(!originalOnlyGuide.includes('<script>'));
  assert.ok(!createGuide({ revision: 'Draft', reason: '' }).includes('href="#change-reason"'));
  assert.ok(
    createGuide({ revision: 'Draft', reason: '' }, { logo: 'data:image/svg+xml,test' }).includes(
      'alt="PromptCraft Babbage emblem"',
    ),
  );
  let downloaded = false,
    downloadLink;
  const previousDocument = global.document;
  global.document = {
    createElement: () =>
      (downloadLink = {
        click() {
          downloaded = true;
        },
        remove() {},
      }),
    body: { append() {} },
  };
  downloadGuide({ revision: 'My directions', reason: 'My reason' });
  assert.equal(downloaded, true);
  assert.equal(downloadLink.download, 'promptcraft-assignment-guide.html');
  assert.ok(downloadLink.href.startsWith('blob:'));
  global.document = previousDocument;
  const records = new Map(),
    storage = {
      getItem: (key) => records.get(key) || null,
      setItem: (key, value) => records.set(key, value),
    };
  const state = initialState(scenario);
  state.phase = 'summary';
  state.teacher.directions = '  Original directions.\n\nKeep   exact spaces.  ';
  state.teacher.learningGoal = 'Compare reasons.';
  state.teacher.mustStay = 'Keep the rubric.';
  saveState(state, storage);
  const legacy = { ...state };
  delete legacy.design;
  delete legacy.designStep;
  storage.setItem(STORAGE_KEY, JSON.stringify(legacy));
  assert.deepEqual(
    loadState(scenario, storage).design,
    { ...state.design, sourceDirections: state.teacher.directions },
    'Existing saves gain design defaults and assignment link',
  );
  saveState(state, storage);
  const original = state.teacher.directions;
  const stale = {
    ...state,
    design: {
      ...state.design,
      revision: starterDraft(
        { directions: teacherSetup.steps[1].example.directions },
        { exchange: 'test' },
      ),
      reason: 'Example reason.',
    },
  };
  delete stale.design.sourceDirections;
  storage.setItem(STORAGE_KEY, JSON.stringify(stale));
  const repaired = loadState(scenario, storage);
  assert.equal(
    repaired.design.revision,
    '',
    'An old example is not presented as the current revised assignment',
  );
  assert.ok(
    repaired.design.previousRevision.includes('community space'),
    'Earlier work is kept separately',
  );
  assert.equal(repaired.design.sourceDirections, original);
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      design: {
        ...state.design,
        sourceDirections: 'Different assignment',
        revision: 'Earlier report revision.',
        reason: 'Earlier rationale.',
      },
    }),
  );
  assert.equal(
    loadState(scenario, storage).design.previousRevision,
    'Earlier report revision.',
    'Assignment changes preserve the previous draft',
  );
  saveState(state, storage);
  const handlers = {},
    notice = { textContent: '' },
    finishButton = { disabled: true, querySelector: () => ({ textContent: '' }) };
  const app = {
    innerHTML: '',
    addEventListener: (name, handler) => (handlers[name] = handler),
    querySelectorAll: () => [],
    querySelector: (selector) =>
      selector === '[data-action="approve-version"]'
        ? finishButton
        : ['.save-notice', '.design-notice', '.final-check-status'].includes(selector)
          ? notice
          : null,
    scrollIntoView: () => {},
  };
  global.window = { localStorage: storage };
  global.document = {
    getElementById: (id) => (id === 'app' ? app : { focus: () => {} }),
    querySelector: () => null,
  };
  global.ResizeObserver = class {
    observe() {}
  };
  global.requestAnimationFrame = (callback) => callback();
  await import('../../src/app/app.js');
  const click = (action) =>
    handlers.click({
      target: {
        closest: (selector) => (selector === '[data-action]' ? { dataset: { action } } : null),
      },
    });
  const input = (name, value) =>
    handlers.input({
      target: {
        name,
        value,
        closest: (selector) => (selector === '[data-design-form]' ? {} : null),
      },
    });
  const saved = () => loadState(scenario, storage);
  click('start-design');
  assert.match(app.innerHTML, /Give the conversation a purpose/);
  input('concern', 'Students do not use the replies.');
  click('design-next');
  assert.match(app.innerHTML, /Choose a job for the reply/);
  input('exchange', 'evidence');
  click('design-next');
  assert.equal(saved().designPanel, 'notes');
  input('notes', 'Use evidence to reconsider a choice.');
  click('design-next');
  assert.match(app.innerHTML, /Design one focused discussion-board activity/);
  click('use-starter');
  assert.match(saved().design.revision, /Compare a classmate/);
  assert.equal(
    saved().teacher.directions,
    original,
    'Starter preserves original directions exactly',
  );
  input('revision', 'My edited draft.');
  input('reason', 'Students explain how evidence changes their choice.');
  click('design-back');
  click('design-next');
  assert.equal(saved().design.revision, 'My edited draft.', 'Back preserves draft edits');
  click('use-starter');
  assert.ok(
    saved().design.revision.startsWith('My edited draft.\n\n'),
    'Starter appends without replacing edits',
  );
  const beforeRepeat = saved().design.revision;
  click('use-starter');
  assert.equal(
    saved().design.revision,
    beforeRepeat,
    'Repeated starter click does not duplicate exchange',
  );
  click('design-next');
  assert.equal(saved().designPanel, 'reason');
  click('design-next');
  assert.match(app.innerHTML, /Original assignment/);
  assert.match(app.innerHTML, /Discussion-board directions/);
  assert.match(app.innerHTML, /My edited draft/);
  assert.equal(saved().phase, 'design');
  assert.equal(saved().designStep, 3, 'Reload restores review and draft');
  click('design-next');
  assert.match(app.innerHTML, /Check your discussion-board component/);
  const check = (key, checked) =>
    handlers.change({
      target: {
        matches: (selector) => selector === '[data-final-check]',
        dataset: { finalCheck: key },
        checked,
      },
    });
  check('instructions', true);
  check('learning', true);
  check('requirements', true);
  assert.equal(finishButton.disabled, false);
  click('approve-version');
  assert.equal(saved().finalCheck.completed, true, 'Final checks persist');
  assert.equal(saved().finalCheck.approved, true, 'Approval persists');
  click('edit-draft');
  input('revision', 'A changed draft.');
  assert.equal(saved().finalCheck.completed, false, 'Draft edits invalidate review');
  assert.equal(saved().finalCheck.approved, false, 'Draft edits invalidate approval');
  assert.equal(saved().finalCheck.instructions, false);
  click('design-next');
  click('design-next');
  click('edit-context');
  assert.match(app.innerHTML, /Here’s what we’ll work with/);
  click('start-design');
  assert.equal(saved().designStep, 3, 'Returning from setup preserves design position');
  for (let i = 0; i < 10 && saved().phase === 'design'; i++) click('design-back');
  assert.equal(saved().phase, 'summary', 'Back from first design step returns to summary');
  assert.equal(saved().teacher.directions, original);
  const bad = {
    ...saved(),
    phase: 'design',
    designStep: 99,
    design: { concern: 3, exchange: 'invalid', revision: '<script>alert(1)</script>' },
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(bad));
  const restored = loadState(scenario, storage);
  assert.equal(restored.designStep, 4);
  assert.equal(restored.design.concern, '');
  assert.equal(restored.design.exchange, '');
  assert.ok(!renderDesign(restored).includes('<script>'), 'User text is escaped');
  assert.ok(renderDesign(restored).includes('&lt;script&gt;'));
  for (const exchange of ['test', 'evidence', 'perspective'])
    assert.ok(starterDraft(state.teacher, { exchange }).startsWith(original));
  const block = starterDraft({ directions: '' }, { exchange: 'test' }).trim();
  const repeated =
    original + '\n\n' + Array(4).fill(block).join('\n\n') + '\n\nKeep this custom ending.';
  assert.equal(
    removeRepeatedStarterExchanges(repeated),
    original + '\n\n' + block + '\n\nKeep this custom ending.',
  );
  const edited = block.replace('Make a choice', 'Explain a recommendation');
  assert.equal(removeRepeatedStarterExchanges(edited), edited, 'Custom edits are preserved');
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, phase: 'design', design: { ...state.design, revision: repeated } }),
  );
  assert.equal(
    loadState(scenario, storage).design.revision,
    original + '\n\n' + block + '\n\nKeep this custom ending.',
    'Existing saved duplicates are repaired on reload',
  );
  storage.setItem(STORAGE_KEY, 'invalid JSON');
  assert.equal(loadState(scenario, storage).phase, 'opening');
  const blocked = {
    getItem() {
      throw Error('blocked');
    },
    setItem() {
      throw Error('blocked');
    },
  };
  assert.ok(loadState(scenario, blocked).saveNotice);
  saveState(state, blocked);
  assert.ok(state.saveNotice);
  const { fillTestLesson, isTestLessonKeyword } = await import('../../src/shared/test-lesson.js');
  assert(isTestLessonKeyword({name:'subject',value:' TEST '}));
  assert(isTestLessonKeyword({name:'directions',value:'test'}));
  assert(!isTestLessonKeyword({name:'directions',value:'A test of evidence'}));
  assert(!isTestLessonKeyword({name:'reason',value:'test'}));
  const sample = initialState(scenario);
  sample.design.revision='Earlier draft'; sample.design.reason='Earlier reason';
  sample.finalCheck.approved=true; sample.babbage.mode='dev';
  fillTestLesson(sample);
  assert.equal(sample.phase,'design'); assert.equal(sample.designPanel,'reason');
  assert.equal(sample.babbage.mode,'live'); assert.equal(sample.finalCheck.approved,false);
  assert.equal(sample.design.previousRevision,'Earlier draft');
  assert.equal(sample.design.sourceDirections,sample.teacher.directions);
  assert(sample.design.revision.includes('staffing schedules'));
  assert(sample.teacher.learningGoal && sample.teacher.mustStay && sample.design.reason);
  const variants = ['good', 'bad', 'joke'].map(keyword => {
    assert(isTestLessonKeyword({name:'subject',value:keyword.toUpperCase()}));
    const variant = initialState(scenario); fillTestLesson(variant, keyword);
    assert.equal(variant.babbage.mode,'live'); assert(!variant.finalCheck.approved);
    assert.equal(variant.design.sourceDirections, variant.teacher.directions);
    return variant;
  });
  assert.equal(new Set(variants.map(variant => variant.design.revision)).size, 3);
  assert(variants[1].design.revision.includes('Do not ask questions'));
  assert(variants[2].design.revision.includes('Paper Jams'));
  assert(!isTestLessonKeyword({name:'subject',value:'good management'}));
  assert.throws(() => fillTestLesson(sample,'unknown'), /Unknown sample/);
  console.log(
    'PASS: design navigation, original preservation, starter append, edits, restore, legacy saves, validation, escaping, storage failures.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
