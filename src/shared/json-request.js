// Keep transport handling separate from each feature's response validation and retry policy.
export async function postJSON(
  url,
  body,
  { fetchImpl = fetch, signal, httpError, unreadableMessage },
) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    let details = null;
    try { details = await response.json(); } catch {}
    throw httpError(response.status, details);
  }
  try {
    return await response.json();
  } catch {
    throw Error(unreadableMessage);
  }
}
