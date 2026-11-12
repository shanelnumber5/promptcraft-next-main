const assert = require('node:assert/strict');
// Broad screenshot inventory complements the route tests that exercise interactions.
module.exports = async ({ send, evaluate, waitFor, shot, accessibleScreen }) => {
  const go = async (view) => {
    await send('Page.navigate', { url: 'http://127.0.0.1:8783/?view=' + view });
    await waitFor('document.readyState === "complete" && !!document.querySelector("h1")');
    await evaluate('document.fonts.ready');
  };
  const capture = async (label) => {
    await evaluate('window.scrollTo(0,0)');
    await evaluate('Promise.all([...document.images].map(image=>image.decode().catch(()=>{})))');
    if (label.endsWith('-dialog-maya-reading') || label.endsWith('-dialog-pixel')) {
      assert(
        await evaluate(
          `(()=>{const dialog=document.querySelector('.maya-dialog[open]');const bounds=dialog.getBoundingClientRect();return [...dialog.querySelectorAll('.maya-scene-nav button')].every(button=>{const r=button.getBoundingClientRect();return r.top>=bounds.top && r.bottom<=bounds.bottom && r.left>=bounds.left && r.right<=bounds.right;});})()`,
        ),
        label + ': both dialogue navigation buttons stay visible',
      );
    }
    await accessibleScreen(label);
    await shot(label);
  };
  for (const [device, width, height] of [
    ['desktop', 1280, 800],
    ['tablet', 820, 1024],
    ['phone', 390, 844],
    ['small-phone', 320, 568],
    ['short-desktop', 1280, 600],
    ['landscape', 844, 390],
  ].filter(
    ([name]) =>
      !process.env.PC_BROWSER_DEVICE || process.env.PC_BROWSER_DEVICE.split(',').includes(name),
  )) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await go('home');
    await evaluate('localStorage.clear()');
    for (const view of ['home', 'how-to-play', 'about', 'babbage', 'privacy']) {
      await go(view);
      const count = await evaluate('document.querySelectorAll("[data-info-section]").length');
      for (let index = 0; index < Math.max(1, count); index++) {
        if (count)
          await evaluate(`document.querySelector('[data-info-section="${index}"]').click()`);
        await capture(`${device}-public-${view}-${index}`);
      }
    }
    await go('guide');
    await capture(`${device}-guide-empty`);
    await go('play');
    const scenes = await evaluate(`(async()=>{
      const {discussionOpening}=await import('/src/features/opening/content.js');
      return discussionOpening.scenes.map(scene=>({id:scene.id,choices:scene.choice?.options.map(option=>option.id)||[]}));
    })()`);
    for (let index = 0; index < scenes.length; index++) {
      const scene = scenes[index];
      for (const stage of ['dialogue', 'board', ...(scene.choices.length ? ['question'] : [])]) {
        for (const answer of stage === 'question' ? ['', ...scene.choices] : ['']) {
          await evaluate(`(async()=>{
            const {discussionOpening}=await import('/src/features/opening/content.js');
            const {initialState}=await import('/src/app/storage.js');
            const {renderScene}=await import('/src/features/opening/screen.js');
            const state=initialState(discussionOpening);
            state.storyStage=${JSON.stringify(stage)};
            state.answers[${JSON.stringify(scene.id)}]=${JSON.stringify(answer)};
            document.getElementById('app').innerHTML=renderScene(discussionOpening,discussionOpening.scenes[${index}],state,${index},{className:${JSON.stringify('scene-' + scene.id + (answer ? ' answer-selected' : ''))}});
          })()`);
          await capture(`${device}-story-${index}-${stage}${answer ? '-' + answer : ''}`);
        }
      }
    }
    await go('workspace');
    await evaluate(String.raw`(async()=>{
      const {freshWorkspace}=await import('/src/features/workspace/storage.js');
      const {reviewFingerprint}=await import('/src/features/workspace/review-ai.js');
      const state=freshWorkspace();
      Object.assign(state.teacher,{subject:'Introduction to management',learnerLevel:'First-year students',learningGoal:'Evaluate competing evidence and justify a staffing decision.',directions:'Compare two staffing schedules.',aiUse:'No student AI use',workTime:'45 minutes',daysAvailable:'One week',mustStay:'Use the supplied case evidence.'});
      Object.assign(state.design,{sourceDirections:state.teacher.directions,revision:'### Staffing decision\n\n1. Compare two staffing schedules.\n2. Recommend a fair plan using the supplied workplace case.\n3. Explain a tradeoff and how you would check the plan.',previousRevision:'Explain which schedule you prefer and why.',reason:'Students compare evidence, explain a tradeoff, and use feedback to reconsider a choice.'});
      Object.assign(state.workspace,{instructorPlan:'Ask one question about the evidence before students submit their final plan.',studentContribution:'An evidence-based staffing recommendation.',peerInteraction:'Check a peer’s proposed tradeoff.',creativeCore:'Make the competing priorities visible.'});
      state.creative.directions=['Investigate conflicting evidence','Negotiate competing priorities','Trace a decision’s consequences'].map((title,index)=>({title,description:'Use the supplied workplace case to investigate a consequential staffing decision.',experience:'Compare approaches with a classmate and explain a choice using the evidence.',learning:'Justify a recommendation.',online:'Use an asynchronous board; allow a text alternative.',core:'Protect the distinctive decision structure '+index}));
      state.creative.alternatives=structuredClone(state.creative.directions);
      state.babbage.history=[{role:'user',content:'Preserve asynchronous participation.',display:'Preserve asynchronous participation.'},{role:'assistant',content:'Which tradeoff should students examine?',display:'Which tradeoff should students examine?'}];
      state.creative.mayaPaused=true;
      state.creative.review={fingerprint:reviewFingerprint(state),feedback:'The activity asks students to compare evidence and make a staffing choice. How will they know which tradeoff is consequential? Model one example, while leaving room for their own decisions.',status:'complete',error:'',offeredMaya:''};
      window.screenReviewState=state;
      window.renderScreenReview=async (options={})=>{
        const {renderWorkspace}=await import('/src/features/workspace/screen.js');
        const {fitWorkspace}=await import('/src/features/workspace/layout.js');
        const copy=structuredClone(state);
        copy.designPanel=options.panel||'babbage';
        if(options.empty) {copy.teacher.directions='';copy.design.revision='';copy.babbage.history=[];copy.creative.directions=[];copy.creative.alternatives=[];}
        if(options.question) copy.babbage.questions=[{id:'question-1',text:'Which practical constraint should students preserve while comparing these two staffing schedules?',field:''}];
        if(options.proposals) copy.creative.review.feedback=JSON.stringify({version:1,tone:'serious',aside:'',message:'Consider making the learning action and instructor feedback more specific.',teaching_notes:{learningGoal:'Justify a staffing recommendation using case evidence.',instructorPlan:'Before the final recommendation, ask students to explain how their evidence supports one tradeoff.'}});
        if(options.reviewError) Object.assign(copy.creative.review,{status:'error',error:'Babbage could not review this draft. Try again or keep working.'});
        if(options.approved) {
          const {finalCheckContext}=await import('/src/features/design/content.js');
          Object.assign(copy.finalCheck,{context:finalCheckContext(copy.teacher,copy.design),instructions:true,learning:true,requirements:true,completed:true,approved:true});
        }
        const ai={pending:false,configured:true,...options.ai};
        const app=document.getElementById('app');
        app.innerHTML=renderWorkspace(copy,ai,options.error||'',options.build||'draft',options.partner||'work',options.review||'rationale',options.ui||{screen:'work'});
        fitWorkspace(app);
      };
    })()`);
    const cases = [
      ['empty', { empty: true }],
      ['loading', { ai: { pending: true, stage: 'working', intent: 'explore' } }],
      ['offline', { ai: { configured: false } }],
      ['question', { question: true }],
      [
        'suggestion',
        {
          ai: {
            suggestion: {
              revision: 'Compare a classmate’s evidence and explain what it reveals.',
              reason: 'Test the reasons behind a choice.',
            },
          },
        },
      ],
      ['ideas', { partner: 'ideas' }],
      ['history', { partner: 'history' }],
      ['connection', { partner: 'options' }],
      ['empty-draft', { empty: true, panel: 'revision' }],
      [
        'restore-error',
        {
          error:
            'Your saved workspace could not be read. It has not been overwritten. Reset this workspace to start again.',
        },
      ],
      ...[
        'preview',
        'saved',
        'combine',
        'feedback',
        'earlier',
        'maya',
        'review-options',
        'sections',
        'options',
      ].map((screen) => [screen, { ui: { screen, index: 0 } }]),
      ...['overview', 'learning', 'online'].map((part) => [
        'idea-' + part,
        { ui: { screen: 'idea', index: 0, part } },
      ]),
      ['review-proposals', { panel: 'reason', proposals: true }],
      ['review-error', { panel: 'reason', reviewError: true }],
      ['approved', { panel: 'reason', review: 'checks', approved: true }],
    ];
    for (const [name, options] of cases) {
      await evaluate(`window.renderScreenReview(${JSON.stringify(options)})`);
      await capture(`${device}-studio-${name}`);
    }
    await evaluate('window.renderScreenReview({panel:"reason",review:"checks"})');
    for (const stage of ['board', 'dialogue']) {
      for (const page of stage === 'board' ? [0] : [0, 1, 2, 3]) {
        await evaluate(`(async()=>{
          const {renderClosing}=await import('/src/features/design/closing.js');
          document.getElementById('app').innerHTML=renderClosing(window.screenReviewState,${JSON.stringify(stage)},${page});
        })()`);
        await capture(`${device}-closing-${stage}-${page}`);
      }
    }
    await evaluate('window.renderScreenReview({panel:"reason",review:"checks"})');
    await evaluate(`(async()=>{
      const {openGuidePreview}=await import('/src/features/design/guide-preview.js');
      openGuidePreview(window.screenReviewState,document.getElementById('app'));
    })()`);
    await waitFor('!!document.querySelector("iframe[data-ready]")');
    await capture(`${device}-dialog-guide`);
    await evaluate('document.querySelector("dialog[open]").close()');
    await waitFor('!document.querySelector("dialog")');
    for (const mode of ['idle', 'reading', 'error', 'cameo']) {
      await evaluate(`(async()=>{
        const state=structuredClone(window.screenReviewState);
        if(${JSON.stringify(mode)}==='cameo') {
          const {showBabbageCameo}=await import('/src/shared/babbage-cameo.js');
          showBabbageCameo(state,document.getElementById('app'),'The schedule has more moving parts than my engine.',{preview:true});
        } else {
          const {openMayaDialog}=await import('/src/features/design/maya-dialog.js');
          openMayaDialog(state,document.getElementById('setup-title'),{autoStart:${mode === 'reading'},initialError:${mode === 'error' ? 'new Error("Reading unavailable. Your draft is unchanged.")' : 'null'}});
        }
      })()`);
      if (mode === 'reading')
        await waitFor('document.querySelector(".maya-dialog")?.dataset.state==="dialogue"');
      await capture(`${device}-dialog-maya-${mode}`);
      if (mode === 'reading') {
        for (let beat = 0; beat < 5; beat++) {
          const next = await evaluate(
            '(()=>{const dialog=document.querySelector(".maya-dialog[open]");if(!dialog || dialog.dataset.speaker==="pixel")return false;dialog.querySelector("[data-maya-next]").click();return true;})()',
          );
          if (!next) break;
        }
        await capture(`${device}-dialog-pixel`);
      }
      await evaluate('document.querySelector("dialog[open]")?.close()');
      await waitFor('!document.querySelector("dialog")');
    }
    await evaluate(
      `(async()=>{const {openReferences}=await import('/src/shared/reference-dialog.js');openReferences(document.querySelector('[data-action="open-references"]'));})()`,
    );
    await capture(`${device}-dialog-references`);
    await evaluate('document.querySelector("dialog[open]").close()');
    await waitFor('!document.querySelector("dialog")');
    await evaluate(
      `(async()=>{const {confirmRestart}=await import('/src/shared/restart-dialog.js');void confirmRestart({title:'Reset this activity workspace?',description:'Download your project first to keep a copy.',confirmLabel:'Reset workspace'});})()`,
    );
    await capture(`${device}-dialog-reset`);
    await evaluate('document.querySelector("dialog[open]").close()');
    await waitFor('!document.querySelector("dialog")');
    await evaluate(
      `(async()=>{const {saveWorkspace}=await import('/src/features/workspace/storage.js');saveWorkspace(window.screenReviewState);})()`,
    );
    await go('guide');
    await capture(`${device}-guide-saved`);
    await go('lab');
    const ids = await evaluate(
      `(async()=>{const {ideas}=await import('/src/features/idea-lab/ideas.js');return ideas.map(idea=>idea.id);})()`,
    );
    await capture(`${device}-lab-gallery`);
    await go('lab&page=1');
    await capture(`${device}-lab-gallery-2`);
    await evaluate(
      '(()=>{const input=document.getElementById("idea-search");input.value="no-such-idea-123";input.dispatchEvent(new Event("input",{bubbles:true}));})()',
    );
    await capture(`${device}-lab-empty`);
    for (const id of ids) {
      await go('lab&idea=' + id);
      await capture(`${device}-lab-${id}`);
    }
    console.log(
      `${device} captured: public topics, all story stages and choices, studio utilities, AI states, closing, dialogs and all Idea Lab details.`,
    );
  }
};
