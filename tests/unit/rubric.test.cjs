const assert = require('node:assert/strict');
(async () => {
  const { freshWorkspace, saveWorkspace, readWorkspace } = await import(
    '../../src/features/workspace/storage.js'
  );
  const { generateRubric, rubricCSV, rubricDocument, renderRubricTable, rubricIssue } =
    await import('../../src/features/workspace/rubric.js');
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
  const {rubricForState}=await import('../../src/features/workspace/rubric.js');
  const {renderBuildPage}=await import('../../src/features/workspace/build-view.js');
  state.workspace.assignmentTitle='Staffing choices';
  state.workspace.studentContribution='A recommendation and a peer response';
  assert.equal(rubricForState(state).title,'Staffing choices rubric');
  assert.equal(rubricForState(state).submission,state.workspace.studentContribution);
  assert(!renderBuildPage(state,{pending:false},'rubric').includes('What will students submit?'));
  assert(renderBuildPage(state,{pending:false},'assessment').includes('Assessment criteria, one per line'));
  const guideWithRubric=createGuide(state.design,{teacher:state.teacher,workspace:state.workspace,rubric:rubricForState(state),conversationNotes:'Maya: Private NPC question\nEducator: Internal answer'});
  assert(guideWithRubric.includes('Staffing choices rubric'));
  assert(guideWithRubric.includes('<title>Staffing choices</title>'));
  assert(!guideWithRubric.includes('Private NPC question') && !guideWithRubric.includes('Design decisions'));
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
  console.log(
    'PASS: rubric grounding, exact Canvas template columns, weights, CSV escaping, editable visual, guide inclusion, persistence and malformed responses. Mocked AI.',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
