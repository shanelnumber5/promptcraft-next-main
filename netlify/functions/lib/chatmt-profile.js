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
  const scene = kind === 'perspectives';
  if (scene) {
    const turn = emotions => ({type:'object',additionalProperties:false,required:['emotion','text'],properties:{emotion:{type:'string',enum:emotions},text:{type:'string'}}});
    schema = {type:'object',additionalProperties:false,required:['version','maya','pixel'],properties:{version:{type:'integer',const:1},maya:turn(['neutral','confident','pleased','skeptical','frustrated','thoughtful','surprised','amused']),pixel:turn(['thoughtful','explaining','confident','pleasant','skeptical'])}};
    instruction = 'Return the version-1 scene object directly with version, maya and pixel. Do not wrap it in feedback_summary or encode the scene as a JSON string. The server supplies the response envelope. Each character must quote a short exact phrase from current_draft_quote_options, using escaped double quotation marks inside their text. Follow the separate Maya and Pixel voices in the supplied instructions.';
  }
  return { model, maxTokens, schema, instruction, feedbackOnly, scene };
}

export function completeChatmtEnvelope(analysis, profile) {
  return profile.feedbackOnly ? {
    ...(profile.scene ? {feedback_summary:JSON.stringify(analysis)} : analysis),
    input_quality: { usable: true, concerns: [] },
    revised_discussion_prompt: '',
    revision_review: { why_these_changes: '' },
  } : analysis;
}
