import {
  updateDialoguePortrait,
  preloadDialoguePortraits,
} from '../../shared/dialogue-portrait.js';
import { discussionOpening } from './content.js?v=20261104-dialogue-feedback-3';
import { renderScene } from './screen.js';
import { loadState, saveState, initialState, sceneReady } from '../../app/storage.js';
import { resetScenarioStudio } from '../workspace/scenario-storage.js';
import { confirmRestart } from '../../shared/restart-dialog.js';
import { openReferences } from '../../shared/reference-dialog.js';
import { createNarrator } from '../../shared/narration.js';
import { updateNarrationControls as updateAudio } from '../../shared/narration-controls.js';
import { storyNarration } from './narration.js';
import { transitionStory } from './flow.js';

// The scenario owns its story only. All design forms and AI work are mounted by
// the shared studio after this single handoff.
export function mountOpening(
  app,
  {
    storage = window.localStorage,
    navigate = (url) => window.location.replace(url),
    location = window.location,
  } = {},
) {
  let state = loadState(discussionOpening, storage);
  // Revisit the classroom without rewriting a completed or in-progress design.
  const replay =
    new URL(location.href).searchParams.get('story') === '1' && state.phase !== 'opening';
  if (replay) state = initialState(discussionOpening);
  const returnLink = document.querySelector('.site-return-activity');
  if (returnLink) returnLink.hidden = !replay;
  const life = new AbortController();
  const narrator = createNarrator({
    speech: globalThis.window?.speechSynthesis,
    Utterance: globalThis.window?.SpeechSynthesisUtterance,
    onChange: updateNarrationControls,
  });
  function updateNarrationControls() {
    updateAudio(app, narrator.status());
  }
  const index = () =>
    Math.max(
      0,
      discussionOpening.scenes.findIndex((scene) => scene.id === state.sceneId),
    );
  const save = () => {
    if (!replay) saveState(state, storage);
    return !state.saveNotice;
  };
  const studio = () => {
    narrator.dispose();
    if (replay) {
      const url = new URL(location.href);
      url.searchParams.set('view', 'scenario');
      url.searchParams.delete('story');
      navigate(url.href);
      return;
    }
    const previousPhase = state.phase;
    if (previousPhase === 'opening' && index() === discussionOpening.scenes.length - 1)
      state.completed = true;
    state.phase = 'design';
    state.designStep = 2;
    state.designPanel = state.design.revision.trim() ? 'revision' : 'babbage';
    state.designReadPage = 0;
    state.designReturnPanel = '';
    if (!save()) {
      state.phase = previousPhase;
      render();
      return;
    }
    const url = new URL(location.href);
    url.searchParams.set('view', 'scenario');
    url.searchParams.delete('story');
    navigate(url.href);
  };
  const positionPixelTag = () => {
    const pixel = app.querySelector('.character--right');
    const image = pixel?.querySelector('img'),
      tag = pixel?.querySelector('figcaption');
    if (image && tag && !image.hidden) {
      const frame = pixel.getBoundingClientRect(),
        art = image.getBoundingClientRect();
      tag.style.left = `${art.left + art.width * 0.56 - frame.left}px`;
    }
  };
  const observer =
    typeof ResizeObserver === 'function' ? new ResizeObserver(positionPixelTag) : null;
  observer?.observe(app);
  let comparisonMode = 'revised';
  function render(focus = false, choice = null) {
    const scene = discussionOpening.scenes[index()];
    document.querySelector('.skip-link')?.setAttribute('href', '#scene-title');
    const className = `scene-${scene.id}${scene.choice && state.answers[scene.id] ? ' answer-selected' : ''}`;
    const markup = renderScene(discussionOpening, scene, state, index(), {
      className,
      replay,
      comparisonMode,
    });
    const current = app.firstElementChild;
    if (current?.classList.contains('focus--dialogue') && ['dialogue', 'response-maya', 'response-pixel'].includes(state.storyStage)) {
      // Retain the classroom, cast and speech panel between consecutive lines.
      const template = document.createElement('template');
      template.innerHTML = markup;
      const incoming = template.content.firstElementChild;
      current.className = incoming.className;
      current.dataset.storyStage = incoming.dataset.storyStage;
      for (const selector of [
        '.chapter-line',
        '#scene-title',
        '.speech-bubble',
        '.dialogue',
        '.save-notice',
      ]) {
        current.querySelector(selector).innerHTML = incoming.querySelector(selector).innerHTML;
      }
      const figure = current.querySelector('.character');
      const nextFigure = incoming.querySelector('.character');
      figure.className = nextFigure.className;
      figure.querySelector('figcaption').textContent =
        nextFigure.querySelector('figcaption').textContent;
      const image = figure.querySelector('img');
      const nextImage = nextFigure.querySelector('img');
      image.alt = nextImage.alt;
      image.dataset.character = nextImage.dataset.character;
      updateDialoguePortrait(image, nextImage.getAttribute('src'));
      current.querySelector('.speech-bubble').className =
        incoming.querySelector('.speech-bubble').className;
    } else {
      app.innerHTML = markup;
    }
    app.querySelectorAll('[data-character]').forEach((image) => {
      image.addEventListener(
        'error',
        () => {
          image.hidden = true;
          image.closest('figure')?.classList.add('art-unavailable');
        },
        { once: true },
      );
      image.addEventListener('load', positionPixelTag, { once: true });
    });
    positionPixelTag();
    updateNarrationControls();
    narrator.read(storyNarration(discussionOpening, scene, state));
    const next = app.querySelector('.scene-actions button.primary:not(:disabled)');
    next?.classList.add('suggested-next');
    next?.setAttribute('aria-description', 'Suggested next action');
    if (choice) {
      const result = app.querySelector('.answer-result');
      result?.setAttribute('tabindex', '-1');
      result?.focus({ preventScroll: true });
    }
    else if (focus) document.getElementById('scene-title')?.focus({ preventScroll: true });
  }
  app.addEventListener(
    'change',
    (event) => {
      if (event.target.name !== 'scene-choice') return;
      const scene = discussionOpening.scenes[index()];
      if (!scene.choice?.options.some((option) => option.id === event.target.value)) return;
      state.answers[scene.id] = event.target.value;
      save();
      render(false, event.target.value);
    },
    { signal: life.signal },
  );
  app.addEventListener(
    'click',
    (event) => {
      const comparison = event.target.closest('[data-plan-comparison]');
      if (comparison?.dataset.planComparison) {
        comparisonMode = comparison.dataset.planComparison === 'original' ? 'original' : 'revised';
        render(false);
        app.querySelector('[data-plan-comparison="' + comparisonMode + '"]')?.focus();
        return;
      }
      const action = event.target.closest('[data-action]')?.dataset.action;
      const scene = discussionOpening.scenes[index()];
      if (action === 'restart-scenario') { void restartScenario(); return; }
      if (action === 'toggle-narration') {
        narrator.toggle(storyNarration(discussionOpening, scene, state));
        return;
      }
      if (action === 'repeat-narration') {
        narrator.read(storyNarration(discussionOpening, scene, state));
        return;
      }
      if (action === 'start-design-studio' || action === 'start-setup') {
        if (index() === discussionOpening.scenes.length - 1 && sceneReady(scene, state)) studio();
        return;
      }
      if (!transitionStory(discussionOpening, state, action)) return;
      save();
      render(true);
      preloadDialoguePortraits(
        discussionOpening.scenes
          .slice(index(), index() + 3)
          .flatMap((scene) => Object.values(scene.portraits || {})),
      );
    },
    { signal: life.signal },
  );
  const restart = document.querySelector('[data-action="restart-module"]');
  async function restartScenario() {
    if (!(await confirmRestart({
      title: replay ? 'Replay from the beginning?' : 'Restart scenario?',
      description: replay ? 'This restarts the story replay. Your saved design stays in this browser.' : 'This clears scenario progress and its design. Your Creative Workspace stays saved.',
      confirmLabel: 'Restart scenario',
    }))) return;
    if (!replay && !resetScenarioStudio(storage)) {
      state.saveNotice = 'Scenario progress could not be reset.';
      render();
      return;
    }
    state = initialState(discussionOpening);
    save();
    render(true);
  }
  if (restart) {
    restart.hidden = false;
    restart.textContent = 'Restart scenario';
    restart.addEventListener(
      'click',
      restartScenario,
      { signal: life.signal },
    );
  }
  document
    .querySelector('[data-action="open-references"]')
    ?.addEventListener('click', (event) => openReferences(event.currentTarget), {
      signal: life.signal,
    });
  if (state.phase !== 'opening') studio();
  else {
    render();
    const warm = () => {
      if (!life.signal.aborted)
        preloadDialoguePortraits(
          discussionOpening.scenes
            .slice(index(), index() + 3)
            .flatMap((scene) => Object.values(scene.portraits || {})),
        );
    };
    if (document.readyState === 'complete') warm();
    else if (typeof window !== 'undefined')
      window.addEventListener('load', warm, { once: true, signal: life.signal });
  }
  globalThis.window?.addEventListener('pagehide', () => narrator.dispose(), {
    once: true,
    signal: life.signal,
  });
  return () => {
    narrator.dispose();
    life.abort();
    observer?.disconnect();
  };
}
