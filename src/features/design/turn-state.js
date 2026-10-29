import { answerIssue } from './input-quality.js';

function hasResolvedAiUsePolicy(teacher) {
  const choice = teacher.aiUse?.trim();
  return Boolean(choice && choice !== 'Not sure yet');
}

function isAiPolicyQuestion(question) {
  // Disclosure and permitted-use questions belong to setup, not drafting.
  return /disclos(?:e|ure)|(?:AI|artificial intelligence|generative tools).{0,45}(?:allow|permi|polic|brainstorm|requir|use)|(?:allow|permi|polic|brainstorm|requir|use).{0,45}(?:AI|artificial intelligence|generative tools)/i.test(question.text);
}

function addRequiredClarifications(turn, teacher) {
  if (hasResolvedAiUsePolicy(teacher)) {
    turn.questions = turn.questions.filter((question) => !isAiPolicyQuestion(question));
    if (!turn.questions.length) turn.ready = true;
  }
  if (!teacher.learningGoal.trim() || teacher.learningGoalUnsure) {
    turn.questions.unshift({
      id: 'learning-goal',
      text: 'What should students learn or practice in this assignment?',
      field: 'learningGoal',
    });
    turn.ready = false;
    turn.suggestion = null;
  }
  if (!teacher.aiUse?.trim() || teacher.aiUse.trim() === 'Not sure yet') {
    turn.questions = turn.questions
      .filter((question) => !isAiPolicyQuestion(question))
      .slice(0, 2);
    turn.questions.unshift({
      id: 'ai-use',
      text: teacher.aiUse?.trim() === 'Not sure yet' ? 'What is your main concern about student AI use here, or which boundary would you like to try?' : 'What student AI use should this assignment allow? You can say none, ideas or feedback only, or drafting with limits.',
      field: 'aiUse',
    });
    turn.ready = false;
    turn.suggestion = null;
  }
  return turn;
}

export function hasCompleteClarificationAnswers(conversation) {
  return conversation.questions.length > 0 && conversation.questions.every((question) =>
    !answerIssue(conversation.answers[question.id] || ''),
  );
}

export function applyBabbageTurn(conversation, history, turn, teacher) {
  addRequiredClarifications(turn, teacher);
  conversation.history = [
    ...history,
    {
      role: 'assistant',
      content: JSON.stringify({
        message: turn.message,
        questions: turn.questions,
        ready: turn.ready,
      }),
      display: turn.message,
    },
  ].slice(-20);
  conversation.questions = turn.questions;
  conversation.questionIndex = 0;
  conversation.answers = {};
  conversation.ready = turn.ready;
  return turn.suggestion;
}

export function prepareClarificationAnswers(conversation, teacher) {
  if (!hasCompleteClarificationAnswers(conversation)) return null;

  const answers = conversation.questions.map((question) => ({
    question: question.text,
    answer: conversation.answers[question.id].trim(),
  }));
  let hasTeacherFieldAnswers = false;
  for (const question of conversation.questions) {
    if (!['learningGoal', 'aiUse'].includes(question.field)) continue;
    teacher[question.field] = conversation.answers[question.id].trim();
    if (question.field === 'learningGoal') teacher.learningGoalUnsure = false;
    hasTeacherFieldAnswers = true;
  }
  return {
    hasTeacherFieldAnswers,
    historyEntry: {
      role: 'user',
      content: JSON.stringify({ clarification_answers: answers }),
      display: answers.map((answer) => answer.question + '\n' + answer.answer).join('\n\n'),
    },
  };
}
