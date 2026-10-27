const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
const OPENAI_BASE_URL = String(process.env.OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
const PROMPTCRAFT_BABBAGE_PROXY_VERSION = 'V373';

const CORS_HEADERS = Object.freeze({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store'
});

const S1_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status', 'confidence', 'feedback_summary', 'what_worked', 'issue_detected',
    'recommended_repair', 'expected_impact', 'revised_discussion_prompt',
    'revision_review', 'course_quality_check', 'input_quality'
  ],
  properties: {
    status: { type: 'string' },
    confidence: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
    feedback_summary: { type: 'string' },
    what_worked: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
    issue_detected: { type: 'string' },
    recommended_repair: { type: 'string' },
    expected_impact: { type: 'string' },
    revised_discussion_prompt: { type: 'string' },
    revision_review: {
      type: 'object', additionalProperties: false,
      required: ['strongest_improvement', 'remaining_limitation', 'why_these_changes'],
      properties: {
        strongest_improvement: { type: 'string' },
        remaining_limitation: { type: 'string' },
        why_these_changes: { type: 'string' }
      }
    },
    course_quality_check: {
      type: 'object', additionalProperties: false,
      required: ['clear_objectives', 'student_interaction', 'real_world_context', 'inclusive_design', 'measurable_outcomes'],
      properties: {
        clear_objectives: { type: 'string' },
        student_interaction: { type: 'string' },
        real_world_context: { type: 'string' },
        inclusive_design: { type: 'string' },
        measurable_outcomes: { type: 'string' }
      }
    },
    input_quality: {
      type: 'object', additionalProperties: false,
      required: ['usable', 'concerns'],
      properties: {
        usable: { type: 'boolean' },
        concerns: { type: 'array', maxItems: 6, items: { type: 'string' } }
      }
    }
  }
};

const S1_EVIDENCE_ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'summary', 'learner_problem', 'visible_change', 'student_benefit', 'design_takeaway'],
  properties: {
    verdict: { type: 'string', enum: ['STRONG', 'DEVELOPING', 'REVISE'] },
    summary: { type: 'string' },
    learner_problem: {
      type: 'object', additionalProperties: false, required: ['met', 'feedback'],
      properties: { met: { type: 'boolean' }, feedback: { type: 'string' } }
    },
    visible_change: {
      type: 'object', additionalProperties: false, required: ['met', 'feedback'],
      properties: { met: { type: 'boolean' }, feedback: { type: 'string' } }
    },
    student_benefit: {
      type: 'object', additionalProperties: false, required: ['met', 'feedback'],
      properties: { met: { type: 'boolean' }, feedback: { type: 'string' } }
    },
    design_takeaway: { type: 'string' }
  }
};

const S1_TRANSFER_PLAN_ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status', 'summary', 'quality_indicators', 'strengths', 'gaps',
    'recommended_next_step', 'human_review_note'
  ],
  properties: {
    status: { type: 'string', enum: ['STRONG', 'DEVELOPING', 'REVISE'] },
    summary: { type: 'string' },
    quality_indicators: {
      type: 'array',
      minItems: 0,
      maxItems: 5,
      items: {
        type: 'string',
        enum: ['CLEAR_DESTINATION', 'VISIBLE_START', 'LEARNING_SEQUENCE', 'VISIBLE_SUBMISSION', 'CONTINUATION_CUE']
      }
    },
    strengths: { type: 'array', minItems: 0, maxItems: 5, items: { type: 'string' } },
    gaps: { type: 'array', minItems: 0, maxItems: 5, items: { type: 'string' } },
    recommended_next_step: { type: 'string' },
    human_review_note: { type: 'string' }
  }
};

const S1_CANVAS_RESCUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['brief_quality', 'brief_summary', 'assumptions', 'proposals'],
  properties: {
    brief_quality: { type: 'string', enum: ['STRONG', 'DEVELOPING', 'WEAK'] },
    brief_summary: { type: 'string' },
    assumptions: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string' } },
    proposals: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'detail', 'recommended_boundary', 'rationale'],
        properties: {
          id: { type: 'string', enum: ['start-here', 'module-path', 'assignment-checklist', 'remove-alternatives', 'invent-outcome'] },
          title: { type: 'string' },
          detail: { type: 'string' },
          recommended_boundary: { type: 'string', enum: ['KEEP_IN_DRAFT', 'INSTRUCTOR_REVIEW'] },
          rationale: { type: 'string' }
        }
      }
    }
  }
};


