import { discussionOpening } from './content.js';
import { renderScene } from './screen.js';
import { loadState, saveState, initialState, sceneReady } from '../../app/storage.js';
import { resetScenarioStudio } from '../workspace/scenario-storage.js';
import { confirmRestart } from '../../shared/restart-dialog.js';
import { openReferences } from '../../shared/reference-dialog.js';

// The scenario owns its story only. All design forms and AI work are mounted by
// the shared studio after this single handoff.
export function mountOpening(app, {storage=window.localStorage,navigate=url=>window.location.replace(url),location=window.location} = {}) {
  let state=loadState(discussionOpening,storage);
  const life=new AbortController();
  const index=()=>Math.max(0,discussionOpening.scenes.findIndex(scene=>scene.id===state.sceneId));
  const save=()=>{saveState(state,storage);return !state.saveNotice;};
  const studio=()=>{
    const previousPhase=state.phase;
    if(previousPhase==='opening' && index()===discussionOpening.scenes.length-1) state.completed=true;
    state.phase='design';state.designStep=2;
    state.designPanel=state.design.revision.trim()?'revision':'babbage';
    state.designReadPage=0;state.designReturnPanel='';
    if(!save()) {state.phase=previousPhase;render();return;}
    const url=new URL(location.href);url.searchParams.set('view','scenario');navigate(url.href);
  };
  const positionPixelTag=()=>{
    const pixel=app.querySelector('.character--right');
    const image=pixel?.querySelector('img'),tag=pixel?.querySelector('figcaption');
    if(image && tag && !image.hidden) {const frame=pixel.getBoundingClientRect(),art=image.getBoundingClientRect();tag.style.left=`${art.left+art.width*.56-frame.left}px`;}
  };
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(positionPixelTag):null;
  observer?.observe(app);
  function render(focus=false,choice=null) {
    const scene=discussionOpening.scenes[index()];
    document.querySelector('.skip-link')?.setAttribute('href','#scene-title');
    app.innerHTML=renderScene(discussionOpening,scene,state,index());
    app.querySelectorAll('[data-character]').forEach(image=>{
      image.addEventListener('error',()=>{image.hidden=true;image.closest('figure')?.classList.add('art-unavailable');},{once:true});
      image.addEventListener('load',positionPixelTag,{once:true});
    });
    positionPixelTag();
    const next=app.querySelector('.scene-actions button.primary:not(:disabled)');
    next?.classList.add('suggested-next');next?.setAttribute('aria-description','Suggested next action');
    if(choice) app.querySelector(`input[value="${choice}"]`)?.focus({preventScroll:true});
    else if(focus) document.getElementById('scene-title')?.focus({preventScroll:true});
  }
  app.addEventListener('change',event=>{
    if(event.target.name!=='scene-choice') return;
    const scene=discussionOpening.scenes[index()];
    if(!scene.choice?.options.some(option=>option.id===event.target.value)) return;
    state.answers[scene.id]=event.target.value;save();render(false,event.target.value);
  },{signal:life.signal});
  app.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    const scene=discussionOpening.scenes[index()];
    if(action==='start-design-studio' || action==='start-setup') {
      if(index()===discussionOpening.scenes.length-1 && sceneReady(scene,state)) studio();
      return;
    }
    if(action==='reveal-board' || action==='reveal-question') state.storyStage=action==='reveal-board'?'board':'question';
    else if(action==='next') {
      if(!sceneReady(scene,state)) return;
      state.sceneId=discussionOpening.scenes[Math.min(index()+1,discussionOpening.scenes.length-1)].id;
      state.storyStage='dialogue';
    } else if(action==='back') {
      if(state.storyStage==='question') state.storyStage='board';
      else if(state.storyStage==='board') state.storyStage='dialogue';
      else {const prior=discussionOpening.scenes[Math.max(0,index()-1)];state.sceneId=prior.id;state.storyStage=prior.choice?'question':'board';}
    } else return;
    save();render(true);
  },{signal:life.signal});
  const restart=document.querySelector('[data-action="restart-module"]');
  if(restart) {
    restart.hidden=false;restart.textContent='Restart scenario';
    restart.addEventListener('click',async()=>{
      if(!(await confirmRestart({title:'Restart Scenario 1?',description:'This clears Scenario 1 progress and its design. Your Creative Workspace stays saved.',confirmLabel:'Restart scenario'}))) return;
      if(!resetScenarioStudio(storage)) {state.saveNotice='Scenario progress could not be reset.';render();return;}
      state=initialState(discussionOpening);save();render(true);
    },{signal:life.signal});
  }
  document.querySelector('[data-action="open-references"]')?.addEventListener('click',event=>openReferences(event.currentTarget),{signal:life.signal});
  if(state.phase!=='opening') studio();else render();
  return ()=>{life.abort();observer?.disconnect();};
}
