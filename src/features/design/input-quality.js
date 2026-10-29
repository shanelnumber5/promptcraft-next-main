// Require an answer; let Babbage interpret humor and adult academic material in context.
export function answerIssue(answer) {
  const text = answer.trim();
  if (!text) return 'Add an answer, or say what you are unsure about.';
  return '';
}

// Recognize explicit uncertainty, not unusual topics or jokes by keyword.
export function isUncertainAnswer(value = '') {
  const text = value.trim().toLowerCase().replace(/[’]/g, "'").replace(/[.!?]+$/, '');
  return /^(?:i (?:do not|don't) know(?: yet| what (?:i want|this means|you mean|to (?:choose|say|do)))?|(?:i am|i'm) (?:not sure|unsure)(?: yet)?|not sure(?: yet)?|unsure|idk|no idea|i (?:do not|don't) understand(?: (?:the question|this))?|help me (?:choose|decide))$/.test(text);
}
export function clarificationSupport(question, answer) {
  if (!isUncertainAnswer(answer)) return '';
  if (question.field === 'learningGoal') return 'Think about what students should practice: explaining a choice, checking evidence, or applying a course concept. You can ask Babbage to help compare those options.';
  if (question.field === 'aiUse') return 'Possible boundaries are no student AI use, ideas or feedback only, or drafting with limits. Tell Babbage what concerns you, or ask for a comparison before choosing.';
  return 'You can ask for an example, two possible approaches, or a suggested starting point. An unsure answer is a request for help, not a final design choice.';
}
