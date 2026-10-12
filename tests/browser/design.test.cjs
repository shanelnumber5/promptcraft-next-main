// Optional browser check using installed Chrome and Node's built-in WebSocket.
const fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http'),
  assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../..'),
  output = path.join(root, 'artifacts/screenshots/design');
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};
let failNextAi = false;
let babbageCalls = 0;
const aiFixture = {
  revision:
    'Explain a recommendation. Reply to two classmates. Compare a classmate’s evidence, then revise or defend your recommendation.',
  reason: 'The reply helps students test their reasons.',
  questions: 'Check your due date before approving.',
};
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/api/babbage') {
    babbageCalls++;
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end('{"configured":true}');
    }
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString());
      const intent = JSON.parse(body.messages.at(-1).content).request_intent;
      const answered = body.messages.some(
        (turn) => turn.role === 'user' && turn.content.includes('clarification_answers'),
      );
      const fail = failNextAi;
      failNextAi = false;
      const data = {
        status: 'ok',
        analysis: {
          feedback_summary: answered
            ? 'You can generate a revision.'
            : 'Please clarify the follow-up.',
          input_quality: {
            usable: answered,
            concerns: answered ? [] : ['What should students do after receiving a reply?'],
          },
          revised_discussion_prompt: intent === 'revise' ? aiFixture.revision : '',
          revision_review: { why_these_changes: intent === 'revise' ? aiFixture.reason : '' },
        },
      };
      setTimeout(() => {
        res.writeHead(fail ? 429 : 200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            fail ? { error: { message: 'A provider error that should never be displayed' } } : data,
          ),
        );
      }, 200);
    });
    return;
  }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (error, data) => {
    res.writeHead(error ? 404 : 200, { 'Content-Type': mime[path.extname(file)] || 'text/plain' });
    res.end(error ? 'Missing' : data);
  });
});
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise((resolve) => server.listen(8783, '127.0.0.1', resolve));
  const chrome = spawn(
    process.env.PC_CHROME_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--disable-background-networking',
      '--remote-debugging-port=9223',
      '--user-data-dir=' + path.join(root, 'artifacts/browser-profiles/design'),
      'about:blank',
    ],
    { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] },
  );
  let launchError = '';
  chrome.stderr.on('data', (data) => (launchError += data.toString()));
  chrome.on('error', (error) => (launchError += error.message));
  let socket;
  try {
    let target;
    for (let i = 0; i < 100; i++) {
      try {
        target = (await (await fetch('http://127.0.0.1:9223/json/list')).json()).find(
          (t) => t.type === 'page',
        );
        if (target) break;
      } catch {}
      await pause(100);
    }
    assert(target, 'Browser debugging endpoint must open. ' + launchError);
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    let serial = 0;
    const pending = new Map(),
      errors = [];
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown')
        errors.push(message.params.exceptionDetails.text);
      if (message.id) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        message.error
          ? request.reject(Error(message.error.message))
          : request.resolve(message.result);
      }
    };
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++serial;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const result = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
      return result.result.value;
    };
    const waitFor = async (expression) => {
      for (let i = 0; i < 100; i++) {
        if (await evaluate(expression)) return;
        await pause(50);
      }
      throw Error('Timed out: ' + expression);
    };
    const click = async (action) =>
      evaluate(
        'document.querySelector(' + JSON.stringify('[data-action="' + action + '"]') + ').click()',
      );
    const fill = async (name, value) =>
      evaluate(
        '(()=>{const el=document.querySelector(' +
          JSON.stringify('[name="' + name + '"]') +
          ');el.value=' +
          JSON.stringify(value) +
          ';el.dispatchEvent(new Event("input",{bubbles:true}));})()',
      );
    const shot = async (label) => {
      const data = await send('Page.captureScreenshot', { captureBeyondViewport: false });
      fs.writeFileSync(path.join(output, label + '.png'), Buffer.from(data.data, 'base64'));
    };
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `(()=>{const original=window.fetch.bind(window);window.fetch=(url,options)=>original(String(url).startsWith('https://promptcraft-test.netlify.app/.netlify/functions/babbage')?'/api/babbage':url,options);})()`,
    });
    const { initialState } = await import('../../src/app/storage.js'),
      { discussionOpening: scenario } = await import('../../src/features/opening/content.js');
    for (const [device, width, height] of [
      ['desktop', 1440, 1000],
      ['short-desktop', 1280, 720],
      ['tablet', 768, 1024],
      ['tablet-landscape', 1024, 768],
      ['nest-hub', 1024, 600],
      ['nest-hub-max', 1280, 800],
      ['phone', 390, 844],
      ['small-phone', 320, 568],
      ['galaxy', 360, 800],
      ['fold', 412, 968],
      ['phone-landscape', 844, 390],
      ['surface', 960, 1440],
      ['ipad-pro', 1032, 1376],
      ['large-desktop', 1920, 1080],
    ]) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: device === 'phone',
      });
      await send('Page.navigate', { url: 'http://127.0.0.1:8783' });
      await waitFor(
        '!!document.querySelector("#scene-title") || !!document.querySelector("#setup-title")',
      );
      const state = initialState(scenario);
      state.phase = 'summary';
      state.teacher.directions = 'Explain a recommendation. Reply to two classmates.';
      state.teacher.learningGoal = 'Compare evidence and explain a choice.';
      state.teacher.mustStay = 'Keep the topic and due date.';
      await evaluate(
        'localStorage.setItem("promptcraft_next_opening_v1",' +
          JSON.stringify(JSON.stringify(state)) +
          ');location.reload()',
      );
      await waitFor('!!document.querySelector("[data-action=start-design]")');
      await click('start-design');
      await fill('concern', 'Students can complete the task without examining another idea.');
      await shot(device + '-concern');
      await click('design-next');
      await evaluate(
        '(()=>{const el=document.querySelector("[value=evidence]");el.checked=true;el.dispatchEvent(new Event("change",{bubbles:true}));})()',
      );
      await fill('notes', 'The peer brings evidence that helps students test a recommendation.');
      await click('design-next');
      await click('use-starter');
      assert.match(
        await evaluate('document.querySelector("#revision").value'),
        /Compare a classmate/,
      );
      const beforeAi = await evaluate('document.querySelector("#revision").value');
      failNextAi = true;
      await click('ask-ai');
      assert(
        await evaluate('!!document.querySelector(".babbage-progress[role=progressbar]")'),
        device + ' loading bar appears during request',
      );
      assert(
        await evaluate(
          '!document.querySelector(".babbage-progress").hasAttribute("aria-valuenow")',
        ),
        'Waiting indicator does not claim a server percentage',
      );
      await shot(device + '-babbage-loading');
      await waitFor('document.querySelector(".ai-status").textContent.includes("usage limit")');
      assert.equal(
        await evaluate('document.querySelector("#revision").value'),
        beforeAi,
        'AI errors preserve draft',
      );
      const clarify = async () => {
        await click('ask-ai');
        await waitFor('!!document.querySelector("[data-clarification-answer]")');
        assert(
          await evaluate('!document.querySelector("[data-action=apply-ai]")'),
          'No revision before clarification',
        );
        await evaluate(
          'document.querySelectorAll("[data-clarification-answer]").forEach(el=>{el.value="Revise or defend the recommendation using the reply.";el.dispatchEvent(new Event("input",{bubbles:true}));})',
        );
        await click('send-clarification');
        await waitFor('!!document.querySelector("[data-action=generate-ai]")');
      };
      await clarify();
      await evaluate('location.reload()');
      await waitFor('!!document.querySelector("[data-action=generate-ai]")');
      await waitFor('!document.querySelector("[data-action=generate-ai]").disabled');
      await click('generate-ai');
      await waitFor('!!document.querySelector("[data-action=apply-ai]")');
      assert.equal(
        await evaluate('document.querySelector("#revision").value'),
        beforeAi,
        'Suggestion does not replace draft automatically',
      );
      await click('dismiss-ai');
      assert.equal(await evaluate('document.querySelector("#revision").value'), beforeAi);
      await click('generate-ai');
      await fill('revision', 'My newer draft.');
      await waitFor('document.querySelector(".ai-status").textContent.includes("changed while")');
      assert.equal(
        await evaluate('document.querySelector("#revision").value'),
        'My newer draft.',
        'Delayed AI does not overwrite edits',
      );
      await clarify();
      await click('generate-ai');
      await waitFor('!!document.querySelector("[data-action=apply-ai]")');
      await shot(device + '-ai-suggestion');
      await click('design-next');
      assert(
        await evaluate('!!document.querySelector("[data-action=apply-ai]")'),
        'Review requires an explicit choice about the suggestion',
      );
      assert(
        await evaluate(
          'document.querySelector(".ai-status").textContent.includes("include the suggestion")',
        ),
      );
      await click('apply-ai');
      assert.equal(await evaluate('document.querySelector("#revision").value'), aiFixture.revision);
      assert.equal(await evaluate('document.querySelector("#reason").value'), aiFixture.reason);
      assert.equal(
        await evaluate(
          'JSON.parse(localStorage.getItem("promptcraft_next_opening_v1")).teacher.directions',
        ),
        state.teacher.directions,
        'AI preserves original assignment',
      );
      await fill('reason', 'Students use a reply to reconsider their reasons.');
      await shot(device + '-draft');
      await click('design-next');
      assert.equal(
        await evaluate('document.querySelectorAll(".design-comparison section").length'),
        2,
      );
      assert(
        await evaluate(
          'document.querySelector(".comparison-card--revised").textContent.includes("Compare a classmate’s evidence")',
        ),
        'Applied revision appears in before and after',
      );
      assert(
        await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),
        device + ' no horizontal overflow',
      );
      if (device === 'desktop') {
        assert(
          await evaluate('document.documentElement.scrollHeight<=innerHeight+1'),
          device + ' fits viewport',
        );
        assert(
          await evaluate(
            '(()=>{const b=document.querySelector(".setup-actions").getBoundingClientRect();return b.bottom<=innerHeight&&b.top>=0})()',
          ),
          device + ' navigation visible',
        );
      } else
        assert(
          await evaluate('getComputedStyle(document.body).overflow!=="hidden"'),
          device + ' scrolling enabled',
        );
      await shot(device + '-review');
      await click('design-next');
      assert(await evaluate('document.querySelector("[data-action=approve-version]").disabled'));
      await evaluate(
        'document.querySelectorAll("[data-final-check]").forEach(el=>{el.checked=true;el.dispatchEvent(new Event("change",{bubbles:true}));})',
      );
      assert(await evaluate('!document.querySelector("[data-action=approve-version]").disabled'));
      await click('preview-guide');
      assert(await evaluate('document.querySelector(".guide-preview").open'));
      assert(
        await evaluate(
          'document.querySelector(".guide-preview iframe").srcdoc.includes("Draft preview")',
        ),
      );
      assert(
        await evaluate(
          'document.querySelector(".guide-preview iframe").srcdoc.includes("The lemonade example")',
        ),
      );
      await waitFor(
        'document.querySelector(".guide-preview iframe").srcdoc.includes("data:image/svg+xml")',
      );
      assert(
        await evaluate(
          'document.querySelector(".guide-preview iframe").srcdoc.includes("Discussion boards")',
        ),
      );
      await shot(device + '-guide-preview');
      await evaluate('document.querySelector(".guide-preview button").click()');
      await waitFor('!document.querySelector(".guide-preview")');
      await click('approve-version');
      await evaluate('location.reload()');
      await waitFor('!!document.querySelector("[data-action=approve-version]")');
      assert(
        await evaluate(
          'JSON.parse(localStorage.getItem("promptcraft_next_opening_v1")).finalCheck.approved',
        ),
      );
      await shot(device + '-final-check');
      await click('approve-version');
      assert(
        await evaluate(
          'document.querySelector("#setup-title").textContent.includes("Make the conversation count")',
        ),
      );
      assert(
        await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),
        device + ' closing screen fits horizontally',
      );
      await shot(device + '-pixel-closing');
      await evaluate('location.reload()');
      await waitFor('!!document.querySelector("[data-action=return-assignment]")');
      await click('return-assignment');
      await waitFor('!!document.querySelector("[data-action=edit-draft]")');
      await click('edit-draft');
      assert.match(
        await evaluate('document.querySelector("#revision").value'),
        /Compare a classmate/,
      );
      await evaluate('location.reload()');
      await waitFor('!!document.querySelector("#revision")');
      assert.equal(
        await evaluate('document.querySelector("#reason").value'),
        'Students use a reply to reconsider their reasons.',
      );
      await click('toggle-dev');
      assert(
        await evaluate(
          'document.querySelector(".babbage-mode").textContent.includes("no API call")',
        ),
      );
      const callsBeforeDev = babbageCalls;
      await clarify();
      await click('generate-ai');
      await waitFor('!!document.querySelector("[data-action=apply-ai]")');
      assert.equal(babbageCalls, callsBeforeDev, 'Dev fallback makes no API calls');
      await shot(device + '-dev-fallback');
      const uncertain = initialState(scenario);
      uncertain.phase = 'design';
      uncertain.designStep = 2;
      uncertain.teacher.directions = 'Compare two explanations. Reply to one classmate.';
      uncertain.teacher.learningGoalUnsure = true;
      uncertain.babbage.mode = 'dev';
      uncertain.babbage.context = JSON.stringify({
        teacher: uncertain.teacher,
        design: uncertain.design,
      });
      await evaluate(
        'localStorage.setItem("promptcraft_next_opening_v1",' +
          JSON.stringify(JSON.stringify(uncertain)) +
          ');location.reload()',
      );
      await waitFor('!!document.querySelector("[data-action=ask-ai]")');
      await click('ask-ai');
      await waitFor('!!document.querySelector("#learning-goal")');
      await evaluate(
        'document.querySelectorAll("[data-clarification-answer]").forEach(el=>{el.value=el.id==="learning-goal"?"Compare evidence and explain a choice.":"Use evidence from the reply to revise or defend.";el.dispatchEvent(new Event("input",{bubbles:true}));})',
      );
      await evaluate('location.reload()');
      await waitFor('!!document.querySelector("#learning-goal")');
      assert.equal(
        await evaluate('document.querySelector("#learning-goal").value'),
        'Compare evidence and explain a choice.',
        'Clarification answers survive reload',
      );
      await click('send-clarification');
      await waitFor('!!document.querySelector("[data-action=generate-ai]")');
      assert.equal(
        await evaluate(
          'JSON.parse(localStorage.getItem("promptcraft_next_opening_v1")).teacher.learningGoalUnsure',
        ),
        false,
        'Clarification resolves unsure learning goal',
      );
      const opening = initialState(scenario);
      opening.sceneId = 'spot-hole';
      await evaluate(
        'localStorage.setItem("promptcraft_next_opening_v1",' +
          JSON.stringify(JSON.stringify(opening)) +
          ');location.reload()',
      );
      await waitFor('document.querySelectorAll(".service-flow .lemonade-visual").length===3');
      assert(
        await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),
        device + ' illustrated smartboard has no horizontal overflow',
      );
      if (device === 'desktop')
        assert(
          await evaluate(
            'document.querySelector(".board-note").getBoundingClientRect().bottom<=document.querySelector(".board-screen").getBoundingClientRect().bottom',
          ),
          'Illustrations fit the smartboard',
        );
      await shot(device + '-lemonade-board');
      for (const scene of scenario.scenes) {
        const sceneState = { ...opening, sceneId: scene.id };
        await evaluate(
          'localStorage.setItem("promptcraft_next_opening_v1",' +
            JSON.stringify(JSON.stringify(sceneState)) +
            ');location.reload()',
        );
        await waitFor('!!document.querySelector(".speech-bubble")');
        if (width <= 1180 || height <= 820) {
          assert.equal(
            await evaluate(`Array.from(document.querySelectorAll('.character'))
            .filter(el => getComputedStyle(el).display !== 'none').length`),
            width > 700 && height >= 550 ? 2 : 1,
            device + ' shows the appropriate cast for its viewport',
          );
        }
        assert(
          await evaluate(`(() => {
          const bubble = document.querySelector('.speech-bubble').getBoundingClientRect();
          const board = document.querySelector('.smartboard').getBoundingClientRect();
          return bubble.right <= board.left || bubble.left >= board.right ||
            bubble.bottom <= board.top || bubble.top >= board.bottom;
        })()`),
          device + ' dialogue clears smartboard: ' + scene.id,
        );
        if ((width <= 700 || height < 550) && (width <= 1180 || height <= 820)) {
          assert.equal(
            await evaluate(`(() => {
              const portrait = document.querySelector('.cast').getBoundingClientRect();
              const speech = document.querySelector('.speech-bubble').getBoundingClientRect();
              return portrait.left > speech.left;
            })()`),
            scene.speaker === 'pixel',
            device + ' places the speaker on their side: ' + scene.id,
          );
        }
        if (width > 700 && height >= 550 && (width <= 1180 || height <= 820)) {
          if (height > 820) {
            assert(
              await evaluate(`(() => {
                const board = document.querySelector('.smartboard').getBoundingClientRect();
                const bubble = document.querySelector('.speech-bubble').getBoundingClientRect();
                const speaker = document.querySelector('.character.is-speaking').getBoundingClientRect();
                const room = document.querySelector('.classroom').getBoundingClientRect();
                return board.width > board.height && bubble.bottom <= speaker.top + 1 &&
                  (speaker.left < room.left + room.width / 2
                    ? bubble.left < room.left + room.width / 2
                    : bubble.right > room.left + room.width / 2);
              })()`),
              device + ' uses a wide board with dialogue above its speaker: ' + scene.id,
            );
          }
          assert(
            await evaluate(`(() => {
              const maya = document.querySelector('.character--left').getBoundingClientRect();
              const pixel = document.querySelector('.character--right').getBoundingClientRect();
              const room = document.querySelector('.classroom').getBoundingClientRect();
              return maya.height > 0 && pixel.height > 0 && maya.right <= pixel.left &&
                maya.bottom <= room.bottom + 1 && pixel.bottom <= room.bottom + 1;
            })()`),
            device + ' keeps Maya left and Pixel right: ' + scene.id,
          );
          assert(
            await evaluate(`(() => {
              const room = document.querySelector('.classroom').getBoundingClientRect();
              const board = document.querySelector('.smartboard').getBoundingClientRect();
              const content = document.querySelector('.board-screen');
              const nav = document.querySelector('.scene-actions').getBoundingClientRect();
              return document.documentElement.scrollHeight <= innerHeight + 1 &&
                content.scrollHeight <= content.clientHeight + 1 &&
                board.top >= room.top - 1 && board.bottom <= room.bottom + 1 &&
                nav.bottom <= innerHeight + 1;
            })()`),
            device + ' fits the complete scene without scrolling: ' + scene.id,
          );
        }
      }
      const savedBeforeCancel = await evaluate(
        'localStorage.getItem("promptcraft_next_opening_v1")',
      );
      for (const phase of ['setup', 'summary']) {
        for (let step = 0; step < 3; step++) {
          const setupState = { ...state, phase, setupStep: step };
          await evaluate(
            'localStorage.setItem("promptcraft_next_opening_v1",' +
              JSON.stringify(JSON.stringify(setupState)) +
              ');location.reload()',
          );
          await waitFor('!!document.querySelector("[data-setup-form]")');
          if (phase === 'summary')
            await evaluate(
              'document.querySelectorAll("[data-summary-section]")[' + step + '].click()',
            );
          assert(
            await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),
            device + ' setup fits horizontally: ' + phase + step,
          );
          await evaluate(
            'document.querySelector(".setup-actions .primary").scrollIntoView({block:"center"})',
          );
          assert(
            await evaluate(`(() => {
            const button=document.querySelector('.setup-actions .primary').getBoundingClientRect();
            return button.top>=0 && button.bottom<=innerHeight+1;
          })()`),
            device + ' setup navigation remains reachable: ' + phase + step,
          );
          await shot(device + '-' + phase + '-' + step);
        }
      }
      await evaluate(
        'localStorage.setItem("promptcraft_next_opening_v1",' +
          JSON.stringify(savedBeforeCancel) +
          ');location.reload()',
      );
      await waitFor('!!document.querySelector(".speech-bubble")');
      const savedForCancel = await evaluate('localStorage.getItem("promptcraft_next_opening_v1")');
      await click('restart-module');
      await waitFor('document.querySelector(".restart-dialog")?.open');
      assert(
        await evaluate('document.activeElement.value === "cancel"'),
        'Keep my work is focused first',
      );
      await shot(device + '-restart-confirmation');
      await evaluate('document.querySelector(".restart-dialog button[value=cancel]").click()');
      await waitFor('!document.querySelector(".restart-dialog")');
      assert.equal(
        await evaluate('localStorage.getItem("promptcraft_next_opening_v1")'),
        savedForCancel,
      );
      const restartFixture = { ...state, phase: 'design', designStep: 2 };
      await evaluate(
        'localStorage.setItem("promptcraft_next_opening_v1",' +
          JSON.stringify(JSON.stringify(restartFixture)) +
          ');localStorage.setItem("unrelated-test-key","keep");location.reload()',
      );
      await waitFor(
        '!!document.querySelector("[data-action=ask-ai]") && !document.querySelector("[data-action=ask-ai]").disabled',
      );
      await click('ask-ai');
      await waitFor('!!document.querySelector(".babbage-loading")');
      await click('restart-module');
      await evaluate('document.querySelector("[data-action=confirm-restart]").click()');
      await waitFor('!!document.querySelector("#scene-title")');
      await pause(1500);
      const restarted = await evaluate(
        'JSON.parse(localStorage.getItem("promptcraft_next_opening_v1"))',
      );
      assert.equal(restarted.phase, 'opening');
      assert.equal(restarted.sceneId, scenario.scenes[0].id);
      assert.equal(restarted.teacher.directions, '');
      assert.equal(restarted.design.revision, '');
      assert.deepEqual(restarted.answers, {});
      assert.deepEqual(restarted.babbage.history, []);
      assert.equal(await evaluate('localStorage.getItem("unrelated-test-key")'), 'keep');
      await evaluate('location.reload()');
      await waitFor('!!document.querySelector("#scene-title")');
      assert(
        await evaluate('document.querySelector("[data-action=back]").disabled'),
        'Reload stays at the beginning',
      );
      assert(
        await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),
        'Restart action fits the header',
      );
      console.log(device + ' PASS: design flow, starter, edits, Back, reload, responsive layout.');
    }
    assert.deepEqual(errors, []);
  } finally {
    socket?.close();
    chrome.kill();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});
