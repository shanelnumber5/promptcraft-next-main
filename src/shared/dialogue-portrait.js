// Keep the current decoded image visible until the next expression is ready.
const pendingPortraits = new WeakMap();

export async function updateDialoguePortrait(image, source) {
  const request = {};
  pendingPortraits.set(image, request);
  if (image.getAttribute('src') === source) return;

  const prepared = new Image();
  prepared.src = source;
  try {
    await prepared.decode();
  } catch {
    return;
  }
  if (pendingPortraits.get(image) === request && image.isConnected) {
    image.setAttribute('src', source);
  }
}
