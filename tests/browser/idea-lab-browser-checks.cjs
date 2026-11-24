const assert = require('node:assert/strict');
// Current Idea Lab flow. Uses the existing mocked browser harness; no live AI calls.
module.exports = async ({send,evaluate,waitFor,key,keyboardReach,accessibleScreen,shot}) => {
  const go=async query=>{
    await send('Page.navigate',{url:'http://127.0.0.1:8783/'+query});
    await waitFor('!!document.querySelector("#entry-title, #setup-title")');
  };
  const input=async(id,value)=>evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
  const follow=async selector=>{await keyboardReach(selector);await key('Enter','Enter',13);};
  for(const [device,width,height] of [['desktop',1440,1000],['short-desktop',1280,720],['tablet',768,1024],['phone',390,844],['small-phone',320,568]].filter(([name])=>!process.env.PC_BROWSER_DEVICE||process.env.PC_BROWSER_DEVICE.split(',').includes(name))) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
    await go('?view=lab&mockBabbage=1');
    assert.equal(await evaluate('document.querySelectorAll(".lab-card").length'),12);
    assert(await evaluate('!!document.querySelector(".lab-category-filters") && !document.querySelector(".lab-sidebar,#lab-pagination,#idea-category")'),'Text filters replace the sidebar and pagination');
    const footer=await evaluate('(()=>{const r=document.querySelector(".lab-footer").getBoundingClientRect();return {top:r.top+scrollY,height:r.height,bottom:r.bottom+scrollY};})()');
    assert(footer.bottom > height, `${device}: the page scrolls through the complete catalog`);
    assert(await evaluate('[".lab-browser",".lab-listing",".lab-grid"].every(selector=>{const el=document.querySelector(selector);return el.scrollHeight<=el.clientHeight+1 && getComputedStyle(el).overflowY==="visible"})'), 'The catalog has no nested scroll boxes');
    await evaluate('document.querySelector(".lab-card:last-child").scrollIntoView()');
    assert(await evaluate('document.querySelector(".lab-card:last-child").getBoundingClientRect().top<innerHeight'), 'The twelfth idea is reachable by scrolling the page');
    await evaluate('scrollTo(0,0)');
    await accessibleScreen(device+' Idea Lab gallery');
    await shot('lab-'+device+'-gallery');
    await input('idea-search','workplace');
    await follow('[data-lab-category="Workplace"]');
    assert(await evaluate(`!!document.querySelector('a[href*="idea=shift-change"]')`));
    await follow('a[href*="idea=shift-change"]');
    await waitFor('!!document.querySelector(".lab-detail")');
    assert(await evaluate('document.querySelector(".lab-detail").textContent.includes("Your role as instructor")'));
    await accessibleScreen(device+' Idea Lab detail');
    await shot('lab-'+device+'-detail');
    await follow('.lab-footer a[href*="view=lab"]');
    await waitFor('!!document.getElementById("idea-search")');
    assert.equal(await evaluate('document.getElementById("idea-search").value'),'workplace');
    assert(await evaluate(`document.querySelector('[data-lab-category="Workplace"]').getAttribute('aria-pressed')==='true'`));
    await input('idea-search','no-matching-idea-123');
    assert(await evaluate('!!document.querySelector(".lab-empty")'));
    await shot('lab-'+device+'-empty');
    await evaluate('document.querySelector(".lab-empty [data-lab-clear]").click()');
    assert.equal(await evaluate('document.querySelectorAll(".lab-card").length'),12);
    await evaluate(`(async()=>{
      const {freshWorkspace,saveWorkspace}=await import('/src/features/workspace/storage.js');
      const state=freshWorkspace();
      state.teacher.directions='Keep this starting assignment.';
      state.design.sourceDirections=state.teacher.directions;
      state.design.revision='Keep this authored draft.';
      state.workspace.ideaId='failure-file';
      state.workspace.selectedDirection={title:'Old sketch',description:'Old description',experience:'Old exchange',learning:'Old purpose',online:'Asynchronous',core:'Old core'};
      state.workspace.creativeCore='Old core';
      saveWorkspace(state);
    })()`);
    await follow('a[href*="idea=decision-clinic"]');
    await waitFor('!!document.querySelector(".lab-detail")');
    await follow('.lab-footer a[href*="adapt="]');
    await waitFor(`!!document.querySelector('[data-design-page="subject"]')`);
    const saved=await evaluate('JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1"))');
    assert.equal(saved.state.design.revision,'Keep this authored draft.');
    assert.equal(saved.workspace.ideaId,'decision-clinic');
    assert.equal(saved.workspace.selectedDirection.title,'The Decision Clinic');
    await shot('lab-'+device+'-adapted');
    console.log(`${device} PASS: twelve ideas, natural page scrolling, text filters, details, empty state, keyboard navigation, safe adaptation. Mocked service.`);
  }
};
