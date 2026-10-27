export const designPanels = [
  ['concern', 'original', 'advice'],
  ['exchange', 'notes', 'advice'],
  ['route', 'babbage', 'revision', 'reason', 'requirements', 'history', 'rationale', 'earlier', 'advice', 'tools', 'feedback'],
];
export function currentDesignPanel(state) {
  const panels = designPanels[state.designStep];
  return panels?.includes(state.designPanel) ? state.designPanel : panels?.[0] || '';
}
export function designDestination(state, delta) {
  const step = state.designStep, panel = currentDesignPanel(state);
  if (panel === 'feedback') return [step,'reason'];
  if (panel === 'tools') return [step,'revision'];
  if (panel === 'advice') return [step, state.designReturnPanel || designPanels[step][0]];
  if (delta < 0) {
    if (panel === 'original') return [0, 'concern'];
    if (panel === 'notes') return [1, 'exchange'];
    if (['babbage', 'revision', 'requirements', 'earlier'].includes(panel)) return [2, 'route'];
    if (['history', 'rationale'].includes(panel)) return [2, 'babbage'];
    if (panel === 'reason') return [2, 'revision'];
    if (step === 2) return [1, 'notes'];
    if (step === 3) return [2, 'reason'];
  } else {
    if (panel === 'original') return [0, 'concern'];
    if (panel === 'exchange') return [1, 'notes'];
    if (['route', 'babbage', 'requirements', 'earlier'].includes(panel)) return [2, 'revision'];
    if (['history', 'rationale'].includes(panel)) return [2, 'babbage'];
    if (panel === 'revision') return [2, 'reason'];
  }
  const next = Math.max(0, Math.min(4, step + delta));
  return [next, designPanels[next]?.[0] || ''];
}

export function introducePixelAdvice(state) {
  const panel=currentDesignPanel(state);
  if(state.phase!=='design' || !['concern','exchange','notes','route','reason'].includes(panel)) return false;
  state.designReturnPanel=panel;
  state.designPanel='advice';
  return true;
}
