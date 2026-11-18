// Short interactive turns use an independently configurable model. Draft revisions
// retain the configured drafting model and their larger output allowance.
export function chatmtProfile(incoming, contract, configuredModel) {
  const kind = contract.analysisType === 'scenario1' ? incoming.response_kind : '';
  const feedbackOnly = ['perspectives', 'review', 'explore'].includes(kind);
  const interactive = feedbackOnly || kind === 'consult';
  const model = interactive
    ? process.env.CHATMT_INTERACTIVE_MODEL?.trim() || 'anthropic.claude-sonnet-5-5'
    : configuredModel;
  const requested = Number(incoming.max_output_tokens || incoming.max_tokens);
  const maxTokens = Math.max(512, Math.min(Number.isFinite(requested) && requested > 0 ? requested : 5000, 8000));
  let schema = contract.schema;
  let instruction = '';
  if (contract.analysisType === 'scenario1') {
    const fields = feedbackOnly ? ['feedback_summary'] : kind === 'consult'
      ? ['feedback_summary', 'input_quality']
      : ['feedback_summary', 'input_quality', 'revised_discussion_prompt', 'revision_review'];
    schema = { type: 'object', additionalProperties: false, required: fields,
      properties: Object.fromEntries(fields.map(key => [key, contract.schema.properties[key]])) };
    if (feedbackOnly) instruction = 'Generate only feedback_summary. The server supplies the empty draft and input-quality fields. Do not generate a revised activity or a rationale.';
  }
  return { model, maxTokens, schema, instruction, feedbackOnly };
}

export function completeChatmtEnvelope(analysis, profile) {
  return profile.feedbackOnly ? {
    ...analysis,
    input_quality: { usable: true, concerns: [] },
    revised_discussion_prompt: '',
    revision_review: { why_these_changes: '' },
  } : analysis;
}
