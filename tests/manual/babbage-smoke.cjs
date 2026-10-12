// Explicit opt-in test using nonsensitive sample data and the existing deployed backend.
if (process.env.RUN_LIVE_BABBAGE !== '1') {
  console.log('Set RUN_LIVE_BABBAGE=1 to make real Babbage requests.');
  process.exit(0);
}
(async () => {
  const { requestBabbageTurn, conversationDefaults } = await import(
    '../../src/features/design/babbage-client.js'
  );
  const diagnosticFetch = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      let data = {};
      try {
        data = await response.clone().json();
      } catch {}
      const message = String(data.error?.message || '').toLowerCase();
      const allowed = [
        'input',
        'messages',
        'message',
        'items',
        'item',
        'missing',
        'too',
        'many',
        'must',
        'be',
        'string',
        'array',
        'object',
        'unsupported',
        'empty',
        'single',
        'multiple',
        'not',
        'supported',
        'invalid',
        'expected',
        'at',
        'least',
        'one',
        'only',
        'provided',
        'parameters',
        'parameter',
        'format',
        'length',
        'maximum',
        'limit',
      ];
      console.log(
        JSON.stringify({
          httpStatus: response.status,
          errorCategories: allowed.filter((word) => message.split(/[^a-z_]+/).includes(word)),
          errorFields: Object.keys(data.error || {}),
        }),
      );
    }
    return response;
  };
  const state = {
    teacher: {
      subject: 'Environmental science',
      learnerLevel: 'First-year college',
      participation: 'online',
      directions:
        'Recommend one improvement to a community park. Explain in 300–400 words and reply to one classmate.',
      learningGoal:
        'Support a recommendation with evidence and reconsider it using a peer question.',
      learningGoalUnsure: false,
      mustStay: 'Keep the community park topic, 300–400 word first post, and one peer reply.',
      workMode: 'individual',
      workTime: '60–90 minutes',
      daysAvailable: 'One week',
    },
    design: {
      concern: 'Replies agree without testing a recommendation.',
      exchange: 'test',
      notes: 'Ask an evidence-based question about one choice.',
      revision: '',
      reason: '',
    },
    babbage: conversationDefaults(),
  };
  state.teacher.aiUse =
    'AI may help brainstorm or provide feedback. Students must choose and verify evidence, explain their own decisions, and disclose how they used AI. AI-generated final posts are not permitted.';
  const { checkBabbage } = await import('../../src/features/design/babbage-client.js');
  console.log(
    JSON.stringify({
      stage: 'connection',
      configured: await checkBabbage({ signal: AbortSignal.timeout(10000) }),
    }),
  );
  let first = await requestBabbageTurn(state, 'clarify', {
    fetchImpl: diagnosticFetch,
    signal: AbortSignal.timeout(90000),
  });
  console.log(
    JSON.stringify({
      stage: 'clarify',
      ready: first.ready,
      questionCount: first.questions.length,
      revisionShown: Boolean(first.suggestion),
    }),
  );
  if (!first.ready) {
    state.babbage.history.push({
      role: 'assistant',
      content: JSON.stringify(first),
      display: first.message,
    });
    state.babbage.history.push({
      role: 'user',
      content: JSON.stringify({
        clarification_answers: first.questions.map((q) => ({
          question: q.text,
          answer:
            'For this fictional test course: the initial post is 300–400 words, one peer reply asks an evidence-based question, and a short follow-up revises or defends the original choice. All work is due at the end of the week. Keep the existing rubric and topic; add no other requirements.',
        })),
      }),
      display: 'Fictional test-course clarification.',
    });
    first = await requestBabbageTurn(state, 'clarify', {
      fetchImpl: diagnosticFetch,
      signal: AbortSignal.timeout(90000),
    });
    console.log(
      JSON.stringify({
        stage: 'clarification-answer',
        ready: first.ready,
        questionCount: first.questions.length,
      }),
    );
    if (!first.ready) {
      console.log('Babbage requested another clarification. No revision was generated.');
      return;
    }
  }
  state.babbage.history.push({
    role: 'assistant',
    content: JSON.stringify(first),
    display: first.message,
  });
  const final = await requestBabbageTurn(state, 'revise', {
    fetchImpl: diagnosticFetch,
    signal: AbortSignal.timeout(90000),
  });
  console.log(
    JSON.stringify({
      stage: 'revise',
      ready: final.ready,
      questionCount: final.questions.length,
      revisionLength: final.suggestion?.revision.length ?? 0,
      reasonLength: final.suggestion?.reason.length ?? 0,
    }),
  );
})().catch((error) => {
  const kind = error.message.includes('incomplete')
    ? 'incomplete-revision'
    : error.message.includes('unreadable')
      ? 'invalid-response'
      : error.message.includes('usage limit')
        ? 'usage-limit'
        : error.message.includes('could not respond')
          ? 'upstream-request-failed'
          : 'connection-failed';
  console.error(
    'Live Babbage smoke check failed: ' +
      kind +
      '. No provider error details or secrets were printed.',
  );
  process.exitCode = 1;
});
