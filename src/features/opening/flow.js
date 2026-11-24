import { sceneReady } from '../../app/storage.js';

// Feedback is part of the story sequence, including when the answer is correct.
export function transitionStory(scenario, state, action) {
  const index = Math.max(
    0,
    scenario.scenes.findIndex((scene) => scene.id === state.sceneId),
  );
  const scene = scenario.scenes[index];
  const answered = scene.choice?.options.some((option) => option.id === state.answers[scene.id]);
  if (action === 'try-another-answer') {
    delete state.answers[scene.id];
    state.storyStage = 'question';
  } else if (action === 'hear-maya' && answered) state.storyStage = 'response-maya';
  else if (action === 'hear-pixel' && answered) state.storyStage = 'response-pixel';
  else if (action === 'reveal-board' || action === 'reveal-question') {
    state.storyStage = action === 'reveal-board' ? 'board' : 'question';
  } else if (action === 'next') {
    if (!sceneReady(scene, state)) return false;
    if (scene.choice && state.storyStage === 'question') state.storyStage = 'response-maya';
    else if (state.storyStage === 'response-maya') state.storyStage = 'response-pixel';
    else {
      state.sceneId = scenario.scenes[Math.min(index + 1, scenario.scenes.length - 1)].id;
      state.storyStage = 'dialogue';
    }
  } else if (action === 'back') {
    if (state.storyStage === 'response-pixel') state.storyStage = 'response-maya';
    else if (state.storyStage === 'response-maya') state.storyStage = 'question';
    else if (state.storyStage === 'question') state.storyStage = 'board';
    else if (state.storyStage === 'board') state.storyStage = 'dialogue';
    else {
      const prior = scenario.scenes[Math.max(0, index - 1)];
      state.sceneId = prior.id;
      state.storyStage =
        prior.choice && state.answers[prior.id]
          ? 'response-pixel'
          : prior.choice
            ? 'question'
            : 'board';
    }
  } else return false;
  return true;
}
