const assert = require('node:assert/strict');
module.exports = async ({
  send,
  evaluate,
  waitFor,
  shot,
  key,
  keyboardReach,
  accessibleScreen,
}) => {
  const go = async (view) => {
    await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=' + view });
    await waitFor('document.readyState==="complete" && !!document.querySelector("h1")');
  };
  await go('home');
  const nativeAudio = await evaluate(
    '({api:!!window.speechSynthesis,voices:window.speechSynthesis?.getVoices().map(v=>({name:v.name,lang:v.lang}))})',
  );
  console.log('Native browser audio capability: ' + JSON.stringify(nativeAudio));
  // Observe the actual content and control lifecycle without sound in automated runs.
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(()=>{
    window.__spoken=[];window.__cancelled=0;
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){window.__cancelled++;},getVoices(){return [{lang:'en-US',name:'Test voice'}];},speak(utterance){window.__spoken.push(utterance);}}});
    window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
  })()`,
  });
  const saves = `JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key])=>key!=='promptcraft_entry_v1')))`;
  for (const [device, width, height] of [
    ['desktop', 1280, 800],
    ['phone', 390, 844],
    ['small-phone', 320, 568],
    ['landscape', 844, 390],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    for (const phase of ['design', 'closing']) {
      await go('home');
      await evaluate(`(async()=>{
        localStorage.clear();
        const {freshWorkspace,saveWorkspace}=await import('/src/features/workspace/storage.js');
        const {saveScenarioStudio}=await import('/src/features/workspace/scenario-storage.js');
        const {finalCheckContext}=await import('/src/features/design/content.js');
        const workspace=freshWorkspace();workspace.teacher.directions='Independent workspace directions';saveWorkspace(workspace);
        const state=freshWorkspace();state.experience='scenario';state.phase=${JSON.stringify(phase)};
        state.teacher.directions='Saved scenario directions';state.design.revision='Keep this saved design.';
        state.workspace.instructorPlan='Keep my teaching guidance.';
        state.teacher.learningGoal='Explain a decision using evidence.';state.design.reason='Make reasoning visible.';
        state.design.instructorPlan=state.workspace.instructorPlan;
        state.finalCheck={instructions:true,learning:true,requirements:true,completed:true,approved:true,context:finalCheckContext(state.teacher,state.design)};
        saveScenarioStudio(state);
      })()`);
      await go('home');
      const before = await evaluate(saves);
      assert.equal(
        await evaluate(
          'document.querySelectorAll(".home-path--story,.home-path--workspace").length',
        ),
        2,
      );
      assert(
        await evaluate(
          '!!document.querySelector(".home-classroom img[src*=maya]") && !!document.querySelector(".home-classroom img[src*=pixel]")',
        ),
      );
      await accessibleScreen(device + '-returning-home');
      await shot(device + '-' + phase + '-returning-home');
      await keyboardReach('a.home-path--story');
      await key('Enter', 'Enter', 13);
      await waitFor('!!document.querySelector(".speech-bubble")');
      const geometry = await evaluate(`(()=>{
        const toolbar=document.querySelector('.story-toolbar'),nav=document.querySelector('.scene-actions'),scene=document.querySelector('.focused-scene');
        return {toolbar:toolbar.getBoundingClientRect().toJSON(),nav:nav.getBoundingClientRect().toJSON(),scene:scene.getBoundingClientRect().toJSON(),children:[...scene.children].map(el=>({class:el.className,rect:el.getBoundingClientRect().toJSON(),display:getComputedStyle(el).display,position:getComputedStyle(el).position})),display:getComputedStyle(scene).display};
      })()`);
      assert(
        geometry.toolbar.height > 0 &&
          geometry.toolbar.top >= 0 &&
          geometry.nav.bottom <= height + 1,
        device + ' story audio and navigation visible: ' + JSON.stringify(geometry),
      );
      assert(await evaluate('location.search.includes("story=1")'));
      assert(
        await evaluate(
          'document.querySelector(".story-identity").textContent.includes("saved design is preserved")',
        ),
      );
      assert.equal(await evaluate('window.__spoken.length'), 0);
      await keyboardReach('[data-action=toggle-narration]');
      await key('Enter', 'Enter', 13);
      assert(
        await evaluate(
          'window.__spoken.at(-1).text.includes(document.querySelector(".speech-bubble p").textContent)',
        ),
      );
      assert(
        await evaluate(
          `getComputedStyle(document.querySelector('[data-action=toggle-narration]')).backgroundColor==='rgba(0, 0, 0, 0)'`,
        ),
        'Active narration remains a plain text control',
      );
      const firstRead = await evaluate('window.__spoken.length');
      await evaluate('document.querySelector("[data-action=repeat-narration]").click()');
      assert.equal(await evaluate('window.__spoken.length'), firstRead + 1);
      await shot(device + '-' + phase + '-story-audio');
      await keyboardReach('[data-action=reveal-board]');
      await key('Enter', 'Enter', 13);
      assert(
        await evaluate(
          'window.__spoken.at(-1).text.includes(document.querySelector(".board-heading h2").textContent)',
        ),
      );
      await evaluate('document.querySelector("[data-action=toggle-narration]").click()');
      const stopped = await evaluate('window.__spoken.length');
      await evaluate('document.querySelector("[data-action=next]").click()');
      assert.equal(await evaluate('window.__spoken.length'), stopped);
      assert.deepEqual(
        JSON.parse(await evaluate(saves)),
        JSON.parse(before),
        'Revisiting story preserves all saved records',
      );
      if (phase === 'design') {
        const scenes = await evaluate(
          `(async()=>{const {discussionOpening}=await import('/src/features/opening/content.js');return discussionOpening.scenes.map(scene=>({id:scene.id,answer:scene.choice?.options.find(option=>option.correct).id}));})()`,
        );
        for (let index = 1; index < scenes.length; index++) {
          assert(
            await evaluate(
              `document.querySelector('.navigation-progress').textContent.includes('Step ${index + 1} of ${scenes.length}')`,
            ),
          );
          await evaluate('document.querySelector("[data-action=reveal-board]").click()');
          if (scenes[index].answer) {
            await evaluate('document.querySelector("[data-action=reveal-question]").click()');
            await evaluate(
              `document.querySelector('input[value="${scenes[index].answer}"]').click()`,
            );
            assert(await evaluate('!!document.querySelector(".feedback.has-feedback")'));
          }
          assert.deepEqual(
            JSON.parse(await evaluate(saves)),
            JSON.parse(before),
            'All seven replay steps preserve the saved design',
          );
          await evaluate(
            `document.querySelector('[data-action=${index === scenes.length - 1 ? 'start-design-studio' : 'next'}]').click()`,
          );
        }
      } else {
        await keyboardReach('.site-menu > [data-dropdown-toggle]');
        await key('Enter', 'Enter', 13);
        await keyboardReach('.site-return-activity');
        await key('Enter', 'Enter', 13);
      }
      await waitFor('!!document.querySelector(".workspace-shell,.closing-experience")');
      assert(await evaluate('location.search.includes("view=scenario")'));
      if (phase === 'closing') {
        await keyboardReach('[data-action=toggle-narration]');
        await key('Enter', 'Enter', 13);
        assert(await evaluate('window.__spoken.at(-1).text.includes("Explain a decision")'));
        await evaluate('document.querySelector("[data-action=closing-pixel]").click()');
        assert(
          await evaluate(
            'window.__spoken.at(-1).text.includes(document.querySelector(".speech-bubble p").textContent)',
          ),
        );
        await shot(device + '-completion-audio');
      }
    }
  }
  console.log(
    'PASS: keyboard menu entry, all seven story steps, completed-story replay, unchanged saves, opt-in/repeat/stop and closing narration at desktop, two phone widths and landscape. Speech output mocked; no listening verification.',
  );
};
