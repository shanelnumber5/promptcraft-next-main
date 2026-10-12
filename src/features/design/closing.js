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
      text: 'Maya’s old discussion needed no peer input. A useful question helped her reconsider her plan—the principle you applied to your own assignment.',
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
  const recap = `<div class="closing-board-recap"><h3>Why this matters</h3><p>Discussion becomes more meaningful when students use another person’s thinking to examine their own. The follow-up makes their learning visible: how they used evidence and feedback to reach a decision.</p><h3>Keep the revision realistic</h3><p>Connect each task to your learning goal. Preserve required elements and keep the workload within the time available. If AI is permitted, set clear boundaries; students still need to verify claims and explain their own decisions.</p><h3>Take it into your course</h3><p>Try your revised assignment. Look for whether students use specific peer contributions in their follow-ups, then use what you notice to refine the next discussion.</p>${state.teacher.learningGoal ? `<p class="closing-goal"><strong>Your learning goal:</strong> ${e(state.teacher.learningGoal)}</p>` : ''}</div>`;
  const navigation = `<nav class="scene-actions" aria-label="Module navigation"><button type="button" class="nav-button nav-button--back" data-action="return-assignment"><span aria-hidden="true">←</span><span>Your assignment</span></button><span class="navigation-hint">Module complete · Take your learning into your course</span><button type="button" class="primary nav-button nav-button--next" data-action="preview-guide"><span>View assignment guide</span><span aria-hidden="true">→</span></button></nav>`;
  return renderScene(scenario, scene, state, 0, {
    className: 'closing-experience',
    titleId: 'setup-title',
    progressLabel: 'Module complete',
    showHandoff: false,
    boardContent: recap,
    navigation,
    designNotice: true,
  });
}
