module.exports = async ({send,evaluate,waitFor,shot,initialState,scenario}) => {
  const goto = async view => {
    await send('Page.navigate',{url:'http://127.0.0.1:8783/?view='+view});
    await waitFor('!!document.body.dataset.appView && document.querySelector("#app").children.length>0');
    await evaluate('document.fonts.ready');
  };
  const states = async label => {
    await require('./type-audit.cjs')(evaluate,label);
    await shot(label);
    await send('DOM.enable'); await send('CSS.enable');
    const {root} = await send('DOM.getDocument',{depth:0});
    const {nodeIds} = await send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'button,a,input,textarea,select'});
    for (const nodeId of nodeIds) await send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover','focus-visible']});
    await require('./type-audit.cjs')(evaluate,label+' hover/focus');
    await shot(label+'-hover-focus');
    for (const nodeId of nodeIds) await send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[]});
    await evaluate('window.__contrastControls=Array.from(document.querySelectorAll("button,input,textarea,select")).map(el=>[el,el.disabled]);window.__contrastControls.forEach(([el])=>el.disabled=true)');
    await require('./type-audit.cjs')(evaluate,label+' disabled');
    await shot(label+'-disabled');
    await evaluate('window.__contrastControls.forEach(([el,disabled])=>el.disabled=disabled);delete window.__contrastControls');
  };
  for (const [device,width,height] of [['desktop',1440,1000],['phone',390,844]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
    await goto('home'); await evaluate('localStorage.clear()'); await goto('home'); await states('audit-'+device+'-home');
    await goto('workspace'); await states('audit-'+device+'-workspace-empty');
    await evaluate(`(async()=>{const {freshWorkspace,saveWorkspace}=await import('/src/features/workspace/storage.js');const s=freshWorkspace();s.teacher.directions='Compare two staffing schedules.';s.teacher.learningGoal='Defend a recommendation with evidence.';s.teacher.aiUse='Feedback only';saveWorkspace(s);})()`);
    await goto('workspace'); await waitFor('!!document.querySelector("[data-action=explore-directions]")'); await states('audit-'+device+'-babbage');
    await evaluate('document.querySelector("[data-action=explore-directions]").click()');
    await waitFor('!!document.querySelector("[data-view-direction]")');
    await states('audit-'+device+'-possibilities');
    await evaluate('document.querySelector("[data-workspace-panel=revision]").click()');await states('audit-'+device+'-workspace-build');
    const state=initialState(scenario);state.phase='design';state.teacher.directions='Compare two staffing schedules.';state.teacher.learningGoal='Defend a recommendation with evidence.';state.teacher.aiUse='Feedback only';state.design.concern='Students repeat each other.';
    await evaluate('localStorage.setItem("promptcraft_next_opening_v1",'+JSON.stringify(JSON.stringify(state))+')');
    await goto('play');await states('audit-'+device+'-scenario');
    await evaluate('document.querySelector("[data-action=design-next]").click()');await states('audit-'+device+'-scenario-reply');
    state.designStep=2;state.designPanel='reason';state.design.revision='Compare two staffing schedules.';state.design.reason='A clear decision gives the reply a purpose.';
    await evaluate('localStorage.setItem("promptcraft_next_opening_v1",'+JSON.stringify(JSON.stringify(state))+')');
    await goto('play');await waitFor('!!document.querySelector("#reason")');await states('audit-'+device+'-scenario-reason');
    await evaluate(`(async()=>{const {initialState}=await import('/src/app/storage.js');const {discussionOpening}=await import('/src/features/opening/content.js');const {openMayaDialog}=await import('/src/features/design/maya-dialog.js');const s=initialState(discussionOpening);s.teacher.directions='Compare two staffing schedules.';s.design.revision='Compare two staffing schedules.';s.babbage.mode='live';openMayaDialog(s,document.activeElement,{autoStart:true,novel:true});})()`);
    await waitFor('!!document.querySelector("[data-dialogue-beat]")'); await states('audit-'+device+'-maya');
    await goto('guide');await states('audit-'+device+'-course-guide');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:width-40,y:24});await states('audit-'+device+'-header-hover');
    console.log(device+' stabilization screenshots and contrast captured');
  }
};