const S2_DRAFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'activity_title', 'activity_prompt', 'design_rationale', 'deliberate_weakness',
    'likely_student_response', 'why_the_weakness_matters'
  ],
  properties: {
    activity_title: { type: 'string' },
    activity_prompt: { type: 'string' },
    design_rationale: { type: 'string' },
    deliberate_weakness: {
      type: 'string',
      enum: ['too_vague', 'no_evidence', 'no_transfer', 'grade_focus']
    },
    likely_student_response: { type: 'string' },
    why_the_weakness_matters: { type: 'string' }
  }
};

const S2_REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status', 'confidence', 'feedback_summary', 'what_improved', 'remaining_issue',
    'revised_activity', 'student_response_after', 'why_student_thinking_changed'
  ],
  properties: {
    status: { type: 'string' },
    confidence: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
    feedback_summary: { type: 'string' },
    what_improved: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
    remaining_issue: { type: 'string' },
    revised_activity: { type: 'string' },
    student_response_after: { type: 'string' },
    why_student_thinking_changed: { type: 'string' }
  }
};


const S3_DRAFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'assessment_title', 'student_role', 'audience', 'task', 'deliverable',
    'constraints', 'success_evidence', 'deliberate_weakness',
    'why_it_is_more_authentic', 'likely_student_behavior'
  ],
  properties: {
    assessment_title: { type: 'string' },
    student_role: { type: 'string' },
    audience: { type: 'string' },
    task: { type: 'string' },
    deliverable: { type: 'string' },
    constraints: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
    success_evidence: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
    deliberate_weakness: {
      type: 'string',
      enum: ['fake_audience', 'thin_decision', 'unclear_evidence', 'over_scaffolded']
    },
    why_it_is_more_authentic: { type: 'string' },
    likely_student_behavior: { type: 'string' }
  }
};

const S3_REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status', 'confidence', 'feedback_summary', 'what_improved',
    'remaining_issue', 'final_assessment', 'alignment_rationale',
    'student_evidence_of_learning'
  ],
  properties: {
    status: { type: 'string' },
    confidence: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
    feedback_summary: { type: 'string' },
    what_improved: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
    remaining_issue: { type: 'string' },
    final_assessment: { type: 'string' },
    alignment_rationale: { type: 'string' },
    student_evidence_of_learning: { type: 'string' }
  }
};


const S3_EVIDENCE_ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'claim_about_learning', 'confidence', 'evidence_used', 'judgment',
    'recommendation', 'deliberate_issue', 'why_this_inference_is_plausible'
  ],
  properties: {
    claim_about_learning: { type: 'string' },
    confidence: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
    evidence_used: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
    judgment: { type: 'string', enum: ['SUFFICIENT', 'PARTIAL', 'INSUFFICIENT'] },
    recommendation: { type: 'string' },
    deliberate_issue: { type: 'string', enum: ['ignores_transfer'] },
    why_this_inference_is_plausible: { type: 'string' }
  }
};


const S3_TRANSFER_ASSESSMENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status', 'confidence', 'feedback_summary', 'current_evidence',
    'alignment_gap', 'authenticity_opportunity', 'suggested_revision',
    'why_stronger_evidence', 'remaining_limitation', 'suggested_components',
    'share_title', 'share_summary'
  ],
  properties: {
    status: { type: 'string' },
    confidence: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
    feedback_summary: { type: 'string' },
    current_evidence: { type: 'string' },
    alignment_gap: { type: 'string' },
    authenticity_opportunity: { type: 'string' },
    suggested_revision: { type: 'string' },
    why_stronger_evidence: { type: 'string' },
    remaining_limitation: { type: 'string' },
    suggested_components: {
      type: 'object',
      additionalProperties: false,
      required: ['situation', 'performance', 'evidence', 'reasoning', 'criteria'],
      properties: {
        situation: { type: 'string' },
        performance: { type: 'string' },
        evidence: { type: 'string' },
        reasoning: { type: 'string' },
        criteria: { type: 'string' }
      }
    },
    share_title: { type: 'string' },
    share_summary: { type: 'string' }
  }
};

