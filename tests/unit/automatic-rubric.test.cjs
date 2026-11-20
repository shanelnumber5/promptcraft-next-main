const assert = require('node:assert/strict');
(async () => {
 const { createAutomaticRubric } = await import('../../src/features/workspace/automatic-rubric.js');
 let state={design:{revision:''},creative:{rubric:{requested:null,rows:[]}}}, busy=false, calls=0, queue=[];
 const auto=createAutomaticRubric({getState:()=>state,isBusy:()=>busy,canStart:()=>true,request:()=>{calls++;},enqueue:cb=>queue.push(cb)});
 const flush=()=>{const tasks=queue;queue=[];tasks.forEach(cb=>cb());};
 auto.schedule();flush();assert.equal(calls,0);
 state.design.revision='Assignment draft';auto.schedule();auto.schedule();flush();assert.equal(calls,1,'One draft request despite repeated renders');
 auto.schedule();flush();assert.equal(calls,1,'Failure or cancellation does not start an evaluation loop');
 state.design.revision='Revised draft';busy=true;auto.schedule();flush();assert.equal(calls,1);
 busy=false;auto.schedule();flush();assert.equal(calls,2,'Completion can draft after the busy state clears');
 state.creative.rubric.rows=[{name:'Instructor edited criterion'}];state.design.revision='Changed text';auto.schedule();flush();assert.equal(calls,2,'Existing instructor edits are preserved');
 state=structuredClone(state);state.creative.rubric.rows=[];state.creative.rubric.requested=false;auto.schedule();flush();assert.equal(calls,2,'Explicit opt-out is respected');
 state.creative.rubric.requested=true;auto.schedule();auto.cancel();flush();assert.equal(calls,2,'Leaving the page cancels queued work');
 console.log('PASS: automatic rubric one-shot drafting, busy-state gating, cancellation, opt-out and preservation of edited rubrics. Mocked request.');
})().catch(e=>{console.error(e);process.exit(1)});
