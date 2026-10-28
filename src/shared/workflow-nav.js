/** Shared, low-friction navigation for both design experiences. */
export function renderWorkflowNav({ context, babbageAction = '' } = {}) {
  const guidance = context === "guided" ? " Babbage becomes available in the drafting step." : "";
  return `<nav class="workflow-nav" aria-label="Workspace shortcuts">
    ${babbageAction}
    <a href="?view=guide">Course Guide</a>
    <a href="?view=home" class="workflow-nav-leave">Save and leave</a>
    <span class="workflow-nav-note">Saved in this browser. Download your Course Guide for a separate copy.${guidance}</span>
  </nav>`;
}
