const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tests = ['json-request','design','babbage','maya','characters','idea-lab','creative','repository','workspace-review','workspace-project','babbage-cameo','shared-controller','architecture','scenario-studio','opening-route'];
for (const name of tests) {
  const result = spawnSync(process.execPath, ['--require', path.join(__dirname,'helpers/offline-fetch.cjs'), path.join(__dirname,'unit',name+'.test.cjs')], {cwd:root,stdio:'inherit',timeout:120000});
  if (result.error || result.status !== 0) {
    if (result.error) console.error(result.error.message);
    process.exit(result.status || 1);
  }
}
console.log(`PASS: ${tests.length} offline unit suites. No browser or live AI verification.`);
