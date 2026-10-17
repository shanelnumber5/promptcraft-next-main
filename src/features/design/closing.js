import { renderScene } from '../opening/screen.js';
import { discussionOpening } from '../opening/content.js';
import { escapeHTML as e } from '../../shared/html.js';

export function renderClosing(state) {
  const scene = {
    id: 'module-closing',
    title: 'Make the conversation count',
    part: 'Module complete',
    speaker: 'pixel',
    portraits: {
      pixel: 'assets/characters/pixel/encouraging.png',
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
    dialogue:
      'Give the conversation a job. A useful reply helps students examine their reasoning, and the follow-up shows how they used it.',
  };
  // Reuse the opening's classroom, smartboard, portraits, and speech bubble.
  const scenario = {
    ...discussionOpening,
    characters: { pixel: discussionOpening.characters.pixel },
    scenes: [scene],
  };
  const recap = `<div class="closing-board-recap"><h3>Why this matters</h3><p>The follow-up shows how students used another person’s thinking to examine their own decision.</p><h3>Keep it realistic</h3><p>Align tasks with your goal, requirements, and time. If AI is allowed, students still verify claims and explain decisions.</p><h3>Try it in your course</h3><p>Look for specific peer contributions in students’ follow-ups. Use what you notice to improve the next discussion.</p>${state.teacher.learningGoal ? `<p class="closing-goal"><strong>Your learning goal:</strong> ${e(state.teacher.learningGoal)}</p>` : ''}</div>`;
  const navigation = `<nav class="scene-actions" aria-label="Module navigation"><button type="button" class="nav-button nav-button--back" data-action="return-assignment"><span aria-hidden="true">←</span><span>Your assignment</span></button><span class="navigation-hint">Module complete · Take your learning into your course</span><button type="button" class="primary nav-button nav-button--next" data-action="preview-guide"><span>View guide</span><span aria-hidden="true">→</span></button></nav>`;
  return renderScene(scenario, scene, state, 0, {
    className: 'closing-experience',
    stage: 'board',
    titleId: 'setup-title',
    progressLabel: 'Module complete',
    showHandoff: false,
    boardContent: recap,
    navigation,
    designNotice: true,
  });
}
