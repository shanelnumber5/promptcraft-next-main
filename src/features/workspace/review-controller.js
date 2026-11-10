import {
  reviewFingerprint,
  reviewEligible,
  requestWorkspaceReview,
  shouldOpenMaya,
} from './review-ai.js';
import { prepareMayaReading } from '../design/maya-dialog.js';

const REVIEW_TIMEOUT_MS = 90000;
const sampleReview =
  'Sample review only; no AI analysis was performed. Consider what students will produce, how you will respond to their thinking, and what changes would make the learning purpose clearer.';

/** Own review requests independently of navigation and DOM rendering.
 * getState must be live: reset/import can replace the entire state during a request.
 * Service overrides allow offline lifecycle tests without calling either AI service.
 */
export function createWorkspaceReviewController({
  getState,
  canReview,
  save,
  render,
  onMayaReady,
  requestReview = requestWorkspaceReview,
  prepareMaya = prepareMayaReading,
}) {
  let activeRequest = null;
  let sequence = 0;

  function cancel() {
    sequence++;
    activeRequest?.abort();
    activeRequest = null;
    const review = getState().creative.review;
    if (review.status === 'pending') review.status = review.feedback ? 'complete' : 'idle';
  }

  async function check(reuseReview = false) {
    const source = getState();
    if (activeRequest || !canReview() || !reviewEligible(source)) return;
    const fingerprint = reviewFingerprint(source);
    const review = source.creative.review;
    const previous = review.feedback
      ? { feedback: review.feedback, previous_fingerprint: review.fingerprint }
      : null;
    const abort = new AbortController();
    const requestSequence = ++sequence;
    activeRequest = abort;
    // Also invalidates callbacks deferred until a cameo dialog closes.
    const isCurrent = () =>
      requestSequence === sequence && source === getState() && !abort.signal.aborted;
    const signal = () => AbortSignal.any([abort.signal, AbortSignal.timeout(REVIEW_TIMEOUT_MS)]);
    let mayaError = null;
    review.status = 'pending';
    review.error = '';
    save();
    render();
    try {
      const feedback = reuseReview
        ? review.feedback
        : source.babbage.mode === 'dev'
          ? sampleReview
          : await requestReview(structuredClone(source), previous, { signal: signal() });
      if (!isCurrent()) return;
      Object.assign(review, { fingerprint, feedback, status: 'complete', error: '' });
      if (shouldOpenMaya(getState())) {
        try {
          await prepareMaya(source, { signal: signal() });
        } catch (error) {
          mayaError = error;
        }
      }
    } catch (error) {
      if (!isCurrent()) return;
      review.status = 'error';
      review.error = error.message || 'Review unavailable. Your draft is unchanged.';
    } finally {
      // A cancelled request must never clear a newer request's loading state.
      if (requestSequence === sequence) {
        activeRequest = null;
        if (isCurrent()) {
          save();
          if (source.designPanel === 'reason') {
            render();
            if (shouldOpenMaya(source))
              onMayaReady({ source, review, error: mayaError, isCurrent });
          }
        }
      }
    }
  }

  async function runAutomatic() {
    const state = getState();
    if (!canReview() || state.designPanel !== 'reason' || !reviewEligible(state) || activeRequest)
      return;
    const review = state.creative.review;
    if (review.fingerprint === reviewFingerprint(state) && review.feedback) {
      if (shouldOpenMaya(state)) await check(true);
      return;
    }
    // Re-entering Review must not automatically re-check an edited or failed draft.
    if (review.feedback || review.error || review.status === 'complete') return;
    await check();
  }

  return {
    check,
    runAutomatic,
    cancel,
    get pending() {
      return activeRequest !== null;
    },
  };
}
