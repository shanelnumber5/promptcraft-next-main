import { buildBabbageRequest, BABBAGE_ENDPOINT, normalizeBabbageResponse } from '../design/babbage-client.js';
import { postJSON } from '../../shared/json-request.js';

export function buildConversationRevisionRequest(state, notes) {
  const base=buildBabbageRequest(state,'revise');
  return {...base,response_kind:'targeted_revision',max_output_tokens:Math.min(3600,Math.max(2200,Math.ceil(state.design.revision.length/3)+900)),
    system:base.system+'\nThis is ONE requested edit of an existing draft after the educator answered Maya and Pixel. Apply only those decisions. Preserve every other requirement, deadline, policy and creative choice. Do not ask any clarification questions or introduce a new evaluation. If the educator leaves a detail open, preserve the current wording. Return the complete edited activity in revised_discussion_prompt, a short reason in revision_review.why_these_changes (80 words maximum), and feedback_summary of 60 words maximum naming what changed. Set input_quality.usable true and concerns to []. Do not invent a missing AI policy or learning goal. The educator reviews the edit next.',
    messages:[base.messages[0],{role:'user',content:JSON.stringify({request_intent:'revise',current_draft:state.design.revision,educator_decisions:notes,revision_scope:'Apply these decisions once; preserve everything else.'})}]};
}
export async function requestConversationRevision(state,notes,{fetchImpl=fetch,signal}={}) {
  const data=await postJSON(BABBAGE_ENDPOINT,buildConversationRevisionRequest(state,notes),{fetchImpl,signal,
    httpError:(status,details)=>Error(details?.error?.message || 'Babbage could not finish this revision. Your draft and answers are saved.'),
    unreadableMessage:'Babbage returned an unreadable revision. Your draft and answers are saved.'});
  const turn=normalizeBabbageResponse(data,'revise');
  if(!turn.suggestion) throw Error('Babbage did not return the requested edit. Your draft and answers are saved; you can edit the draft directly.');
  return turn.suggestion;
}
