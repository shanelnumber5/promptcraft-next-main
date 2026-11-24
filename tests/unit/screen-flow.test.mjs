import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initialState, loadState, STORAGE_KEY, sceneReady } from '../../src/app/storage.js';
import { discussionOpening } from '../../src/features/opening/content.js';
import { transitionStory } from '../../src/features/opening/flow.js';
import { renderScene } from '../../src/features/opening/screen.js';
import { storyNarration } from '../../src/features/opening/narration.js';
import { freshWorkspace, WORKSPACE_KEY } from '../../src/features/workspace/storage.js';
import {
  resetScenarioStudio,
  SCENARIO_STUDIO_KEY,
} from '../../src/features/workspace/scenario-storage.js';
import { renderPartner } from '../../src/features/workspace/partner-view.js';
import { renderReview } from '../../src/features/workspace/review-view.js';
import { renderLoading, updateLoadingStage } from '../../src/features/design/loading.js';
import { createAiWaiting } from '../../src/features/design/ai-waiting.js';
import { createGuide, guideOptions } from '../../src/features/design/guide.js';
import { readingPages } from '../../src/shared/reading-pages.js';

for (const scene of discussionOpening.scenes.filter((item) => item.choice)) {
  for (const option of scene.choice.options) {
    test(`${scene.id}/${option.id}: both characters respond before the next scene`, () => {
      const state = initialState(discussionOpening);
      const index = discussionOpening.scenes.indexOf(scene);
      Object.assign(state, { sceneId: scene.id, storyStage: 'question' });
      state.answers[scene.id] = option.id;
      assert(
        renderScene(discussionOpening, scene, state, index).includes(
          option.correct ? '>Correct<' : '>Not quite<',
        ),
      );
      assert(transitionStory(discussionOpening, state, 'hear-maya'));
      assert.equal(state.sceneId, scene.id);
      assert.equal(storyNarration(discussionOpening, scene, state)[0].speaker, 'maya');
      assert(
        storyNarration(discussionOpening, scene, state)[0].text.includes(option.narrative.maya),
      );
      assert(transitionStory(discussionOpening, state, 'hear-pixel'));
      assert.equal(state.sceneId, scene.id);
      const narration = storyNarration(discussionOpening, scene, state)[0];
      assert.equal(narration.speaker, 'pixel');
      assert(narration.text.includes(option.narrative.pixel));
      assert(narration.text.includes(scene.choice.checkIn));
      assert(scene.choice.checkIn.endsWith('?'));
      const restored = loadState(discussionOpening, { getItem: () => JSON.stringify(state) });
      assert.equal(restored.storyStage, 'response-pixel');
      if (sceneReady(scene, state)) {
        assert(transitionStory(discussionOpening, state, 'next'));
        assert.equal(state.sceneId, discussionOpening.scenes[index + 1].id);
      } else {
        assert.equal(transitionStory(discussionOpening, state, 'next'), false);
        transitionStory(discussionOpening, state, 'try-another-answer');
        assert.equal(state.storyStage, 'question');
        assert.equal(state.answers[scene.id], undefined);
      }
    });
  }
}

test('Back revisits both responses, and Next cannot skip character feedback', () => {
  const state = initialState(discussionOpening);
  state.sceneId = 'spot-hole';
  state.storyStage = 'question';
  state.answers['spot-hole'] = 'roles';
  transitionStory(discussionOpening, state, 'next');
  assert.equal(state.storyStage, 'response-maya');
  transitionStory(discussionOpening, state, 'next');
  assert.equal(state.storyStage, 'response-pixel');
  transitionStory(discussionOpening, state, 'back');
  assert.equal(state.storyStage, 'response-maya');
  transitionStory(discussionOpening, state, 'back');
  assert.equal(state.storyStage, 'question');
});

test('Restart clears scenario records while preserving Creative Workspace', () => {
  const saved = new Map([
    [STORAGE_KEY, 'scenario'],
    [SCENARIO_STUDIO_KEY, 'scenario design'],
    [WORKSPACE_KEY, 'workspace design'],
  ]);
  assert(resetScenarioStudio({ removeItem: (key) => saved.delete(key) }));
  assert(!saved.has(STORAGE_KEY));
  assert(!saved.has(SCENARIO_STUDIO_KEY));
  assert.equal(saved.get(WORKSPACE_KEY), 'workspace design');
  const state = initialState(discussionOpening);
  const last = discussionOpening.scenes.at(-1);
  state.storyStage = 'board';
  assert(
    renderScene(discussionOpening, last, state, discussionOpening.scenes.length - 1).includes(
      'data-action="restart-scenario"',
    ),
  );
});

test('Reading pagination preserves every word across desktop and phone limits', () => {
  const text =
    'A long paragraph with evidence and reasoning. '.repeat(100) +
    '\n\n' +
    'Another paragraph. '.repeat(100);
  for (const limit of [240, 300, 850]) {
    const pages = readingPages(text, limit);
    assert(pages.every((page) => page.length <= limit));
    assert.equal(pages.join(' ').replace(/\s+/g, ' ').trim(), text.replace(/\s+/g, ' ').trim());
  }
});

