// Keep the current decoded image visible until the next expression is ready.
const pendingPortraits = new WeakMap();
const decodedPortraits = new Map();

function preparePortrait(source, priority = 'auto') {
  if (decodedPortraits.has(source)) return decodedPortraits.get(source);
  const prepared = new Image();
  prepared.fetchPriority = priority;
  prepared.src = source;
  const ready = prepared.decode().then(() => prepared).catch(error => {
    decodedPortraits.delete(source);
    throw error;
  });
  decodedPortraits.set(source, ready);
  return ready;
}

// Two low-priority downloads at a time avoid competing with the visible scene.
export function preloadDialoguePortraits(sources) {
  const queue = [...new Set(sources)];
  const worker = async () => {
    while (queue.length) {
      try { await preparePortrait(queue.shift(), 'low'); } catch { /* Retry when shown. */ }
    }
  };
  return Promise.all([worker(), worker()]);
}

export async function updateDialoguePortrait(image, source) {
  const request = {};
  pendingPortraits.set(image, request);
  if (image.getAttribute('src') === source) return;

  try {
    await preparePortrait(source);
  } catch {
    return;
  }
  if (pendingPortraits.get(image) === request && image.isConnected) {
    image.setAttribute('src', source);
  }
}
