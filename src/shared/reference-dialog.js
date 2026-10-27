import { escapeHTML as e } from './html.js';
import { designEvidence } from './design-evidence.js';
import { discussionOpening } from '../features/opening/content.js';
import { teacherSetup } from '../features/setup/content.js';

const scene = (id) => discussionOpening.scenes.find((item) => item.id === id);
const example = teacherSetup.steps[1].example;
const samples = [
  {
    label: 'The starting discussion',
    title: 'A discussion with little purpose',
    text: scene('student-before').board.text,
    explanation: 'Students can finish this assignment without using a classmate’s thinking. Reply counts alone do not give the conversation a learning purpose.',
  },
  {
    label: 'A useful reply',
    title: 'A reply that tests a decision',
    text: scene('peer-question').board.quote,
    explanation: 'This peer identifies a choice, connects it to a possible problem, and asks the group to examine its reasoning.',
  },
  {
    label: 'Using peer input',
    title: 'A follow-up that uses peer input',
    text: scene('revised-plan').choice.options.find((option) => option.correct).label,
    explanation: 'The group explains how a specific peer concern informed its decision and names what still needs testing.',
  },
  {
    label: 'Another assignment',
    title: 'An assignment to try in the designer',
    text: example.directions,
    explanation: 'Learning goal: ' + example.learning,
  },
];

export function openReferences(opener) {
  const existing = document.querySelector('.reference-dialog');
  if (existing) return existing.focus();
  const dialog = document.createElement('dialog');
  dialog.className = 'reference-dialog';
  dialog.setAttribute('aria-labelledby', 'reference-title');
  dialog.innerHTML = `<header class="reference-header"><h2 id="reference-title">Sources &amp; samples</h2><form method="dialog"><button type="submit" autofocus>Close</button></form></header><nav class="reference-tabs" aria-label="Reference type"><button type="button" data-reference-tab="sources" aria-pressed="true">Sources</button><button type="button" data-reference-tab="samples" aria-pressed="false">Samples</button></nav><div class="reference-content"></div><p class="reference-note"></p>`;
  let mode = 'sources';
  const selections = { sources: 0, samples: 0 };
  const sourceLabels = ['Learning alignment', 'Discussion design', 'Using feedback'];
  const content = dialog.querySelector('.reference-content');
  function render() {
    const sourceMode = mode === 'sources';
    const items = sourceMode ? designEvidence : samples;
    const item = items[selections[mode]];
    const label = (entry, index) => sourceMode ? sourceLabels[index] : entry.label;
    content.innerHTML = `<aside class="reference-topics"><nav aria-label="${sourceMode ? 'Source topics' : 'Sample topics'}">${items.map((entry,index) => `<button type="button" data-reference-item="${index}"${index===selections[mode]?' aria-current="true"':''}>${e(label(entry,index))}</button>`).join('')}</nav><label class="reference-picker-label" for="reference-picker">${sourceMode?'Source topic':'Sample'}</label><select id="reference-picker">${items.map((entry,index)=>`<option value="${index}"${index===selections[mode]?' selected':''}>${e(label(entry,index))}</option>`).join('')}</select></aside><section class="reference-entry" aria-live="polite" aria-atomic="true">${sourceMode ? `<h3>${e(item.claim)}</h3><p>${e(item.application)}</p><p class="reference-citation">${e(item.citation)}</p><a href="${e(item.url)}" target="_blank" rel="noopener noreferrer">Read original source</a>` : `<h3>${e(item.title)}</h3><blockquote>${e(item.text)}</blockquote><p>${e(item.explanation)}</p>`}</section>`;
    dialog.querySelector('.reference-note').textContent = sourceMode ? 'Research behind the teaching moves. The fictional examples are illustrations, not studies of PromptCraft.' : 'Illustrations to adapt for your own learning goal.';
    const choose = (index, selector) => {
      if (!Number.isInteger(index) || !items[index]) return;
      selections[mode] = index;
      render();
      content.querySelector(selector)?.focus({preventScroll:true});
    };
    content.querySelector('select').addEventListener('change', event => choose(Number(event.target.value), '#reference-picker'));
    content.querySelectorAll('[data-reference-item]').forEach(button => button.addEventListener('click', () => choose(Number(button.dataset.referenceItem), '[data-reference-item="'+button.dataset.referenceItem+'"]')));
  }
  dialog.querySelectorAll('[data-reference-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      mode = button.dataset.referenceTab;
      dialog.querySelectorAll('[data-reference-tab]').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
      render();
    });
  });
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }, { once: true });
  render();
  document.body.append(dialog);
  dialog.showModal();
}
