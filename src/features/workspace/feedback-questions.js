import { renderInlineProse } from '../../shared/directions.js';
import { mayaFeedbackReference } from '../design/maya-dialog.js';
import { escapeHTML as e } from '../../shared/html.js';

export { feedbackQuestions } from '../design/feedback-conversation.js';
import { feedbackQuestions, answerFor } from '../design/feedback-conversation.js';
export function currentFeedbackQuestions(state) { return feedbackQuestions(mayaFeedbackReference(state)); }
export function renderFeedbackClarifications(state, pending) {
  const questions=currentFeedbackQuestions(state);
  return `<section class="workspace-feedback-clarifications"><p>Answer any questions that matter to your design. Babbage will use your answers to revise the activity; you can edit the result in Build.</p>${questions.length ? questions.map((item,index)=>`<div class="workspace-feedback-question"><label for="feedback-answer-${index}">${e(item.speaker)} asks: ${renderInlineProse(item.text)}</label><textarea id="feedback-answer-${index}" data-feedback-answer="${index}" maxlength="1000" rows="3">${e(answerFor(state,item))}</textarea></div>`).join('') : '<p>Questions from Maya and Pixel appear here after their reading, when they ask any.</p><button type="button" data-action="continue-to-maya">Hear Maya’s perspective</button>'}<div class="workspace-feedback-question"><label for="feedback-answer-other">Anything else to clarify or change?</label><textarea id="feedback-answer-other" data-feedback-answer="other" maxlength="1000" rows="3">${e(state.creative.conversation?.other || "")}</textarea></div><p class="field-help">Answers are added to your project notes when you select Revise with my answers.</p></section>`;
}
export function clarificationNotes(questions, answers) {
  const entries=questions.map((question,index)=>({question:`${question.speaker}: ${question.text}`,answer:answers[String(index)]?.trim()}));
  entries.push({question:'Additional educator clarification',answer:answers.other?.trim()});
  if (entries.some(item=>item.answer?.length>1000)) throw Error('Keep each answer under 1,000 characters.');
  const answered=entries.filter(item=>item.answer);
  if(!answered.length) throw Error('Add an answer or a change you want Babbage to make.');
  return 'Educator clarifications for the next revision:\n'+answered.map(item=>item.question+'\n'+item.answer).join('\n\n');
}
