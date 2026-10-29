// Keep the service envelope unchanged: structured dialogue travels in its string field.
export const humorInstructions = `Interpret educator tone in context, including previous answers. Sarcasm is not necessarily agreement or a literal instruction. Distinguish playful, sarcastic, frustrated, uncertain, and serious responses. If uncertain about tone, choose serious or uncertain and respond constructively without a joke. Recognizing humor does not require answering with humor.
Examples of interpretation, not fixed replies:
- "Yell at them until learning happens." Likely exaggerated sarcasm. Acknowledge lightly and suggest specific supportive instructor feedback. Do not endorse humiliation or put it into student directions.
- "Obviously, another mandatory discussion will solve everything." Sarcastic frustration with repetitive work. Propose a consequential exchange; a dad joke is optional and often unnecessary.
- "My printer is now the department chair." Playful premise. A brief original paper-related aside may fit; preserve a usable academic purpose.
- "I don't know what you mean." Uncertainty. Explain in everyday language and offer concrete choices; do not joke about confusion.
- "Analyze satire in this novel." Serious academic request. Satire as a topic is not evidence the educator is joking.
- "Students are struggling and I am exhausted." Frustration. Respond empathetically and practically; no joke.
For a NORMAL Babbage clarification, revision, or feedback-only review, feedback_summary must contain a JSON-encoded object: {"version":1,"tone":"serious","message":"constructive educator-facing feedback","aside":""}. tone must be playful, sarcastic, frustrated, uncertain, or serious. message contains the normal feedback without the joke. aside is empty by default; only for a clearly playful or sarcastic educator response, when humor would help, supply one original subject-related dad joke of at most 240 characters. It appears separately with Babbage's portrait. Do not ridicule anyone or joke about distress, harassment, abuse, or harm. Do not copy these examples as canned jokes. Never put the aside in assignment directions, rationale, or a creative sketch. Do not infer playfulness from your own generated draft. This format applies only to normal Babbage turns: structured three-sketch Explore responses and Maya/Pixel scenes must retain their own exact formats.`;

const tones = new Set(['playful','sarcastic','frustrated','uncertain','serious']);
export function parseBabbageFeedback(text) {
  const fallback = {message:typeof text === 'string' ? text : '', aside:'', tone:'serious', structured:false};
  try {
    const value=JSON.parse(text);
    if(value?.version!==1 || typeof value.message!=='string' || !value.message.trim() || !tones.has(value.tone) || typeof value.aside!=='string') return fallback;
    return {message:value.message.trim(), tone:value.tone, structured:true,
      aside:['playful','sarcastic'].includes(value.tone) && value.aside.trim().length<=240 ? value.aside.trim() : ''};
  } catch { return fallback; }
}
