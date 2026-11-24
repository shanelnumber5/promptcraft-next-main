const assert = require('node:assert/strict');
(async () => {
  const {freshWorkspace}=await import('../../src/features/workspace/storage.js');
  const {assignmentContext}=await import('../../src/features/design/babbage-client.js');
  const {createDesignController}=await import('../../src/features/design/controller.js');
  const {applySuggestedDraft}=await import('../../src/features/workspace/draft.js');
  const state=freshWorkspace();
  Object.assign(state.teacher,{directions:'Choose a staffing plan using case evidence.',learningGoal:'Justify a decision.',aiUse:'No student AI use'});
  state.design.sourceDirections=state.teacher.directions;
  Object.assign(state.babbage,{mode:'dev',ready:true,context:assignmentContext(state)});
  const ai={pending:false,configured:true};
  let delivered=0;
  const app={querySelector:()=>null,contains:()=>false};
  const controller=createDesignController({app,getState:()=>state,ai,render:()=>{},saveSafely:()=>true,syncFinalCheck:()=>{},onSuggestion:()=>{delivered++;return true;}});
  const old=controller.askBabbage('revise');
  const cancelled=ai.requestController;
  cancelled.abort(); ai.pending=false; ai.requestController=null;
  const current=controller.askBabbage('revise');
  await old;
  assert(ai.pending,'Cancelled completion must not clear a newer loading state');
  await current;
  assert.equal(delivered,1,'Only the active request delivers a suggestion');
  assert.equal(state.babbage.history.filter(turn=>turn.role==='assistant').length,1);

  const originalFetch=global.fetch;
  const responses=[];
  global.fetch=()=>new Promise(resolve=>responses.push(resolve));
  try {
    const older=controller.refreshBabbageConnection();
    const newer=controller.refreshBabbageConnection();
    responses[1]({ok:true,json:async()=>({configured:true})}); await newer;
    responses[0]({ok:true,json:async()=>({configured:false})}); await older;
    assert.equal(ai.configured,true,'Older connection checks cannot overwrite the latest result');
  } finally {global.fetch=originalFetch;}

  state.design.previousRevision='An earlier draft worth preserving.';
  state.design.revision='';
  state.finalCheck.approved=true;
  applySuggestedDraft(state,{revision:'New directions.',reason:'Support reasoning.'});
  assert.equal(state.design.previousRevision,'An earlier draft worth preserving.');
  assert.equal(state.design.sourceDirections,state.teacher.directions);
  assert.equal(state.finalCheck.approved,false);
  applySuggestedDraft(state,{revision:'Revised directions.',reason:'Use feedback.'});
  assert.equal(state.design.previousRevision,'New directions.');
  console.log('PASS: aborted request isolation, connection ordering, prior-draft preservation, approval invalidation. Mocked only.');
})().catch(error=>{console.error(error);process.exitCode=1;});
