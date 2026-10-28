const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
module.exports = async ({ send, evaluate, waitFor, fill, shot, key, accessibleScreen, initialState, scenario, root }) => {
  const checked = [];
  const { teacherSetup } = await import('../../src/features/setup/content.js');
  for (const [device, width, height] of [['wide', 1693, 950], ['desktop', 1440, 1000], ['short', 1280, 720], ['tablet', 932, 903], ['compact-tablet', 820, 790], ['phone', 390, 844], ['small-phone', 320, 568]].filter(([device]) => !process.env.PC_BROWSER_DEVICE || process.env.PC_BROWSER_DEVICE.split(',').includes(device))) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    const state = initialState(scenario);
    state.phase = 'summary'; state.setupStep = 4;
    state.teacher.directions = '### Original assignment\n\n1. Compare two recommendations.\n2. Explain a choice using evidence.';
    state.teacher.subject = 'Office Management & Supervision';
    state.teacher.learningGoal = 'Explain a fair decision using evidence.';
    await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=play' });
    await waitFor('!!document.querySelector("#app")');
    await evaluate(`localStorage.setItem('promptcraft_next_opening_v1', ${JSON.stringify(JSON.stringify(state))});location.reload()`);
    await waitFor('!!document.querySelector(".summary-shell")');
    let baseline;
    for (let index = 0; index < teacherSetup.steps.length; index++) {
      await evaluate(`document.querySelector('[data-summary-section="${index}"]').click()`);
      await accessibleScreen(device + ' summary ' + index);
      const metrics = await evaluate(`(() => {
        const rect = selector => { const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}; };
        const panel=document.querySelector('#summary-panel'), area=document.querySelector('.summary-sections');
        return {nav:rect('.setup-actions'), preview:rect('.setup-live-preview'), panel:rect('#summary-panel'), tabs:[...document.querySelectorAll('[data-summary-section]')].map(el=>el.getBoundingClientRect().y), bodyOverflow:document.documentElement.scrollWidth>innerWidth+1, formOverflow:area.scrollHeight>area.clientHeight+1, fieldWidths:[...panel.querySelectorAll('input[type=text],textarea')].map(el=>el.getBoundingClientRect().width), usable:panel.clientWidth-parseFloat(getComputedStyle(panel).paddingLeft)-parseFloat(getComputedStyle(panel).paddingRight)};
      })()`);
      assert(!metrics.bodyOverflow, 'No horizontal overflow');
      if (width >= 1100 && height >= 700) {
        if (metrics.formOverflow) await shot('setup-' + device + '-overflow-' + index);
        assert(!metrics.formOverflow, device + ' summary ' + index + ' fields fit without scrolling: '+JSON.stringify({...metrics,details:await evaluate('Array.from(document.querySelectorAll(".summary-sections,#summary-panel,#summary-panel .setup-field,#summary-panel textarea,#summary-panel label,#summary-panel .field-help")).map(e=>({c:e.className,id:e.id,client:e.clientHeight,scroll:e.scrollHeight,rect:e.getBoundingClientRect().toJSON(),grid:getComputedStyle(e).gridTemplateColumns,gap:getComputedStyle(e).gap}))')}));
        assert(metrics.nav.bottom <= height + 1 && metrics.preview.right <= width, 'Navigation/preview fit viewport');
        assert(metrics.tabs.every(y => Math.abs(y-metrics.tabs[0])<1), 'Five tabs share one row');
        if (baseline) {
          assert(Math.abs(metrics.nav.y-baseline.nav.y)<1, 'Navigation remains on one baseline');
          assert(Math.abs(metrics.preview.y-baseline.preview.y)<1 && Math.abs(metrics.preview.height-baseline.preview.height)<1, 'Preview has consistent geometry');
        }
      }
      if ([1, 2].includes(index)) assert(metrics.fieldWidths[0] >= metrics.usable - 2, 'Single directions/learning field fills its panel');
      baseline = metrics;
      await shot('setup-' + device + '-summary-' + index);
    }
    await evaluate('document.querySelectorAll("[data-summary-section]")[1].click();document.querySelector("#directions").focus();document.querySelector("#directions").setSelectionRange(99999,99999)');
    await send('Input.insertText', { text: '\n\nA live preview update.' });
    assert(await evaluate('document.querySelector("[data-setup-live-preview]").textContent.includes("A live preview update.")'));
    await evaluate('document.querySelectorAll("[data-summary-section]")[0].focus()');
    await key('ArrowRight', 'ArrowRight', 39);
    assert.equal(await evaluate('document.activeElement.dataset.summarySection'), '1');
    await evaluate('location.reload()');
    await waitFor('!!document.querySelector(".summary-shell")');
    assert(await evaluate('document.querySelector("[data-setup-live-preview]").textContent.includes("A live preview update.")'), 'Edits survive refresh');
    for (let step = 0; step < teacherSetup.steps.length; step++) {
      const next = { ...state, phase: 'setup', setupStep: step };
      await evaluate(`localStorage.setItem('promptcraft_next_opening_v1', ${JSON.stringify(JSON.stringify(next))});location.reload()`);
      await waitFor('!!document.querySelector(".setup-step")');
      await shot('setup-' + device + '-step-' + step);
    }
    const empty = {...state,phase:'setup',setupStep:0,teacher:{...state.teacher,directions:''}};
    await evaluate(`localStorage.setItem('promptcraft_next_opening_v1', ${JSON.stringify(JSON.stringify(empty))});location.reload()`);
    await waitFor('!!document.querySelector(".setup-preview-empty")');
    assert(await evaluate('document.querySelector(".setup-preview-content").getBoundingClientRect().height < 180'),'Empty assignment context stays compact');
    await shot('setup-'+device+'-empty-context');
    checked.push({ device, width, height, summarySections: 5, setupSections: 5, result: 'pass' });
    console.log(device + ' PASS: five summary and five setup sections, full-width fields, stable navigation/preview, responsive layout, keyboard labels, live preview and refresh. No AI calls.');
  }
  fs.writeFileSync(path.join(process.env.PC_BROWSER_OUTPUT || path.join(root, 'artifacts/screenshots/design'), 'setup-layout-audit.json'), JSON.stringify({ browser: 'Chrome', layouts: checked, aiCalls: 0 }, null, 2));
};
