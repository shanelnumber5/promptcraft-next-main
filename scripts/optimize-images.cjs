// Usage: node scripts/optimize-images.cjs /path/to/cwebp
// Keep source artwork intact; generate smaller assets used by the browser.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const encoder = process.argv[2] || 'cwebp';
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'promptcraft-images-'));
function encode(source, target, width) {
  execFileSync(encoder, ['-quiet', '-q', '85', '-m', '6', '-metadata', 'none',
    ...(width ? ['-resize', String(width), '0'] : []), source, '-o', target]);
}
try {
  for (const directory of ['characters/maya', 'characters/pixel', 'backgrounds', 'people']) {
    for (const file of fs.readdirSync(path.join(root, 'assets', directory))) {
      if (!file.endsWith('.png')) continue;
      const source = path.join(root, 'assets', directory, file);
      const width = fs.readFileSync(source).readUInt32BE(16);
      encode(source, source.replace(/\.png$/, '.webp'), directory === 'backgrounds' ? Math.min(width, 1600) : undefined);
    }
  }
  const logo = fs.readFileSync(path.join(root, 'assets/brand/babbage-mark.svg'), 'utf8');
  const embedded = logo.match(/data:image\/png;base64,([^"']+)/);
  if (!embedded) throw Error('Expected the original embedded PNG logo');
  const source = path.join(temp, 'logo.png'), target = path.join(temp, 'logo.webp');
  fs.writeFileSync(source, Buffer.from(embedded[1], 'base64'));
  encode(source, target, 256);
  fs.writeFileSync(path.join(root, 'assets/brand/babbage-mark-small.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280"><image width="1280" height="1280" href="data:image/webp;base64,' +
    fs.readFileSync(target).toString('base64') + '"/></svg>\n');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
