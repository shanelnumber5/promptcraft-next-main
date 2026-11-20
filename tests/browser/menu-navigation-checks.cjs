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
    await evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))');
  };
  const fits = (selector) =>
    evaluate(
      `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return r.top>=0 && r.left>=0 && r.right<=innerWidth+1 && r.bottom<=innerHeight+1})()`,
    );
  const publicPage = async (view) => {
    if (
      await evaluate(
        'getComputedStyle(document.querySelector(".public-navigation")).display!=="none"',
      )
    ) {
      await keyboardReach('.public-navigation a[href="?view=' + view + '"]');
      await key('Enter', 'Enter', 13);
    } else {
      await keyboardReach('#public-page');
      await evaluate(
        `(()=>{const picker=document.getElementById('public-page');picker.value=${JSON.stringify(view)};picker.dispatchEvent(new Event('change',{bubbles:true}))})()`,
      );
    }
  };
  // The reported failure is on a wide screen; assert actual word geometry through 2560px.
  for (const width of [320, 390, 700, 701, 768, 820, 1024, 1280, 1600, 1920, 2560]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await go('home');
    assert(
      await evaluate(
        `(()=>{const h=document.querySelector('h1');return [...h.children].every(word=>{const r=document.createRange();r.selectNodeContents(word);const lines=[...r.getClientRects()];return lines.length===1 && lines[0].right<=h.getBoundingClientRect().right+1})})()`,
      ),
      'Headline words stay intact at ' + width,
    );
    assert(
      await evaluate(
        `(()=>{const r=document.querySelector('.home-hero').getBoundingClientRect();return r.left===0 && Math.abs(r.right-Math.min(document.documentElement.clientWidth,document.body.clientWidth))<1 && document.documentElement.scrollWidth<=innerWidth})()`,
      ),
      'Home spans the available width at ' + width,
    );
  }
  for (const [name, width, height] of [
    ['wide-desktop', 1920, 1080],
    ['desktop', 1280, 800],
    ['tablet', 820, 1024],
    ['phone', 390, 844],
    ['small-phone', 320, 568],
    ['short-desktop', 1280, 600],
    ['landscape', 844, 390],
    ['short-narrow', 640, 400],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await go('home');
    await evaluate('localStorage.clear()');
    await go('home');
    for (const saved of [false, true]) {
      if (saved) {
        await evaluate(
          `(async()=>{const {freshWorkspace,saveWorkspace}=await import('/src/features/workspace/storage.js');const state=freshWorkspace();state.designPanel='revision';state.design.revision='Keep this activity.';state.teacher.directions='Original directions.';saveWorkspace(state)})()`,
        );
        await go('home');
      }
      assert(await fits('.home-explore'), 'Scroll guidance is visible before scrolling: ' + name);
      assert(
        await evaluate(
          'document.querySelector(".home-explore").textContent.includes("Scroll down")',
        ),
      );
      await accessibleScreen(name + '-home-' + saved);
      await shot(name + '-home-' + saved);
      await keyboardReach('.home-jump');
      await key('Enter', 'Enter', 13);
      assert(await fits('.home-path--story'), 'Choose your path reaches the first action');
      assert(
        await evaluate('document.activeElement.id==="home-paths"'),
        'Jump moves keyboard focus to the destination menu',
      );
      await shot(name + '-destination-index');
      assert.equal(
        await evaluate(
          'document.querySelectorAll(".home-paths .home-action:not(.home-path--resume)").length',
        ),
        4,
      );
      for (const selector of [
        '.home-path--story',
        '.home-path--workspace',
        '.home-path--lab',
        '.home-path--guide',
      ]) {
        await keyboardReach(selector);
        assert(await fits(selector));
        assert(
          await evaluate(
            `(()=>{const s=getComputedStyle(document.querySelector(${JSON.stringify(selector)}));return s.backgroundColor==='rgb(30, 45, 89)' && s.color==='rgb(255, 255, 255)' && s.textDecorationLine==='none'})()`,
          ),
          'Destination uses a button without an underline',
        );
      }
      await evaluate('scrollTo(0,0)');
    }
    const before = await evaluate('localStorage.getItem("promptcraft_assignment_workspace_v1")');
    await publicPage('about');
    assert(
      await evaluate(
        'document.title.includes("About PromptCraft") && document.activeElement.id==="entry-title"',
      ),
      'Public menu announces the new page',
    );
    assert(
      await evaluate('document.getElementById("public-page").value==="about"'),
      'Page chooser reflects navigation',
    );
    await publicPage('home');
    await keyboardReach('.home-path--workspace');
    await key('Enter', 'Enter', 13);
    await waitFor('!!document.querySelector(".workspace-shell")');
    assert(
      await evaluate(
        `(()=>{const r=document.getElementById('workspace-panel').getBoundingClientRect();return r.left===0 && Math.abs(r.width-document.body.clientWidth)<1})()`,
      ),
      'Workspace uses the available screen width',
    );
    assert.equal(
      await evaluate(
        'JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1")).state.design.revision',
      ),
      'Keep this activity.',
    );
    await keyboardReach('#site-menu-toggle');
    await key('Enter', 'Enter', 13);
    assert(await fits('#site-menu-panel'), 'Task menu fits ' + name);
    assert(
      await evaluate('document.querySelectorAll("#site-menu-panel > .site-menu-group").length===3'),
    );
    assert(
      await evaluate(
        `(()=>{const r=document.querySelector('#site-menu-panel').getBoundingClientRect();return r.left===0 && Math.abs(r.right-Math.min(document.documentElement.clientWidth,document.body.clientWidth))<1})()`,
      ),
      'Task menu uses the screen width: ' +
        (await evaluate(
          `JSON.stringify({rect:document.querySelector('#site-menu-panel').getBoundingClientRect().toJSON(),width:innerWidth,cssWidth:getComputedStyle(document.querySelector('#site-menu-panel')).width,box:getComputedStyle(document.querySelector('#site-menu-panel')).boxSizing,max:getComputedStyle(document.querySelector('#site-menu-panel')).maxWidth})`,
        )),
    );
    await accessibleScreen(name + '-task-menu');
    await shot(name + '-task-menu');
    await key('Tab', 'Tab', 9);
    assert(await evaluate('document.activeElement===document.querySelector("#site-menu-panel a")'));
    await key('Escape', 'Escape', 27);
    assert(
      await evaluate(
        'document.activeElement.id==="site-menu-toggle" && document.getElementById("site-menu-panel").hidden',
      ),
    );
    await key('ArrowDown', 'ArrowDown', 40);
    assert(await evaluate('document.activeElement===document.querySelector("#site-menu-panel a")'));
    await evaluate('document.querySelector("h1").click()');
    assert(await evaluate('document.getElementById("site-menu-panel").hidden'));
    await evaluate(
      'document.querySelector("[data-workspace-panel=revision]").click();document.querySelector("[data-design-page=draft]").click()',
    );
    await keyboardReach('.activity-tools > [data-dropdown-toggle]');
    await key('Enter', 'Enter', 13);
    assert(await fits('#activity-tools-panel'));
    await accessibleScreen(name + '-activity-menu');
    await shot(name + '-activity-menu');
    await key('Tab', 'Tab', 9);
    await key('Enter', 'Enter', 13);
    await waitFor('!!document.querySelector(".workspace-draft-overview")');
    await keyboardReach('[data-workspace-view=work]');
    await key('Enter', 'Enter', 13);
    assert(
      await evaluate('document.activeElement.matches(".activity-tools > [data-dropdown-toggle]")'),
    );
    assert.equal(
      await evaluate(
        'JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1")).state.design.revision',
      ),
      JSON.parse(before).state.design.revision,
    );
    console.log(
      name +
        ' PASS: intact words, full width, visible scroll cue, jump focus, public navigation, task menus, button actions and preserved work.',
    );
  }
};
