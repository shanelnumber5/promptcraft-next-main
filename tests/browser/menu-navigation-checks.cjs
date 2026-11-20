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
    await evaluate('Promise.all([...document.images].map(image=>image.decode().catch(()=>{})))');
  };
  const openMenu = async () => {
    await keyboardReach('#site-menu-toggle');
    await key('Enter', 'Enter', 13);
    await waitFor('!document.getElementById("site-menu-panel").hidden');
  };
  const fits = (selector) =>
    evaluate(
      `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return r.top>=0 && r.left>=0 && r.right<=innerWidth+1 && r.bottom<=innerHeight+1;})()`,
    );
  for (const [name, width, height] of [
    ['desktop', 1280, 800],
    ['tablet', 820, 1024],
    ['phone', 390, 844],
    ['small-phone', 320, 568],
    ['short-desktop', 1280, 600],
    ['landscape', 844, 390],
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
          `(async()=>{const {freshWorkspace,saveWorkspace}=await import('/src/features/workspace/storage.js');const state=freshWorkspace();state.designPanel='revision';state.design.revision='Keep this activity.';state.teacher.directions='Original directions.';saveWorkspace(state);})()`,
        );
        await go('home');
      }
      assert.equal(
        await evaluate('document.querySelectorAll(".home-paths a:not(.home-path--resume)").length'),
        4,
        'Home exposes both journeys and its two supporting destinations',
      );
      for (const selector of [
        '.home-path--story',
        '.home-path--workspace',
        '.home-path--lab',
        '.home-path--guide',
      ]) {
        await keyboardReach(selector);
        assert(
          await fits(selector),
          'Keyboard focus brings each destination into view: ' + name + '/' + selector,
        );
      }
      assert(
        await evaluate(
          `(()=>{const frame=document.querySelector('.home-studio').getBoundingClientRect(),link=getComputedStyle(document.querySelector('.home-path--story'));return frame.left===0 && Math.abs(frame.right-document.documentElement.clientWidth)<1 && link.borderRadius==='0px' && link.boxShadow==='none' && parseFloat(link.borderTopWidth)===0 && link.backgroundColor==='rgba(0, 0, 0, 0)';})()`,
        ),
        'Home is a full-bleed index without cards',
      );
      assert(
        await evaluate(
          `(()=>{const frame=document.querySelector('.home-studio').getBoundingClientRect();return [...document.querySelectorAll('.home-paths a')].every(link=>link.getBoundingClientRect().bottom<=frame.bottom+1);})()`,
        ),
        'No starting choice is clipped by its frame: ' + name + '/' + saved,
      );
      assert(
        await evaluate('document.documentElement.scrollWidth<=innerWidth'),
        'The reference layout scrolls vertically without horizontal overflow',
      );
      assert(
        !(await evaluate(
          '!!document.querySelector(".home-eyebrow,.home-path-action,.studio-step")',
        )),
      );
      await evaluate('scrollTo(0,0)');
      await shot(name + '-home-' + (saved ? 'saved' : 'fresh'));
      await evaluate('document.querySelector(".home-studio").scrollIntoView()');
      await shot(name + '-home-index-' + (saved ? 'saved' : 'fresh'));
      await evaluate('scrollTo(0,0)');
    }
    const before = await evaluate('localStorage.getItem("promptcraft_assignment_workspace_v1")');
    await openMenu();
    assert(
      await evaluate(
        'document.querySelectorAll("#site-menu-panel > .site-menu-group").length===3 && document.getElementById("site-menu-toggle").textContent.trim()==="Close"',
      ),
      'Menu groups journeys, work, and help and provides an explicit close control',
    );
    assert(await fits('#site-menu-panel'), 'Global menu fits ' + name);
    assert(
      await evaluate(
        'document.getElementById("site-menu-panel").scrollHeight<=document.getElementById("site-menu-panel").clientHeight+1',
      ),
      'Menu fits without internal scrolling: ' + name,
    );
    await accessibleScreen(name + '-site-menu');
    await shot(name + '-site-menu');
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
    await openMenu();
    await keyboardReach('#site-menu-panel a[href="?view=about"]');
    await key('Enter', 'Enter', 13);
    assert(
      await evaluate(
        'document.title.includes("About PromptCraft") && document.activeElement.id==="entry-title"',
      ),
    );
    await openMenu();
    await keyboardReach('#site-menu-panel a[href="?view=workspace"]');
    await key('Enter', 'Enter', 13);
    await waitFor('!!document.querySelector(".workspace-shell")');
    assert.equal(
      await evaluate(
        'document.querySelector("#revision")?.value || JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1")).state.design.revision',
      ),
      'Keep this activity.',
    );
    await evaluate(
      'document.querySelector("[data-workspace-panel=revision]").click();document.querySelector("[data-design-page=draft]").click()',
    );
    await keyboardReach('.activity-tools > [data-dropdown-toggle]');
    await key('Enter', 'Enter', 13);
    assert(await fits('#activity-tools-panel'), 'Activity menu fits ' + name);
    await accessibleScreen(name + '-activity-menu');
    await shot(name + '-activity-menu');
    await key('Tab', 'Tab', 9);
    await key('Enter', 'Enter', 13);
    await waitFor('!!document.querySelector(".workspace-draft-overview")');
    await keyboardReach('[data-workspace-view=work]');
    await key('Enter', 'Enter', 13);
    assert(
      await evaluate('document.activeElement.matches(".activity-tools > [data-dropdown-toggle]")'),
      'Returns focus to the closed activity menu',
    );
    assert.equal(
      await evaluate(
        'JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1")).state.design.revision',
      ),
      JSON.parse(before).state.design.revision,
    );
    console.log(
      name +
        ' PASS: all editorial home choices reachable, keyboard dropdowns, Escape, outside click, navigation, preview and preserved draft.',
    );
  }
  // A narrow, short viewport may scroll rather than clipping text at enlarged layouts.
  await send('Emulation.setDeviceMetricsOverride', {
    width: 640,
    height: 400,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await go('home');
  assert(
    await evaluate(
      `(()=>{const frame=document.querySelector('.home-studio').getBoundingClientRect();return [...document.querySelectorAll('.home-paths a')].every(link=>link.getBoundingClientRect().bottom<=frame.bottom+1) && document.documentElement.scrollWidth<=innerWidth;})()`,
    ),
    'Short narrow layouts retain every menu choice without clipping',
  );
  await evaluate(
    'document.querySelector(".home-path--workspace").scrollIntoView({block:"center"})',
  );
  assert(await fits('.home-path--workspace'));
};
