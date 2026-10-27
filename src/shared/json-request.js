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
  if (!response.ok) throw httpError(response.status);
  try {
    return await response.json();
  } catch {
    throw Error(unreadableMessage);
  }
}
