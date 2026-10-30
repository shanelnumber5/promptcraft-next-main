// Optional browser check using installed Chrome and Node's built-in WebSocket.
const fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  http = require('node:http'),
  assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const runDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'promptcraft-browser-'));
const output = process.env.PC_BROWSER_OUTPUT || path.join(runDirectory, 'screenshots');
// Feature harnesses share the same isolated output directory for their JSON audits.
process.env.PC_BROWSER_OUTPUT = output;
const profile = process.env.PC_BROWSER_PROFILE || path.join(runDirectory, 'profile');
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};
const auditRecords = [];
let failNextAi = false;
let babbageCalls = 0;
const aiFixture = {
  revision:
    '### Peer exchange\n\n1. **First post:** Explain a recommendation.\n2. **Reply:** Compare a classmate’s evidence.\n   - Explain what it reveals.\n3. **Follow-up:** Revise or defend your recommendation.',
  reason: 'The reply helps students test their reasons.',
  questions: 'Check your due date before approving.',
};
aiFixture.revision += "\n\n### Timing\nPost by Thursday and follow up by Sunday.\n\n### What to submit\nInclude your recommendation and peer response.";
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
      const isWorkspace = Boolean(JSON.parse(body.messages[0].content).workspace);
      const isMaya = body.system.startsWith('You are Maya,');
      const current = isMaya ? JSON.parse(body.messages.at(-2).content) : {};
      // Match the visible text even when the editor serializes a line as a heading.
      const visibleRevision = (current.design?.revision || '').replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim();
      const mayaResponse = visibleRevision.includes('Compare two staffing schedules.')
        ? '“Compare two staffing schedules.” gives me a specific decision to work through. I can explain which plan seems fair and why. The starting idea was broad; now I know what I would produce. I would want to know which staffing details I should use.'
        : visibleRevision.includes('Follow-up due Sunday.')
        ? 'The new directions say “Follow-up due Sunday.” That answers my earlier timing question. I still need to compare a classmate’s evidence and explain what I learned from it, but now I can plan when to return to the discussion.'
        : visibleRevision.includes('Choose a metaphor')
        ? '“Choose a metaphor in the poem” gives me somewhere to start. Before, I could just agree with two people. Now I need two lines to explain my reading, so I have something specific to discuss. Which poem are we using?'
        : visibleRevision.includes('Compare two t-test outputs')
          ? 'Now I need to “Compare two t-test outputs” and have someone check an assumption instead of just replying twice. I can see what I would work on with a classmate. Where do I get the outputs?'
          : 'The old directions let me finish and reply twice. Now I need to “Compare a classmate’s evidence” and explain what it reveals. That gives me a reason to read carefully. I would want to know when the follow-up is due before I plan my week.';
      const explore = JSON.parse(body.messages.at(-1).content).explore_three_directions === true;
      const creativeFixture = {version:1,directions:['Investigate conflicting evidence','Negotiate competing priorities','Trace a decision’s consequences'].map((experience,index)=>({title:'Possibility '+index,description:'A brief creative sketch '+index,experience,learning:'Defend management decisions with evidence.',online:'Use an asynchronous LMS exchange.',core:'Protect the distinctive mechanism '+index}))};
      const intent = JSON.parse(body.messages.at(-1).content).request_intent;
      const answered = body.messages.some(
        (turn) => turn.role === 'user' && turn.content.includes('clarification_answers'),
      );
      const fail = failNextAi;
      failNextAi = false;
      const data = {
        status: 'ok',
        analysis: {
          feedback_summary: explore ? JSON.stringify(creativeFixture) : isMaya ? JSON.stringify({version:1,
            maya:{emotion: visibleRevision.includes('staffing') || visibleRevision.includes('Sunday') ? 'pleased' : 'thoughtful', text:mayaResponse},
            pixel:{emotion:'thoughtful', text: visibleRevision.includes('staffing')
              ? '“Compare two staffing schedules.” asks students to weigh options and explain a decision. Maya can see a practical purpose. Check whether the supplied case gives students enough information to justify the tradeoff.'
              : `The requirement “${[...mayaResponse.matchAll(/[“]([^”]+)[”]/g)][0][1]}” gives students a concrete task. Maya’s reaction can help you examine clarity and purpose, but it does not establish learning. Consider whether the directions explain what students should do with the comparison.`}
          }) : answered
            ? 'You can generate a revision.'
            : isWorkspace ? 'Which time or resource constraint should this activity preserve?' : 'Please clarify the follow-up.',
          input_quality: {
            usable: isMaya || answered,
            concerns: isMaya || answered ? [] : [isWorkspace ? 'Which time or resource constraint should this activity preserve?' : 'What should students do after receiving a reply?'],
          },
          revised_discussion_prompt: intent === 'revise' ? (isWorkspace ? '### Staffing decision\n\n1. Compare two staffing schedules.\n2. Recommend a fair plan using the supplied workplace case.\n3. Explain a tradeoff and how you would check the plan.' : aiFixture.revision) : '',
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
  console.log('Browser test output: ' + output);
  await new Promise((resolve) => server.listen(8783, '127.0.0.1', resolve));
  const chrome = spawn(
    require('./chrome-path.cjs')(),
    [
      '--headless=new',
      '--disable-gpu',
      ...(process.env.PC_BROWSER_SANDBOX_WORKAROUND === '1' ? ['--no-sandbox', '--in-process-gpu'] : []),
      '--in-process-gpu',
      '--no-first-run',
      '--disable-background-networking',
      '--remote-debugging-port=9223',
      '--user-data-dir=' + profile,
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
        target = (await (await fetch('http://127.0.0.1:9223/json/list', { signal: AbortSignal.timeout(1000) })).json()).find(
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
        errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.id) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        message.error
          ? request.reject(Error(message.error.message))
          : request.resolve(message.result);
      }
    };
    const send = (method, params = {}, sessionId) =>
      new Promise((resolve, reject) => {
        const id = ++serial;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params, sessionId }));
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
    const key = async (key, code, virtualKey, modifiers = 0) => {
      for (const type of ['keyDown', 'keyUp'])
        await send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: virtualKey, modifiers,
          ...(type === 'keyDown' && ['Enter', ' '].includes(key) ? { text: key === 'Enter' ? '\r' : ' ', unmodifiedText: key === 'Enter' ? '\r' : ' ' } : {}),
        });
    };
    const keyboardReach = async (selector) => {
      for (let i = 0; i < 45; i++) {
        if (await evaluate(`document.activeElement.matches(${JSON.stringify(selector)})`)) return;
        await key('Tab', 'Tab', 9);
      }
      throw Error('Keyboard could not reach ' + selector + ': ' + JSON.stringify(await evaluate('({active:document.activeElement.outerHTML.slice(0,240),title:document.querySelector("h1")?.textContent,actions:[...document.querySelectorAll("[data-action]")].map(el=>({action:el.dataset.action,disabled:el.disabled}))})')));
    };
    const accessibleScreen = async (label) => {
      const issues = await evaluate(`(() => {
        const issues = [];
        const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
        if (new Set(ids).size !== ids.length) issues.push('Duplicate IDs');
        for (const el of document.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls]'))
          for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls'])
            for (const id of (el.getAttribute(attr) || '').split(/\\s+/).filter(Boolean))
              if (!document.getElementById(id)) issues.push('Missing ' + attr + ': ' + id);
        for (const el of document.querySelectorAll('input:not([type=hidden]), textarea, [role=textbox]'))
          if (!el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'))
            issues.push('Unnamed input: ' + (el.id || el.name));
        if (document.querySelector('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])'))
          issues.push('Unexpected positive tab order');
        return issues;
      })()`);
      assert.deepEqual(issues, [], label + ' labels and ARIA references');
      const { nodes } = await send('Accessibility.getFullAXTree');
      for (const node of nodes.filter(node => !node.ignored && ['button', 'textbox', 'radio', 'checkbox', 'tab', 'dialog'].includes(node.role?.value)))
        assert(node.name?.value?.trim(), label + ' accessible name: ' + node.role.value);
    };
    const shot = async (label) => {
      await evaluate('Promise.all(document.getAnimations().filter(animation => animation.effect.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})))');
      const data = await send('Page.captureScreenshot', { captureBeyondViewport: false });
      fs.writeFileSync(path.join(output, label + '.png'), Buffer.from(data.data, 'base64'));
      const layoutIssues = await evaluate(`(() => {
        const issues = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) issues.push('Page overflows horizontally');
        for (const button of document.querySelectorAll('button')) {
          const rect = button.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          if (button.scrollWidth > button.clientWidth + 2 || button.scrollHeight > button.clientHeight + 2)
            issues.push('Clipped button: ' + button.innerText.trim() + ' (' + button.scrollWidth + '×' + button.scrollHeight + ' in ' + button.clientWidth + '×' + button.clientHeight + ')');
          if (button.closest('.app-header') && (rect.left < 0 || rect.right > innerWidth + 1))
            issues.push('Header button falls outside viewport: ' + button.innerText.trim());
        }
        for (const dialog of document.querySelectorAll('dialog[open]'))
          if (dialog.scrollWidth > dialog.clientWidth + 2) issues.push('Dialog overflows horizontally: ' + dialog.className);
        if (document.querySelector('dialog[open]') && getComputedStyle(document.documentElement).overflowY !== 'hidden')
          issues.push('Background remains scrollable behind modal');
        return issues;
      })()`);
      assert.deepEqual(layoutIssues, [], label + ' formatting audit');
      if (process.env.PC_CONTRAST_AUDIT === '1') {
        const contrast = await require('./contrast-checks.cjs')(evaluate);
        fs.writeFileSync(path.join(output, label + '-contrast.json'), JSON.stringify(contrast, null, 2));
        if (process.env.PC_CONTRAST_STRICT === '1') assert.deepEqual(contrast.failures, [], label + ' contrast audit');
      }
      auditRecords.push({screen: label, ...await evaluate('({width: innerWidth, height: innerHeight})'), result: 'pass'});
    };
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `(()=>{const original=window.fetch.bind(window);window.fetch=(url,options)=>original(String(url).startsWith('https://promptcraft-discussion.netlify.app/.netlify/functions/babbage')?'/api/babbage':url,options);})()`,
    });
    if (['workspace-layout','scenario-studio'].includes(process.env.PC_BROWSER_FEATURE)) {
      await require('./workspace-layout-checks.cjs')({send,evaluate,waitFor,shot,key,keyboardReach,accessibleScreen,scenarioMode:process.env.PC_BROWSER_FEATURE==='scenario-studio'});
    } else if (process.env.PC_BROWSER_FEATURE === 'lab') {
      await require('./idea-lab-browser-checks.cjs')({send,evaluate,waitFor,key,keyboardReach,accessibleScreen,shot});
    } else throw Error('Choose the shared-routes or idea-lab browser test entry point.');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'responsive-audit.json'), JSON.stringify({browser:'Chrome',screens:auditRecords},null,2));
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
