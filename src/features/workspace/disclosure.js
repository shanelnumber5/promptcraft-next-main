// Workspace-only disclosure; Scenario 1 keeps its established presentation.
export function renderWorkspaceDisclosure(state) {
  return `<p class="workspace-ai-disclosure">${state.babbage.mode === 'dev'
    ? 'Sample simulation only. No AI analysis or API call.'
    : 'AI collaboration shares your activity and design context with the PromptCraft Babbage service and OpenAI. Review suggestions using your professional judgment.'}</p>`;
}
