// Optional decoder check: node scripts/check-image-assets.cjs /path/to/dwebp
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'promptcraft-image-check-'));
let before = 0, after = 0, count = 0;
try {
  for (const directory of ['characters/maya', 'characters/pixel', 'backgrounds', 'people']) {
    for (const name of fs.readdirSync(path.join(root, 'assets', directory))) {
      if (!name.endsWith('.webp')) continue;
      const file = path.join(root, 'assets', directory, name);
      const original = fs.readFileSync(file.replace(/\.webp$/, '.png'));
      const bytes = fs.statSync(file).size;
      before += original.length; after += bytes; count++;
      if (process.argv[2]) execFileSync(process.argv[2], ['-quiet', file, '-o', path.join(temp, 'decoded.png')]);
      console.log(`${directory}/${name}: ${original.length} -> ${bytes} bytes`);
    }
  }
  const logo = fs.readFileSync(path.join(root, 'assets/brand/babbage-mark-small.svg'), 'utf8');
  const embedded = Buffer.from(logo.match(/data:image\/webp;base64,([^"']+)/)[1], 'base64');
  const logoFile = path.join(temp, 'logo.webp');
  fs.writeFileSync(logoFile, embedded);
  if (process.argv[2]) execFileSync(process.argv[2], ['-quiet', logoFile, '-o', path.join(temp, 'logo.png')]);
  before += fs.statSync(path.join(root, 'assets/brand/babbage-mark.svg')).size;
  after += Buffer.byteLength(logo);
  console.log(`${count + 1} optimized assets: ${before} -> ${after} bytes (${(100 * (1 - after / before)).toFixed(1)}% smaller)`);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
