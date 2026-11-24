import { isChatmtPreview } from '../design/babbage-client.js';
// Workspace-only disclosure; Scenario 1 keeps its established presentation.
export function renderWorkspaceDisclosure(state, { compact = false } = {}) {
  return `<aside class="workspace-ai-disclosure" aria-label="About AI collaboration"><p>${state.babbage.mode === 'dev'
    ? 'Sample simulation only. No AI analysis or API call.'
    : compact ? 'Babbage shares your activity with Chat MT AI. Review suggestions before applying them.' : `AI collaboration shares your activity and design context with the PromptCraft Babbage service and Chat MT AI. Review suggestions using your professional judgment.${isChatmtPreview ? ' Netlify holds feedback temporarily while it is delivered, then removes it within five minutes.' : ''}`}</p></aside>`;
}
