const assert = require('node:assert/strict');
(async () => {
 const {createAiWaiting}=await import('../../src/features/design/ai-waiting.js');
 const {renderLoading}=await import('../../src/features/design/loading.js');
 const old=global.document;
 let created=0,cancelled=0;
 const dialogs=[];
 global.document={querySelector(){return null;},body:{children:[],classList:{add(){},remove(){}},append(){}},createElement(){
  created++;
  const button={focus(){},addEventListener(name,fn){this[name]=fn;}};
  const content={innerHTML:''};
  const dialog={open:false,button,content,events:{},setAttribute(){},querySelector(s){return s==='button'?button:content;},addEventListener(n,f){this.events[n]=f;},showModal(){this.open=true;},close(){this.open=false;},remove(){this.removed=true;}};
  dialogs.push(dialog);return dialog;
 }};
 try {
  let sync;
  sync=createAiWaiting({onCancel(){cancelled++;sync({pending:false});}});
  sync({pending:true,intent:'explore'});
  assert.equal(dialogs[0].open,true,'Native modal blocks menu interaction');
  sync({pending:true,intent:'review'});
  assert.equal(created,1,'The same waiting surface is reused across stages');
  assert(dialogs[0].content.innerHTML.includes('Reviewing your activity'));
  sync({pending:true,intent:'review',stage:'complete'});
  assert(!dialogs[0].content.innerHTML.includes('Response ready'), 'Previous completion is not displayed as the current request');
  dialogs[0].button.click();
  assert.equal(cancelled,1);assert.equal(dialogs[0].removed,true);
  sync({pending:true,intent:'revise'});
  let prevented=false;dialogs[1].events.cancel({preventDefault(){prevented=true;}});
  assert(prevented);assert.equal(cancelled,2);
  sync({pending:true});sync({pending:false});assert.equal(dialogs[2].open,false);
  assert(renderLoading({intent:'perspectives',stage:'working'},false).includes('Preparing Maya and Pixel’s feedback'));
 } finally {global.document=old;}
 console.log('PASS: shared modal waiting, stage updates, completion, cancellation and Escape. Offline only.');
})().catch(e=>{console.error(e);process.exitCode=1;});
