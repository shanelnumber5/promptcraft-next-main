import { escapeHTML as e } from './html.js';

// A playful *premise* is not sufficient by itself: the joke comes from Babbage's
// own contextual AI reply, never a fixed lookup-table of canned puns.
export function isAbsurdPremise(state) {
  const source = [state.teacher?.subject, state.teacher?.directions, state.design?.concern, state.workspace?.idea?.summary, state.design?.revision].filter(Boolean).join(' ').toLowerCase();
  if (!source || /\b(trauma|suicide|assault|abuse|bereavement|self.harm|harassment)\b/.test(source)) return false;
  return /\b(printer|photocopier|stapler|toaster|refrigerator|coffee machine|vacuum cleaner|potato|banana)\b.{0,140}\b(promot\w*|dean|president|professor|manager|teach|grade|hire|election|ceo)\b|\b(promot\w*|dean|president|professor|manager|teach|grade|hire|election|ceo)\b.{0,140}\b(printer|photocopier|stapler|toaster|refrigerator|coffee machine|vacuum cleaner|potato|banana)\b|\b(cat|kitten|dragon|unicorn|alien)\b.{0,140}\b(dean|professor|teach|grade|department chair|run the class)\b|\b(dean|professor|teach|grade|department chair)\b.{0,140}\b(cat|kitten|dragon|unicorn|alien)\b|\b(potato|banana|toaster|robot|llama|raccoon|penguin|dinosaur|ghost|zombie|sentient|talking|intergalactic)\b.{0,120}\b(debate|committee|tenure|enroll|discuss|grade|teach|exam|syllabus|university|class|assignment|campus|faculty)\b|\b(debate|committee|tenure|enroll|discuss|grade|teach|exam|syllabus|university|class|assignment|campus|faculty)\b.{0,120}\b(potato|banana|toaster|robot|llama|raccoon|penguin|dinosaur|ghost|zombie|sentient|talking|intergalactic)\b/.test(source);
}

export function babbageCameoFor(state, feedback) {
  if (!isAbsurdPremise(state) || state.babbage?.mode === 'dev' || !feedback?.trim()) return null;
  // Babbage's prompt requests that its contextual joke lead feedback_summary.
  // Use Babbage's own opening joke, rooted in the particular scenario.
  // Prefer the first two short sentences when the punchline needs a setup.
  const opening = feedback.trim().replace(/^(?:Babbage:|Charles Babbage:)\s*/i, '');
  const sentences = opening.match(/[^.!?]+[.!?]+(?:[\"'’”]+)?/g);
  if (!sentences?.length) return opening.length <= 220 ? opening : null;
  const first = sentences[0].trim();
  const second = sentences[1]?.trim();
  return first.length < 75 && second && first.length + second.length < 270 ? `${first} ${second}` : first.slice(0, 270);
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
export function showBabbageCameo(state, root) {
  if (document.querySelector('.babbage-cameo-dialog[open]')) return;
  const marker = root.querySelector('[data-babbage-cameo]');
  const joke = marker?.getAttribute('data-babbage-cameo');
  const premise = [state.teacher?.subject, state.teacher?.directions, state.design?.concern, state.workspace?.idea?.summary].filter(Boolean).join('|');
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
