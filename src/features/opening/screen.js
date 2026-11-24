import { sceneReady } from '../../app/storage.js';
// Scenario-independent renderers. All supplied text is escaped before insertion.
import { escapeHTML } from '../../shared/html.js';
import { lemonadeVisual, planVisuals } from '../../shared/lemonade-visuals.js';
import { characterArt } from '../../shared/character-art.js';
const e = escapeHTML;
const choiceLabel = (option) => `<span class="choice-label-full">${e(option.label)}</span>${option.shortLabel ? `<span class="choice-label-brief">${e(option.shortLabel)}</span>` : ''}`;
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
  const reading =
    (board.text || board.quote) &&
    !board.visual &&
    !board.nodes?.length &&
    !board.facts?.length &&
    !afterContent;
  const title = board.title;
  return `<section class="smartboard${reading ? ' smartboard--reading' : ''}${board.facts?.length ? ' smartboard--facts' : ''}" aria-labelledby="board-title"><div class="board-camera" aria-hidden="true"><span></span></div><div class="board-screen"><div class="board-heading"><div><h2 id="board-title">${e(title)}</h2></div><span class="lemonade-icon">${lemonadeIcon}</span></div>${content}${afterContent}</div><div class="board-frame" aria-hidden="true"><span class="board-status"><span class="board-light"></span><span class="board-speaker"></span></span><span class="board-brand">PROMPTCRAFT</span><span class="board-power"><svg viewBox="0 0 20 20" fill="none"><path d="M10 2v7m-4-5a7 7 0 1 0 8 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span></div><div class="board-pen-tray" aria-hidden="true"><span class="board-stylus"></span><span class="board-stylus board-stylus--gold"></span></div></section>`;
}

export function renderCharacter(character, active) {
  return `<figure class="character character--${e(character.side)}${active ? ' is-speaking' : ''}"><img src="${e(character.src)}" alt="${e(character.alt)}" data-character="${e(character.id)}" width="832" height="1177" decoding="async"><figcaption>${e(character.name)}</figcaption></figure>`;
}

function renderNarrativeFeedback(narrative) {
  return `<div class="feedback feedback--narrative has-feedback" role="status" aria-live="polite" aria-atomic="true"><div class="feedback-turn feedback-turn--maya"><div><strong>Maya</strong><p>${e(narrative.maya)}</p></div></div><div class="feedback-turn feedback-turn--pixel"><div><strong>Pixel</strong><p>${e(narrative.pixel)}</p></div></div></div>`;
}

function renderSingleFeedback(feedback) {
  return `<div class="feedback feedback--narrative feedback--single has-feedback" role="status" aria-live="polite" aria-atomic="true"><div class="feedback-turn feedback-turn--pixel"><div><strong>Pixel</strong><p>${e(feedback)}</p></div></div></div>`;
}

function smartboardExpressions(scene, answer) {
  const defaults = { maya: characterArt.maya.thoughtful, pixel: characterArt.pixel.confident };
  const base = {
    'meet-plan': { maya: characterArt.maya.neutral, pixel: characterArt.pixel.explaining },
    'peer-question': { maya: characterArt.maya.thoughtful, pixel: characterArt.pixel.explaining },
    'revised-plan': { maya: characterArt.maya.confident, pixel: characterArt.pixel.pleasant },
  };
  const choices = {
    'spot-hole': {
      roles: { maya: characterArt.maya.pleased, pixel: characterArt.pixel.thoughtful },
      drink: { maya: characterArt.maya.skeptical, pixel: characterArt.pixel.thoughtful },
      length: { maya: characterArt.maya.explaining, pixel: characterArt.pixel.skeptical },
    },
    'peer-question': {
      roles: { maya: characterArt.maya.skeptical, pixel: characterArt.pixel.thoughtful },
      words: { maya: characterArt.maya.pleased, pixel: characterArt.pixel.confident },
      agree: { maya: characterArt.maya.skeptical, pixel: characterArt.pixel.explaining },
    },
    'revised-plan': {
      changed: { maya: characterArt.maya.explaining, pixel: characterArt.pixel.skeptical },
      proven: { maya: characterArt.maya.confident, pixel: characterArt.pixel.skeptical },
      reasoned: { maya: characterArt.maya.pleased, pixel: characterArt.pixel.confident },
    },
  };
  const selected = answer && choices[scene.id]?.[answer];
  return selected || base[scene.id] || defaults;
}

