import { discussionOpening } from './content.js';
import { escapeHTML as e } from '../../shared/html.js';
import { lemonadeVisual, planVisuals } from '../../shared/lemonade-visuals.js';

function lemonadeExample() {
  const scene = (id) => discussionOpening.scenes.find((item) => item.id === id);
  const flow = (board) =>
    `<ol class="flow" aria-label="${e(board.flowLabel)}">${board.nodes.map((node, index) => `<li>${planVisuals(board)[index]}<strong>${e(node.title)}</strong><p>${e(node.detail)}</p></li>`).join('')}</ol><p>${e(board.note)}</p>`;
  return `<section><h2>The lemonade example</h2><p>The old assignment asked students to describe a lemonade stand and reply to two classmates. Maya could finish without using anyone else’s ideas. The revised discussion gives the reply a purpose: examine a choice and use the question to revise or defend it.</p><h3>Maya’s experience before</h3><blockquote>${e(scene('student-before').dialogue)}</blockquote><div class="example-situation"><div>${lemonadeVisual('stand')}</div><div><h3>The situation</h3><ul>${scene(
    'meet-plan',
  )
    .board.facts.map((fact) => `<li>${e(fact)}</li>`)
    .join(
      '',
    )}</ul></div></div><div class="plans"><article><h3>First plan</h3>${flow(scene('spot-hole').board)}</article><article><h3>A revision to test</h3>${flow(scene('revised-plan').board)}</article></div><h3>The useful peer question</h3><blockquote>${e(scene('peer-question').board.quote)}</blockquote><p>The question points to a specific concern: Alex handles both payments and drinks while Sam may have no supplies to restock. It helps the group reconsider how the helpers share service work.</p><h3>Maya’s experience after</h3><blockquote>${e(scene('student-after').dialogue)}</blockquote><h3 class="practice-title">What students practice</h3><ol class="flow practice-steps"><li><strong>Propose</strong><p>Choose a plan and explain the helper roles.</p></li><li><strong>Question</strong><p>Name a choice, explain a concern, and ask a question about it.</p></li><li><strong>Respond</strong><p>Revise or defend the plan with reasons that address the question.</p></li></ol><p class="practice-note">The revised plan is a possibility to test, not proof of faster service. Defending the original plan can also be a useful response if the group addresses the concern.</p><h3>Use the same approach in your course</h3><p>Choose a decision students need to explain. Ask classmates to test one part of that decision. Then ask students to show how the reply informed their revision or defense.</p></section>`;
}

function scenarioGuidance() {
  const lessons = discussionOpening.scenes.filter((scene) => scene.choice);
  return `<section><h2>Adapt the teaching moves</h2><p>${e(discussionOpening.endNote)}</p>${lessons
    .map((scene) => {
      const response = scene.choice.options.find((option) => option.correct);
      return `<h3>${e(scene.title)}</h3><p>${e(scene.choice.question)}</p><blockquote>${e(response.label)}</blockquote><p>${e(response.feedback)}</p>`;
    })
    .join(
      '',
    )}<h3>Plan the transfer to your course</h3><ul><li>Choose a decision that calls for evidence and reasoning.</li><li>Give students shared facts, a manageable task, and a specific purpose for peer input.</li><li>Require students to explain how they used the contribution to revise or defend their decision.</li><li>Look for the connection between the concern, decision, and reasons when reviewing student work.</li></ul></section>`;
}

export function scenarioGuideSections() {
  return [
    { id: 'lemonade-example', title: 'The lemonade example', body: lemonadeExample() },
    { id: 'scenario-guidance', title: 'Adapt the teaching moves', body: scenarioGuidance() },
  ];
}
