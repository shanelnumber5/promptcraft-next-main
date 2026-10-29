/** Shared, low-friction navigation for both design experiences. */
export function renderWorkflowNav({ context, babbageAction = '' } = {}) {
  return `<nav class="workflow-nav" aria-label="Workspace shortcuts">
    ${babbageAction}
    <a href="?view=guide">Course Guide</a>
    <a href="?view=home" class="workflow-nav-leave">Save and leave</a>
  </nav>`;
}
