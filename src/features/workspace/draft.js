import { finalCheckDefaults } from '../design/content.js';

// Both explicit acceptance and the requested rework use the same saved-draft rules.
export function applySuggestedDraft(state, suggestion) {
  if (state.design.revision.trim()) {
    state.design.previousRevision = state.design.revision;
    state.design.previousReason = state.design.reason;
  }
  state.design.revision = suggestion.revision;
  state.design.reason = suggestion.reason;
  state.design.sourceDirections = state.teacher.directions;
  state.finalCheck = finalCheckDefaults();
}
