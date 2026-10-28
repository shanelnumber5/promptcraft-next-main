const assert = require('node:assert/strict');
module.exports = async (evaluate,label) => {
    const issues = await evaluate(`(() => {
      const issues=[];
      const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>2&&r.height>2&&s.display!=='none'&&s.visibility==='visible'&&!e.closest('[hidden],.sr-only');};
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()) {
        const n=walker.currentNode,e=n.parentElement;
        if(n.textContent.trim()&&!e.closest('script,style,option')&&visible(e)&&parseFloat(getComputedStyle(e).fontSize)<16) issues.push({text:n.textContent.trim().slice(0,60),size:getComputedStyle(e).fontSize});
      }
      for(const e of document.querySelectorAll('input,textarea,select'))if(visible(e)&&parseFloat(getComputedStyle(e).fontSize)<16)issues.push({control:e.id,size:getComputedStyle(e).fontSize});
      for(const e of document.querySelectorAll('button,.action-link,.nav-button,.workflow-nav a,.info-nav a,.home-path,.home-resume a')) {
        if(!visible(e))continue;
        const s=getComputedStyle(e);
        const corners=['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'];
        if(corners.some(k=>s[k]!=='3px'))issues.push({button:e.textContent.trim().slice(0,60),corners:corners.map(k=>s[k])});
      }
      for(const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
        if(!visible(h))continue;
        const section=h.closest('article,section,.speech-bubble,.maya-dialogue,.home-choices,.home-studio-intro')||h.parentElement;
        const body=[...section.querySelectorAll('p,li,label')].filter(visible).filter(e=>!e.closest('h1,h2,h3,h4,h5,h6'));
        const largest=Math.max(16,...body.map(e=>parseFloat(getComputedStyle(e).fontSize)));
        if(parseFloat(getComputedStyle(h).fontSize)<=largest)issues.push({heading:h.textContent.trim().slice(0,60),size:getComputedStyle(h).fontSize,body:largest});
      }
      return issues;
    })()`);
    assert.deepEqual(issues,[],label+' text minimum and heading hierarchy');
  };