const S4_DRAFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'plan_title', 'essential_learning_function', 'synchronous_path',
    'asynchronous_path', 'evidence_of_learning', 'deliberate_weakness',
    'why_the_plan_looks_fair', 'likely_student_consequence'
  ],
  properties: {
    plan_title: { type: 'string' },
    essential_learning_function: { type: 'string' },
    synchronous_path: { type: 'string' },
    asynchronous_path: { type: 'string' },
    evidence_of_learning: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'string' } },
    deliberate_weakness: {
      type: 'string',
      enum: ['recording_only', 'unequal_path', 'hidden_live_requirement', 'fragile_tech']
    },
    why_the_plan_looks_fair: { type: 'string' },
    likely_student_consequence: { type: 'string' }
  }
};

const S4_REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status', 'confidence', 'feedback_summary', 'what_improved',
    'remaining_issue', 'final_participation_plan',
    'equivalence_rationale', 'observable_evidence'
  ],
  properties: {
    status: { type: 'string' },
    confidence: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
    feedback_summary: { type: 'string' },
    what_improved: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
    remaining_issue: { type: 'string' },
    final_participation_plan: { type: 'string' },
    equivalence_rationale: { type: 'string' },
    observable_evidence: { type: 'string' }
  }
};


const S5_BRIEF_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'brief_title', 'brief_summary', 'claims', 'deliberate_issue',
    'target_claim_id', 'why_unsafe', 'verification_priority'
  ],
  properties: {
    brief_title: { type: 'string' },
    brief_summary: { type: 'string' },
    claims: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['claim_id', 'claim_text', 'cited_source_id'],
        properties: {
          claim_id: { type: 'string' },
          claim_text: { type: 'string' },
          cited_source_id: { type: 'string' }
        }
      }
    },
    deliberate_issue: {
      type: 'string',
      enum: ['fabricated_source', 'unsupported_number', 'overclaim', 'source_mismatch']
    },
    target_claim_id: { type: 'string' },
    why_unsafe: { type: 'string' },
    verification_priority: { type: 'string' }
  }
};

const S5_REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status', 'confidence', 'feedback_summary', 'what_improved',
    'remaining_issue', 'corrected_claim', 'verification_note',
    'safe_use_recommendation'
  ],
  properties: {
    status: { type: 'string' },
    confidence: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
    feedback_summary: { type: 'string' },
    what_improved: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
    remaining_issue: { type: 'string' },
    corrected_claim: { type: 'string' },
    verification_note: { type: 'string' },
    safe_use_recommendation: { type: 'string' }
  }
};

const S2_ACCESSIBILITY_HEADING_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['repaired_html', 'explanation'],
  properties: { repaired_html: { type: 'string' }, explanation: { type: 'string' } }
};

