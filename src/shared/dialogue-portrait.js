// Keep the current decoded image visible until the next expression is ready.
const pendingPortraits = new WeakMap();
const decodedPortraits = new Map();

function preparePortrait(source, priority = 'auto') {
  if (typeof Image === 'undefined') return Promise.reject(Error('Images unavailable'));
  if (decodedPortraits.has(source)) return decodedPortraits.get(source);
  const prepared = new Image();
  prepared.fetchPriority = priority;
  prepared.src = source;
  const ready = prepared
    .decode()
    .then(() => prepared)
    .catch((error) => {
      decodedPortraits.delete(source);
      throw error;
    });
  decodedPortraits.set(source, ready);
  return ready;
}

// A shared queue bounds background traffic even when several scenes warm at once.
const warmQueue = [];
const warming = new Map();
let activeWarmers = 0;
function drainWarmQueue() {
  while (activeWarmers < 2 && warmQueue.length) {
    const { source, resolve } = warmQueue.shift();
    activeWarmers += 1;
    preparePortrait(source, 'low')
      .catch(() => {})
      .finally(() => {
        activeWarmers -= 1;
        warming.delete(source);
        resolve();
        drainWarmQueue();
      });
  }
}
export function preloadDialoguePortraits(sources) {
  const pending = [...new Set(sources)].filter(Boolean).map((source) => {
    if (warming.has(source)) return warming.get(source);
    if (decodedPortraits.has(source)) return decodedPortraits.get(source).catch(() => {});
    const ready = new Promise((resolve) => warmQueue.push({ source, resolve }));
    warming.set(source, ready);
    return ready;
  });
  drainWarmQueue();
  return Promise.all(pending);
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
