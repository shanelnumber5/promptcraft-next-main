import { finalCheckDefaults } from '../design/content.js';

// Suggestions live inside the existing review feedback string. Saved projects
// need no new storage fields, and old plain-text reviews remain valid.
export const teachingNoteFields = ['learningGoal','instructorPlan'];
export function teachingNoteSuggestions(state) {
  let feedback, source;
  try { feedback=JSON.parse(state.creative.review.feedback); source=JSON.parse(state.creative.review.fingerprint); }
  catch { return {}; }
  if (feedback?.version!==1 || !feedback.teaching_notes || !source ||
      source.directions!==state.design.revision.trim() || source.requirements!==state.teacher.mustStay.trim() ||
      source.creativeCore!==(state.workspace.creativeCore || '') ||
      (source.studentContribution || '')!==(state.workspace.studentContribution || '') ||
      (source.peerInteraction || '')!==(state.workspace.peerInteraction || '')) return {};
  const current={learningGoal:state.teacher.learningGoal,instructorPlan:state.workspace.instructorPlan || ''};
  const original={learningGoal:source.goal,instructorPlan:source.instructorPlan};
  return Object.fromEntries(teachingNoteFields.filter(field=>{
    const text=feedback.teaching_notes[field];
    return typeof text==='string' && text.trim() && text.length<=2000 &&
      current[field].trim()===(original[field] || '').trim() && text.trim()!==current[field].trim();
  }).map(field=>[field,feedback.teaching_notes[field].trim()]));
}
export function applyTeachingNoteSuggestion(state, field, editedText) {
  if (!teachingNoteFields.includes(field) || !Object.hasOwn(teachingNoteSuggestions(state),field) ||
      typeof editedText!=='string' || !editedText.trim() || editedText.length>2000) return false;
  const text=editedText.trim();
  if (field==='learningGoal') {
    state.teacher.learningGoal=text;
    state.teacher.learningGoalUnsure=false;
  } else state.workspace.instructorPlan=text;
  state.finalCheck=finalCheckDefaults();
  return true;
}
