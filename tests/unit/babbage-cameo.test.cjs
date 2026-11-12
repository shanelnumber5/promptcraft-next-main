const assert = require('node:assert/strict');
(async () => {
  const {babbageCameoFor,renderBabbageCameo,showBabbageCameo}=await import('../../src/shared/babbage-cameo.js');
  const {parseBabbageFeedback,humorInstructions}=await import('../../src/shared/babbage-feedback.js');
  const {normalizeBabbageResponse}=await import('../../src/features/design/babbage-client.js');
  const {applyBabbageTurn}=await import('../../src/features/design/turn-state.js');
  const raw=(tone,aside,message='Try a decision that students must explain.')=>JSON.stringify({version:1,tone,message,aside});
  const state={teacher:{learningGoal:'Explain a decision.',aiUse:'No AI',directions:'My printer chairs the department.'},babbage:{mode:'live',history:[]}};
  const joke='The new chair has an impressive paper trail.';
  assert.equal(babbageCameoFor(state,raw('playful',joke)),joke);
  assert.equal(babbageCameoFor(state,raw('sarcastic',joke)),joke);
  for(const tone of ['serious','uncertain','frustrated']) assert.equal(babbageCameoFor(state,raw(tone,joke)),null,'Acknowledging tone does not require humor');
  assert.equal(babbageCameoFor(state,'A plain opening sentence.'),null,'Never infer a joke from an opening sentence');
  assert.equal(babbageCameoFor(state,raw('playful','x'.repeat(241))),null);
  assert.equal(babbageCameoFor({...state,babbage:{mode:'dev'}},raw('playful',joke)),null);
  assert.equal(parseBabbageFeedback('Legacy feedback.').message,'Legacy feedback.');
  assert.equal(parseBabbageFeedback('{bad json}').aside,'');
  const turn=normalizeBabbageResponse({analysis:{feedback_summary:raw('playful',joke),input_quality:{usable:true,concerns:[]}}},'clarify');
  assert.equal(turn.message,'Try a decision that students must explain.');
  assert(!turn.message.includes(joke));
  applyBabbageTurn(state.babbage,[],turn,state.teacher);
  assert.equal(babbageCameoFor(state,turn.message),joke,'Separate aside survives saved conversation content');
  assert(renderBabbageCameo(state,turn.message).includes('data-babbage-cameo='));
  assert.equal(babbageCameoFor(state,'Different feedback.'),null,'Old aside cannot attach to unrelated feedback');
  const restored=JSON.parse(JSON.stringify(state));
  assert.equal(babbageCameoFor(restored,turn.message),joke);
  for(const example of ['Yell at them','mandatory discussion','department chair','don\'t know','Analyze satire','exhausted']) assert(humorInstructions.includes(example));
  const previousDocument=global.document;
  const previews=[];
  const fakeDialog=()=>({
    style:{setProperty(){}},setAttribute(){},querySelectorAll:()=>[],addEventListener(){},
    showModal(){previews.push(this.innerHTML);},
  });
  global.document={querySelector:()=>null,activeElement:null,createElement:fakeDialog,body:{appendChild(){}}};
  try {
    const root={querySelector:()=>null};
    const dev={...state,babbage:{mode:'dev',history:[]}};
    showBabbageCameo(dev,root,joke);
    assert.equal(previews.length,0,'Ordinary Dev feedback cannot masquerade as a live aside');
    showBabbageCameo(dev,root,joke,{preview:true});
    assert.equal(previews.length,1,'Explicit joke shortcut can preview the portrait in Dev mode');
    assert(previews[0].includes('Dev preview · scripted joke · no AI request'));
    assert(previews[0].includes('charles-babbage-full.webp'));
    assert(previews[0].includes(joke));
    showBabbageCameo(dev,root,joke,{preview:true});
    assert.equal(previews.length,2,'An explicit preview can be repeated');
  } finally {global.document=previousDocument;}
  console.log('PASS: explicit humorous asides, tone gates, plain legacy replies, saved history, no opening-sentence guessing. Mocked responses only.');
})().catch(error=>{console.error(error);process.exitCode=1;});
