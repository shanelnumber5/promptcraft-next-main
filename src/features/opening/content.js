import { characterArt } from '../../shared/character-art.js';
// Content owns the scenario; the shared engine owns interaction and navigation.
const firstPlan = {
  label: 'The first plan',
  title: 'One stand, two helpers',
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
  title: 'Sharing the service work',
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
    'Now bring one discussion from your course. Identify a gap, explore possibilities with Babbage if you choose, and build a before-and-after example using your topic.',
  characters: {
    maya: {
      id: 'maya',
      name: 'Maya',
      side: 'left',
      src: characterArt.maya.neutral,
      alt: 'Maya, the student in this fictional story.',
    },
    pixel: {
      id: 'pixel',
      name: 'Professor Pixel',
      side: 'right',
      src: characterArt.pixel.neutral,
      alt: 'Professor Pixel, facing the student.',
    },
  },
  scenes: [
    {
      id: 'student-before',
      portraits: { maya: characterArt.maya.skeptical },
      part: 'The experience',
      title: 'Maya describes the old discussion',
      speaker: 'maya',
      dialogue:
        "I posted my idea and replied to two people. Everyone said the plans looked good. I didn't really need to read their posts to finish.",
      board: {
        label: 'The old discussion',
        title: 'The old discussion: post once, reply twice',
        text: 'Describe a successful lemonade stand. Reply to two classmates.',
        note: 'What does the conversation help students do?',
      },
    },
    {
      id: 'meet-plan',
      portraits: { pixel: characterArt.pixel.confident },
      part: 'The example',
      title: 'Pixel introduces the shared plan',
      speaker: 'pixel',
      dialogue:
        "Let's try a different approach. Each student checks one piece: customer steps, supplies, or helper roles. The group brings those findings together into a plan.",
      board: {
        label: 'The supplied facts',
        title: 'A lemonade stand at a community event',
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
      portraits: { pixel: characterArt.pixel.skeptical },
      dialogue:
        'Their first plan assigns Alex to payments and drinks, and Sam to supplies. Where might it get stuck?',
      board: firstPlan,
      choice: {
        allowAnyResponse: true,
        question: 'Which reply best helps the group examine its reasoning before changing the plan?',
        options: [
          {
            id: 'roles',
            label: 'If several customers arrive while supplies are full, what happens when Alex handles both payment and pouring? How could Sam help?',
            correct: true,
            feedback:
              'This tests a specific choice against the supplied facts. The group must explain whether its division of work can handle a rush. The discussion has a job: examine the reasoning behind a decision.',
            narrative: {
              maya: 'I would ask what happens during the rush before changing the jobs. That makes us test the plan instead of just adding detail.',
              pixel: 'This question tests a specific choice against the supplied facts. The group has to examine its reasoning before changing the plan.',
            },
          },
          {
            id: 'drink',
            label: 'Have Alex take payments and Sam pour drinks. That division of work will make service faster.',
            feedback:
              'Maya: “I’d move Sam to pouring like you suggested. I’m still not sure what we’d do when the cups run out.” Pixel: What question would help the group test the new roles before committing to them?',
            narrative: {
              maya: 'I’d move Sam to pouring like you suggested. I’m still not sure what we’d do when the cups run out.',
              pixel: 'What question would help the group test the new roles before committing to them?',
            },
          },
          {
            id: 'length',
            label: 'Explain the payment, pouring, and restocking steps in more detail so readers can understand the plan.',
            feedback:
              'Maya: “I’d spell out each step, but I’d still leave Alex doing both jobs. I haven’t thought about what happens if three people arrive at once.” Pixel: What could you ask that would help the group think through that rush?',
            narrative: {
              maya: 'I’d spell out each step, but I’d still leave Alex doing both jobs. I haven’t thought about what happens if three people arrive at once.',
              pixel: 'What could you ask that would help the group think through that rush?',
            },
          },
        ],
      },
    },
    {
      id: 'peer-question',
      portraits: { pixel: characterArt.pixel.thoughtful },
      part: 'The exchange',
      title: 'Give a peer question a useful job',
      speaker: 'pixel',
      dialogue:
        'Another group connects a choice to a possible problem and asks the planners to examine it. Now consider what the assignment must require for that question to affect their learning.',
      board: {
        label: "Another group's question",
        title: 'Could the second helper serve?',
        quote:
          '“If three customers arrive together, Alex has to take each payment and pour each drink. Could Sam help serve while the supplies are full?”',
      },
      choice: {
        question: 'Which follow-up requirement would make students use this peer question to deepen their reasoning?',
        options: [
          {
            id: 'roles',
            label: 'Summarize the peer question and describe why feedback is useful when planning a stand.',
            feedback:
              'A summary shows students read the question, but they can still avoid examining their own plan. Require them to connect the concern to their decision and explain their response.',
            narrative: {
              maya: 'I could summarize the question, but I still would not have to decide what to do about the rush.',
              pixel: 'A summary shows students noticed the question, but not whether they used it to examine the plan.',
            },
          },
          {
            id: 'words',
            label: 'Use the concern about a customer rush to revise or defend the helper roles, explaining the reasons for that decision.',
            correct: true,
            feedback:
              'This makes peer input part of the reasoning students must show. They connect a specific concern to their plan and explain a revision or defense. A required reply alone does not create that connection.',
            narrative: {
              maya: 'I would have to decide whether the second helper should serve, or explain why the original jobs still work.',
              pixel: 'Students connect the concern to their plan and explain a revision or defense. The question becomes part of their reasoning.',
            },
          },
          {
            id: 'agree',
            label: 'Change the helper roles to match the peer suggestion and describe the new plan.',
            feedback:
              'Following a suggestion is not enough to show learning. Students need to evaluate it and explain why they changed the plan. Keeping the original roles can also be worthwhile if their reasons address the concern.',
            narrative: {
              maya: 'I could copy the suggestion, but that would not show why the change helps.',
              pixel: 'Following a suggestion is not the same as evaluating it. Students should explain the decision.',
            },
          },
        ],
      },
    },
    {
      id: 'revised-plan',
      part: 'The response',
      title: 'See how the group responds',
      speaker: 'pixel',
      portraits: { pixel: characterArt.pixel.confident },
      dialogue:
        'They propose different roles and explain why. This is a plan to test, not proof that service will be faster. A group could also defend its original choice if it addresses the concern.',
      board: revisedPlan,
      choice: {
        question: 'Which response best shows that the group used peer input to examine its decision?',
        options: [
          {
            id: 'changed',
            label: 'We moved Sam to pouring because the other group recommended sharing service work. Our revised plan uses their suggestion.',
            feedback:
              'This names the suggestion and a change, but leaves the reasoning unstated. Why does the change address the rush, and what still needs testing?',
            narrative: {
              maya: 'We followed the suggestion, but I have not explained why the new jobs help during the rush.',
              pixel: 'The change is visible, but the reasoning is missing. What still needs testing?',
            },
          },
          {
            id: 'proven',
            label: 'We split payment and pouring after the peer raised the rush. Both helpers now serve customers, so we know the line will move faster.',
            feedback:
              'This connects the change to the concern, but treats an untested plan as proof. The group still needs to consider the order handoff and what happens when supplies run low.',
            narrative: {
              maya: 'We connected the change to the rush, but saying we know it will be faster feels too certain.',
              pixel: 'This uses the concern, but treats a plan as proof. Students should name what remains uncertain.',
            },
          },
          {
            id: 'reasoned',
            label: 'The peer’s rush question exposed a possible delay: Alex does both service steps. We split the roles to let both helpers serve, and will test the order handoff and restocking during a rush.',
            correct: true,
            feedback:
              'This links the peer concern, the decision, and the reasons for it, while naming what remains uncertain. The learning is visible in how students evaluate and use the contribution, not simply in whether they change their answer.',
            narrative: {
              maya: 'We explained the rush concern, why we split the jobs, and what we still need to test.',
              pixel: 'This connects the concern, decision, and reasons while keeping the plan testable.',
            },
          },
        ],
      },
    },
    {
      id: 'student-after',
      part: 'The response',
      title: 'Maya explains what changed',
      speaker: 'maya',
      portraits: {
        maya: characterArt.maya.friendly,
        pixel: characterArt.pixel.neutral,
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
      portraits: { pixel: characterArt.pixel.pleasant },
      dialogue:
        "Their question gave the group a reason to reconsider a decision. Where could a classmate's contribution help students think something through in your course?",
      board: {
        label: 'The teaching move',
        title: 'Give the conversation a purpose',
        nodes: [
          { title: 'Propose', detail: 'Make a choice and explain it.' },
          { title: 'Question', detail: 'Test a specific part.' },
          { title: 'Respond', detail: 'Revise or defend with reasons.' },
        ],
        note: 'One manageable change to one discussion forum.',
      },
    },
  ],
};
