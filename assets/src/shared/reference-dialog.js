import { escapeHTML as e } from './html.js';
import { designEvidence } from './design-evidence.js';
import { discussionOpening } from '../features/opening/content.js';
import { teacherSetup } from '../features/setup/content.js';

const scene = (id) => discussionOpening.scenes.find((item) => item.id === id);
const example = teacherSetup.steps[1].example;
const samples = [
  {
    title: 'A discussion with little purpose',
    text: scene('student-before').board.text,
    explanation: 'Students can finish this assignment without using a classmate’s thinking. Reply counts alone do not give the conversation a learning purpose.',
  },
  {
    title: 'A reply that tests a decision',
    text: scene('peer-question').board.quote,
    explanation: 'This peer identifies a choice, connects it to a possible problem, and asks the group to examine its reasoning.',
  },
  {
    title: 'A follow-up that uses peer input',
    text: scene('revised-plan').choice.options.find((option) => option.correct).label,
    explanation: 'The group explains how a specific peer concern informed its decision and names what still needs testing.',
  },
  {
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
  dialog.innerHTML = `<header class="reference-header"><h2 id="reference-title">Sources &amp; samples</h2><form method="dialog"><button type="submit" autofocus>Close</button></form></header><div class="reference-tabs" aria-label="Reference type"><button type="button" data-reference-tab="sources" aria-pressed="true">Sources</button><button type="button" data-reference-tab="samples" aria-pressed="false">Samples</button></div><div class="reference-content"></div>`;
  let mode = 'sources';
  const selections = { sources: 0, samples: 0 };
  const content = dialog.querySelector('.reference-content');
  function render() {
    const sourceMode = mode === 'sources';
    const items = sourceMode ? designEvidence : samples;
    const item = items[selections[mode]];
    content.innerHTML = `<label for="reference-picker">${sourceMode ? 'Choose a source' : 'Choose a sample'}</label><select id="reference-picker">${items.map((entry, index) => `<option value="${index}"${index === selections[mode] ? ' selected' : ''}>${e(sourceMode ? entry.short : entry.title)}</option>`).join('')}</select><section class="reference-entry" aria-live="polite" aria-atomic="true">${sourceMode ? `<h3>${e(item.claim)}</h3><p><strong>In this module:</strong> ${e(item.application)}</p><p class="reference-citation">${e(item.citation)}</p><a href="${e(item.url)}" target="_blank" rel="noopener noreferrer">Read the source ↗</a>` : `<h3>${e(item.title)}</h3><blockquote>${e(item.text)}</blockquote><p>${e(item.explanation)}</p>`}</section><p class="reference-note">${sourceMode ? 'These sources inform the teaching moves. The fictional lemonade story illustrates them; it is not a study of this module.' : 'These are illustrations you can adapt to your learning goal. Close this window to return to your assignment.'}</p>`;
    content.querySelector('select').addEventListener('change', (event) => {
      selections[mode] = Number(event.target.value);
      render();
      content.querySelector('select').focus({ preventScroll: true });
    });
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
