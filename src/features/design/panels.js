export const designPanels = [
  ['concern', 'original', 'advice'],
  ['exchange', 'notes', 'advice'],
  ['babbage', 'route', 'revision', 'reason', 'requirements', 'history', 'rationale', 'earlier', 'advice', 'tools', 'feedback', 'clarify', 'teaching'],
];
export function currentDesignPanel(state) {
  const panels = designPanels[state.designStep];
  return panels?.includes(state.designPanel) ? state.designPanel : panels?.[0] || '';
}
