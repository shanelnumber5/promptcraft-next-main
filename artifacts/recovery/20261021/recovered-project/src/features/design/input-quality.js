// Require an answer; let Babbage interpret humor and adult academic material in context.
export function answerIssue(answer) {
  const text = answer.trim();
  if (!text) return 'Add an answer, or say what you are unsure about.';
  return '';
}
