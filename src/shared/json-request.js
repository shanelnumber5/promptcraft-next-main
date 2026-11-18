// Keep transport handling separate from each feature's response validation and retry policy.
export async function postJSON(
  url,
  body,
  { fetchImpl = fetch, signal, httpError, unreadableMessage },
) {
  let response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  const started = Date.now();
  let pollUrl = '';
  while (response.status === 202) {
    let pending;
    try { pending = await response.json(); } catch { throw Error(unreadableMessage); }
    if (!/^[a-f0-9]{32}$/.test(pending?.job_id || '')) throw Error(unreadableMessage);
    if (Date.now() - started > 300000) throw Error('Chat MT AI took too long. Your draft is saved. Please retry.');
    pollUrl = `${url}${url.includes('?') ? '&' : '?'}job=${pending.job_id}`;
    await new Promise((resolve, reject) => {
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
    response = await fetchImpl(pollUrl, { signal });
  }
  if (!response.ok) {
    let details = null;
    try { details = await response.json(); } catch {}
    if (pollUrl) {
      try { await fetchImpl(pollUrl, { method: 'DELETE', signal }); } catch {}
    }
    throw httpError(response.status, details);
  }
  try {
    const data = await response.json();
    if (pollUrl) {
      try { await fetchImpl(pollUrl, { method: 'DELETE', signal }); } catch {}
    }
    return data;
  } catch {
    throw Error(unreadableMessage);
  }
}
