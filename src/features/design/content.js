export const designDefaults = () => ({
  concern: '',
  exchange: '',
  notes: '',
  revision: '',
  reason: '',
  sourceDirections: '',
  previousRevision: '',
  previousReason: '',
});
export function syncDraftAssignment(teacher, design) {
  if (design.sourceDirections === teacher.directions) return false;
  if (design.revision.trim()) {
    design.previousRevision = design.revision;
    design.previousReason = design.reason;
  }
  design.revision = '';
  design.reason = '';
  design.sourceDirections = teacher.directions;
  return true;
}
export const exchangeOptions = [
  ['test', 'Ask a question about a classmate’s choice'],
  ['evidence', 'Compare a classmate’s idea with evidence or an example'],
  ['perspective', 'Explain a different way to look at a classmate’s idea'],
];
export const designSteps = [
  {
    title: 'Give the conversation a purpose',
    intro: 'First, identify one thing you want to improve in the current discussion.',
    prompt:
      'Read your current directions below. What is missing from the discussion? For example, do students reply without helping each other think more carefully?',
    fields: [
      {
        id: 'concern',
        label: 'What is missing from the current discussion?',
        help: 'Describe one problem you want to solve. You do not need to know the solution yet.',
        type: 'textarea',
        placeholder: 'For example, students say “I agree” but do not explain why or ask questions.',
      },
    ],
  },
  {
    title: 'Choose a job for the reply',
    intro: 'Choose what students should do when they reply to a classmate.',
    prompt:
      'A reply should help the classmate think about their work. Choose one action below that could help with the problem you described.',
    fields: [
      {
        id: 'exchange',
        label: 'What should students do in their replies?',
        help: 'Choose one starting point. You can change the wording when you write the directions.',
        type: 'radio',
        options: exchangeOptions,
      },
      {
        id: 'notes',
        label: 'Optional: What might this reply help students notice?',
        help: 'Make a short prediction before drafting, or leave this blank. You can reconsider it later; your final rationale will explain the change you actually chose.',
        type: 'textarea',
        placeholder:
          'For example, a question could help students notice a weakness in their explanation.',
      },
    ],
  },
  {
    title: 'Design one focused discussion-board activity',
    intro:
      'Use the course context and learning goal to create a distinctive forum exchange. This is one component of the larger assignment, not an all-in-one replacement.',
    prompt:
      'Design one feasible discussion-board component for the larger assignment, not a replacement for every task. Use the subject, learners, learning goal, original directions, and time limits to make the exchange feel specific to this course. Give the first post, peer reply, and follow-up connected jobs so classmates’ contributions matter to the learning goal. Keep required elements. You can write your own directions or adapt the starter; remove old instructions that conflict.',
    fields: [
      {
        id: 'revision',
        label: 'Discussion-board directions',
        help: 'Write the first post, a purposeful peer reply, and a follow-up that uses the exchange. Keep this forum component focused; the larger assignment directions stay saved separately.',
        type: 'textarea',
        placeholder: 'Describe the focused forum exchange students will complete.',
      },
      {
        id: 'reason',
        label: 'How will this forum exchange help students learn?',
        help: 'Briefly explain your choice and what you will look for in student work to see whether it helped. If Babbage helped, say what you kept, adapted, or questioned. A short, specific explanation is enough.',
        type: 'textarea',
        placeholder:
          'For example, students must explain whether a classmate’s question changed their thinking.',
      },
    ],
  },
  {
    title: 'Review your before and after',
    intro:
      'Compare the original assignment with your focused discussion-board component. Check that the forum directions are clear, purposeful, and preserve your requirements.',
  },
  {
    title: 'Check your discussion-board component',
    intro:
      'Read the forum directions in the context of the larger assignment, complete the three checks, then select Assignment guide. Use Edit directions if anything needs changing.',
  },
];
export const finalCheckItems = [
  {
    id: 'instructions',
    title: 'Clear instructions',
    label:
      'Students can tell what to post, how to reply, and what to do with the reply they receive.',
    help: 'Check the order of the tasks, deadlines, and any instructions that might conflict.',
  },
  {
    id: 'learning',
    title: 'Learning goal',
    label: 'The tasks help students practice the learning goal shown above.',
    help: 'Look for something students will actually do that supports this goal.',
  },
  {
    id: 'requirements',
    title: 'Required elements',
    label:
      'The revised directions keep my required elements, or I have confirmed that there are none.',
    help: 'Check the topic, deadlines, grading criteria, and any other requirements. Make sure the workload fits the time available.',
  },
];
export const finalCheckDefaults = () => ({
  instructions: false,
  learning: false,
  requirements: false,
  completed: false,
  approved: false,
  context: '',
});
export const finalCheckContext = (teacher, design) =>
  JSON.stringify([
    design.revision,
    design.reason,
    teacher.directions,
    teacher.learningGoal,
    teacher.learningGoalUnsure,
    teacher.alignmentGuide,
    teacher.alignmentReference,
    teacher.mustStay,
    teacher.mustStayUnsure,
    teacher.workTime,
    teacher.daysAvailable,
  ]);
export const finalCheckReady = (state) =>
  Boolean(
    state.design.revision.trim() &&
      (!state.workspace || (state.design.reason.trim() && state.teacher.directions.trim() && !state.teacher.learningGoalUnsure)) &&
      state.teacher.learningGoal.trim() &&
      finalCheckItems.every((item) => state.finalCheck[item.id] === true) &&
      state.finalCheck.context === finalCheckContext(state.teacher, state.design),
  );
export function starterDraft(teacher, design) {
  const tasks = {
    test: 'Name a specific choice in a classmate’s contribution. Explain a concern and ask a question that helps them test that choice.',
    evidence:
      'Compare a classmate’s reasoning with a relevant piece of evidence or example. Explain what the comparison reveals and ask what they would reconsider.',
    perspective:
      'Offer a different perspective on a classmate’s contribution. Explain how it changes the problem and ask what they would reconsider.',
  };
  return (
    teacher.directions +
    '\n\nPeer exchange (draft)\n1. Make a choice connected to the assignment and explain your reasons.\n2. ' +
    (tasks[design.exchange] || tasks.test) +
    '\n3. Respond to the contribution you received. Revise or defend your choice with reasons, and explain how the exchange informed your response.'
  );
}

export function hasStarterExchange(text) {
  return /^Peer exchange \(draft\)\s*$/m.test(text);
}

export function removeRepeatedStarterExchanges(text) {
  // Only remove complete, generated exchanges. Preserve original directions and edited text.
  const blocks = exchangeOptions.map(([exchange]) =>
    starterDraft({ directions: '' }, { exchange }).trim(),
  );
  const escaped = blocks.map((block) =>
    block.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\n/g, '\\r?\\n'),
  );
  const pattern = new RegExp('(?:\\r?\\n){0,2}(?:' + escaped.join('|') + ')', 'g');
  let seen = false;
  return text.replace(pattern, (block) => {
    if (seen) return '';
    seen = true;
    return block;
  });
}
