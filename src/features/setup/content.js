// Scenario content for the guided teacher setup. Shared form rendering lives elsewhere.
export const teacherSetup = {
  id: 'discussion-teacher-setup',
  title: 'Your assignment',
  steps: [
    {
      id: 'class',
      label: 'Step 1 of 3',
      title: 'Your class',
      intro:
        'Bring one assignment you’d like to improve. Open its directions in your course so you can refer to them.',
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
      title: 'Your assignment',
      intro: 'Use the current version. You will be able to review everything before moving on.',
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
          label: 'Paste the current assignment directions',
          help: 'Copy the instructions students receive, including any requirements for posts and replies.',
          type: 'textarea',
          rows: 9,
          placeholder: 'Paste the directions exactly as students see them.',
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
      intro: 'Practical limits help keep a revision realistic for you and your students.',
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
          label: 'Do students work on their own or in groups?',
          help: 'Choose how students complete the main assignment, even if they also reply to classmates.',
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
  workTime: '',
  workTimeUnsure: false,
  daysAvailable: '',
  daysAvailableUnsure: false,
  workMode: '',
  mustStay: '',
  mustStayUnsure: false,
});
