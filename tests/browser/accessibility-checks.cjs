const assert = require('node:assert/strict');

module.exports = async ({ send, evaluate, waitFor, accessibleScreen, shot, key }) => {
  for (const [width, height] of [[1280, 800], [820, 1024], [390, 844], [320, 568]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    for (const view of ['home', 'how-to-play', 'about', 'babbage', 'privacy', 'guide', 'lab', 'play']) {
      await send('Page.navigate', { url: `http://127.0.0.1:8783/?view=${view}` });
      await waitFor('document.readyState === "complete" && !!document.querySelector("h1")');
      await accessibleScreen(`${width}/${view}`);
      assert(await evaluate('!!document.querySelector(document.querySelector(".skip-link").getAttribute("href"))'), `${view}: skip link destination`);
      await shot(`accessibility-${width}-${view}`);
    }
    // Native dialogs must close with Escape and return focus to the opener.
    await evaluate('document.querySelector("[data-action=open-references]").focus(); document.querySelector("[data-action=open-references]").click()');
    await waitFor('!!document.querySelector("dialog[open]")');
    await accessibleScreen(`${width}/references`);
    await shot(`accessibility-${width}-references`);
    await key('Escape', 'Escape', 27);
    await waitFor('!document.querySelector("dialog[open]")');
    assert(await evaluate('document.activeElement.matches("[data-action=open-references]")'), 'References restore focus');
    await evaluate('document.querySelector("[data-action=restart-module]").focus(); document.querySelector("[data-action=restart-module]").click()');
    await waitFor('!!document.querySelector("dialog[open]")');
    await accessibleScreen(`${width}/restart`);
    await shot(`accessibility-${width}-restart`);
    await key('Escape', 'Escape', 27);
    await waitFor('!document.querySelector("dialog[open]")');
    assert(await evaluate('document.activeElement.matches("[data-action=restart-module]")'), 'Restart restores focus');
    await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=home' });
    await waitFor('document.readyState === "complete" && !!document.querySelector(".info-nav")');
    await evaluate(`document.querySelector('.info-nav a[href="?view=about"]').click()`);
    assert(await evaluate('document.activeElement.id === "entry-title" && document.title.includes("About PromptCraft")'), 'Information navigation announces the new page');
    console.log(`${width}px PASS: public routes, skip destinations, dialog Escape and focus restoration, in-place page navigation.`);
  }
};
