import { isChatmtPreview } from '../design/babbage-client.js';
// Workspace-only disclosure; Scenario 1 keeps its established presentation.
export function renderWorkspaceDisclosure(state) {
  return `<aside class="workspace-ai-disclosure" aria-label="About AI collaboration"><p>${state.babbage.mode === 'dev'
    ? 'Sample simulation only. No AI analysis or API call.'
    : `AI collaboration shares your activity and design context with the PromptCraft Babbage service and Chat MT AI. Review suggestions using your professional judgment.${isChatmtPreview ? ' Netlify holds feedback temporarily while it is delivered, then removes it within five minutes.' : ''}`}</p></aside>`;
}
