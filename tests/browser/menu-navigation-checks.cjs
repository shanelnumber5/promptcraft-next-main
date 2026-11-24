const assert = require('node:assert/strict');

// Check the rendered design brief as well as keyboard navigation through Help.
module.exports = async ({ send, evaluate, waitFor, shot, key, keyboardReach, accessibleScreen }) => {
  const go = async (view) => {
    await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=' + view });
    await waitFor('document.readyState === "complete" && !!document.querySelector("h1")');
    await evaluate('document.fonts.ready');
  };
  const follow = async (selector) => {
    await keyboardReach(selector);
    await key('Enter', 'Enter', 13);
  };
  for (const [device, width, height] of [
    ['wide-desktop', 1920, 1080],
    ['desktop', 1280, 800],
    ['tablet', 820, 1024],
    ['phone', 390, 844],
    ['small-phone', 320, 568],
    ['landscape', 844, 390],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await go('home');
    assert(await evaluate(`(() => {
      const labels = ['Home', 'Guided Scenario', 'Creative Workspace', 'Babbage' + String.fromCharCode(8217) + 's Idea Lab', 'Course Guide', 'About'];
      const text = selector => [...document.querySelectorAll(selector)].map(el => el.textContent.trim());
      return JSON.stringify(text('.public-navigation a')) === JSON.stringify(labels)
        && JSON.stringify(text('.site-menu-journeys a')) === JSON.stringify(labels)
        && document.querySelector('#site-menu-toggle').textContent.trim() === 'Help';
    })()`), 'Page labels and order match in the public navigation and Help');
    assert(await evaluate(`(() => {
      const hero = document.querySelector('.reference-home-heading');
      const gutter = parseFloat(getComputedStyle(document.body).getPropertyValue('--editorial-gutter'));
      return Math.abs(hero.getBoundingClientRect().left) < 1
        && Math.abs(document.querySelector('h1').getBoundingClientRect().left - gutter) < 1
        && getComputedStyle(hero).backgroundColor === 'rgb(32, 45, 86)';
    })()`), 'Navy Home hero is full bleed and uses the shared gutter');
    if (width === 1920) {
      assert(await evaluate(`getComputedStyle(document.querySelector('h1')).fontSize === '200px'`), 'Wide Home headline reaches 200px');
      assert(await evaluate(`document.querySelector('.reference-hero-engine').getBoundingClientRect().left > document.querySelector('h1').getBoundingClientRect().left`), 'Engine sits beside the desktop headline');
    }
    await accessibleScreen(device + ' home');
    await shot(device + '-home-hero');
    await keyboardReach('[data-home-plate="1"]');
    assert(await evaluate(`getComputedStyle(document.activeElement).backgroundColor === 'rgb(243, 191, 75)'`), 'Path has a gold keyboard focus state');
    await shot(device + '-home-paths');

    await go('about');
    assert(await evaluate(`(() => {
      const button = document.querySelector('.info-sidebar button[aria-current]');
      const s = getComputedStyle(button);
      return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.textDecorationLine.includes('underline')
        && s.textDecorationColor === 'rgb(217, 143, 6)'
        && parseFloat(getComputedStyle(document.querySelector('.info-copy p')).fontSize) >= 18;
    })()`), 'Information topics use an underline and readable body type');

    await go('lab&page=1');
    assert.equal(await evaluate('document.querySelectorAll(".lab-card").length'), 12, 'Legacy page URLs also show all twelve ideas');
    assert(await evaluate(`['.lab-browser', '.lab-listing', '.lab-grid'].every(selector => getComputedStyle(document.querySelector(selector)).overflowY === 'visible')`), 'Idea Lab uses page scrolling');
    assert(await evaluate(`(() => {
      const gutter = parseFloat(getComputedStyle(document.body).getPropertyValue('--editorial-gutter'));
      return ['.lab-heading h1', '#idea-search', '.lab-card h2'].every(selector => Math.abs(document.querySelector(selector).getBoundingClientRect().left - gutter) < 1);
    })()`), 'Lab title, search, and ideas have the same left edge');
    await shot(device + '-lab-hero');

    await evaluate(`(async () => {
      const { freshWorkspace, saveWorkspace } = await import('/src/features/workspace/storage.js');
      const state = freshWorkspace();
      state.designPanel = 'revision';
      state.teacher.directions = 'Compare two cases.';
      state.design.sourceDirections = state.teacher.directions;
      state.design.revision = 'Compare two cases and explain a decision using evidence.';
      state.creative.rubric.requested = false;
      saveWorkspace(state);
    })()`);
    await go('workspace&build=draft&mockBabbage=1');
    await waitFor('!!document.querySelector("#revision")');
    assert(await evaluate(`(() => {
      const gutter = parseFloat(getComputedStyle(document.body).getPropertyValue('--editorial-gutter'));
      const header = document.querySelector('.app-header').getBoundingClientRect();
      const tabs = [...document.querySelectorAll('.workspace-tabs button')].map(el => el.getBoundingClientRect());
      const brand = document.querySelector('.brand').getBoundingClientRect();
      const fields = document.querySelector('.design-page-fields');
      const fieldsLeft = fields.getBoundingClientRect().left + parseFloat(getComputedStyle(fields).paddingLeft);
      return Math.abs(header.right - innerWidth) < 1 && Math.abs(document.getElementById('app').getBoundingClientRect().right - innerWidth) < 1
        && Math.abs(brand.left - gutter) < 1 && Math.abs(tabs[0].left - gutter) < 1
        && Math.abs(fieldsLeft - gutter) < 1
        && Math.abs(tabs[1].left - tabs[0].right - 40) < 1
        && Math.abs(tabs[2].left - tabs[1].right - 40) < 1;
    })()`), 'Studio has no right strip, aligned left edges, and auto-width stages spaced 40px apart');
    assert(await evaluate('!document.querySelector(".workspace-action-bar [data-dropdown-toggle]")'), 'Activity tools do not compete with the footer');
    const before = await evaluate('localStorage.getItem("promptcraft_assignment_workspace_v1")');
    await follow('#site-menu-toggle');
    assert(await evaluate('!!document.querySelector("#site-menu-panel [data-current-activity-tools] [data-workspace-view=preview]")'), 'Help contains current task actions');
    await accessibleScreen(device + ' Help');
    await shot(device + '-help-activity-tools');
    await follow('#site-menu-panel [data-workspace-view=preview]');
    await waitFor('!!document.querySelector(".workspace-reading-preview")');
    assert(await evaluate('document.querySelector(".workspace-reading-preview").textContent.includes("Compare two cases")'), 'Help preview opens the actual working draft');
    await follow('.studio-back [data-workspace-view=work]');
    await waitFor('!!document.querySelector("#revision")');
    assert.equal(await evaluate('localStorage.getItem("promptcraft_assignment_workspace_v1")'), before, 'Preview through Help preserves saved work');
    await follow('#site-menu-toggle');
    await key('Escape', 'Escape', 27);
    assert(await evaluate('document.activeElement.id === "site-menu-toggle" && document.getElementById("site-menu-panel").hidden'), 'Help Escape restores focus');
    await shot(device + '-studio-draft');

    await evaluate('localStorage.removeItem("promptcraft_next_opening_v1")');
    await go('play&story=1');
    await waitFor('!!document.querySelector("[data-action=reveal-board]")');
    assert(await evaluate(`(() => {
      const back = document.querySelector('.nav-button--back');
      return back.disabled && getComputedStyle(back).opacity === '1'
        && getComputedStyle(document.querySelector('.story-identity strong')).fontFamily.includes('Fraunces');
    })()`), 'Story title uses the shared display face and disabled Back stays readable');
    await follow('[data-action=reveal-board]');
    await follow('[data-action=next]');
    assert(await evaluate(`getComputedStyle(document.querySelector('.scene-progress .is-complete')).backgroundColor === 'rgb(217, 143, 6)'`), 'Completed story steps are gold');
    await shot(device + '-story-progress');
    console.log(device + ' PASS: shared margins, full-bleed hero, twelve ideas, consistent navigation, Help actions, saved-work preservation, and story styling.');
  }
};
