const assert = require('node:assert/strict');
(async () => {
  const { updateDialoguePortrait, preloadDialoguePortraits } = await import('../../src/shared/dialogue-portrait.js');
  const originalImage = global.Image;
  const prepared = [];
  global.Image = class {
    decode() {
      return new Promise((resolve, reject) => prepared.push({ resolve, reject }));
    }
  };
  try {
    const portrait = {
      source: 'current.png', isConnected: true,
      getAttribute() { return this.source; },
      setAttribute(name, value) { this.source = value; },
    };
    await updateDialoguePortrait(portrait, 'current.png');
    assert.equal(prepared.length, 0, 'Repeated expression does not request another image');
    const earlier = updateDialoguePortrait(portrait, 'earlier.png');
    const latest = updateDialoguePortrait(portrait, 'latest.png');
    assert.equal(portrait.source, 'current.png', 'Current art remains visible during decoding');
    prepared[1].resolve(); await latest;
    prepared[0].resolve(); await earlier;
    assert.equal(portrait.source, 'latest.png', 'Rapid navigation keeps the latest expression');
    const cancelled = updateDialoguePortrait(portrait, 'cancelled.png');
    await updateDialoguePortrait(portrait, 'latest.png');
    prepared[2].resolve(); await cancelled;
    assert.equal(portrait.source, 'latest.png', 'Returning to the visible expression cancels older requests');
    const failed = updateDialoguePortrait(portrait, 'missing.png');
    prepared[3].reject(Error('unavailable')); await failed;
    assert.equal(portrait.source, 'latest.png', 'Unavailable art does not blank the portrait');
    const closed = updateDialoguePortrait(portrait, 'closed.png');
    portrait.isConnected = false; prepared[4].resolve(); await closed;
    assert.equal(portrait.source, 'latest.png', 'Closed scenes ignore pending changes');
    const warming = preloadDialoguePortraits(['warm-a.webp', 'warm-b.webp', 'warm-a.webp', 'warm-c.webp']);
    assert.equal(prepared.length, 7, 'Preloading starts only two unique downloads');
    prepared[5].resolve(); prepared[6].resolve();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(prepared.length, 8, 'Remaining expression starts after a slot is free');
    prepared[7].resolve(); await warming;
    portrait.isConnected = true;
    await updateDialoguePortrait(portrait, 'warm-a.webp');
    assert.equal(prepared.length, 8, 'Visible expression reuses the preloaded decoded image');
    assert.equal(portrait.source, 'warm-a.webp');
    console.log('PASS: repeated expressions, decode continuity, rapid navigation, cancellation, failed art and closed scenes. Mocked images.');
  } finally {
    global.Image = originalImage;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
