// Scenario-independent renderers. All supplied text is escaped before insertion.
import { escapeHTML } from '../../shared/html.js';
import { lemonadeVisual, planVisuals } from '../../shared/lemonade-visuals.js';
const e = escapeHTML;
const lemonadeIcon = `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M21 22h38l-6 47H27z" fill="#fff4d5" stroke="currentColor" stroke-width="3"/><path d="M25 42h30l-3 23H28z" fill="#e6a51d"/><path d="m45 9-7 45" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="27" r="12" fill="#f4cc56" stroke="currentColor" stroke-width="2"/><path d="M60 17v20m-10-10h20" stroke="#98670d" stroke-width="2"/></svg>`;

export function renderBoard(board, { afterContent = '' } = {}) {
  let content = '';
  if (board.visual === 'stand')
    content += `<div class="board-stand-visual">${lemonadeVisual('stand')}</div>`;
  if (board.quote) content += `<blockquote class="board-quote">${e(board.quote)}</blockquote>`;
  if (board.text) content += `<p class="board-text">${e(board.text)}</p>`;
  if (board.facts?.length)
    content += `<ul class="facts">${board.facts.map((f) => `<li>${e(f)}</li>`).join('')}</ul>`;
  if (board.nodes?.length) {
    const tag = board.numbered === false ? 'ul' : 'ol';
    content += `<${tag} class="service-flow${board.numbered === false ? ' service-flow--roles' : ''}" aria-label="${e(board.flowLabel || 'Plan in order')}">${board.nodes.map((n, i) => `<li>${board.visual === 'plan' ? planVisuals(board)[i] : ''}${board.numbered === false ? '' : `<span class="flow-number" aria-hidden="true">${i + 1}</span>`}<strong>${e(n.title)}</strong><span>${e(n.detail)}</span></li>`).join('')}</${tag}>`;
  }
  if (board.note) content += `<p class="board-note">${e(board.note)}</p>`;
  return `<section class="smartboard" aria-labelledby="board-title"><div class="board-screen"><div class="board-heading"><div><span class="eyebrow">${e(board.label || 'On the smartboard')}</span><h2 id="board-title">${e(board.title)}</h2></div><span class="lemonade-icon">${lemonadeIcon}</span></div>${content}${afterContent}</div><div class="board-frame" aria-hidden="true"><span class="board-light"></span> PROMPTCRAFT</div></section>`;
}

export function renderCharacter(character, active) {
  return `<figure class="character character--${e(character.side)}${active ? ' is-speaking' : ''}"><img src="${e(character.src)}" alt="${e(character.alt)}" data-character="${e(character.id)}"><figcaption>${e(character.name)}</figcaption></figure>`;
}

export function renderChoices(choice, answer) {
  if (!choice) return '';
  const option = choice.options.find((o) => o.id === answer);
  return `<fieldset class="choices"><legend>${e(choice.question)}</legend><div class="choice-list">${choice.options.map((o) => `<label class="choice${o.id === answer ? ' is-selected' : ''}"><input type="radio" name="scene-choice" value="${e(o.id)}"${o.id === answer ? ' checked' : ''}><span>${e(o.label)}</span></label>`).join('')}</div><div id="choice-feedback" class="feedback${option ? ' has-feedback' : ''}" role="status" aria-live="polite" aria-atomic="true">${option ? e(option.feedback) : 'Choose an answer to explore the plan.'}</div></fieldset>`;
}

export function renderScene(scenario, scene, state, index, options = {}) {
  const stage = options.stage ?? state.storyStage ?? 'dialogue';
  const showingBoard = stage !== 'dialogue';
  const showingQuestion = stage === 'question' && !!scene.choice;
  const answer = state.answers[scene.id];
  const ready = !showingQuestion || scene.choice.options.some((o) => o.id === answer && o.correct);
  const isLast = index === scenario.scenes.length - 1;
  const boardContent = options.boardContent ?? '';
  const nextAction = !showingBoard ? 'reveal-board' : scene.choice && !showingQuestion ? 'reveal-question' : isLast ? 'start-setup' : 'next';
  const nextLabel = !showingBoard ? 'View smartboard' : scene.choice && !showingQuestion ? 'See the question' : isLast ? 'Set up my assignment' : 'Continue';
  const cast = Object.values(scenario.characters).map((c) => ({
    ...c,
    src: scene.portraits?.[c.id] || c.src,
  }));
  const navigation =
    options.navigation ??
    `<nav class="scene-actions" aria-label="Story navigation"><button type="button" class="nav-button nav-button--back" data-action="back"${index === 0 && !showingBoard ? ' disabled' : ''}><span aria-hidden="true">←</span><span>Back</span></button><span class="navigation-hint">${!showingBoard ? 'Read the dialogue, then continue to the board.' : !ready ? 'Choose a response, then use the feedback to reconsider.' : 'Continue when you are ready.'}</span><button type="button" class="primary nav-button nav-button--next" data-action="${nextAction}"${!ready ? ' disabled' : ''}><span>${nextLabel}</span><span aria-hidden="true">→</span></button></nav>`;
  const progressLabel =
    options.progressLabel ?? scene.part + ' · ' + (index + 1) + ' of ' + scenario.scenes.length;
  const speaker = cast.find((c) => c.id === scene.speaker);
  const content = showingQuestion
    ? renderBoard({ label: 'Think it through · Back returns to the plan', title: scene.board.title }, { afterContent: renderChoices(scene.choice, answer) })
    : showingBoard
    ? renderBoard(scene.board, { afterContent: boardContent + (isLast && options.showHandoff !== false ? `<div class="handoff"><strong>Your assignment comes next</strong><p>${e(scenario.endNote)}</p></div>` : '') })
    : `<div class="speaker-panel"><div class="cast">${renderCharacter(speaker, true)}</div><section class="speech-bubble speech-bubble--${e(speaker.side)}" aria-labelledby="speaker-label"><span class="eyebrow">${e(scene.part)}</span><h2 id="speaker-label">${e(speaker.name)}</h2><p>${e(scene.dialogue)}</p></section></div>`;
  return `<section class="experience focused-scene focus--${e(stage)} camera--${e(speaker.side)}${options.className ? ' ' + e(options.className) : ''}" aria-label="${e(scenario.title)}"><div class="chapter-line"><span>${e(scenario.title)}</span><span>${e(progressLabel)} · ${showingQuestion ? 'Question' : showingBoard ? 'Smartboard' : 'Dialogue'}</span></div><h1 id="${e(options.titleId ?? 'scene-title')}" class="sr-only" tabindex="-1">${e(scene.title)}</h1><div class="classroom">${content}</div><section class="dialogue" aria-label="Story navigation">${navigation}</section>${options.designNotice ? '<p class="design-notice" role="status"></p>' : ''}<p class="save-notice" role="status">${e(state.saveNotice || '')}</p></section>`;
}
