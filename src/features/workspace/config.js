/** Shared studio rules. IDs are persisted; change labels without renaming IDs. */
export const workspaceStages = [
  ['babbage', 'Explore'],
  ['revision', 'Build'],
  ['reason', 'Review'],
];
export const workspacePanelIds = workspaceStages.map(([id]) => id);

export const MAX_WORKSPACE_TEXT = 6000;
export const MAX_SAVED_ALTERNATIVES = 30;

// These planning fields extend assignment context without discarding answered questions.
// Reuse this list when restoring saves and handling edits to keep both paths aligned.
export const workspacePlanningFields = [
  'creativeCore',
  'studentContribution',
  'peerInteraction',
  'instructorPlan',
  'openQuestions',
];
