const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
function filesIn(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(folder, entry.name);
    return entry.isDirectory() ? filesIn(target) : [target];
  });
}
const sources = [
  ...filesIn(path.join(root, 'src')),
  ...filesIn(path.join(root, 'server')),
  path.join(root, 'index.html'),
];
const usedAssets = new Set();
for (const file of sources) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
    if (match[1].startsWith('.'))
      assert.ok(
        fs.existsSync(path.resolve(path.dirname(file), match[1])),
        `Missing import in ${file}: ${match[1]}`,
      );
  }
  for (const match of text.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
    if (/^(#|data:|https?:)/.test(match[1])) continue;
    const target = path.resolve(path.dirname(file), match[1]);
    assert.ok(fs.existsSync(target), `Missing stylesheet reference in ${file}: ${match[1]}`);
    if (target.startsWith(path.join(root, 'assets') + path.sep)) usedAssets.add(target);
  }
  for (const match of text.matchAll(/(?:\.\.\/)*assets\/[A-Za-z0-9_./-]+\.(?:png|webp|svg|ico)/g)) {
    const relative = match[0].slice(match[0].indexOf('assets/'));
    const target = path.join(root, relative);
    assert.ok(fs.existsSync(target), `Missing asset in ${file}: ${relative}`);
    usedAssets.add(target);
  }
}
// Retain the original images without rendering identities superseded by the supplied guide.
const referenceAssets = new Set([
  'assets/people/babbage-engine.png',
  'assets/characters/maya/neutral.png', 'assets/characters/maya/confident.png',
  'assets/characters/pixel/listening.png', 'assets/characters/pixel/thinking.png',
  'assets/characters/pixel/encouraging.png', 'assets/people/charles-babbage.png',
].map(relative => path.join(root, relative)));
for (const asset of referenceAssets) {
  // Reference files may be archived or removed separately; none may become active again.
  assert.ok(!usedAssets.has(asset), `Retired character artwork is still active: ${asset}`);
}
for (const asset of filesIn(path.join(root, 'assets')))
  assert.ok(usedAssets.has(asset) || referenceAssets.has(asset), `Unreferenced asset: ${path.relative(root, asset)}`);
const entry = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of entry.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const pathname = match[1].split(/[?#]/)[0];
  if (pathname && pathname !== './')
    assert.ok(fs.existsSync(path.join(root, pathname)), `Missing entry reference: ${match[1]}`);
}
assert.ok(!fs.existsSync(path.join(root, 'server/ai.js')), 'Retired provider should not return');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const script of Object.values(pkg.scripts)) {
  for (const match of script.matchAll(/node\s+([^\s]+\.(?:js|cjs))/g))
    assert.ok(fs.existsSync(path.join(root, match[1])), `Missing script: ${match[1]}`);
}
console.log(
  'PASS: module imports, stylesheet links, entry references, active assets, package scripts, retired provider removal.',
);
