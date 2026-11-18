const assert = require('node:assert/strict');
(async () => {
  const { chatmtProfile } = await import('../../netlify/functions/lib/chatmt-profile.js');
  const { getAnalysisContract_ } = await import('../../netlify/functions/lib/analysis-contracts.js');
  const { handleChatmt, parseChatmtAnalysis } = await import('../../netlify/functions/lib/chatmt.js');
  const contract = getAnalysisContract_({ analysis_type: 'scenario1' });
  const env = { ...process.env };
  try {
    delete process.env.CHATMT_INTERACTIVE_MODEL;
    const short = chatmtProfile({ response_kind: 'perspectives', max_output_tokens: 1400 }, contract, 'draft-model');
    assert.equal(short.model, 'anthropic.claude-sonnet-5-5');
    assert.equal(short.maxTokens, 1400, 'Short readings no longer inherit a 5000-token floor');
    assert.deepEqual(short.schema.required, ['feedback_summary']);
    const draft = chatmtProfile({ response_kind: 'draft', max_output_tokens: 3500 }, contract, 'draft-model');
    assert.equal(draft.model, 'draft-model');
    assert(draft.schema.required.includes('revised_discussion_prompt'));
    const legacy = chatmtProfile({}, contract, 'configured-model');
    assert.equal(legacy.model, 'configured-model');
    process.env.CHATMT_INTERACTIVE_MODEL = 'override-model';
    assert.equal(chatmtProfile({ response_kind: 'review' }, contract, 'draft-model').model, 'override-model');
    process.env.CHATMT_API_KEY = 'test-placeholder';
    process.env.CHATMT_BASE_URL = 'https://my.chatmt.ai/bedrock';
    process.env.CHATMT_MODEL = 'draft-model';
    const incoming = { analysis_type: 'scenario1', response_kind: 'perspectives', max_output_tokens: 1400, messages: [{ role: 'user', content: 'Fictional activity' }] };
    const result = await handleChatmt({ httpMethod: 'POST', body: JSON.stringify(incoming) }, getAnalysisContract_, (status, body) => ({ status, body }), 'test', {
      fetchImpl: async (url, options) => {
        assert.equal(url, 'https://my.chatmt.ai/bedrock/v1/messages');
        const sent = JSON.parse(options.body);
        assert.equal(sent.model, 'override-model');
        assert.equal(sent.max_tokens, 1400);
        return new Response(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify({ feedback_summary: 'Grounded character feedback' }) }], stop_reason: 'end_turn', model: sent.model }));
      },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.analysis.feedback_summary, 'Grounded character feedback');
    assert.deepEqual(result.body.analysis.input_quality, { usable: true, concerns: [] });
    assert.equal(result.body.analysis.revised_discussion_prompt, '');
    assert.deepEqual(parseChatmtAnalysis('Here is the result: {"feedback_summary":"Line one\nLine two"} done.'), {feedback_summary:'Line one\nLine two'});
    assert.throws(() => parseChatmtAnalysis('{"feedback_summary":"unfinished'), SyntaxError);
    let attempts = 0;
    const recovered = await handleChatmt({httpMethod:'POST', body:JSON.stringify(incoming)}, getAnalysisContract_, (status,body)=>({status,body}), 'retry-test', {
      fetchImpl: async () => new Response(JSON.stringify({content:[{type:'text',text:++attempts === 1 ? '{"feedback_summary":"truncated' : '{"feedback_summary":"Complete feedback"}'}],stop_reason:'end_turn'}))
    });
    assert.equal(attempts,2);
    assert.equal(recovered.status,200);
    console.log('PASS: interactive model routing, bounded token budgets, minimal feedback output and compatible response envelopes. Mocked provider.');
  } finally {
    for (const key of ['CHATMT_INTERACTIVE_MODEL','CHATMT_API_KEY','CHATMT_BASE_URL','CHATMT_MODEL']) {
      if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key];
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
