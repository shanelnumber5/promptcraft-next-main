const fs = require('node:fs');
const path = require('node:path');

function filesIn(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(folder, entry.name);
    return entry.isDirectory() ? filesIn(target) : [target];
  });
}

// Browser imports can include cache versions; those are not part of a local filename.
function resolveSourceReference(file, reference) {
  return path.resolve(path.dirname(file), reference.split(/[?#]/)[0]);
}

module.exports = { filesIn, resolveSourceReference };
