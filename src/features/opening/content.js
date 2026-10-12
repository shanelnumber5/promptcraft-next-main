// Content owns the scenario; the shared engine owns interaction and navigation.
const firstPlan = {
  label: 'The first plan',
  title: 'One stand. Two helpers.',
  visual: 'plan',
  numbered: false,
  flowLabel: 'Customer situation and helper roles',
  nodes: [
    { title: 'Customers arrive', detail: 'Some may arrive together.' },
    { title: 'Alex serves', detail: 'Take payments and pour each drink.' },
    { title: 'Sam restocks', detail: 'Keep cups and pitchers stocked.' },
  ],
  note: 'Two helpers · One table · Lemonade already mixed',
};
const revisedPlan = {
  label: 'A revision to test',
  title: 'Share the service work.',
  visual: 'plan',
  flowLabel: 'Revised customer steps',
  nodes: [
    { title: 'Customers arrive', detail: 'Place an order.' },
    { title: 'Alex takes payment', detail: 'Pass the order to Sam.' },
    { title: 'Sam serves drinks', detail: 'Pour and hand over the lemonade.' },
  ],
  note: 'Restock between customers. Pause and refill if supplies run low.',
};
export const discussionOpening = {
  id: 'discussion-opening',
  contentVersion: 1,
  title: 'Give the discussion a job',
  endNote:
    'In the next build, you will bring one discussion from your course. Babbage will help you identify a gap, explore possibilities, and build a before-and-after example using your topic.',
  characters: {
    maya: {
      id: 'maya',
      name: 'Maya',
      side: 'left',
      src: 'assets/characters/maya/neutral.png',
      alt: 'Maya, the student in this fictional story.',
    },
    pixel: {
      id: 'pixel',
      name: 'Professor Pixel',
      side: 'right',
      src: 'assets/characters/pixel/listening.png',
      alt: 'Professor Pixel, facing the student.',
    },
  },
  scenes: [
    {
      id: 'student-before',
      part: 'The experience',
      title: 'Maya describes the old discussion',
      speaker: 'maya',
      dialogue:
        "I posted my idea and replied to two people. Everyone said the plans looked good. I didn't really need to read their posts to finish.",
      board: {
        label: 'The old discussion',
        title: 'Post your idea. Reply twice.',
        text: 'Describe a successful lemonade stand. Reply to two classmates.',
        note: 'What does the conversation help students do?',
      },
    },
    {
      id: 'meet-plan',
      part: 'The example',
      title: 'Pixel introduces the shared plan',
      speaker: 'pixel',
      dialogue:
        "Let's try a different approach. Each student checks one piece: customer steps, supplies, or helper roles. The group brings those findings together into a plan.",
      board: {
        label: 'The supplied facts',
        title: 'A small stand at a community event.',
        visual: 'stand',
        facts: [
          'Two helpers and one table with space for two stations.',
          'Lemonade is already mixed in pitchers.',
          'Several customers may arrive together.',
        ],
        note: 'Fictional classroom example. No business experience needed.',
      },
    },
    {
      id: 'spot-hole',
      part: 'The example',
      title: 'Find a useful concern in the first plan',
      speaker: 'pixel',
      portraits: { pixel: 'assets/characters/pixel/thinking.png' },
      dialogue:
        'Their first plan assigns Alex to payments and drinks, and Sam to supplies. Where might it get stuck?',
      board: firstPlan,
      choice: {
        question: 'Which concern would help the group test this plan?',
        options: [
          {
            id: 'roles',
            label: 'Alex handles both service steps while Sam may have nothing to restock.',
            correct: true,
            feedback:
              "That's a specific concern. A peer could ask whether Sam can help serve when the supplies are full.",
          },
          {
            id: 'drink',
            label: 'They should sell a different drink.',
            feedback:
              'That could be a different project. For this plan, look at the two helpers and what customers need them to do.',
          },
          {
            id: 'length',
            label: 'The plan needs a longer description.',
            feedback:
              'More words may not solve the problem. Look for a choice that affects how the stand works.',
          },
        ],
      },
    },
    {
      id: 'peer-question',
      part: 'The exchange',
      title: 'Give a peer question a useful job',
      speaker: 'pixel',
      dialogue:
        'Another group names a choice, explains a concern, and asks a question the first group can use. What does their question help the group reconsider?',
      board: {
        label: "Another group's question",
        title: 'Could the second helper serve?',
        quote:
          '“If three customers arrive together, Alex has to take each payment and pour each drink. Could Sam help serve while the supplies are full?”',
      },
      choice: {
        question: 'What decision does the question help them examine?',
        options: [
          {
            id: 'roles',
            label: 'How the two helpers share the work.',
            correct: true,
            feedback: 'Yes. The reply has a job: test one part of the plan.',
          },
          {
            id: 'words',
            label: 'How many words their post contains.',
            feedback: 'The question is about the helper roles, not the length of the post.',
          },
          {
            id: 'agree',
            label: 'Whether everyone agrees with the group.',
            feedback:
              'Agreement is not the goal. A useful question can help the group examine a choice.',
          },
        ],
      },
    },
    {
      id: 'revised-plan',
      part: 'The response',
      title: 'See how the group responds',
      speaker: 'pixel',
      portraits: { pixel: 'assets/characters/pixel/encouraging.png' },
      dialogue:
        'They propose different roles and explain why. This is a plan to test, not proof that service will be faster. A group could also defend its original choice if it addresses the concern.',
      board: revisedPlan,
    },
    {
      id: 'student-after',
      part: 'The response',
      title: 'Maya explains what changed',
      speaker: 'maya',
      portraits: {
        maya: 'assets/characters/maya/confident.png',
        pixel: 'assets/characters/pixel/listening.png',
      },
      dialogue:
        "Another group asked what our second helper would do when a line formed. We hadn't thought about that. We changed the jobs and explained why.",
      board: revisedPlan,
    },
    {
      id: 'bridge',
      part: 'Your course',
      title: 'Connect the example to your assignment',
      speaker: 'pixel',
      portraits: { pixel: 'assets/characters/pixel/encouraging.png' },
      dialogue:
        "Their question gave the group a reason to reconsider a decision. Where could a classmate's contribution help students think something through in your course?",
      board: {
        label: 'The teaching move',
        title: 'Give the conversation a purpose.',
        nodes: [
          { title: 'Propose', detail: 'Make a choice and explain it.' },
          { title: 'Question', detail: 'Test a specific part.' },
          { title: 'Respond', detail: 'Revise or defend with reasons.' },
        ],
        note: 'One manageable change to one assignment.',
      },
    },
  ],
};