function renderSmartboardCast(scene, answer, board) {
  const expressions = smartboardExpressions(scene, answer);
  const characters = [
    {
      id: 'maya',
      name: 'Maya',
      side: 'left',
      src: expressions.maya,
      alt: 'Maya, considering the plan.',
    },
    {
      id: 'pixel',
      name: 'Professor Pixel',
      side: 'right',
      src: expressions.pixel,
      alt: 'Professor Pixel, considering the plan.',
    },
  ];
  return `<div class="smartboard-stage"><div class="smartboard-cast smartboard-cast--left">${renderCharacter(characters[0], false)}</div><div class="smartboard-stage-board">${board}</div><div class="smartboard-cast smartboard-cast--right">${renderCharacter(characters[1], false)}</div></div>`;
}

export function renderChoices(choice, answer) {
  if (!choice) return '';
  const option = choice.options.find((o) => o.id === answer);
  const feedback = option?.narrative
    ? renderNarrativeFeedback(option.narrative)
    : option
      ? renderSingleFeedback(option.feedback)
      : '<div class="feedback feedback--narrative" aria-hidden="true"></div>';
  const result = option ? `<p class="answer-result answer-result--${option.correct ? 'correct' : 'reconsider'}"><strong>${option.correct ? 'Correct' : 'Not quite'}</strong><span>${option.correct ? 'This response examines the decision and its reasoning.' : 'Use Maya and Pixel’s feedback to reconsider.'}</span></p>` : '';
  const markedFeedback = option ? feedback.replace('has-feedback', `has-feedback ${option.correct ? 'feedback--correct' : 'feedback--reconsider'}`).replace('<div class="feedback-turn', result + '<div class="feedback-turn') : feedback;
  if (option) return `<section class="choice-response" aria-label="Your answer and feedback"><p class="selected-answer"><strong>Your choice</strong> ${choiceLabel(option)}</p>${markedFeedback}<p class="choice-response-next">Hear Maya and Pixel respond, then consider their question.</p><button type="button" class="text-action" data-action="try-another-answer">Compare the answers again</button></section>`;
  return `<fieldset class="choices"><legend>${e(choice.question)}</legend><div class="choice-list">${choice.options.map((o) => `<label class="choice${o.id === answer ? ' is-selected' : ''}"><input type="radio" name="scene-choice" value="${e(o.id)}"${o.id === answer ? ' checked' : ''}><span>${choiceLabel(o)}</span></label>`).join('')}</div>${markedFeedback}</fieldset>`;
}

