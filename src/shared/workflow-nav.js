/** Shared, low-friction navigation for both design experiences. */
export function renderWorkflowNav({ context, babbageAction = '' } = {}) {
  const guidance = context === "guided" ? " Babbage is integrated into the drafting step." : "";
  return `<nav class="workflow-nav" aria-label="Workspace shortcuts">
    ${babbageAction}
    <a href="?view=guide">Course Guide</a>
    <a href="?view=home" class="workflow-nav-leave">Save and leave</a>
    <span class="workflow-nav-note">Your progress is saved in this browser. For a separate copy, download your Course Guide.${guidance}</span>
  </nav>`;
}
