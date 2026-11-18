// Shared transport keeps feature validation and retry decisions with their callers.
const JOB_TIMEOUT_MS = 300000;

function waitForPoll(signal) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, 1500);
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, { once: true });
  });
}

export async function postJSON(
  url,
  body,
  { fetchImpl = fetch, signal, httpError, unreadableMessage, onProgress = () => {} },
) {
  let pollUrl = '';
  const started = Date.now();
  try {
    onProgress('sending');
    let response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    if(response.status===202) onProgress('working');
    while (response.status === 202) {
      let pending;
      try {
        pending = await response.json();
      } catch {
        throw Error(unreadableMessage);
      }
      if (!/^[a-f0-9]{32}$/.test(pending?.job_id || '')) throw Error(unreadableMessage);
      const nextUrl = `${url}${url.includes('?') ? '&' : '?'}job=${pending.job_id}`;
      if (pollUrl && nextUrl !== pollUrl) throw Error(unreadableMessage);
      pollUrl = nextUrl;
      if (Date.now() - started > JOB_TIMEOUT_MS)
        throw Error('Chat MT AI took too long. Your draft is saved. Please retry.');
      await waitForPoll(signal);
      response = await fetchImpl(pollUrl, { signal });
    }
    if (!response.ok) {
      let details = null;
      try {
        details = await response.json();
      } catch {}
      throw httpError(response.status, details);
    }
    try {
      onProgress('received');
      const data=await response.json();
      onProgress('complete');
      return data;
    } catch {
      throw Error(unreadableMessage);
    }
  } finally {
    if (pollUrl) {
      // Cancellation must still acknowledge the job using an independent signal.
      // Cleanup runs in the background so navigation never waits on the network.
      void fetchImpl(pollUrl, { method: 'DELETE', signal: AbortSignal.timeout(5000) }).catch(
        () => {},
      );
    }
  }
}
