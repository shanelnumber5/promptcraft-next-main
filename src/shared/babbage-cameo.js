import { escapeHTML as e } from './html.js';

import { parseBabbageFeedback } from './babbage-feedback.js';

const educatorClarifications = state => (state.babbage?.history || []).filter(turn=>turn.role==='user').map(turn=>turn.content).join('|');

// Only an explicitly separated AI aside can trigger the portrait. No keyword list
// and no guessing that an ordinary opening sentence must be a joke.
export function babbageCameoFor(state, feedback) {
  if (state.babbage?.mode === 'dev' || !feedback?.trim()) return null;
  const direct=parseBabbageFeedback(feedback);
  if(direct.structured) return direct.aside || null;
  const turn=state.babbage?.history?.findLast(turn=>turn.role==='assistant' && turn.display===feedback);
  return turn ? parseBabbageFeedback(turn.content).aside || null : null;
}

export function renderBabbageCameo(state, feedback) {
  const joke = babbageCameoFor(state, feedback);
  if (!joke) return '';
  return `<span class="babbage-cameo-trigger" data-babbage-cameo="${e(joke)}" hidden></span>`;
}

// An Easter egg is a single appearance per submitted scenario, not per UI render.
// Store only a compact key in this tab; nothing is uploaded or persisted.
const shown = new Set();
const MAX_SHOWN = 80;
export function showBabbageCameo(state, root, feedback = '') {
  if (document.querySelector('.babbage-cameo-dialog[open]')) return;
  const marker = root.querySelector('[data-babbage-cameo]');
  const joke = marker?.getAttribute('data-babbage-cameo') || babbageCameoFor(state, feedback);
  const premise = [state.teacher?.subject, state.teacher?.directions, state.design?.concern, state.workspace?.idea?.summary, educatorClarifications(state)].filter(Boolean).join('|');
  const key = `${state.workspace ? 'workspace' : 'guided'}:${premise}`;
  if (!joke || shown.has(key)) return;
  if (shown.size >= MAX_SHOWN) shown.clear();
  shown.add(key);
  const dialog = document.createElement('dialog');
  dialog.className = 'maya-dialog maya-dialog--novel babbage-cameo-dialog';
  dialog.setAttribute('aria-label', 'Charles Babbage’s playful aside');
  dialog.style.setProperty('--maya-header-height',(document.querySelector('.app-header')?.getBoundingClientRect().height || 80)+'px');
  dialog.innerHTML = `<div class="maya-stage"><div class="maya-actor" aria-hidden="true"><img src="assets/people/charles-babbage-full.png" alt=""></div><section class="maya-dialogue" aria-label="Babbage's dialogue"><h3>Charles Babbage</h3><p>${e(joke)}</p></section></div><div class="maya-body"><nav class="maya-scene-nav" aria-label="Dialogue navigation"><button type="button" class="primary" data-babbage-close>Continue designing</button></nav></div>`;
  document.body.appendChild(dialog);
  const opener = document.activeElement;
  const close = () => dialog.close();
  dialog.querySelectorAll('[data-babbage-close]').forEach(button => button.addEventListener('click', close));
  dialog.addEventListener('close', () => { dialog.remove(); if (opener?.isConnected) opener.focus({preventScroll:true}); });
  dialog.showModal();
}