function getAnalysisContract_(incoming) {
  const analysisType = String(incoming?.analysis_type || 'scenario1');
  if (analysisType === 's2_accessibility_heading_repair') return { analysisType, schemaName: 'promptcraft_s2_accessibility_heading_repair', schemaVersion: 'promptcraft_s2_accessibility_heading_repair_v1', schema: S2_ACCESSIBILITY_HEADING_SCHEMA };
  if (analysisType === 's1_evidence_analysis') {
    return {
      analysisType,
      schemaName: 'promptcraft_s1_evidence_analysis',
      schemaVersion: 'promptcraft_s1_evidence_analysis_v1',
      schema: S1_EVIDENCE_ANALYSIS_SCHEMA
    };
  }
  if (analysisType === 's1_transfer_plan_analysis') {
    return {
      analysisType,
      schemaName: 'promptcraft_s1_transfer_plan_analysis',
      schemaVersion: 'promptcraft_s1_transfer_plan_analysis_v1',
      schema: S1_TRANSFER_PLAN_ANALYSIS_SCHEMA
    };
  }
  if (analysisType === 's1_canvas_rescue') {
    return {
      analysisType,
      schemaName: 'promptcraft_s1_canvas_rescue',
      schemaVersion: 'promptcraft_s1_canvas_rescue_v1',
      schema: S1_CANVAS_RESCUE_SCHEMA
    };
  }
  if (analysisType === 's2_draft') {
    return {
      analysisType,
      schemaName: 'promptcraft_s2_babbage_draft',
      schemaVersion: 'promptcraft_s2_babbage_draft_v1',
      schema: S2_DRAFT_SCHEMA
    };
  }
  if (analysisType === 's2_review') {
    return {
      analysisType,
      schemaName: 'promptcraft_s2_babbage_review',
      schemaVersion: 'promptcraft_s2_babbage_review_v1',
      schema: S2_REVIEW_SCHEMA
    };
  }
  if (analysisType === 's3_draft') {
    return {
      analysisType,
      schemaName: 'promptcraft_s3_babbage_draft',
      schemaVersion: 'promptcraft_s3_babbage_draft_v1',
      schema: S3_DRAFT_SCHEMA
    };
  }
  if (analysisType === 's3_review') {
    return {
      analysisType,
      schemaName: 'promptcraft_s3_babbage_review',
      schemaVersion: 'promptcraft_s3_babbage_review_v1',
      schema: S3_REVIEW_SCHEMA
    };
  }
  if (analysisType === 's3_evidence_analysis') {
    return {
      analysisType,
      schemaName: 'promptcraft_s3_evidence_analysis',
      schemaVersion: 'promptcraft_s3_evidence_analysis_v1',
      schema: S3_EVIDENCE_ANALYSIS_SCHEMA
    };
  }
  if (analysisType === 's3_transfer_assessment') {
    return {
      analysisType,
      schemaName: 'promptcraft_s3_transfer_assessment',
      schemaVersion: 'promptcraft_s3_transfer_assessment_v1',
      schema: S3_TRANSFER_ASSESSMENT_SCHEMA
    };
  }
  if (analysisType === 's4_draft') {
    return {
      analysisType,
      schemaName: 'promptcraft_s4_babbage_draft',
      schemaVersion: 'promptcraft_s4_babbage_draft_v1',
      schema: S4_DRAFT_SCHEMA
    };
  }
  if (analysisType === 's4_review') {
    return {
      analysisType,
      schemaName: 'promptcraft_s4_babbage_review',
      schemaVersion: 'promptcraft_s4_babbage_review_v1',
      schema: S4_REVIEW_SCHEMA
    };
  }
  if (analysisType === 's5_brief') {
    return {
      analysisType,
      schemaName: 'promptcraft_s5_babbage_brief',
      schemaVersion: 'promptcraft_s5_babbage_brief_v1',
      schema: S5_BRIEF_SCHEMA
    };
  }
  if (analysisType === 's5_review') {
    return {
      analysisType,
      schemaName: 'promptcraft_s5_babbage_review',
      schemaVersion: 'promptcraft_s5_babbage_review_v1',
      schema: S5_REVIEW_SCHEMA
    };
  }
  return {
    analysisType: 'scenario1',
    schemaName: 'promptcraft_s1_babbage_analysis',
    schemaVersion: 'promptcraft_s1_babbage_analysis_v1',
    schema: S1_SCHEMA
  };
}

function jsonResponse(statusCode, payload) {
  return { statusCode, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(payload) };
}

