const assert = require('node:assert/strict');
(async () => {
  const { freshWorkspace, saveWorkspace, readWorkspace } = await import(
    '../../src/features/workspace/storage.js'
  );
  const {
    generateRubric,
    rubricCSV,
    rubricDocument,
    renderRubricTable,
    rubricIssue,
    renderAssessmentSetup,
    renderRubricEditor,
    renderRubric,
  } = await import('../../src/features/workspace/rubric.js');
  const { createProjectFile, parseProjectFile } = await import(
    '../../src/features/workspace/project-file.js'
  );
  const { createGuide } = await import('../../src/features/design/guide.js');
  const state = freshWorkspace();
  state.design.revision =
    'Recommend a staffing schedule using two case details, then explain a tradeoff.';
  state.teacher.learningGoal = 'Justify a choice using evidence.';
  Object.assign(state.creative.rubric, {
    title: 'Case, evidence "rubric"',
    submission: 'A recommendation and revised decision',
    total: '10',
    criteria: 'Use of evidence\nReasoning\nResponse to feedback',
  });
  let sent;
  const rows = await generateRubric(state, {
    fetchImpl: async (_, options) => {
      sent = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          analysis: {
            feedback_summary: JSON.stringify({
              rows: ['Use of evidence', 'Reasoning', 'Response to feedback'].map((name) => ({
                name,
                description: 'Assess ' + name,
                ratings: [
                  'Supports the choice with two case details.',
                  'Uses one case detail, but leaves its relevance unclear.',
                  'No case evidence is provided.',
                ],
              })),
            }),
          },
        }),
      };
    },
  });
  assert.equal(
    rows.reduce((n, r) => n + r.points, 0),
    10,
  );
  assert.deepEqual(
    rows.map((r) => r.points),
    [4, 3, 3],
  );
  assert(sent.messages[0].content.includes(state.design.revision));
  state.creative.rubric.rows = rows;
  state.creative.rubric.basis = state.design.revision;
  state.creative.rubric.confirmed = true;
  const { rubricForState } = await import('../../src/features/workspace/rubric.js');
  const { renderBuildPage } = await import('../../src/features/workspace/build-view.js');
  state.workspace.assignmentTitle = 'Staffing choices';
  state.workspace.studentContribution = 'A recommendation and a peer response';
  assert.equal(rubricForState(state).title, 'Staffing choices rubric');
  assert.equal(rubricForState(state).submission, state.workspace.studentContribution);
  assert(
    !renderBuildPage(state, { pending: false }, 'rubric').includes('What will students submit?'),
  );
  assert(renderAssessmentSetup(state).includes('Add a criterion'));
  const guideWithRubric = createGuide(state.design, {
    teacher: state.teacher,
    workspace: state.workspace,
    rubric: rubricForState(state),
    conversationNotes: 'Maya: Private NPC question\nEducator: Internal answer',
  });
  assert(guideWithRubric.includes('Staffing choices rubric'));
  assert(guideWithRubric.includes('How PromptCraft uses this:'));
  assert(guideWithRubric.includes('attach the imported rubric to your assignment'));
  state.creative.rubric.requested = true;
  assert(guideWithRubric.includes('Download rubric (.csv)'));
  const encoded = guideWithRubric.match(/href="data:text\/csv;charset=utf-8,([^"]+)"/)[1];
  assert.equal(decodeURIComponent(encoded), rubricCSV(rubricForState(state)));
  assert(renderRubricEditor(rubricForState(state)).includes('Criterion 1 of'));
  assert(renderRubricTable(rubricForState(state)).includes('rubric-score'));
  const visual = renderRubric(state);
  assert(visual.includes('<table class="assignment-rubric">') && !visual.includes('<textarea'), 'Generated rubric opens as a visual table');
  assert(renderRubric(state, false, {editing:true}).includes('data-rubric-row="0"'), 'Editing happens in that same table');

  assert(guideWithRubric.includes('<title>Staffing choices</title>'));
  assert(
    !guideWithRubric.includes('Private NPC question') &&
      !guideWithRubric.includes('Design decisions'),
  );
  const uncertain = structuredClone(state);
  uncertain.creative.rubric.criteria = '';
  assert.equal(rubricIssue(rubricForState(uncertain)), '', 'Empty criteria invite AI drafting');
  const drafted = await generateRubric(uncertain, {
    fetchImpl: async (_, options) => {
      const request = JSON.parse(options.body);
      assert.deepEqual(JSON.parse(request.messages[0].content).criteria, []);
      return {
        ok: true,
        json: async () => ({
          analysis: {
            feedback_summary: JSON.stringify({
              rows: ['Evidence', 'Explanation'].map((name) => ({
                name,
                description: 'Observable ' + name,
                ratings: ['Clear evidence.', 'Partial evidence.', 'No evidence.'],
              })),
            }),
          },
        }),
      };
    },
  });
  assert.deepEqual(
    drafted.map((row) => row.name),
    ['Evidence', 'Explanation'],
  );
  assert.equal(
    drafted.reduce((n, row) => n + row.points, 0),
    10,
  );
  const setup = renderAssessmentSetup(uncertain);
  assert(setup.includes('Not sure? Draft criteria with Babbage'));
  assert.equal((setup.match(/<article>/g) || []).length, 3, 'Levels are three separate cards');
  assert(setup.includes('data-rubric-criterion="0"'));
  const csv = rubricCSV(state.creative.rubric);
  assert(
    csv.startsWith(
      '"Rubric Name","Criteria Name","Criteria Description","Criteria Enable Range","Rating Name","Rating Description","Rating Points"',
    ),
  );
  assert(csv.includes('"Case, evidence ""rubric"""'));
  assert.equal(csv.trim().split('\r\n').length, 4);
  assert(csv.includes('"false","Strong"'));
  assert(
    csv.includes('"Developing","Uses one case detail, but leaves its relevance unclear.","1.5"'),
  );
  rows[0].ratings[0] = '<script>bad</script>\nUse two details, explain relevance.';
  assert(!rubricDocument(state.creative.rubric).includes('<script>'));
  assert(
    renderRubricTable(state.creative.rubric, { editable: true }).includes('data-rubric-row="0"'),
  );
  assert.deepEqual(
    parseProjectFile(createProjectFile(state)).creative.rubric,
    state.creative.rubric,
  );
  const saved = new Map();
  assert(saveWorkspace(state, { setItem: (k, v) => saved.set(k, v) }));
  assert.deepEqual(
    readWorkspace({ getItem: (k) => saved.get(k) }).state.creative.rubric,
    state.creative.rubric,
  );
  assert(
    createGuide(state.design, {
      teacher: state.teacher,
      workspace: state.workspace,
      rubric: state.creative.rubric,
    }).includes('Assessment rubric'),
  );
  assert(rubricIssue({ ...state.creative.rubric, total: '0' }));
  assert(
    rubricIssue({ ...state.creative.rubric, criteria: Array(9).fill('Criterion').join('\n') }),
  );
  await assert.rejects(
    generateRubric(state, {
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({ analysis: { feedback_summary: '{}' } }),
      }),
    }),
    /incomplete/,
  );

  const { mountWorkspacePopup } = await import('../../src/features/workspace/popups.js');
  const originalDocument = global.document;
  let mounted,
    closed = false,
    opened = false,
    cancel;
  global.document = {
    createElement: () => ({
      setAttribute() {},
      addEventListener(name, fn) {
        if (name === 'cancel') cancel = fn;
      },
      showModal() {
        opened = true;
      },
      querySelector() {
        return { focus() {} };
      },
    }),
  };
  try {
    const app = {
      append(node) {
        mounted = node;
      },
    };
    mountWorkspacePopup(app, state, { popup: 'rubric' }, () => {
      closed = true;
    });
    assert(opened, 'Rubric opens as a modal');
    assert(mounted.innerHTML.includes('<table class="assignment-rubric">'));
    assert(!mounted.innerHTML.includes('<textarea'), 'Rubric is readable before choosing edit');
    assert(mounted.innerHTML.includes('Edit rubric'));
    assert(mounted.innerHTML.includes('attach it to your assignment'));
    cancel({ preventDefault() {} });
    assert(closed, 'Escape closes popup');
    mountWorkspacePopup(app, state, { popup: 'rubric', rubricPart: 'edit' }, () => {});
    assert(mounted.innerHTML.includes('data-rubric-row="0"'));
    assert(mounted.innerHTML.includes('Done editing'));
    mountWorkspacePopup(app, state, { popup: 'rubric-choice' }, () => {});
    assert(mounted.innerHTML.includes('create a rubric automatically'));
    assert(mounted.innerHTML.includes('Continue without a rubric'));
  } finally {
    global.document = originalDocument;
  }
  console.log(
    'PASS: rubric grounding, exact Canvas template columns, weights, CSV escaping, editable visual, guide inclusion, persistence and malformed responses. Mocked AI.',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
