const assert = require('node:assert/strict');
(async () => {
  const { createNarrator } = await import('../../src/shared/narration.js');
  const { storyNarration } = await import('../../src/features/opening/narration.js');
  const { discussionOpening } = await import('../../src/features/opening/content.js');
  const spoken = [];
  let cancelled = 0;
  const speech = {
    cancel() {
      cancelled++;
    },
    getVoices: () => [
      { lang: 'en-US', name: 'First' },
      { lang: 'en-US', name: 'Second' },
    ],
    speak: (utterance) => spoken.push(utterance),
  };
  class Utterance {
    constructor(text) {
      this.text = text;
    }
  }
  const narrator = createNarrator({ speech, Utterance });
  const scene = discussionOpening.scenes[0];
  const segments = storyNarration(discussionOpening, scene, {
    storyStage: 'dialogue',
    answers: {},
  });
  narrator.read(segments);
  assert.equal(spoken.length, 0, 'No sound without user opting in');
  narrator.toggle(segments);
  assert.equal(spoken.length, 1);
  assert.match(spoken[0].text, /Maya/);
  const stale = spoken[0];
  narrator.read([{ text: 'New screen' }, { text: 'Second line' }]);
  stale.onend();
  assert.equal(spoken.length, 2, 'Cancelled screen cannot continue speaking');
  spoken.at(-1).onend();
  assert.equal(spoken.at(-1).text, 'Second line');
  spoken.at(-1).onend();
  assert.equal(narrator.status().speaking, false);
  narrator.toggle(segments);
  assert.equal(narrator.status().enabled, false);
  narrator.toggle(segments);
  spoken.at(-1).onerror();
  assert.equal(narrator.status().enabled, false);
  assert.match(narrator.status().message, /could not play/);
  narrator.dispose();
  assert(cancelled > 0);
  const unavailable = createNarrator();
  unavailable.toggle(segments);
  assert.equal(unavailable.status().enabled, false);
  for (const scene of discussionOpening.scenes) {
    const board = storyNarration(discussionOpening, scene, { storyStage: 'board', answers: {} })
      .map((s) => s.text)
      .join(' ');
    assert(board.includes(scene.board.title));
    if (scene.choice)
      for (const option of scene.choice.options) {
        const text = storyNarration(discussionOpening, scene, {
          storyStage: 'question',
          answers: { [scene.id]: option.id },
        })
          .map((s) => s.text)
          .join(' ');
        assert(text.includes(scene.choice.question));
        assert(text.includes(option.narrative?.maya || option.feedback));
        if (option.narrative) assert(text.includes(option.narrative.pixel));
      }
  }
  console.log(
    'PASS: opt-in speech, all authored story and feedback content, cancellation, stale callbacks, errors and unavailable audio. Mocked device voices.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
