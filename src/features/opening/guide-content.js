import { discussionOpening } from './content.js';
import { escapeHTML as e } from '../../shared/html.js';
import { lemonadeVisual, planVisuals } from '../../shared/lemonade-visuals.js';

function lemonadeExample() {
  const scene = (id) => discussionOpening.scenes.find((item) => item.id === id);
  const flow = (board) => `<ol class="flow" aria-label="${e(board.flowLabel)}">${board.nodes.map((node, index) => `<li>${planVisuals(board)[index]}<strong>${e(node.title)}</strong><p>${e(node.detail)}</p></li>`).join('')}</ol>`;
  return `<section><h2>The lemonade example</h2><p>The original discussion could be completed without using anyone else’s ideas. A useful peer question gives the exchange a purpose: test a choice, then revise or defend it with reasons.</p><div class="guide-quotes"><article><h3>Maya before</h3><blockquote>${e(scene('student-before').dialogue)}</blockquote></article><article><h3>Maya after</h3><blockquote>${e(scene('student-after').dialogue)}</blockquote></article></div><div class="example-situation"><div>${lemonadeVisual('stand')}</div><div><h3>The shared situation</h3><ul>${scene('meet-plan').board.facts.map((fact) => `<li>${e(fact)}</li>`).join('')}</ul></div></div><div class="plans"><article><h3>First plan</h3>${flow(scene('spot-hole').board)}</article><article><h3>A revision to test</h3>${flow(scene('revised-plan').board)}</article></div><div class="guide-question-row"><h3>The peer question</h3><blockquote>${e(scene('peer-question').board.quote)}</blockquote><p>Alex handles payments and drinks while Sam may have no supplies to restock. The question asks the group to examine that division of work. The revision still needs testing during a rush.</p></div><h3>What students practice</h3><ol class="flow practice-steps"><li><strong>Propose</strong><p>Choose a plan and explain the roles.</p></li><li><strong>Question</strong><p>Test a choice with a specific concern.</p></li><li><strong>Respond</strong><p>Revise or defend the plan with reasons.</p></li></ol></section>`;
}

function scenarioGuidance() {
  const lessons = discussionOpening.scenes.filter((scene) => scene.choice);
  return `<section><h2>Adapt the teaching moves</h2><p>Choose one decision students need to explain. Give peer contributions a specific purpose, then ask students to show how they used them.</p><div class="teaching-moves">${lessons.map((scene, index) => {
    const response = scene.choice.options.find((option) => option.correct);
    return `<article><h3>${['Test a choice', 'Use the contribution', 'Explain the decision'][index]}</h3><p>${e(response.feedback)}</p><blockquote>${e(scene.choice.checkIn)}</blockquote></article>`;
  }).join('')}</div><p>Use shared facts, a manageable task, and enough time to respond. A reasoned defense of the original plan can be as useful as a revision.</p></section>`;
}

export function scenarioGuideSections() {
  return [
    { id: 'lemonade-example', title: 'The lemonade example', body: lemonadeExample() },
    { id: 'scenario-guidance', title: 'Adapt the teaching moves', body: scenarioGuidance() },
  ];
}
