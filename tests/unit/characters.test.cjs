const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inflateSync } = require('node:zlib');

// Decode the supplied 8-bit RGBA PNGs to check real transparency, not just an alpha header.
function inspectPNG(file) {
  const png = fs.readFileSync(file);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  assert.deepEqual([width, height, png[24], png[25], png[28]], [832, 1177, 8, 6, 0], file);
  const chunks = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT')
      chunks.push(png.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * 4;
  assert.equal(raw.length, (stride + 1) * height);
  let previous = Buffer.alloc(stride), offset = 0, visible = 0;
  const bounds = { top: height, bottom: 0 };
  const paeth = (a, b, c) => {
    const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = raw[offset++], row = Buffer.alloc(stride);
    assert(filter <= 4, 'Supported PNG filter');
    for (let i = 0; i < stride; i++) {
      const left = i >= 4 ? row[i - 4] : 0, up = previous[i], corner = i >= 4 ? previous[i - 4] : 0;
      const prediction = [0, left, up, Math.floor((left + up) / 2), paeth(left, up, corner)][filter];
      row[i] = (raw[offset++] + prediction) & 255;
    }
    for (let x = 0; x < width; x++) {
      const alpha = row[x * 4 + 3];
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1)
        assert.equal(alpha, 0, `Transparent canvas edges: ${file}`);
      if (alpha >= 128) { visible++; bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y); }
    }
    previous = row;
  }
  assert(visible > width * height * .1, 'A visible full-body character is present');
  return bounds;
}

(async () => {
  const { characterArt } = await import('../../src/shared/character-art.js');
  const { discussionOpening } = await import('../../src/features/opening/content.js');
  const bounds = [];
  for (const [identity, poses] of Object.entries(characterArt)) {
    for (const [pose, file] of Object.entries(poses)) {
      assert(file.startsWith(`assets/characters/${identity}/${identity}_`), 'Character identities stay in their own catalogs');
      bounds.push({ identity, pose, ...inspectPNG(path.resolve(__dirname, '../..', file)) });
    }
  }
  assert.equal(bounds.length, 20, 'All twenty inspected poses are declared available');
  assert(Math.max(...bounds.map(b => b.top)) - Math.min(...bounds.map(b => b.top)) <= 20, 'Consistent head placement');
  assert(Math.max(...bounds.map(b => b.bottom)) - Math.min(...bounds.map(b => b.bottom)) <= 20, 'Consistent foot placement');
  for (const scene of discussionOpening.scenes) {
    for (const [identity, file] of Object.entries(scene.portraits || {}))
      assert(Object.values(characterArt[identity]).includes(file), 'Scene portraits belong to the intended character');
  }
  console.log('PASS: distinct realistic character catalogs, twenty 832×1177 RGBA PNGs, transparent edges, consistent placement and scene ownership.');
})().catch(error => { console.error(error); process.exitCode = 1; });
