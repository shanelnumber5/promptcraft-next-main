import { answerIssue, isUncertainAnswer } from './input-quality.js';

function hasResolvedAiUsePolicy(teacher) {
  const choice = teacher.aiUse?.trim();
  return Boolean(choice && !isUncertainAnswer(choice));
}

function isAiPolicyQuestion(question) {
  // Disclosure and permitted-use questions belong to setup, not drafting.
  return /disclos(?:e|ure)|(?:AI|artificial intelligence|generative tools).{0,45}(?:allow|permi|polic|brainstorm|requir|use)|(?:allow|permi|polic|brainstorm|requir|use).{0,45}(?:AI|artificial intelligence|generative tools)/i.test(question.text);
}

function addRequiredClarifications(turn, teacher) {
  if (hasResolvedAiUsePolicy(teacher)) {
    const policyOnly = turn.questions.length > 0 && turn.questions.every(isAiPolicyQuestion);
    turn.questions = turn.questions.filter((question) => !isAiPolicyQuestion(question));
    if (policyOnly && !turn.questions.length) turn.ready = true;
  }
  if (!teacher.learningGoal.trim() || teacher.learningGoalUnsure || isUncertainAnswer(teacher.learningGoal)) {
    turn.questions.unshift({
      id: 'learning-goal',
      text: 'What should students learn or practice in this assignment?',
      field: 'learningGoal',
    });
    turn.ready = false;
    turn.suggestion = null;
  }
  if (!teacher.aiUse?.trim() || isUncertainAnswer(teacher.aiUse)) {
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
        ...(turn.aside ? {aside:turn.aside,tone:turn.tone,version:1} : {}),
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
    const answer = conversation.answers[question.id].trim();
    if (isUncertainAnswer(answer)) continue;
    teacher[question.field] = answer;
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

export function clarificationLimitReached(conversation) {
  if (conversation.ready) return false;
  const rounds = conversation.history.filter(turn => {
    if (turn.role !== 'user') return false;
    try { return Array.isArray(JSON.parse(turn.content).clarification_answers); } catch { return false; }
  }).length;
  return rounds >= 2;
}
export function renderClarificationPause() {
  return '<section class="babbage-clarification-pause"><h3>Let’s leave the questions here</h3><p>Babbage could not turn these answers into a workable draft. You can keep the playful premise, edit your starting point to make the learning task clearer, or continue writing your draft.</p><p>Your current draft is unchanged.</p><div class="workspace-project-actions"><button type="button" data-action="edit-context">Edit starting point</button><button type="button" data-action="edit-draft">Work on my draft</button></div></section>';
}
