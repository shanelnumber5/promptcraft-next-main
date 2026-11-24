// Explicit opt-in: fictional examples only, using the existing Babbage service.
if (process.env.RUN_LIVE_MAYA !== '1') {
  console.log('Set RUN_LIVE_MAYA=1 to test Maya with fictional statistics and poetry assignments.');
  process.exit(0);
}
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const { initialState } = await import('../../src/app/storage.js');
  const { discussionOpening } = await import('../../src/features/opening/content.js');
  const { requestMayaResponse, buildMayaRequest } = await import('../../src/features/design/maya-client.js');
  const { BABBAGE_ENDPOINT } = await import('../../src/features/design/babbage-client.js');
  const connection = await fetch(BABBAGE_ENDPOINT, { signal: AbortSignal.timeout(10000) });
  console.log(JSON.stringify({ stage: 'connection', httpStatus: connection.status, contentType: connection.headers.get('content-type') }));
  if (!connection.ok) throw Error('The existing AI service is unavailable. No Maya quality result can be claimed.');
  const results = [];
  for (const [subject, original, revision] of [
    ['Statistics', 'Write an independent-samples t-test report and reply twice.', 'Compare two t-test outputs. Explain how unequal variances affect your interpretation. Ask a peer to check one assumption, then revise or defend your interpretation.'],
    ['Literature', 'Describe a poem and agree or disagree with two classmates.', 'Choose a metaphor in the poem. Compare a classmate’s reading with two lines from the poem, then revise or defend your interpretation.'],
  ]) {
    const state = initialState(discussionOpening);
    state.teacher.subject = subject;
    state.teacher.directions = original;
    state.design.sourceDirections = original;
    state.design.revision = revision;
    const response = await requestMayaResponse(state, [], { signal: AbortSignal.timeout(90000) });
    const previous = [{ assignment: buildMayaRequest(state).messages[0].content, response }];
    state.design.revision += subject === 'Statistics'
      ? ' Use the anonymized output tables provided by the instructor. The follow-up is due Sunday.'
      : ' Use the poem posted in this week’s course materials. The follow-up is due Sunday.';
    const afterRevision = await requestMayaResponse(state, previous, { signal: AbortSignal.timeout(90000) });
    results.push({ subject, original, revision, response, nextRevision: state.design.revision, afterRevision });
    console.log(JSON.stringify({ stage: 'Maya reading and follow-up', subject, responseLength: response.length, afterRevisionLength: afterRevision.length }));
  }
  assert.notEqual(results[0].response, results[1].response);
  const output = path.resolve(__dirname, '../../artifacts/maya-live-review.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2));
  console.log('Grounding checks passed. Review artifacts/maya-live-review.json for student voice, substantive differences, invented facts, and acknowledgment of revisions; automated checks do not establish response quality.');
})().catch((error) => {
  console.error(error instanceof TypeError ? 'Maya live test failed: connection unavailable.' : error.message);
  process.exitCode = 1;
});
