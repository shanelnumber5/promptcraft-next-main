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
    assert.equal(await evaluate('document.querySelectorAll(".lab-card").length'),6);
    const footer=await evaluate('(()=>{const r=document.querySelector(".lab-footer").getBoundingClientRect();return {top:r.top,height:r.height,bottom:r.bottom};})()');
    assert.equal(footer.height,72);
    assert(footer.bottom<=height,`${device}: footer stays in the viewport`);
    await accessibleScreen(device+' Idea Lab gallery');
    await evaluate('document.querySelector("[data-lab-page=\"1\"]").click()');
    assert.equal(await evaluate('document.querySelectorAll(".lab-card").length'),6);
    assert.equal(await evaluate('new URL(location.href).searchParams.get("page")'),'1');
    const nextFooter=await evaluate('document.querySelector(".lab-footer").getBoundingClientRect().top');
    assert(Math.abs(nextFooter-footer.top)<2,`${device}: paging does not move the footer`);
    await input('idea-search','workplace');
    await input('idea-category','Workplace');
    assert(await evaluate('!!document.querySelector("a[href*=\"idea=shift-change\"]")'));
    await follow('a[href*="idea=shift-change"]');
    await waitFor('!!document.querySelector(".lab-detail")');
    assert(await evaluate('document.querySelector(".lab-detail").textContent.includes("Your role as instructor")'));
    await accessibleScreen(device+' Idea Lab detail');
    await follow('.lab-footer a[href*="view=lab"]');
    await waitFor('!!document.getElementById("idea-search")');
    assert.equal(await evaluate('document.getElementById("idea-search").value'),'workplace');
    assert.equal(await evaluate('document.getElementById("idea-category").value'),'Workplace');
    await input('idea-search','no-matching-idea-123');
    assert(await evaluate('!!document.querySelector(".lab-empty")'));
    await evaluate('document.querySelector(".lab-empty [data-lab-clear]").click()');
    assert.equal(await evaluate('document.querySelectorAll(".lab-card").length'),6);
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
    await waitFor('!!document.querySelector("[data-build-page=\"subject\"]")');
    const saved=await evaluate('JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1"))');
    assert.equal(saved.state.design.revision,'Keep this authored draft.');
    assert.equal(saved.workspace.ideaId,'decision-clinic');
    assert.equal(saved.workspace.selectedDirection.title,'The Decision Clinic');
    await shot('lab-'+device+'-adapted');
    console.log(`${device} PASS: Idea Lab paging, footer, filters, details, empty state, keyboard navigation, safe adaptation. Mocked service.`);
  }
};
