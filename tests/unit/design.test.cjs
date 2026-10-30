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
  assert.equal(teacherSetup.steps.length, 6);
  assert.equal(teacherSetup.steps[5].fields[0].type, 'radio');
  assert.match(teacherSetup.steps[5].fields[0].options.map(option => option[1]).join(' '), /Not sure yet/);
  assert.match(teacherSetup.steps[1].intro, /one focused forum component/);
  assert.match(teacherSetup.steps[1].intro, /not replace it/);
  assert.equal(teacherSetup.steps[2].fields.find((field) => field.id === 'alignmentGuide').type, 'select');
  assert.deepEqual(
    teacherSetup.steps[2].fields.find((field) => field.id === 'alignmentGuide').options.map(([id]) => id),
    ['none', 'montana-k12', 'msu-outcomes', 'oscqr'],
  );
  assert.match(instructions, /one bounded discussion-board component within the larger assignment/);
  assert.match(instructions, /distinctive, feasible forum mechanism that fits this course/);
  assert.match(instructions, /not an all-in-one replacement/);
  assert.match(instructions, /Never claim official alignment, endorsement, accreditation, or compliance/);
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
  assert(!milestone.includes('Start With the Learning'));
  assert(!milestone.includes('id="decision-milestone"'));
  assert(!milestone.includes('href="#decision-milestone"'));
  assert(!milestone.includes('Replies miss &lt;evidence&gt;'));
  assert(milestone.includes('Evaluate claims &amp; evidence'));
  assert(milestone.includes(milestoneDesign.reason));
  assert(milestone.includes('href="#your-assignment"'));
  const guidedMilestone = createGuide(milestoneDesign, {
    teacher: {
      ...milestoneTeacher,
      alignmentGuide: 'oscqr',
      alignmentReference: 'OSCQR item <interaction>',
    },
  });
  assert(guidedMilestone.includes('Optional assignment guidance'));
  assert(guidedMilestone.includes('OSCQR online course quality rubric'));
  assert(guidedMilestone.includes('OSCQR item &lt;interaction&gt;'));
  assert(guidedMilestone.includes('not as verification of official alignment or compliance'));
  assert(createGuide(milestoneDesign, { teacher: milestoneTeacher, approved: false }).includes('Draft preview · Not yet approved'));
  assert(createGuide({ revision: 'Legacy revision', reason: '' }, { teacher: milestoneTeacher }).includes('Legacy revision'));
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
  for (const [designStep, origin] of [[0,'concern'],[1,'exchange'],[1,'notes'],[2,'route'],[2,'reason']]) {
    const adviceState = {...initialState(scenario),phase:'design',designStep,designPanel:'advice',designReturnPanel:origin};
    adviceState.design.concern='Keep my concern';
    const restored=loadState(scenario,{getItem:()=>JSON.stringify(adviceState)});
    assert.equal(restored.designPanel,'advice');
    assert.equal(restored.designReturnPanel,origin);
    assert.equal(restored.design.concern,'Keep my concern');

  }

  const { renderAssignmentDirections } = await import('../../src/shared/directions.js');
  const { renderDirectionsEditor } = await import('../../src/shared/directions-editor.js');
  const { renderDesignRationale } = await import('../../src/shared/design-evidence.js');
  const formattedEditor = renderDirectionsEditor('```markdown\n### Peer exchange\n1) __Compare:__ Explain your choice.\n```');
  assert.ok(formattedEditor.includes('contenteditable="true"'));
  assert.ok(formattedEditor.includes('<h4>Peer exchange</h4>'));
  assert.ok(formattedEditor.includes('<strong>Compare:</strong>'));
  assert.ok(!formattedEditor.includes('```'));
  assert.ok(!formattedEditor.includes('<textarea'));
  const citedReason = renderDesignRationale('Use feedback (Carless & Boud, 2018): https://doi.org/10.1080/02602938.2018.1463354.');
  assert.ok(citedReason.includes('href="https://doi.org/10.1080/02602938.2018.1463354"'));
  const rawReason='Supports alignment (Carnegie Mellon Eberly Center, n.d., https://www.cmu.edu/teaching/assessment/basics/alignment.html) and feedback (Carless & Boud, 2018, https://doi.org/10.1080/02602938.2018.1463354).';
  const cleanReason=renderDesignRationale(rawReason);
  assert(cleanReason.includes('<p>Supports alignment and feedback.</p>'));
  assert(cleanReason.includes('rationale-references'));
  assert.equal((cleanReason.match(/<a /g)||[]).length,2);
  assert(!renderDesignRationale(rawReason,{showSources:false}).includes('https://'));
  const longExplanation='Students compare a staffing choice and explain the evidence behind their decision. '.repeat(7);
  const spacedExplanation=renderDesignRationale(longExplanation,{paragraphBreaks:true});
  assert.equal((spacedExplanation.match(/<p>/g)||[]).length,7,'Long guide explanations have readable paragraph breaks');
  assert(rawReason.includes('https://'), 'Display formatting leaves the original text intact');
  assert.ok(!renderDesignRationale('[Unverified](https://unverified.example)').includes('<a '));
  const report = renderAssignmentDirections(
    '## Week 8: t-Test Report\n\n**Due:** Sunday\n\n### Peer exchange\n1. **First post:** Explain your choice.\n   Use your own output.\n2. Test a peer’s interpretation.\n\n<script>bad</script>',
  );
  assert.ok(report.includes('<h4>Week 8: t-Test Report</h4>'));
  assert.ok(report.includes('<strong>First post:</strong>'));
  assert.ok(report.includes('<br>Use your own output.'));
  assert.ok(!report.includes('<script>'));
  const replySentence=renderAssignmentDirections('### Peer reply\nReply to one classmate’s initial post. Engage one specific sentence.');
  assert(replySentence.includes('<p>Reply to one classmate’s initial post. Engage one specific sentence.</p>'));
  assert(!replySentence.includes('<h4>Reply</h4>'),'An ordinary sentence is not a heading');
  assert(renderAssignmentDirections('Reply: Test one claim.').includes('<h4>Reply</h4><p>Test one claim.</p>'));
  assert(renderAssignmentDirections('Reply\nTest one claim.').includes('<h4>Reply</h4><p>Test one claim.</p>'));
  const {renderScrollableDirections}=await import('../../src/shared/paged-directions.js');
  const fullDraft=renderScrollableDirections('## Purpose\nExplain a decision.\n## Peer exchange\nTest a claim.\n## Follow-up\nRevise the choice.');
  assert(fullDraft.includes('Explain a decision.') && fullDraft.includes('Test a claim.') && fullDraft.includes('Revise the choice.'));
  assert(fullDraft.indexOf('Jump to a section')<fullDraft.indexOf('suggested-full-document'));
  assert(fullDraft.includes('2. Peer exchange') && fullDraft.includes('data-reading-anchor'));
  assert(!fullDraft.includes('Section 1 of'),'Named section navigation replaces the obscure count-only picker');
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
    'Lemonade example appears first',
  );
  assert.ok(guide.includes('id="change-reason"'), 'The explanation remains in the guide');
  assert.ok(!guide.includes('href="#change-reason"'), 'Contents show main sections only');
  const originalOnlyGuide = createGuide(
    { revision: '', reason: '', sourceDirections: 'Original assignment with <script>quoted text</script>' },
    { teacher: { directions: 'Original assignment with <script>quoted text</script>' }, approved: false },
  );
  assert.ok(!originalOnlyGuide.includes('href="#original-assignment"'));
  assert.ok(!originalOnlyGuide.includes('id="original-assignment"'));
  assert.ok(!originalOnlyGuide.includes('Original assignment with &lt;script&gt;quoted text&lt;/script&gt;'));
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
  assert.equal(sample.phase,'design'); assert.equal(sample.designPanel,'babbage');
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
  assert(isTestLessonKeyword({name:'directions',value:' Dev '}));
  const { freshWorkspace }=await import('../../src/features/workspace/storage.js');
  const devWorkspace=freshWorkspace();fillTestLesson(devWorkspace,'Dev');
  for(const key of ['studentNeeds','creativeCore','instructorPlan','openQuestions']) assert(devWorkspace.workspace[key],'Dev fills '+key);
  for(const key of ['subject','directions','learningGoal','learnerLevel','workTime','daysAvailable','mustStay','aiUse']) assert(devWorkspace.teacher[key],'Dev fills '+key);
  assert(devWorkspace.design.concern);
  assert.equal(devWorkspace.design.revision,'');
  assert.equal(devWorkspace.design.reason,'');
  assert.equal(devWorkspace.designPanel,'babbage');
  assert.equal(devWorkspace.babbage.mode,'live');
  assert.equal(devWorkspace.babbage.history.length,0,'Dev awaits an actual Babbage conversation');
  assert(!devWorkspace.finalCheck.approved,'Sample data still requires review');
  assert(!isTestLessonKeyword({name:'subject',value:'good management'}));
  assert.throws(() => fillTestLesson(sample,'unknown'), /Unknown sample/);
  console.log(
    'PASS: design content and saved-state compatibility, original preservation, starter handling, legacy saves, escaping, and storage failures.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
