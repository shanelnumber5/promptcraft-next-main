const assert = require('node:assert/strict');
(async () => {
  const { renderHome } = await import('../../src/features/entry/screen.js');
  const { renderScene, renderChoices } = await import('../../src/features/opening/screen.js');
  const { discussionOpening } = await import('../../src/features/opening/content.js');
  const { initialState } = await import('../../src/app/storage.js');
  const home = renderHome('workspace');
  assert(home.includes('Continue your saved work'));
  for (const destination of ['play&amp;story=1', 'workspace', 'lab', 'guide'])
    assert(home.includes('?view=' + destination));
  assert(!home.includes('onclick='), 'Navigation uses ordinary links');
  assert(home.includes('data-home-plate="1"'));
  const choice = discussionOpening.scenes.find(item => item.choice).choice;
  for (const option of choice.options) {
    const rendered = renderChoices(choice, option.id);
    assert(rendered.includes(option.correct ? '>Correct</strong>' : '>Consider another response</strong>'));
    assert(rendered.includes('role="status"'));
  }
  assert(!renderChoices(choice).includes('answer-result'), 'No outcome before a response');
  const scene = discussionOpening.scenes.find((item) => item.id === 'revised-plan'),
    state = initialState(discussionOpening);
  state.storyStage = 'board';
  const snapshot = JSON.stringify(state),
    index = discussionOpening.scenes.indexOf(scene);
  const original = renderScene(discussionOpening, scene, state, index, {
    comparisonMode: 'original',
  });
  const revised = renderScene(discussionOpening, scene, state, index, {
    comparisonMode: 'revised',
  });
  assert(original.includes('Take payments and pour each drink.'));
  assert(revised.includes('Pass the order to Sam.'));
  assert(original.includes('data-plan-comparison="original" aria-pressed="true"'));
  assert(revised.includes('data-plan-comparison="revised" aria-pressed="true"'));
  assert.equal(
    JSON.stringify(state),
    snapshot,
    'Comparison never changes answers or saved project',
  );
  state.storyStage = 'question';
  assert(
    !renderScene(discussionOpening, scene, state, index).includes('data-plan-comparison='),
    'Questions retain their authored presentation',
  );
  console.log(
    'PASS: editorial home navigation, original/revised plan comparison, and saved-state isolation.',
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
