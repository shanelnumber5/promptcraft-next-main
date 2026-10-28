const assert = require('node:assert/strict');
module.exports = async ({send,evaluate,waitFor,shot}) => {
  const inspectType = label => require('./type-audit.cjs')(evaluate,label);
  for(const [device,width,height] of [['desktop',1440,1000],['short',1280,720],['phone',390,844],['small-phone',320,568]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
    let frame;
    for(const view of ['home','how-to-play','about','babbage','privacy','guide']) {
      await send('Page.navigate',{url:'http://127.0.0.1:8783/?view='+view});
      await waitFor('!!document.querySelector(".menu-board")');
      await evaluate('document.fonts.ready');
      const metrics=await evaluate('(()=>{const r=document.querySelector(".menu-board").getBoundingClientRect(),f=document.querySelector(".app-footer").getBoundingClientRect();return {height:r.height,footer:f.top};})()');
      if(!frame)frame=metrics;
      assert(Math.abs(metrics.height-frame.height)<1,device+' same menu height: '+view+JSON.stringify({frame,metrics}));
      assert(Math.abs(metrics.footer-frame.footer)<1,device+' fixed gold footer: '+view+JSON.stringify({frame,metrics}));
      if(view==='home') assert(await evaluate(`(() => {
        const a=document.querySelector('.home-choices').getBoundingClientRect();
        const b=document.querySelector('.home-studio-intro').getBoundingClientRect();
        return a.right<=b.left+1 || b.right<=a.left+1 || a.bottom<=b.top+1 || b.bottom<=a.top+1;
      })()`),device+' Home choices and introduction never overlap');
      await inspectType(device+' '+view);
      await shot('type-menu-'+device+'-'+view);
      const count=await evaluate('document.querySelectorAll("[data-info-section]").length');
      for(let i=0;i<count;i++) {
        await evaluate('document.querySelectorAll("[data-info-section]")['+i+'].click()');
        await inspectType(device+' '+view+' topic '+i);
        assert(await evaluate('Math.abs(document.querySelector(".app-footer").getBoundingClientRect().top-'+frame.footer+')<1'),device+' footer stays fixed across topics');
      }
    }
    console.log(device+' PASS: all menu pages/topics keep the same height and footer; text >=16px and headings exceed body text.');
  }
};
