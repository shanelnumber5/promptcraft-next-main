const assert = require('node:assert/strict');
(async () => {
  const {freshWorkspace, saveWorkspace, readWorkspace, WORKSPACE_KEY} = await import('../../src/features/workspace/storage.js');
  const {createProjectFile, parseProjectFile} = await import('../../src/features/workspace/project-file.js');
  const {reviewFingerprint, reviewNeedsCheck} = await import('../../src/features/workspace/review-ai.js');
  const {assignmentContext} = await import('../../src/features/design/babbage-client.js');
  const {finalCheckContext, finalCheckReady} = await import('../../src/features/design/content.js');
  const {invalidateWorkspaceApproval} = await import('../../src/features/workspace/approval.js');
  const {renderWorkspace} = await import('../../src/features/workspace/screen.js');
  const {createGuide} = await import('../../src/features/design/guide.js');
  const {initialState, STORAGE_KEY} = await import('../../src/app/storage.js');
  const {discussionOpening} = await import('../../src/features/opening/content.js');
  const {renderClosing} = await import('../../src/features/design/closing.js');
  function approvedProject() {
    const state = freshWorkspace();
    Object.assign(state.teacher, {directions:'Original case activity.',learningGoal:'Evaluate competing evidence.',subject:'Management',learnerLevel:'First-year students',aiUse:'ideas'});
    Object.assign(state.design, {sourceDirections:state.teacher.directions,revision:'Compare evidence and explain a decision. '.repeat(60),reason:'Make reasoning visible.',concern:'Move beyond recall.'});
    Object.assign(state.workspace, {creativeCore:'Defend a decision.',instructorPlan:'Question emerging reasoning.',openQuestions:'How much time is needed?',studentNeeds:'Flexible timing.'});
    state.designPanel = 'reason';
    Object.assign(state.finalCheck,{instructions:true,learning:true,requirements:true,completed:true,approved:true,context:finalCheckContext(state.teacher,state.design)});
    const fingerprint=reviewFingerprint(state);
    state.creative.review={fingerprint,feedback:'Consider which evidence students need.',status:'complete',error:'',offeredMaya:fingerprint};
    return state;
  }
  const state=approvedProject();
  assert(finalCheckReady(state));
  assert(state.creative.review.fingerprint.length>1000);
  const guidedRaw=JSON.stringify(initialState(discussionOpening));
  const records=new Map([[STORAGE_KEY,guidedRaw]]);
  const storage={getItem:key=>records.get(key)||null,setItem:(key,value)=>records.set(key,value)};
  assert(saveWorkspace(state,storage));
  const beforeRead=records.get(WORKSPACE_KEY);
  const restored=readWorkspace(storage);
  assert(!restored.error);
  assert.equal(records.get(WORKSPACE_KEY),beforeRead,'Reading never rewrites saved bytes');
  for(const result of [restored.state,parseProjectFile(createProjectFile(state))]) {
    assert.equal(result.design.revision,state.design.revision);
    assert.deepEqual(result.workspace,state.workspace);
    assert.equal(result.creative.review.fingerprint,state.creative.review.fingerprint);
    assert.equal(result.creative.review.offeredMaya,state.creative.review.offeredMaya);
    assert(!reviewNeedsCheck(result),'Long draft review remains current after restoration');
    assert(result.finalCheck.approved && finalCheckReady(result));
    const guide=createGuide(result.design,{teacher:result.teacher,workspace:result.workspace,approved:result.finalCheck.approved});
    for(const removed of ['Creative core and design intentions','Chosen improvement','Approved milestone','Using your downloaded guide','<nav class="toc"']) assert(!guide.includes(removed), 'Workspace Guide omits redundant sections');
    for(const text of ['Course Guide · Your activity','Activity directions',result.workspace.instructorPlan,result.design.reason]) assert(guide.includes(text));
    assert(renderClosing(result).includes('workspace-home'));
  }
  for(const [group,key,value] of [['teacher','subject','Biology'],['teacher','learnerLevel','Advanced students'],['teacher','aiUse','none'],['design','concern','Improve transfer.'],['workspace','studentNeeds','Offline alternatives.'],['workspace','creativeCore','Test a hypothesis.'],['workspace','instructorPlan','Provide content feedback.'],['design','revision','New directions.']]) {
    const edited=approvedProject();
    const before=assignmentContext(edited);
    edited[group][key]=value;
    assert(invalidateWorkspaceApproval(edited,before),`${group}.${key} invalidates approval`);
    assert(!edited.finalCheck.approved && !edited.finalCheck.completed && !finalCheckReady(edited));
    assert(!parseProjectFile(createProjectFile(edited)).finalCheck.approved);
  }
  assert(!invalidateWorkspaceApproval(state,assignmentContext(state)),'No-op input preserves approval');
  const failingStorage={setItem(){throw Error('quota');}};
  assert(!saveWorkspace(state,failingStorage));
  const unsaved=renderWorkspace(state,{pending:false,configured:true},'', 'draft');
  assert(unsaved.includes('Not saved in this browser.</span>'));
  assert(!unsaved.includes('>Saved in this browser.</span>'));
  assert(state.saveNotice.includes('download your project from Options'));
  assert.equal(parseProjectFile(createProjectFile(state)).design.revision,state.design.revision,'Backup works even when autosave fails');
  const bad='{"broken":true}';records.set(WORKSPACE_KEY,bad);
  assert(readWorkspace(storage).error);
  assert.equal(records.get(WORKSPACE_KEY),bad,'Damaged saves remain untouched');
  for(const text of ['not json','{}','[]',JSON.stringify({format:'promptcraft-workspace-project',fileVersion:99,project:{}})]) assert.throws(()=>parseProjectFile(text));
  assert.equal(records.get(STORAGE_KEY),guidedRaw,'Scenario 1 save is unchanged');
  console.log('PASS: approved project roundtrip, long review restoration, edit invalidation, save-failure backup and status, guide/completion rendering, corrupt-file protection, Scenario 1 isolation. No browser or live AI used.');
})().catch(error=>{console.error(error);process.exitCode=1;});
