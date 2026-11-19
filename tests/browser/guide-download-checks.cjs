const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Download through the real UI, then inspect the saved HTML and embedded Canvas CSV.
// All browser data belongs to the harness's temporary profile; AI remains mocked.
module.exports = async ({ send, evaluate, waitFor, shot, key, keyboardReach, scenarioMode }) => {
  const route = scenarioMode ? 'scenario' : 'workspace';
  const folder = path.resolve(process.env.PC_BROWSER_OUTPUT, 'downloads', route);
  fs.mkdirSync(folder, { recursive: true });
  const file = path.join(folder, 'promptcraft-assignment-guide.html');
  if (fs.existsSync(file)) fs.unlinkSync(file);
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: folder });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await evaluate(`(async()=>{
    const {readWorkspace,saveWorkspace}=await import('/src/features/workspace/storage.js');
    const {readScenarioStudio,saveScenarioStudio}=await import('/src/features/workspace/scenario-storage.js');
    const state=${scenarioMode ? 'readScenarioStudio' : 'readWorkspace'}().state;
    state.creative.review.perspectivesComplete=true;
    state.workspace.assignmentTitle='Evidence workshop';
    Object.assign(state.creative.rubric,{requested:false,title:'Evidence workshop rubric',criteria:'Evidence',basis:state.design.revision,rows:[{name:'Evidence',description:'Use the case evidence.',points:100,ratings:['Supports a choice with case evidence.','Partly supports a choice.','No support is supplied.']}]});
    ${scenarioMode ? 'saveScenarioStudio' : 'saveWorkspace'}(state);
  })()`);
  await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=' + route });
  await waitFor('!!document.querySelector(".workspace-tabs")');
  const click = (selector) =>
    evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const fill = (selector, value) =>
    evaluate(
      `(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));})()`,
    );
  await click('[data-workspace-panel="revision"]');
  await click('[data-design-page="presence"]');
  await fill('#instructor-plan', 'Ask students to test one assumption using the case evidence.');
  await click('[data-workspace-panel="reason"]');
  await click('[data-review-page="reasoning"]');
  await fill('#reason', 'Students connect evidence to a decision and explain a tradeoff.');
  await click('[data-review-page="checks"]');
  await evaluate(
    `document.querySelectorAll('[data-final-check]').forEach(el=>{if(!el.checked)el.click();})`,
  );
  assert(
    await evaluate('!document.querySelector("[data-action=approve-version]").disabled'),
    route + ' can approve',
  );
  await click('[data-action="approve-version"]');
  await click('[data-action="preview-guide"]');
  await waitFor('!!document.querySelector("iframe[data-ready]")');
  const titles = await evaluate(
    '[...document.querySelector("#guide-section").options].map(el=>el.textContent)',
  );
  assert.equal(titles.includes('The lemonade example'), scenarioMode);
  assert.equal(titles.includes('Adapt the teaching moves'), scenarioMode);
  assert(titles.includes('Assessment rubric'));
  await keyboardReach('[data-guide-next]');
  await key('Enter', 'Enter', 13);
  await waitFor('!!document.querySelector("iframe[data-ready]")');
  assert.equal(
    await evaluate('document.getElementById("guide-section").value'),
    '1',
    'Guide Continue supports the keyboard',
  );
  await keyboardReach('[data-guide-back]');
  await key('Enter', 'Enter', 13);
  await waitFor('!!document.querySelector("iframe[data-ready]")');
  assert.equal(
    await evaluate('document.getElementById("guide-section").value'),
    '0',
    'Guide Back supports the keyboard',
  );
  await shot(route + '-approved-preview');
  await click('[data-guide-download]');
  for (let i = 0; i < 100 && !fs.existsSync(file); i++)
    await new Promise((resolve) => setTimeout(resolve, 50));
  assert(fs.existsSync(file), route + ' produces a downloaded guide');
  const html = fs.readFileSync(file, 'utf8');
  for (const text of [
    'Approved version',
    'Evidence workshop',
    'Compare the evidence',
    'Supports a choice with case evidence.',
    'Using your downloaded guide',
  ])
    assert(html.includes(text), route + ' download includes ' + text);
  if (scenarioMode)
    for (const text of [
      'Alex takes payment',
      'Sam serves drinks',
      'Adapt the teaching moves',
      'not proof of faster service',
      'Maya’s experience after',
    ])
      assert(html.includes(text));
  assert(!/<script\b|<link\b|src="https?:/i.test(html), 'Downloaded guide is self contained');
  for (let page = 0; page < titles.length; page++) {
    await evaluate(
      `(()=>{const picker=document.getElementById('guide-section');picker.value=${page};picker.dispatchEvent(new Event('change'));})()`,
    );
    await waitFor('!!document.querySelector("iframe[data-ready]")');
    const section = await evaluate(
      `new DOMParser().parseFromString(document.querySelector('.guide-preview iframe').srcdoc,'text/html').querySelector('.guide-section').outerHTML`,
    );
    const exportedSection = await evaluate(
      `new DOMParser().parseFromString(${JSON.stringify(html)},'text/html').querySelectorAll('.guide-section')[${page}].outerHTML`,
    );
    assert.equal(section, exportedSection, 'Preview/download section parity: ' + titles[page]);
    if (scenarioMode && page < 2) await shot(route + '-guide-section-' + page);
  }
  await click('[data-guide-close]');
  await waitFor('!document.querySelector("dialog[open]")');
  await click('[data-action="finish-workspace"]');
  if (scenarioMode) await click('[data-action="closing-pixel"]');
  for (let i = 0; i < 3; i++) await click('[data-action="closing-next"]');
  await click('[data-action="preview-guide"]');
  await waitFor('!!document.querySelector("iframe[data-ready]")');
  assert.deepEqual(
    await evaluate('[...document.querySelector("#guide-section").options].map(el=>el.textContent)'),
    titles,
    'Completion retains all guide sections',
  );
  await send('Page.navigate', { url: pathToFileURL(file).href });
  await waitFor('document.readyState==="complete" && !!document.querySelector(".toc")');
  assert(
    await evaluate(
      'getComputedStyle(document.querySelector("h1")).fontFamily.startsWith("Georgia")',
    ),
  );
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await shot(route + '-download-offline');
  const csv = await evaluate(
    'decodeURIComponent(document.querySelector(".rubric-download a").href.split(",").slice(1).join(","))',
  );
  assert(csv.includes('Evidence') && csv.includes('Supports a choice with case evidence.'));
  const csvFile = path.join(folder, 'assignment-rubric-canvas.csv');
  if (fs.existsSync(csvFile)) fs.unlinkSync(csvFile);
  await click('.rubric-download a');
  for (let i = 0; i < 100 && !fs.existsSync(csvFile); i++)
    await new Promise((resolve) => setTimeout(resolve, 50));
  assert(fs.existsSync(csvFile), 'Offline guide downloads the Canvas CSV');
  assert.equal(fs.readFileSync(csvFile, 'utf8'), csv);
  await click('a[href="#your-assignment"]');
  assert.equal(await evaluate('location.hash'), '#your-assignment');
  await shot(route + '-download-activity');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate('scrollTo(0,0)');
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await shot(route + '-download-phone');
  await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=guide' });
  await waitFor('!!document.querySelector(".guide-entry")');
  const index = await evaluate(
    `Array.from(document.querySelectorAll('.guide-entry')).findIndex(el=>el.textContent.includes(${JSON.stringify(scenarioMode ? 'Guided scenario' : 'Creative Workspace')}))`,
  );
  assert(index >= 0);
  const saved = await evaluate('JSON.stringify({...localStorage})');
  await click(`[data-guide-index="${index}"]`);
  await waitFor('!!document.querySelector("iframe[data-ready]")');
  assert.deepEqual(
    await evaluate('[...document.querySelector("#guide-section").options].map(el=>el.textContent)'),
    titles,
    'Library restores all sections and the saved rubric',
  );
  assert.equal(
    await evaluate('JSON.stringify({...localStorage})'),
    saved,
    'Reading the library does not rewrite saves',
  );
  await click('[data-guide-close]');
  await waitFor('!document.querySelector("dialog[open]")');
  await evaluate(`document.querySelectorAll('.guide-entry')[${index}].querySelector('a').click()`);
  await waitFor(
    `new URLSearchParams(location.search).get('view')===${JSON.stringify(route)} && !!document.querySelector('.workspace-tabs')`,
  );
  console.log(
    route +
      ' PASS: approval, every preview section, downloaded HTML and Canvas CSV, completion, offline/mobile guide, library save preservation and correct resume route.',
  );
};