function requestId_(event) {
  return event?.headers?.['x-nf-request-id'] || event?.headers?.['X-Nf-Request-Id'] || `pc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractOutputText_(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    if (item?.type !== 'message') continue;
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text.trim();
    }
  }
  return '';
}

function parseStructuredOutput_(data) {
  const text = extractOutputText_(data);
  if (!text) throw new Error('OpenAI returned no output_text.');
  return JSON.parse(text);
}

export const handler = async (event = {}) => {
  const requestId = requestId_(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };

  if (event.httpMethod === 'GET') {
    return jsonResponse(200, {
      status: 'ok',
      service: 'PromptCraft Babbage proxy',
      proxy_version: PROMPTCRAFT_BABBAGE_PROXY_VERSION,
      provider: 'openai',
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: DEFAULT_OPENAI_MODEL,
      supported_contracts: [
        'scenario1',
        's1_evidence_analysis',
        's1_transfer_plan_analysis',
        's1_canvas_rescue',
        's2_draft', 's2_review', 's2_accessibility_heading_repair',
        's3_draft', 's3_review', 's3_evidence_analysis', 's3_transfer_assessment',
        's4_draft', 's4_review',
        's5_brief', 's5_review'
      ],
      message: process.env.OPENAI_API_KEY ? 'Babbage is configured for OpenAI Responses API.' : 'Babbage proxy is reachable, but OPENAI_API_KEY is unavailable.'
    });
  }

  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: { message: 'Method not allowed.' } });
  if (!process.env.OPENAI_API_KEY) return jsonResponse(503, { error: { message: 'Babbage is not configured. Add OPENAI_API_KEY to the Netlify environment.' } });

  let incoming;
  try { incoming = JSON.parse(event.body || '{}'); }
  catch (_error) { return jsonResponse(400, { error: { message: 'Request body must be valid JSON.' } }); }

  const input = Array.isArray(incoming.messages) ? incoming.messages : [];
  if (!input.length) return jsonResponse(400, { error: { message: 'At least one user message is required.' } });

  const contract = getAnalysisContract_(incoming);
  const startedAt = Date.now();
  const payload = {
    model: DEFAULT_OPENAI_MODEL,
    instructions: String(incoming.system || ''),
    input,
    max_output_tokens: Math.max(1200, Math.min(Number(incoming.max_output_tokens || incoming.max_tokens || 5000), 8000)),
    reasoning: { effort: String(process.env.OPENAI_REASONING_EFFORT || 'low') },
    text: {
      format: {
        type: 'json_schema',
        name: contract.schemaName,
        strict: true,
        schema: contract.schema
      }
    }
  };

  console.log(`[PromptCraft Babbage] ${requestId} start provider=openai model=${payload.model} analysis_type=${contract.analysisType} max_output_tokens=${payload.max_output_tokens}`);

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/v1/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify(payload)
    });
    const elapsedMs = Date.now() - startedAt;
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch (_error) { data = {}; }

    if (!response.ok) {
      const providerMessage = data?.error?.message || raw.slice(0, 800) || `HTTP ${response.status}`;
      console.error(`[PromptCraft Babbage] ${requestId} upstream_error status=${response.status} elapsed_ms=${elapsedMs} message=${providerMessage}`);
      return jsonResponse(response.status, { error: { message: providerMessage }, promptcraft_proxy: { version: PROMPTCRAFT_BABBAGE_PROXY_VERSION, provider: 'openai', model: payload.model, elapsed_ms: elapsedMs, request_id: requestId } });
    }

    let analysis;
    try { analysis = parseStructuredOutput_(data); }
    catch (error) {
      console.error(`[PromptCraft Babbage] ${requestId} parse_error elapsed_ms=${elapsedMs} message=${error.message}`);
      return jsonResponse(502, { error: { message: 'Babbage received an OpenAI response but could not parse the structured analysis.' }, promptcraft_proxy: { version: PROMPTCRAFT_BABBAGE_PROXY_VERSION, provider: 'openai', model: payload.model, elapsed_ms: elapsedMs, request_id: requestId } });
    }

    console.log(`[PromptCraft Babbage] ${requestId} success status=${response.status} elapsed_ms=${elapsedMs} input_tokens=${data?.usage?.input_tokens ?? 'unknown'} output_tokens=${data?.usage?.output_tokens ?? 'unknown'}`);
    return jsonResponse(200, {
      status: 'ok',
      provider: 'openai',
      model: payload.model,
      proxy_version: PROMPTCRAFT_BABBAGE_PROXY_VERSION,
      analysis_schema: contract.schemaVersion,
      analysis_type: contract.analysisType,
      request_id: requestId,
      elapsed_ms: elapsedMs,
      analysis,
      usage: data?.usage || null
    });
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    console.error(`[PromptCraft Babbage] ${requestId} network_error elapsed_ms=${elapsedMs}`, error);
    return jsonResponse(502, { error: { message: 'Babbage could not reach the OpenAI Responses API.' }, promptcraft_proxy: { version: PROMPTCRAFT_BABBAGE_PROXY_VERSION, provider: 'openai', model: DEFAULT_OPENAI_MODEL, elapsed_ms: elapsedMs, request_id: requestId } });
  }
};