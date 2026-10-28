// Scenario content for the guided teacher setup. Shared form rendering lives elsewhere.
const setupSections = {
  id: 'discussion-teacher-setup',
  title: 'Discussion board assignment',
  steps: [
    {
      id: 'class',
      label: 'Step 1 of 3',
      title: 'Your class',
      intro:
        'We’ll use your course context to shape one focused discussion-board activity that supports your larger assignment.',
      fields: [
        {
          id: 'subject',
          label: 'What subject do you teach?',
          help: 'This keeps examples and suggestions connected to your course.',
          type: 'text',
          placeholder: 'For example, biology or public speaking',
          unsure: true,
        },
        {
          id: 'learnerLevel',
          label: 'Who are the students in this class?',
          help: 'Describe their year, course level, or experience with the subject.',
          type: 'text',
          placeholder: 'For example, first-year college or adult education',
          unsure: true,
        },
        {
          id: 'participation',
          label: 'Where does this class meet?',
          help: 'Choose online, in person, or a mix of the two.',
          type: 'radio',
          options: [
            ['online', 'Online'],
            ['in-person', 'In person'],
            ['both', 'Both'],
            ['not-sure', 'Not sure yet'],
          ],
        },
      ],
    },
    {
      id: 'assignment',
      label: 'Step 2 of 3',
      title: 'Original assignment directions',
      intro:
        'Share the larger assignment for context. We’ll design one focused forum component that supports it, not replace it.',
      example: {
        title: 'Example for exploring without an assignment',
        directions:
          'Choose one recommendation for improving a community space. Explain your recommendation in 300–400 words and respond to one classmate with a question that tests part of their reasoning.',
        learning:
          'Students should practice making a recommendation, supporting it with reasons, and using a peer question to reconsider one choice.',
      },
      fields: [
        {
          id: 'directions',
          label: 'Paste the larger assignment directions',
          help: 'These directions provide context for the discussion-board component.',
          type: 'textarea',
          rows: 9,
          placeholder: 'Paste the current assignment directions for context.',
        },
        {
          id: 'learningGoal',
          label: 'What should students learn or practice?',
          help: 'Name the skill or understanding students should gain from this assignment.',
          type: 'textarea',
          rows: 4,
          placeholder: 'For example, compare two explanations and support a choice with evidence.',
          unsure: true,
        },
      ],
    },
    {
      id: 'limits',
      label: 'Step 3 of 3',
      title: 'Your limits',
      intro:
        'Practical limits help keep the discussion-board component realistic for you and your students.',
      fields: [
        {
          id: 'workTime',
          label: 'How much work time should each student spend?',
          help: 'Estimate the total time spent reading, writing, and replying.',
          type: 'text',
          placeholder: 'For example, 60–90 minutes',
          unsure: true,
        },
        {
          id: 'daysAvailable',
          label: 'How many days do students have to finish?',
          help: 'Count the days from the assignment’s start to its final due date.',
          type: 'text',
          placeholder: 'For example, one week',
          unsure: true,
        },
        {
          id: 'workMode',
          label: 'How do students complete the larger assignment?',
          help: 'Choose individual or group work for the larger assignment. The discussion-board component can still include peer exchange.',
          type: 'radio',
          options: [
            ['individual', 'Individual'],
            ['group', 'Group'],
            ['both', 'Both'],
            ['not-sure', 'Not sure yet'],
          ],
        },
        {
          id: 'mustStay',
          label: 'What parts of the assignment must stay the same?',
          help: 'List requirements you cannot change, such as the topic, due date, or grading rubric.',
          type: 'textarea',
          rows: 4,
          placeholder: 'For example, the topic, due date, rubric, required tool, or group size',
          unsure: true,
        },
      ],
    },
  ],
  summaryTitle: 'Here’s what we’ll work with.',
};

// Keep each screen focused while retaining the original assignment/example step.
const [classSection, assignmentSection, limitsSection] = setupSections.steps;
export const teacherSetup = {
  ...setupSections,
  steps: [
    classSection,
    { ...assignmentSection, fields: assignmentSection.fields.slice(0, 1) },
    {
      id: 'learning',
      title: 'Your learning goal',
      intro:
        'Choose one skill or understanding a focused discussion-board exchange can advance within the larger assignment.',
      fields: [
        ...assignmentSection.fields.slice(1),
        {
          id: 'alignmentGuide',
          label: 'Optional assignment guide',
          help: 'Choose one lens, or leave this set to none. Babbage uses only the relevant guidance you provide; it does not verify official alignment.',
          type: 'select',
          options: [
            ['none', 'No additional guide'],
            ['montana-k12', 'Montana K–12 Content Standards'],
            ['msu-outcomes', 'MSU course description or learning outcomes'],
            ['oscqr', 'OSCQR online course quality rubric'],
          ],
        },
        {
          id: 'alignmentReference',
          label: 'Relevant standard, outcome, or rubric item',
          help: 'Optional: paste source text, a standard number, or a rubric item, or leave blank. Montana K-12: include grade and subject. MSU: include course outcome.',
          type: 'textarea',
          rows: 4,
          placeholder: 'Paste a relevant excerpt or identifier here.',
        },
      ],
    },
    {
      id: 'time',
      title: 'Time for the discussion',
      intro:
        'Set realistic limits for this discussion-board component, keeping the larger assignment and student workload in view.',
      fields: limitsSection.fields.slice(0, 2),
    },
    {
      ...limitsSection,
      title: 'Requirements to keep',
      intro:
        'Choose how students complete the larger assignment and list what the discussion-board component must preserve.',
      fields: limitsSection.fields.slice(2),
    },
  ].map((step, index) => ({
    ...step,
    tabLabel: ['Class', 'Directions', 'Learning goal', 'Time', 'Requirements'][index],
    label: `Step ${index + 1} of 5`,
  })),
};

export const teacherSetupDefaults = () => ({
  aiUse: '',
  subject: '',
  subjectUnsure: false,
  learnerLevel: '',
  learnerLevelUnsure: false,
  participation: '',
  directions: '',
  learningGoal: '',
  learningGoalUnsure: false,
  alignmentGuide: 'none',
  alignmentReference: '',
  workTime: '',
  workTimeUnsure: false,
  daysAvailable: '',
  daysAvailableUnsure: false,
  workMode: '',
  mustStay: '',
  mustStayUnsure: false,
});
