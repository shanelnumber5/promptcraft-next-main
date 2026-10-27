import { characterArt } from '../../shared/character-art.js';
import { renderScene } from '../opening/screen.js';
import { discussionOpening } from '../opening/content.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderClosing(state) {
  const completion = state.workspace ? 'Design complete' : 'Module complete';
  const scene = {
    id: 'module-closing',
    title: 'Make the conversation count',
    part: completion,
    speaker: 'pixel',
    portraits: {
      pixel: characterArt.pixel.pleasant,
    },
    board: {
      label: 'What we learned',
      title: 'Give the discussion a job',
      nodes: [
        {
          title: 'Explain a decision',
          detail: 'Give students a choice to make and reasons to explain.',
        },
        {
          title: 'Give replies a purpose',
          detail: 'Test a choice, compare evidence, or offer another perspective.',
        },
        {
          title: 'Make feedback matter',
          detail:
            'Name a peer’s contribution. Explain what changed—or why the decision stayed the same.',
        },
      ],
      flowLabel: 'Three moves that make a discussion meaningful',
    },
    dialogue: state.workspace
      ? 'Your design and reasoning are saved. When you try this activity, look for how students use one another’s ideas. Use that evidence to decide what to keep or revise.'
      : 'Give the conversation a job. A useful reply helps students examine their reasoning, and the follow-up shows how they used it.',
  };
  // Reuse the opening's classroom, smartboard, portraits, and speech bubble.
  const scenario = {
    ...discussionOpening,
    characters: { pixel: discussionOpening.characters.pixel },
    scenes: [scene],
  };
  const recap = '<div class="closing-board-recap"><section><h3>Keep it realistic</h3><p>Match the goal, requirements, and time available. If AI is allowed, students still verify claims and explain decisions.</p></section><section><h3>Look for evidence</h3><p>Notice how students use a peer’s contribution to examine their decision. Use what you learn to improve the next discussion.</p></section>'+(state.teacher.learningGoal ? '<div class="closing-goal"><strong>Your learning goal</strong><span>'+e(state.teacher.learningGoal)+'</span></div>' : '')+'</div>';
  const navigation = `<nav class="scene-actions" aria-label="Module navigation"><button type="button" class="nav-button nav-button--back" data-action="return-assignment"><span>${state.workspace ? 'Your Course Guide' : 'Your assignment'}</span></button><span class="navigation-hint">${completion} · Take your learning into your course</span><button type="button" class="primary nav-button nav-button--next" data-action="${state.workspace ? 'workspace-home' : 'preview-guide'}"><span>${state.workspace ? 'Return Home' : 'View guide'}</span></button></nav>`;
  return renderScene(scenario, scene, state, 0, {
    className: 'closing-experience',
    stage: state.workspace ? 'dialogue' : 'board',
    titleId: 'setup-title',
    progressLabel: completion,
    showHandoff: false,
    boardContent: recap,
    navigation,
    designNotice: true,
  });
}
