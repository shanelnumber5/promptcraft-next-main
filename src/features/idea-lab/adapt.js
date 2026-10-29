import { conversationDefaults } from '../design/babbage-client.js';
import { finalCheckDefaults } from '../design/content.js';

// Selecting inspiration preserves authored directions and removes stale AI context.
export function adaptIdea(state, item) {
  const changed = state.workspace.ideaId !== item.id;
  if (!state.teacher.directions.trim()) {
    state.workspace.sourceKind = 'idea';
    state.teacher.directions = item.summary + '\n\nPossible student activity:\n' + item.actions.join('\n');
    state.design.sourceDirections = state.teacher.directions;
  }
  if (changed) {
    if (state.workspace.creativeCore === state.workspace.selectedDirection?.core) state.workspace.creativeCore = '';
    delete state.workspace.selectedDirection;
    state.creative.directions = [];
    state.creative.basis = '';
    state.babbage = { ...conversationDefaults(), mode: state.babbage.mode };
    state.finalCheck = finalCheckDefaults();
  }
  state.workspace.ideaId = item.id;
  state.designPanel = 'revision';
  return changed;
}