export function renderScene(scenario, scene, state, index, options = {}) {
  const stage = options.stage ?? state.storyStage ?? 'dialogue';
  const responseSpeaker = stage === 'response-maya' ? 'maya' : stage === 'response-pixel' ? 'pixel' : '';
  const selected = scene.choice?.options.find((option) => option.id === state.answers[scene.id]);
  if (responseSpeaker && selected) {
    scene = { ...scene, speaker: responseSpeaker,
      dialogue: (selected.narrative?.[responseSpeaker] || selected.feedback) + (responseSpeaker === 'pixel' ? ' ' + scene.choice.checkIn : ''),
      portraits: smartboardExpressions(scene, selected.id) };
  }
  const showingBoard = stage !== 'dialogue' && !responseSpeaker;
  const showingQuestion = stage === 'question' && !!scene.choice;
  const answer = state.answers[scene.id];
  const ready = !showingQuestion || Boolean(selected);
  const isLast = index === scenario.scenes.length - 1;
  const comparing = scene.id === 'revised-plan' && !showingQuestion;
  const comparisonMode = options.comparisonMode === 'original' ? 'original' : 'revised';
  const comparisonControls = comparing
    ? `<div class="reference-comparison"><div class="reference-comparison-controls" role="group" aria-label="Compare the group plans"><button type="button" data-plan-comparison="original" aria-pressed="${comparisonMode === 'original'}">Original plan</button><button type="button" data-plan-comparison="revised" aria-pressed="${comparisonMode === 'revised'}">Revised plan</button></div><p role="status">${comparisonMode === 'original' ? 'Alex handles both service steps. What happens during a rush?' : 'Both helpers serve. The handoff and restocking still need testing.'}</p></div>`
    : '';
  const displayedBoard =
    comparing && comparisonMode === 'original'
      ? scenario.scenes.find((item) => item.id === 'spot-hole')?.board || scene.board
      : scene.board;
  const boardContent = (options.boardContent ?? '') + comparisonControls;
  const nextAction = responseSpeaker === 'maya' ? 'hear-pixel' : responseSpeaker === 'pixel' ? (sceneReady(scene, state) ? 'next' : 'try-another-answer') : showingQuestion && selected ? 'hear-maya' : !showingBoard
    ? 'reveal-board'
    : scene.choice && !showingQuestion
      ? 'reveal-question'
      : isLast
        ? 'start-design-studio'
        : 'next';
  const nextLabel = responseSpeaker === 'maya' ? 'Hear Pixel' : responseSpeaker === 'pixel' ? (sceneReady(scene, state) ? 'Continue' : 'Try again') : showingQuestion && selected ? 'Hear Maya' : !showingBoard
    ? 'View smartboard'
    : scene.choice && !showingQuestion
      ? 'See the question'
      : isLast
        ? options.replay
          ? 'Return to my activity'
          : 'Design my activity'
        : 'Continue';
  const cast = Object.values(scenario.characters).map((c) => ({
    ...c,
    src: scene.portraits?.[c.id] || c.src,
  }));
  const navigation =
    options.navigation ??
    `<nav class="scene-actions" aria-label="Story navigation"><button type="button" class="nav-button nav-button--back" data-action="back"${index === 0 && !showingBoard ? ' disabled' : ''}><span>Back</span></button><span class="navigation-hint"><strong class="navigation-progress">Step ${index + 1} of ${scenario.scenes.length}</strong><span class="navigation-guidance">${!showingBoard ? 'Read the dialogue, then view the smartboard.' : !ready ? 'Choose a response, then use the feedback to reconsider.' : showingQuestion && scene.choice.allowAnyResponse ? 'Try another reply or continue.' : 'Continue when you are ready.'}</span></span><button type="button" class="primary nav-button nav-button--next" data-action="${nextAction}"${!ready ? ' disabled' : ''}><span>${nextLabel}</span></button></nav>`;
  const progressLabel =
    options.progressLabel ?? scene.part + ' · ' + (index + 1) + ' of ' + scenario.scenes.length;
  const speaker = cast.find((c) => c.id === scene.speaker);
  const board = showingQuestion
    ? renderBoard(
        { label: 'Think it through', title: scene.board.title },
        { afterContent: renderChoices(scene.choice, answer) },
      )
    : renderBoard(displayedBoard, {
        afterContent:
          boardContent +
          (isLast && options.showHandoff !== false
            ? `<div class="handoff"><p>Bring one discussion from your course into Explore, Build, and Review.</p><button type="button" class="text-action" data-action="restart-scenario">Restart scenario</button></div>`
            : ''),
      });
  const content = showingQuestion
    ? renderSmartboardCast(scene, answer, board)
    : showingBoard
      ? renderSmartboardCast(scene, answer, board)
      : `<div class="speaker-panel"><div class="cast">${renderCharacter(speaker, true)}</div><section class="speech-bubble speech-bubble--${e(speaker.side)}" aria-labelledby="speaker-label"><h2 id="speaker-label">${e(speaker.name)}</h2>${(Array.isArray(scene.dialogue) ? scene.dialogue : [scene.dialogue]).map((line) => `<p>${e(line)}</p>`).join('')}</section></div>`;
  const audio = `<div class="story-toolbar"><div class="story-identity"><strong>${e(options.audioTitle || 'Guided Scenario')}</strong>${options.replay ? '<span class="sr-only">Story replay · your saved design is preserved</span>' : `<span>${e(options.audioDescription || 'Pixel & Maya’s classroom')}</span>`}</div><div class="narration-controls" role="group" aria-label="Story audio"><button type="button" data-action="toggle-narration" aria-pressed="false">Read aloud</button><button type="button" data-action="repeat-narration" disabled>Read again</button><span class="narration-status" role="status">Dialogue and smartboard audio · device voices</span></div></div>`;
  const progress = `<ol class="scene-progress" aria-hidden="true">${scenario.scenes.map((_, step) => `<li class="${step < index ? 'is-complete' : step === index ? 'is-current' : ''}"></li>`).join('')}</ol>`;
  return `<section class="experience focused-scene focus--${e(responseSpeaker ? 'dialogue' : stage)} camera--${e(speaker.side)}${options.className ? ' ' + e(options.className) : ''}" data-story-stage="${e(stage)}" aria-label="${e(scenario.title)}"><div class="chapter-line" hidden><span>${e(scenario.title)}</span><span>${e(progressLabel)} · ${showingQuestion ? 'Question' : showingBoard ? 'Smartboard' : 'Dialogue'}</span></div><h1 id="${e(options.titleId ?? 'scene-title')}" class="sr-only" tabindex="-1">${e(scene.title)}</h1>${audio}<div class="classroom">${content}</div><section class="dialogue" aria-label="Story navigation">${navigation}${progress}</section>${options.designNotice ? '<p class="design-notice" role="status"></p>' : ''}<p class="save-notice" role="status">${e(state.saveNotice || '')}</p></section>`;
}
