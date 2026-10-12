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
        label: 'How would this kind of reply help students learn?',
        help: 'Explain how the reply could address the problem you described.',
        type: 'textarea',
        placeholder:
          'For example, a question could help students notice a weakness in their explanation.',
      },
    ],
  },
  {
    title: 'Draft one manageable change',
    intro:
      'Write what students should post, how they should reply, and what they should do with the reply they receive.',
    prompt:
      'Keep the requirements listed below. You can write your own directions or add the starter. If you use the starter, remove any old instructions that no longer fit.',
    fields: [
      {
        id: 'revision',
        label: 'Revised assignment directions',
        help: 'Include instructions for the first post, the reply, and the follow-up. Your original directions stay saved separately.',
        type: 'textarea',
        placeholder: 'Write the complete instructions students will receive.',
      },
      {
        id: 'reason',
        label: 'How will the revised assignment help students learn?',
        help: 'Explain why your new directions are better for the learning goal you entered.',
        type: 'textarea',
        placeholder:
          'For example, students must explain whether a classmate’s question changed their thinking.',
      },
    ],
  },
  {
    title: 'Review your before and after',
    intro:
      'Compare the two versions. Check that the new directions are clear and keep your required elements.',
  },
  {
    title: 'Check your assignment',
    intro:
      'Read your revised directions, return to the three checks, then select Go to assignment guide. Use Edit directions if anything needs changing.',
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
    teacher.mustStay,
    teacher.mustStayUnsure,
    teacher.workTime,
    teacher.daysAvailable,
  ]);
export const finalCheckReady = (state) =>
  Boolean(
    state.design.revision.trim() &&
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
