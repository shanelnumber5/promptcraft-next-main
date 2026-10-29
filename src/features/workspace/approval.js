import { assignmentContext } from '../design/babbage-client.js';
import { finalCheckDefaults } from '../design/content.js';

// Every substantive workspace edit needs a fresh educator approval, including
// course context and creative intentions omitted from Scenario 1's check context.
export function invalidateWorkspaceApproval(state, previousContext) {
  if (assignmentContext(state) === previousContext) return false;
  state.finalCheck = finalCheckDefaults();
  return true;
}