function workspace() {
  const state = freshWorkspace();
  state.experience = 'workspace';
  state.teacher.directions = 'Read two accounts. Compare the evidence and defend your choice.';
  state.teacher.learningGoal = 'Defend a choice with evidence.';
  state.design.revision = state.teacher.directions;
  state.design.sourceDirections = state.teacher.directions;
  return state;
}
const ai = { configured: true, pending: false, error: '', suggestion: null };

test('Explore puts its primary action with the chosen idea', () => {
  const state = workspace();
  state.workspace.selectedDirection = {
    title: 'Test a tradeoff',
    core: 'Use case evidence to question an assumption.',
  };
  const html = renderPartner(state, ai, 'work', '');
  assert(html.includes('explore-feature'));
  assert(html.indexOf('Consult Babbage') < html.indexOf('<footer'));
});

test('Suggested drafts have two decisions and keep both complete texts', () => {
  const state = workspace();
  const revision = 'A proposed draft with a complete final instruction. '.repeat(100);
  const html = renderPartner(state, { ...ai, suggestion: { revision, reason: '' } }, 'work', '');
  assert(html.includes('Your current draft'));
  assert(html.includes('Babbage’s draft'));
  assert.equal((html.match(/data-action="apply-ai"/g) || []).length, 1);
  assert.equal((html.match(/data-action="dismiss-ai"/g) || []).length, 1);
  assert(html.includes('data-reading-page="1"'));
  assert(!html.includes('data-partner-page="rationale"'));
});

test('Final checks link to the corresponding Build fields and use section tabs', () => {
  const html = renderReview(workspace(), ai, 'checks', '');
  assert(!html.includes('<select'));
  assert(html.includes('Review and edit'));
  assert(html.includes('Preview and download'));
  assert.equal((html.match(/>Review this<\/a>/g) || []).length, 3);
  assert(html.includes('data-design-page="learning" data-focus-field="learningGoal"'));
  assert(html.includes('data-design-page="requirements" data-focus-field="mustStay"'));
  assert(!html.includes('Saved in this browser.'));
});

test('Pending loading is indeterminate; completion alone reports 100 percent', () => {
  assert(!renderLoading({ stage: 'sending' }, false).includes('aria-valuenow'));
  assert(renderLoading({ stage: 'complete' }, false).includes('aria-valuenow="100"'));
  const attributes = new Map([['aria-valuenow', '100']]);
  const bar = {
    classList: { toggle() {} },
    setAttribute: (key, value) => attributes.set(key, value),
    removeAttribute: (key) => attributes.delete(key),
  };
  updateLoadingStage(
    { querySelector: (selector) => (selector === '.babbage-progress' ? bar : null) },
    'sending',
  );
  assert(!attributes.has('aria-valuenow'));
});

test('Waiting makes the background inert and restores it on cancellation', () => {
  const original = globalThis.document;
  const background = { inert: false };
  const classes = new Set();
  const listeners = new Map();
  let cancel;
  const dialog = {
    classList: {},
    setAttribute() {},
    querySelector: (selector) =>
      selector === 'button'
        ? {
            addEventListener: (_, callback) => {
              cancel = callback;
            },
            focus() {},
          }
        : { innerHTML: '' },
    addEventListener: (name, callback) => listeners.set(name, callback),
    showModal() {},
    close() {
      listeners.get('close')?.();
    },
    remove() {},
  };
  globalThis.document = {
    activeElement: null,
    body: {
      children: [background],
      classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
      append: () => {},
    },
    createElement: () => dialog,
    querySelector: () => null,
  };
  try {
    const sync = createAiWaiting({ onCancel: () => sync({ pending: false }) });
    sync({ pending: true, stage: 'sending' });
    assert(background.inert);
    assert(classes.has('ai-waiting-open'));
    assert(dialog.innerHTML.includes('>Cancel</button>'));
    cancel();
    assert.equal(background.inert, false);
    assert(!classes.has('ai-waiting-open'));
  } finally {
    globalThis.document = original;
  }
});

test('Offline guides embed the exact local fonts and use compact section introductions', async () => {
  const state = workspace();
  const html = createGuide(state.design, guideOptions(state));
  assert(html.includes('guide-section-intro'));
  assert(!html.includes('guide-section-heading'));
  const fonts = [...html.matchAll(/data:font\/ttf;base64,([A-Za-z0-9+/=]+)/g)];
  assert.equal(fonts.length, 3);
  for (const [index, name] of ['fraunces-400.ttf', 'fraunces-700.ttf', 'manrope.ttf'].entries()) {
    assert(
      Buffer.from(fonts[index][1], 'base64').equals(
        await readFile(new URL('../../assets/fonts/' + name, import.meta.url)),
      ),
    );
  }
});
