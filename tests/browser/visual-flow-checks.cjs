const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
module.exports=async({send,evaluate,waitFor,shot})=>{
 const results=[];
 const go=async(view)=>{await send('Page.navigate',{url:'http://127.0.0.1:8783/?view='+view});await waitFor('!!document.querySelector("#app h1")');await evaluate('document.fonts.ready');};
 const click=async(selector)=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)};
 const capture=async(name)=>{
  await evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))');
  await shot(name);
  const audit=await evaluate(`(()=>{const inners=[...document.querySelectorAll('#app *,dialog[open] *')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return r.width&&r.height&&!e.closest('[hidden]')&&['auto','scroll'].includes(s.overflowY)&&e.scrollHeight>e.clientHeight+2}).map(e=>e.className);const cutoff=[...document.querySelectorAll('.board-screen,.design-page-fields,.partner-inline-actions,.workspace-checks,.final-action-groups')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&r.bottom>innerHeight-55}).map(e=>({class:e.className,bottom:e.getBoundingClientRect().bottom}));return {innerScroll:inners,cutoff,horizontal:document.documentElement.scrollWidth>innerWidth+1,pageHeight:document.documentElement.scrollHeight};})()`);
  results.push({name,...audit});console.log(name,JSON.stringify(audit));
 };
 for(const [width,height]of [[1440,900],[390,800]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await go('home');await evaluate('localStorage.clear()');
  const seed=async(scene,stage,answer)=>{await evaluate(`(async()=>{const {discussionOpening}=await import('/src/features/opening/content.js');const {initialState,saveState}=await import('/src/app/storage.js');const s=initialState(discussionOpening);s.sceneId=${JSON.stringify(scene)};s.storyStage=${JSON.stringify(stage)};${answer?`s.answers[s.sceneId]=${JSON.stringify(answer)};`:''}saveState(s);})()`);await go('play&story=1');};
  await seed('spot-hole','question');await capture(width+'-quiz-unselected');
  await evaluate(`(()=>{const i=document.querySelector('input[value="roles"]');i.checked=true;i.dispatchEvent(new Event('change',{bubbles:true}));})()`);await capture(width+'-quiz-correct');
  assert(await evaluate('document.querySelector(".answer-result").textContent.includes("Correct")'));
  await click('[data-action=hear-maya]');await capture(width+'-maya-checkin');assert(await evaluate('document.querySelector("#speaker-label").textContent==="Maya"'));
  await click('[data-action=hear-pixel]');await capture(width+'-pixel-checkin');assert(await evaluate('document.querySelector(".speech-bubble").textContent.includes("?")'));
  await seed('spot-hole','question','length');await capture(width+'-quiz-wrong');
  await seed('revised-plan','board');await capture(width+'-service-plan');await click('[data-plan-comparison=original]');assert(await evaluate('document.querySelector("#board-title").textContent==="One stand, two helpers"'));
  await seed('bridge','dialogue');await capture(width+'-dialogue');
  // Menu and final-step restart share the same confirmation and reset path.
  await click('[data-action=restart-module]');await waitFor('!!document.querySelector(".restart-dialog[open]")');await click('.restart-dialog button[value=cancel]');assert(await evaluate('document.querySelector(".speech-bubble").textContent.includes("Their question")'));
  await click('[data-action=restart-module]');await click('[data-action=confirm-restart]');await waitFor('document.querySelector(".speech-bubble").textContent.includes("I posted")');
  await seed('bridge','board');await click('[data-action=restart-scenario]');await click('[data-action=confirm-restart]');await waitFor('document.querySelector(".speech-bubble").textContent.includes("I posted")');
  await go('workspace');await waitFor('!!document.querySelector("#workspace-panel")');
  await evaluate(`(async()=>{const {freshWorkspace}=await import('/src/features/workspace/storage.js');const s=freshWorkspace();s.teacher.directions='Recommend a staffing schedule using two case details. Respond to a peer challenge, then revise or defend your recommendation.';s.design.revision=s.teacher.directions;s.teacher.learningGoal='Justify a staffing decision with evidence.';s.design.reason='The peer question makes students examine their reasoning.';s.workspace.assignmentTitle='Staffing-schedule decision';s.workspace.selectedDirection={title:'A decision worth testing',core:'Compare two staffing plans. Ask a peer to challenge one assumption, then revise or defend the choice.'};s.babbage.mode='dev';window.qaState=s;window.qaAi={configured:true,pending:false};})()`);
  const partner=async(extra='')=>evaluate(`(async()=>{const {renderPartner}=await import('/src/features/workspace/partner-view.js');${extra}document.getElementById('workspace-panel').innerHTML=renderPartner(qaState,qaAi,'work',null,{});})()`);
  for (const step of ['start','subject','learning','ai-use','requirements','sharing','intentions','presence','draft']) {
    await evaluate(`(async()=>{const {renderBuildPage}=await import('/src/features/workspace/build-view.js');document.getElementById('workspace-panel').innerHTML=renderBuildPage(qaState,qaAi,${JSON.stringify(step)});})()`);
    await capture(width+'-build-'+step);
  }
  await partner();await capture(width+'-explore');
  await partner(`qaState.babbage.history=[{role:'assistant',display:'Worth keeping: Your decision uses a concrete case. Tradeoff: Give students time to test a competing recommendation.'}];qaState.babbage.questions=[{id:'q1',question:'Which case details should students use?'}];`);await capture(width+'-notes');
  await partner(`qaAi.suggestion={revision:'Staffing-Schedule Decision. Purpose: justify a staffing choice with evidence. Compare two schedules. Post your recommendation with two case details. Ask a peer to test one assumption. Revise or defend your decision after reading their response.',reason:'Peer input tests the decision.'};`);await capture(width+'-comparison');
  await evaluate(`(async()=>{const {renderReview}=await import('/src/features/workspace/review-view.js');document.getElementById('workspace-panel').innerHTML=renderReview(qaState,qaAi,'checks',null,{});})()`);await capture(width+'-final-checks');
  await evaluate(`(async()=>{const {createAiWaiting}=await import('/src/features/design/ai-waiting.js');window.qaWait=createAiWaiting({onCancel:()=>qaWait({pending:false})});qaWait({pending:true,intent:'review',stage:'working'});})()`);await capture(width+'-waiting');
  const t1=await evaluate('getComputedStyle(document.querySelector(".babbage-progress span")).transform');await new Promise(r=>setTimeout(r,120));const t2=await evaluate('getComputedStyle(document.querySelector(".babbage-progress span")).transform');assert.notEqual(t1,t2,'Indeterminate bar moves');assert.equal(await evaluate('document.querySelector(".babbage-progress").hasAttribute("aria-valuenow")'),false);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#app")).visibility'),'hidden');await click('.ai-waiting-dialog>button');assert.equal(await evaluate('!!document.querySelector(".ai-waiting-dialog")'),false);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await evaluate('qaWait({pending:true,stage:"working"})');assert.equal(await evaluate('getComputedStyle(document.querySelector(".babbage-progress span")).animationName'),'none');await evaluate('qaWait({pending:false})');await send('Emulation.setEmulatedMedia',{features:[]});
  await evaluate(`(async()=>{const {createGuide,guideOptions}=await import('/src/features/design/guide.js');qaState.experience='scenario';const html=createGuide(qaState.design,guideOptions(qaState));document.open();document.write(html);document.close();})()`);await evaluate('document.fonts.ready');await capture(width+'-guide');
  assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'),false,'Guide horizontal fit');assert.equal(await evaluate('document.querySelector(".toc").textContent.includes("lemonade")'),true);
 }
 fs.writeFileSync(path.join(process.env.PC_BROWSER_OUTPUT,'visual-flow-layout.json'),JSON.stringify(results,null,2));
 const failures=results.filter(r=>r.innerScroll.length||r.cutoff.length||r.horizontal||(!r.name.endsWith('-guide')&&r.pageHeight>(r.name.startsWith('1440')?900:800)+2));assert.deepEqual(failures,[],'No inner scrollbars or clipped task content');
};
