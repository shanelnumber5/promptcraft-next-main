const assert = require('node:assert/strict');
module.exports = async ({
  send,
  evaluate,
  waitFor,
  shot,
  key,
  keyboardReach,
  accessibleScreen,
  scenarioMode = false,
}) => {
  const choose = (selector) =>
    evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  if (scenarioMode) {
    await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=home' });
    await waitFor('document.readyState==="complete"');
    await evaluate('localStorage.clear()');
    await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=play' });
    await waitFor('!!document.querySelector("[data-action=reveal-board]")');
    const scenes = await evaluate(
      `(async()=>{const {discussionOpening}=await import('/src/features/opening/content.js');return discussionOpening.scenes.map(scene=>({id:scene.id,answer:scene.choice?.options.find(option=>option.correct).id}));})()`,
    );
    for (let index = 0; index < scenes.length; index++) {
      assert(
        await evaluate(
          `document.querySelector('.navigation-progress').textContent.includes('Step ${index + 1} of ${scenes.length}')`,
        ),
        'Story shows the current step',
      );
      if (index === 0) {
        await keyboardReach('[data-action=reveal-board]');
        await key('Enter', 'Enter', 13);
      } else await choose('[data-action=reveal-board]');
      if (scenes[index].answer) {
        await choose('[data-action=reveal-question]');
        await choose('input[value="' + scenes[index].answer + '"]');
      }
      if (index < scenes.length - 1) await choose('[data-action=next]');
    }
    await choose('[data-action=start-design-studio]');
    await waitFor('!!document.querySelector(".workspace-shell")');
    assert(await evaluate('new URL(location.href).searchParams.get("view")==="scenario"'));
    assert(
      !(await evaluate('!!document.querySelector(".summary-shell,.setup-shell--teacher")')),
      'Opening hands off directly without the retired intake',
    );
  }
  for (const [device, width, height] of [
    ['desktop', 1280, 800],
    ['tablet', 820, 1024],
    ['phone', 390, 844],
    ['small-phone', 320, 568],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=home' });
    await waitFor('document.readyState==="complete"');
    await evaluate(`(async()=>{
      const {freshWorkspace,saveWorkspace}=await import('/src/features/workspace/storage.js');
      const {reviewFingerprint}=await import('/src/features/workspace/review-ai.js');
      localStorage.clear();
      const state=freshWorkspace();
      state.designPanel='revision';
      Object.assign(state.teacher,{directions:'Compare two case studies.',subject:'Introduction to management',learningGoal:'Evaluate competing evidence.',learnerLevel:'First-year students',aiUse:'No student AI use'});
      state.creative.mayaPaused=true; Object.assign(state.creative.rubric,{requested:false,criteria:'Evidence',basis:state.design.revision,rows:[{name:'Evidence',description:'Use the supplied case.',points:100,ratings:['Supports a choice.','Partly supports a choice.','No support.']}]});
      Object.assign(state.design,{sourceDirections:state.teacher.directions,revision:'Compare the evidence, choose a response, and explain your reasoning.',reason:'Make students’ reasoning visible.'});
      state.creative.review={fingerprint:reviewFingerprint(state),feedback:'Which evidence would help students test their decision?',status:'complete',error:'',offeredMaya:'',perspectivesComplete:true};
      ${scenarioMode ? "state.experience='scenario';const {saveScenarioStudio}=await import('/src/features/workspace/scenario-storage.js');saveScenarioStudio(state);" : 'saveWorkspace(state);'}
    })()`);
    await send('Page.navigate', {
      url: 'http://127.0.0.1:8783/?view=' + (scenarioMode ? 'scenario' : 'workspace'),
    });
    await waitFor('!!document.querySelector(".workspace-section-sidebar")');
    const sidebar = await evaluate(
      '[...document.querySelectorAll(".workspace-section-sidebar button")].map(el=>el.dataset.designPage)',
    );
    assert.deepEqual(sidebar, [
      'start',
      'subject',
      'ai-use',
      'sharing',
      'intentions',
      'presence',
      'draft',
    ]);
    assert(
      await evaluate(
        `(()=>{const selected=document.querySelector('.workspace-tabs [aria-selected=true]');const secondary=document.querySelector('.workspace-section-sidebar [aria-current=page]');return getComputedStyle(selected).backgroundColor==='rgb(217, 143, 6)' && getComputedStyle(secondary).backgroundColor==='rgba(0, 0, 0, 0)' && !document.querySelector('details');})()`,
      ),
      'One dominant stage system, quiet section navigation, and no accordions',
    );
    await keyboardReach('.header-actions a[href="?view=home"]');
    assert(
      await evaluate(
        `getComputedStyle(document.activeElement).outlineColor==='rgb(30, 45, 89)' && parseFloat(getComputedStyle(document.activeElement).outlineWidth)>=3`,
      ),
      'Quiet header controls retain visible keyboard focus',
    );
    await keyboardReach('[data-workspace-panel=revision]');
    await key('ArrowRight', 'ArrowRight', 39);
    assert(
      await evaluate(
        `document.activeElement.matches('[data-workspace-panel=reason][aria-selected=true]')`,
      ),
      'Stage navigation supports arrow keys and retains focus',
    );
    await key('ArrowLeft', 'ArrowLeft', 37);
    let desktopFooter;
    const sameFooter = async (label) => {
      const bars = await evaluate(
        '[...document.querySelectorAll("#workspace-panel .workspace-action-bar")].map(el=>({...el.getBoundingClientRect().toJSON(),y:el.getBoundingClientRect().y+scrollY}))',
      );
      assert.equal(bars.length, 1, `${label}: one main gold bar`);
      assert(bars[0].height >= 72, `${label}: comfortable action bar`);
      assert(
        await evaluate(
          `(()=>{const bar=document.querySelector('#workspace-panel .workspace-action-bar');const r=bar.getBoundingClientRect();return [...bar.querySelectorAll('button,a')].every(el=>{const b=el.getBoundingClientRect();return b.left>=r.left && b.right<=r.right+1 && b.top>=r.top && b.bottom<=r.bottom+1;});})()`,
        ),
        `${label}: every footer action is visible`,
      );
      desktopFooter ??= bars[0];
      for (const property of ['bottom'])
        assert(
          Math.abs(bars[0][property] - desktopFooter[property]) < 3,
          `${label}: stable gold bar ${property} (${bars[0][property]} vs ${desktopFooter[property]})`,
        );
    };
    for (const page of sidebar) {
      await choose(`[data-design-page="${page}"]`);
      if (page === 'ai-use')
        assert(
          await evaluate(
            `!document.querySelector('dialog[open]') && !!document.querySelector('[name=aiUse]')`,
          ),
          'AI-use choices are inline',
        );
      const layout = await evaluate(`(()=>{
        const footer=document.querySelector('.workspace-section-main .workspace-view-actions');
        const panel=document.getElementById('workspace-panel');
        return {width:document.documentElement.scrollWidth,viewport:innerWidth,
          footer:footer.getBoundingClientRect().toJSON(),panel:panel.getBoundingClientRect().toJSON(),
          nav:[...document.querySelectorAll('.workspace-section-sidebar button')].map(el=>({size:parseFloat(getComputedStyle(el).fontSize),height:el.getBoundingClientRect().height})),
          current:document.querySelectorAll('.workspace-section-sidebar [aria-current="page"]').length,
          fields:[...document.querySelectorAll('.build-page-fields input,.build-page-fields textarea,.build-page-fields select')].map(el=>({id:el.id||el.name,width:el.getBoundingClientRect().width}))};
      })()`);
      assert(layout.width <= layout.viewport, `${device}/${page}: no document overflow`);
      assert.equal(layout.current, 1);
      for (const item of width > 700 ? layout.nav : [])
        assert(
          item.size >= 16 && item.height >= 44,
          `${device}/${page}: readable navigation and targets`,
        );
      if (width <= 700) {
        assert.equal(
          await evaluate('document.getElementById("workspace-section-picker").value'),
          page,
          'Mobile chooser identifies the current section',
        );
        assert(
          await evaluate(
            'document.getElementById("workspace-section-picker").getBoundingClientRect().height>=44',
          ),
          'Mobile chooser is a comfortable touch target',
        );
        await evaluate(
          `(()=>{const picker=document.getElementById('workspace-section-picker');picker.value=${JSON.stringify(page)};picker.dispatchEvent(new Event('change',{bubbles:true}));})()`,
        );
        assert.equal(
          await evaluate('document.activeElement.id'),
          'workspace-section-picker',
          'Choosing a section retains focus',
        );
      }
      for (const field of layout.fields)
        assert(field.width > 0, `${device}/${page}: visible field ${field.id}`);
      assert(
        Math.abs(layout.footer.bottom - layout.panel.bottom) < 3,
        `${device}/${page}: footer at panel bottom ${JSON.stringify({ footer: layout.footer, panel: layout.panel })}`,
      );
      await sameFooter(`${device}/build/${page}`);
      if (page === 'ai-use')
        assert(
          await evaluate(
            '(()=>{const requirements=document.querySelector(".workspace-requirements");return requirements.getBoundingClientRect().width>0 && !!requirements.querySelector("[name=aiUse]");})()',
          ),
          `${device}: requirements span both columns`,
        );
      if (page === 'ai-use')
        assert(
          await evaluate(
            `(()=>{const end=Math.max(...[...document.querySelectorAll('.radio-cards label')].map(el=>el.getBoundingClientRect().bottom));return document.querySelector('.studio-rubric-choice').getBoundingClientRect().top>=end;})()`,
          ),
          'Requirements choices and rubric preference never overlap',
        );
      if (page === 'intentions' || page === 'presence') {
        const ids =
          page === 'intentions'
            ? ['creative-core', 'concern']
            : ['instructor-plan', 'open-questions'];
        assert(
          await evaluate(
            `(()=>{const first=document.getElementById(${JSON.stringify(ids[0])}).getBoundingClientRect();const second=document.getElementById(${JSON.stringify(ids[1])}).getBoundingClientRect();return second.top>first.bottom&&Math.abs(first.width-second.width)<2;})()`,
          ),
          `${device}/${page}: full-width answers are stacked in order`,
        );
      }
      assert(
        await evaluate(
          'getComputedStyle(document.getElementById("design-page-title")).fontFamily.startsWith("Georgia")',
        ),
        `${device}/${page}: Georgia task headings`,
      );
      await accessibleScreen(`${device}/${page}`);
      await shot(`layout-${device}-build-${page}`);
    }
    if (device === 'desktop') {
      await choose('[data-design-page=subject]');
      await evaluate(
        `(()=>{const el=document.getElementById('subject');el.value='Evidence design seminar';el.dispatchEvent(new Event('input',{bubbles:true}));})()`,
      );
      await choose('.studio-next [data-design-page=ai-use]');
      assert(
        await evaluate(
          `!document.querySelector('dialog[open]') && !!document.querySelector('[name=aiUse]')`,
        ),
        'Continue opens the inline requirements task',
      );
      await choose('.studio-back button');
      assert.equal(
        await evaluate('document.getElementById("subject").value'),
        'Evidence design seminar',
        'Back preserves the entered course',
      );
      await choose('[data-design-page=ai-use]');
      await evaluate(`document.querySelectorAll('[name=aiUse]')[1].click()`);
      assert.equal(
        await evaluate('document.getElementById("aiUseDetails").value'),
        'Brainstorming or feedback only; students write their own work.',
        'Changing a legacy AI choice does not retain a contradictory old policy',
      );
      await evaluate(
        `(()=>{const el=document.getElementById('aiUseDetails');el.value+=String.fromCharCode(10)+'Name the tool and verify every claim.';el.dispatchEvent(new Event('input',{bubbles:true}));document.querySelectorAll('[name=aiUse]')[2].click();document.querySelector('[data-rubric-preference]').click();})()`,
      );
      assert.equal(
        await evaluate('document.getElementById("aiUseDetails").value'),
        'AI drafting allowed; students verify claims and revise the output.\nName the tool and verify every claim.',
        'Changing AI choice preserves the educator’s custom instructions',
      );
      await choose('[data-workspace-panel=reason]');
      await choose('[data-review-page=checks]');
      assert(
        await evaluate(`!document.querySelector('dialog[open]')`),
        'Final checks do not reopen the saved rubric over the task',
      );
      await choose('[data-workspace-panel=revision]');
      await choose('[data-design-page=ai-use]');
      assert(
        await evaluate(
          `document.querySelector('[data-rubric-preference]').checked && document.querySelectorAll('[name=aiUse]')[2].checked`,
        ),
        'AI choices and rubric preference survive task navigation',
      );
      await require('./editor-controls-checks.cjs')({ evaluate, choose, scenarioMode });
    }
    await keyboardReach(
      width <= 700
        ? '#workspace-section-picker'
        : '.workspace-section-sidebar [data-design-page="subject"]',
    );
    const focus = await evaluate(
      '(()=>{const style=getComputedStyle(document.activeElement);return {color:style.outlineColor,width:parseFloat(style.outlineWidth)};})()',
    );
    assert.equal(focus.color, 'rgb(30, 45, 89)');
    assert(focus.width >= 3);
    if (width <= 700) {
      await key('Home', 'Home', 36);
      assert.equal(
        await evaluate('document.getElementById("workspace-section-picker").value'),
        'start',
        'Mobile section navigation works from the keyboard',
      );
    } else await key('Enter', 'Enter', 13);
    await choose('[data-workspace-panel="reason"]');
    for (const page of ['rationale', 'reasoning', 'rubric', 'checks']) {
      await choose(`[data-review-page="${page}"]`);
      await evaluate(
        `document.querySelector('[data-action=close-workspace-popup]')?.click();document.querySelector('[data-guide-close]')?.click();`,
      );
      assert(
        await evaluate('document.documentElement.scrollWidth<=innerWidth'),
        `${device}/${page}: no document overflow`,
      );
      assert.equal(await evaluate('document.querySelectorAll(".review-actions").length'), 1);
      await sameFooter(`${device}/review/${page}`);
      await accessibleScreen(`${device}/review/${page}`);
      await shot(`layout-${device}-review-${page}`);
    }
    await choose('[data-workspace-panel="babbage"]');
    await sameFooter(`${device}/explore`);
    if (width >= 820)
      assert(
        await evaluate('document.documentElement.scrollHeight<=innerHeight+1'),
        `${device}: workspace fits the browser height`,
      );
    await evaluate(
      'document.querySelector(".design-notice").textContent="Add your draft and design reasoning before checking the design."',
    );
    await sameFooter(`${device}/notice-visible`);
    await evaluate('document.querySelector(".design-notice").textContent=""');
    await accessibleScreen(`${device}/explore`);
    await shot(`layout-${device}-explore`);
    await choose('[data-workspace-view="options"]');
    await sameFooter(`${device}/options`);
    await shot(`layout-${device}-options`);
    console.log(
      `${device} PASS: seven Build pages, four Review pages, Explore, keyboard focus, footer placement, rendered contrast. Mocked service only.`,
    );
  }
  await require('./guide-download-checks.cjs')({
    send,
    evaluate,
    waitFor,
    shot,
    key,
    keyboardReach,
    scenarioMode,
  });
};
