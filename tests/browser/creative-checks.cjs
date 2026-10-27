const assert = require('node:assert/strict');
module.exports = async ({send,evaluate,waitFor,fill,shot,key,click,keyboardReach,accessibleScreen,apiRequests,initialState,scenario}) => {
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.search.includes('offlineUi=1')){const normal=window.fetch.bind(window);window.fetch=(url,options)=>String(url).includes('babbage')&&(!options||!options.method||options.method==='GET')?Promise.resolve(new Response('{"configured":false}',{headers:{'Content-Type':'application/json'}})):normal(url,options);}`});
  const goto=async query=>{await send('Page.navigate',{url:'http://127.0.0.1:8783/'+query});await waitFor('!!document.querySelector("#setup-title,#entry-title")');};
  const choose=async selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const view=async name=>choose(`[data-workspace-view="${name}"]`);
  const section=async name=>{
    if(await evaluate('document.querySelector("#workspace-section-picker")?.dataset.workspaceSectionPicker==="data-design-page"')) {
      await evaluate('(()=>{const picker=document.querySelector("#workspace-section-picker");picker.value='+JSON.stringify(name)+';picker.dispatchEvent(new Event("change",{bubbles:true}));})()');
    } else {await view('sections');await choose('[data-design-page="'+name+'"]');}
  };
  const meta=async(id,value)=>evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  const noAccordions=async()=>assert.equal(await evaluate('document.querySelectorAll(".workspace-shell details").length'),0,'Workspace uses direct views instead of accordions');
  const fits=async()=>{assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No horizontal clipping');if(await evaluate('innerHeight>=720'))assert(await evaluate('document.documentElement.scrollHeight<=innerHeight+1'),'The short task fits the screen: '+JSON.stringify(await evaluate('({height:innerHeight,scroll:document.documentElement.scrollHeight,panel:document.getElementById("workspace-panel")?.getBoundingClientRect().toJSON(),shell:document.querySelector(".workspace-shell")?.getBoundingClientRect().toJSON()})')));};
  for(const [device,width,height] of [['desktop',1280,720],['phone',390,844],['small-phone',320,568]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
    await goto('?view=home');await evaluate('localStorage.clear()');
    const guidedRaw=JSON.stringify(initialState(scenario));
    await evaluate(`localStorage.setItem('promptcraft_next_opening_v1',${JSON.stringify(guidedRaw)})`);
    await goto('?view=workspace');await noAccordions();await fits();
    assert(await evaluate('document.body.textContent.includes("What could your discussion become?")'));
    await shot('workspace-'+device+'-start');
    await click('edit-context');await fill('directions','Replace an agreement-only management discussion.');
    await evaluate('(()=>{const picker=document.querySelector("#workspace-build-group");picker.value="time";picker.dispatchEvent(new Event("change",{bubbles:true}));})()');
    await shot('workspace-'+device+'-time');
    assert(await evaluate('(()=>{const work=document.getElementById("workTime").getBoundingClientRect(),days=document.getElementById("daysAvailable").getBoundingClientRect();return work.height>=40 && days.top>work.bottom+10;})()'),'Time inputs are separate, full-height, and do not overlap');
    await fill('workTime','60–90 minutes');
    await fill('daysAvailable','One week');
    await section('start');
    await section('time');
    assert(await evaluate('document.getElementById("workTime").value==="60–90 minutes" && document.getElementById("daysAvailable").value==="One week"'),'Both time estimates persist after navigating away');
    await section('start');
    const stableRect=await evaluate('document.getElementById("workspace-panel").getBoundingClientRect().toJSON()');
    const stableBar=await evaluate('document.querySelector(".workspace-section-main .workspace-view-actions").getBoundingClientRect().toJSON()');
    const buildTypes=[];
    for(const destination of ['subject','learners','learner-group','needs','time','requirements','ai-use','concern','intentions','presence','questions','draft','start']) {
      await section(destination);
      buildTypes.push(await evaluate('(()=>{const type=element=>{const style=getComputedStyle(element);return {family:style.fontFamily,size:style.fontSize,weight:style.fontWeight,line:style.lineHeight};};return {page:document.querySelector(".build-page-fields").dataset.buildPage,heading:type(document.getElementById("design-page-title")),labels:Array.from(document.querySelectorAll(".build-page-fields .setup-field > label,.build-page-fields .creative-core > label,.build-page-fields .workspace-writing > label,.build-page-fields fieldset > legend")).map(type)};})()'));
      const frame=await evaluate('document.getElementById("workspace-panel").getBoundingClientRect().toJSON()');
      const bar=await evaluate('document.querySelector(".workspace-section-main .workspace-view-actions").getBoundingClientRect().toJSON()');
      for(const property of ['x','y','width','height']) assert(Math.abs(frame[property]-stableRect[property])<2,'Stable panel '+property+' for '+destination);
      for(const property of ['y','height']) assert(Math.abs(bar[property]-stableBar[property])<2,'Stable actions '+property+' for '+destination);
    }
    const expectedTitle=buildTypes[0].heading;
    assert(expectedTitle.family.startsWith('Arial'),'Build titles use the same font family as the fields');
    assert.equal(expectedTitle.weight,'700','Build titles have consistent bold weight');
    const expectedLabel=buildTypes[0].labels[0];
    for(const entry of buildTypes) {
      assert.deepEqual(entry.heading,expectedTitle,'Matching Build heading typography: '+entry.page);
      for(const label of entry.labels) assert.deepEqual(label,expectedLabel,'Matching Build label typography: '+entry.page);
    }
    await choose('[data-workspace-panel=reason]');
    for(const destination of ['rationale','guide','help']) {
      await choose('[data-review-page="'+destination+'"]');
      const frame=await evaluate('document.getElementById("workspace-panel").getBoundingClientRect().toJSON()');
      for(const property of ['x','y','width','height']) assert(Math.abs(frame[property]-stableRect[property])<2,'Stable review '+property+' for '+destination);
      const bar=await evaluate('document.querySelector(".review-actions").getBoundingClientRect().toJSON()');
      for(const property of ['y','height']) assert(Math.abs(bar[property]-stableBar[property])<2,'Stable review actions '+property+' for '+destination);
    }
    await choose('[data-workspace-panel=babbage]');
    const exploreRect=await evaluate('document.getElementById("workspace-panel").getBoundingClientRect().toJSON()');
    for(const property of ['x','y','width','height']) assert(Math.abs(exploreRect[property]-stableRect[property])<2,'Stable Explore '+property);
    await choose('[data-workspace-panel=revision]');
    await section('start');
    await shot('workspace-'+device+'-build-start');await fits();
    if(width>=700) { await keyboardReach('[data-workspace-section-group]');await section('learners'); }
    else { await keyboardReach('[data-workspace-section-picker]');await section('learners'); }

    await fill('learningGoal','Defend management decisions using evidence.');
    await section('ai-use');await fill('aiUse','Feedback only; students verify their own decisions.');
    await choose('[data-workspace-panel=babbage]');await waitFor('!document.querySelector("[data-action=explore-directions]")?.disabled');
    const conversation=await evaluate('JSON.stringify(JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1")).state.babbage.history)');
    await keyboardReach('[data-action=explore-directions]');await key('Enter','Enter',13);
    await waitFor('document.querySelectorAll("[data-view-direction]").length===3');
    await noAccordions();await shot('workspace-'+device+'-ideas');await fits();await accessibleScreen(device+' short creative choices');
    await choose('[data-view-direction="2"]');await choose('[data-idea-part=learning]');
    assert(await evaluate('document.querySelector(".workspace-reading").textContent.includes("Protect the distinctive mechanism 2")'));
    await choose('[data-save-direction="2"]');await view('work');
    assert(await evaluate('document.body.textContent.includes("Saved possibilities (1)")'));
    await view('combine');await choose('[data-combine-direction="0"]');await choose('[data-combine-direction="1"]');await click('combine-directions');
    await meta('creative-core','Students defend a choice after encountering competing evidence.');await shot('workspace-'+device+'-core');await fits();
    if(width>=390) assert(await evaluate('(()=>{const fields=document.querySelector(".build-page-fields");return fields.scrollHeight<=fields.clientHeight+2;})()'),'The creative-core form fits without an outer scrollbar');
    await section('presence');await meta('instructor-plan','Question initial reasoning and provide final feedback.');await section('questions');await meta('open-questions','Can this fit one hour?');
    assert.equal(await evaluate('JSON.stringify(JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1")).state.babbage.history)'),conversation);
    await section('draft');await fill('revision','Read the case, defend a choice, then reconsider after new evidence.');
    await evaluate('location.reload()');await waitFor('!!document.querySelector("#revision")');
    await keyboardReach('[data-workspace-view=preview]');await key('Enter','Enter',13);
    assert(await evaluate('document.querySelector("[data-live-preview]").textContent.includes("reconsider")'));
    await keyboardReach('[data-workspace-view=work]');await key('Enter','Enter',13);
    assert(await evaluate('document.activeElement.id==="workspace-show-preview"'),'Returning restores focus to the preview button');
    await view('maya');await click('pause-maya');
    assert(await evaluate('JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1")).creative.mayaPaused'));
    await choose('[data-workspace-panel=reason]');await shot('workspace-'+device+'-review-reason');await fill('reason','New evidence gives students a reason to reconsider.');
    await choose('[data-review-page=checks]');assert(!await evaluate('!!document.querySelector(".maya-dialog")'));
    for(const id of ['instructions','learning','requirements'])await choose(`[data-final-check="${id}"]`);
    await click('approve-version');await waitFor('!!document.querySelector("[data-action=preview-guide]")');await fits();
    await click('preview-guide');await waitFor('document.querySelector(".guide-preview iframe")?.dataset.ready==="true"');
    assert(await evaluate('document.querySelector(".guide-preview iframe").srcdoc.includes("Students defend a choice")'));
    await evaluate('document.querySelector(".guide-preview button").click()');await noAccordions();await shot('workspace-'+device+'-guide');
    assert.equal(await evaluate('localStorage.getItem("promptcraft_next_opening_v1")'),guidedRaw);
    await choose('[data-workspace-panel=babbage]');await choose('[data-view-direction="0"]');
    const durable=await evaluate('localStorage.getItem("promptcraft_assignment_workspace_v1")');
    await evaluate('window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==="promptcraft_assignment_workspace_v1")throw Error("quota");return window.originalSet.call(this,key,value)}');
    await choose('[data-save-direction="0"]');assert(await evaluate('document.querySelector(".design-notice").textContent.includes("could not be saved")'));
    assert.equal(await evaluate('localStorage.getItem("promptcraft_assignment_workspace_v1")'),durable);
    await evaluate('Storage.prototype.setItem=window.originalSet');await choose('[data-save-direction="0"]');
    assert.equal(await evaluate('JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1")).creative.alternatives.length'),2);
    await goto('?view=workspace&offlineUi=1');await waitFor('!!document.querySelector("[data-action=retry-babbage]")');await noAccordions();await fits();
    await shot('workspace-'+device+'-offline');
    await choose('[data-workspace-panel=revision]');await section('start');
    const requestCount=apiRequests.length;
    await fill('directions','Dev');
    const devSample=await evaluate('JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1"))');
    assert(devSample.workspace.creativeCore && devSample.workspace.instructorPlan && devSample.workspace.openQuestions,'Dev fills workspace writing fields');
    assert(devSample.state.teacher.directions.includes('staffing case'),'Dev fills the starting material');
    assert.equal(devSample.state.design.revision,'','Dev does not insert a fake AI draft');
    assert.equal(devSample.state.design.reason,'','The rationale follows the actual design work');
    assert.equal(devSample.state.designPanel,'babbage','Dev starts the Babbage workflow in Explore');
    assert(!devSample.state.finalCheck.approved,'Dev does not approve the sample');
    assert.equal(apiRequests.length,requestCount,'Autofill does not generate an AI response');
    assert.equal(await evaluate('localStorage.getItem("promptcraft_next_opening_v1")'),guidedRaw,'Workspace autofill preserves the guided save');
    await goto('?view=workspace');
    await waitFor('!!document.querySelector("[data-action=ask-ai]") && !document.querySelector("[data-action=ask-ai]").disabled');
    await click('ask-ai');await waitFor('!!document.querySelector("[data-clarification-answer]")');
    assert(apiRequests.length>requestCount,'Start exploring sends the filled context through Babbage');
    const afterDev=await evaluate('JSON.parse(localStorage.getItem("promptcraft_assignment_workspace_v1"))');
    assert(afterDev.state.babbage.history.some(turn=>turn.role==='assistant'),'Babbage response is recorded');
    assert.equal(afterDev.state.design.revision,'','Clarification never silently applies a draft');
    await choose('[data-workspace-panel=revision]');await section('presence');
    assert(await evaluate('document.getElementById("instructor-plan").value.includes("focused question")'),'Sample values remain available after changing sections');
    console.log(device+' PASS: no accordions, short task layouts, direct section navigation, separate idea views, combinations, preview/back focus, saved work, approval without Maya, guide, and failed-save recovery. Mocked AI only.');
  }
};
