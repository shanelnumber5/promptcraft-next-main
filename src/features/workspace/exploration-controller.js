import { requestCreativeDirections, creativeBasis } from './creative.js';

// Request ownership survives page changes, resets and imports without stale writes.
export async function exploreWorkspace({
  getState,
  ai,
  onStart,
  onStage,
  onComplete,
  onFinish,
  requestDirections = requestCreativeDirections,
}) {
  if (ai.pending) return;
  const source = getState();
  const basis = creativeBasis(source);
  const snapshot = structuredClone(source);
  const request = new AbortController();
  const ownsRequest = () => source === getState() && ai.requestController === request;
  const isCurrent = () => ownsRequest() && !request.signal.aborted;
  Object.assign(ai, {
    pending: true,
    requestController: request,
    error: '',
    stage: 'working',
    intent: 'explore',
  });
  onStart();
  try {
    const directions = await requestDirections(snapshot, {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(300000)]),
      onStage: (stage) => {
        if (!isCurrent()) return;
        ai.stage = stage;
        onStage();
      },
      onRefinementFailure: (message) => {
        if (isCurrent()) ai.error = message;
      },
    });
    if (!isCurrent()) return;
    if (basis !== creativeBasis(source)) {
      ai.error =
        'Your context changed while Babbage was exploring. Ask again for possibilities based on your latest work.';
      return;
    }
    source.creative.directions = directions;
    source.creative.basis = basis;
    onComplete();
  } catch (error) {
    if (isCurrent())
      ai.error =
        error.name === 'TimeoutError'
          ? 'Babbage took too long. Your ideas and draft are unchanged. Try again.'
          : error.message;
  } finally {
    if (ownsRequest()) {
      Object.assign(ai, { pending: false, requestController: null });
      onFinish();
    }
  }
}
