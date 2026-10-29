const assert = require('node:assert/strict');
module.exports = async ({send,evaluate,waitFor,shot,key,keyboardReach,accessibleScreen}) => {
  const choose = selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  for(const [device,width,height] of [['desktop',1280,800],['tablet',820,1024],['phone',390,844],['small-phone',320,568]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
    await send('Page.navigate',{url:'http://127.0.0.1:8783/?view=home'});
    await waitFor('document.readyState==="complete"');
    await evaluate(`(async()=>{
      const {freshWorkspace,saveWorkspace}=await import('/src/features/workspace/storage.js');
      const {reviewFingerprint}=await import('/src/features/workspace/review-ai.js');
      localStorage.clear();
      const state=freshWorkspace();
      state.designPanel='revision';
      Object.assign(state.teacher,{directions:'Compare two case studies.',subject:'Introduction to management',learningGoal:'Evaluate competing evidence.',learnerLevel:'First-year students'});
      state.creative.mayaPaused=true;
      Object.assign(state.design,{sourceDirections:state.teacher.directions,revision:'Compare the evidence, choose a response, and explain your reasoning.',reason:'Make students’ reasoning visible.'});
      state.creative.review={fingerprint:reviewFingerprint(state),feedback:'Which evidence would help students test their decision?',status:'complete',error:'',offeredMaya:''};
      saveWorkspace(state);
    })()`);
    await send('Page.navigate',{url:'http://127.0.0.1:8783/?view=workspace'});
    await waitFor('!!document.querySelector(".workspace-section-sidebar")');
    const sidebar=await evaluate('[...document.querySelectorAll(".workspace-section-sidebar button")].map(el=>el.dataset.designPage)');
    assert.deepEqual(sidebar,['start','subject','ai-use','intentions','presence','draft']);
    let desktopFooter;
    const sameFooter=async label=>{
      const bars=await evaluate('[...document.querySelectorAll("#workspace-panel .workspace-action-bar")].map(el=>el.getBoundingClientRect().toJSON())');
      assert.equal(bars.length,1, `${label}: one main gold bar`);
      assert.equal(bars[0].height,72, `${label}: 72px action bar`);
      desktopFooter ??= bars[0];
      for(const property of ['y','height']) assert(Math.abs(bars[0][property]-desktopFooter[property])<3, `${label}: stable gold bar ${property}`);
    };
    for(const page of sidebar) {
      await choose(`[data-design-page="${page}"]`);
      const layout=await evaluate(`(()=>{
        const footer=document.querySelector('.workspace-section-main .workspace-view-actions');
        const panel=document.getElementById('workspace-panel');
        return {width:document.documentElement.scrollWidth,viewport:innerWidth,
          footer:footer.getBoundingClientRect().toJSON(),panel:panel.getBoundingClientRect().toJSON(),
          nav:[...document.querySelectorAll('.workspace-section-sidebar button')].map(el=>({size:parseFloat(getComputedStyle(el).fontSize),height:el.getBoundingClientRect().height})),
          current:document.querySelectorAll('.workspace-section-sidebar [aria-current="page"]').length,
          fields:[...document.querySelectorAll('.build-page-fields input,.build-page-fields textarea,.build-page-fields select')].map(el=>({id:el.id||el.name,width:el.getBoundingClientRect().width}))};
      })()`);
      assert(layout.width<=layout.viewport,`${device}/${page}: no document overflow`);
      assert.equal(layout.current,1);
      for(const item of layout.nav) assert(item.size>=16 && item.height>=44,`${device}/${page}: readable navigation and targets`);
      for(const field of layout.fields) assert(field.width>0,`${device}/${page}: visible field ${field.id}`);
      assert(Math.abs(layout.footer.bottom-layout.panel.bottom)<3,`${device}/${page}: footer at panel bottom`);
      await sameFooter(`${device}/build/${page}`);
      if(page==='ai-use') assert(await evaluate('(()=>{const wide=document.querySelector(".workspace-field-wide").getBoundingClientRect();const grid=document.querySelector(".workspace-combined-fields").getBoundingClientRect();return Math.abs(wide.width-grid.width)<2;})()'), `${device}: requirements span both columns`);
      if(page==='intentions'||page==='presence') {
        const ids=page==='intentions'?['creative-core','concern']:['instructor-plan','open-questions'];
        assert(await evaluate(`(()=>{const first=document.getElementById(${JSON.stringify(ids[0])}).getBoundingClientRect();const second=document.getElementById(${JSON.stringify(ids[1])}).getBoundingClientRect();return second.top>first.bottom&&Math.abs(first.width-second.width)<2;})()`), `${device}/${page}: full-width answers are stacked in order`);
      }
      assert(await evaluate('getComputedStyle(document.getElementById("design-page-title")).fontFamily.startsWith("Arial")'), `${device}/${page}: bold scenario typography`);
      await accessibleScreen(`${device}/${page}`);
      await shot(`layout-${device}-build-${page}`);
    }
    await keyboardReach('.workspace-section-sidebar [data-design-page="subject"]');
    const focus=await evaluate('(()=>{const style=getComputedStyle(document.activeElement);return {color:style.outlineColor,width:parseFloat(style.outlineWidth)};})()');
    assert.equal(focus.color,'rgb(30, 45, 89)');
    assert(focus.width>=3);
    await key('Enter','Enter',13);
    await choose('[data-workspace-panel="reason"]');
    for(const page of ['rationale','reasoning','checks','help']) {
      await choose(`[data-review-page="${page}"]`);
      assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),`${device}/${page}: no document overflow`);
      assert.equal(await evaluate('document.querySelectorAll(".review-actions").length'),1);
      await sameFooter(`${device}/review/${page}`);
      await accessibleScreen(`${device}/review/${page}`);
      await shot(`layout-${device}-review-${page}`);
    }
    await choose('[data-workspace-panel="babbage"]');
    await sameFooter(`${device}/explore`);
    if(width>=820) assert(await evaluate('document.documentElement.scrollHeight<=innerHeight+1'), `${device}: workspace fits the browser height`);
    await evaluate('document.querySelector(".design-notice").textContent="Add your draft and design reasoning before checking the design."');
    await sameFooter(`${device}/notice-visible`);
    await evaluate('document.querySelector(".design-notice").textContent=""');
    await accessibleScreen(`${device}/explore`);
    await shot(`layout-${device}-explore`);
    await choose('[data-workspace-view="options"]');
    await sameFooter(`${device}/options`);
    await shot(`layout-${device}-options`);
    console.log(`${device} PASS: six Build pages, four Review pages, Explore, keyboard focus, footer placement, rendered contrast. Mocked service only.`);
  }
};
