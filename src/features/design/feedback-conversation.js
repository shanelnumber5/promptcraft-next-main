// Durable educator notes, shared by the narrative dialogue and legacy Review links.
export function feedbackQuestions(scene) {
  const questions=[];
  for (const [speaker,turn] of [['Maya',scene?.maya],['Pixel',scene?.pixel]]) {
    if (!turn?.text) continue;
    for (const {segment} of new Intl.Segmenter('en',{granularity:'sentence'}).segment(turn.text)) {
      const text=segment.trim();
      if (/\?[”"’']?$/.test(text) && text.length<=700 && !questions.some(q=>q.text===text)) questions.push({speaker,text});
    }
  }
  return questions.slice(0,4);
}
export const emptyFeedbackConversation = () => ({draft:'',context:'',response:'',answers:[],other:'',appliedNotes:''});
export function restoreFeedbackConversation(value) {
  const result=emptyFeedbackConversation();
  if (!value || typeof value!=='object') return result;
  for (const [key,max] of [['draft',6000],['context',100000],['response',6000],['other',1000],['appliedNotes',6000]])
    if(typeof value[key]==='string') result[key]=value[key].slice(0,max);
  result.answers=Array.isArray(value.answers)?value.answers.slice(-12).filter(q=>['Maya','Pixel'].includes(q?.speaker) && typeof q.question==='string' && typeof q.answer==='string').map(q=>({speaker:q.speaker,question:q.question.slice(0,700),answer:q.answer.slice(0,1000)})):[];
  return result;
}
export function answerFor(state,question) {
  return state.creative?.conversation?.answers.find(q=>q.speaker===question.speaker && q.question===question.text)?.answer || '';
}
export function saveFeedbackAnswer(state,question,answer) {
  const record=state.creative.conversation ||= emptyFeedbackConversation();
  const existing=record.answers.find(q=>q.speaker===question.speaker && q.question===question.text);
  if(existing) existing.answer=answer.slice(0,1000);
  else record.answers=[...record.answers,{speaker:question.speaker,question:question.text,answer:answer.slice(0,1000)}].slice(-12);
}
export function savedFeedbackNotes(state) {
  const record=state.creative?.conversation;
  if (!record) return '';
  let questions=[];
  try { questions=feedbackQuestions(JSON.parse(record.response)); } catch {}
  const answers=record.answers.filter(q=>q.answer.trim() && (!questions.length || questions.some(current=>current.speaker===q.speaker && current.text===q.question)));
  return answers.map(q=>`${q.speaker}: ${q.question}\nEducator: ${q.answer.trim()}`).concat(record.other?.trim()?[record.other.trim()]:[]).join('\n\n');
}
