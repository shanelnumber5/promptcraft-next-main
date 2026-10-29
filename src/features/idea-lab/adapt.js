import { isUncertainAnswer } from '../design/input-quality.js';
import { conversationDefaults } from '../design/babbage-client.js';
import { finalCheckDefaults } from '../design/content.js';

// Selecting inspiration preserves authored directions and removes stale AI context.
export function adaptIdea(state, item) {
  const changed = state.workspace.ideaId !== item.id || !state.workspace.selectedDirection;
  if (!state.teacher.directions.trim()) {
    state.workspace.sourceKind = 'idea';
    state.teacher.directions = item.summary + '\n\nPossible student activity:\n' + item.actions.join('\n');
    state.design.sourceDirections = state.teacher.directions;
  }
  if (changed) {
    if (state.workspace.creativeCore === state.workspace.selectedDirection?.core) state.workspace.creativeCore = '';
    state.workspace.selectedDirection = {
      title:item.title, description:item.summary, experience:item.actions.join('\n'),
      learning:item.purpose, online:'Use an asynchronous course discussion. Adjust the timing and access arrangements for your learners.', core:item.summary,
    };
    if (!state.workspace.creativeCore?.trim() || isUncertainAnswer(state.workspace.creativeCore)) state.workspace.creativeCore = item.summary;
    state.creative.directions = [];
    state.creative.basis = '';
    state.babbage = { ...conversationDefaults(), mode: state.babbage.mode };
    state.finalCheck = finalCheckDefaults();
  }
  state.workspace.ideaId = item.id;
  state.designPanel = 'revision';
  return changed;
}
