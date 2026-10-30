import { assignmentContext } from '../design/babbage-client.js';
import { loadState, saveState, clearState, STORAGE_KEY } from '../../app/storage.js';
import { discussionOpening } from '../opening/content.js';
import { readWorkspace, saveWorkspace, workspaceDefaults } from './storage.js';
import { creativeDefaults } from './creative.js';

export const SCENARIO_STUDIO_KEY='promptcraft_scenario_studio_v1';
export function readScenarioStudio(storage=window.localStorage) {
  let main=loadState(discussionOpening,storage);
  let extras;
  try {
    const raw=storage.getItem(SCENARIO_STUDIO_KEY);
    extras=raw ? JSON.parse(raw) : null;
    if(extras && (extras.version!==1 || !extras.workspace || !extras.creative)) throw Error('Invalid scenario design');
  } catch { return {state:{...main,experience:'scenario',workspace:workspaceDefaults(),creative:creativeDefaults()},error:'Your saved scenario design could not be read. It has not been overwritten.',exists:true}; }
  if(extras) main=loadState(discussionOpening,storage,extras.workspace);
  const legacyIntake=['setup','summary'].includes(main.phase);
  const mainPanel=legacyIntake?'revision':['revision','babbage','reason'].includes(main.designPanel)?main.designPanel:main.design.revision.trim()?'revision':'babbage';
  const metadata=extras?.workspace || {...workspaceDefaults(),instructorPlan:main.design.instructorPlan || '',openQuestions:main.design.feedbackClarifications || ''};
  if(!extras && main.babbage.history.length) main.babbage.context=assignmentContext({...main,workspace:metadata});
  const record={version:1,state:{...main,phase:'design',designStep:2,designPanel:mainPanel},workspace:metadata,creative:extras?.creative || creativeDefaults()};
  const parsed=readWorkspace({getItem:()=>JSON.stringify(record)});
  parsed.state.experience='scenario';
  if(main.saveNotice) parsed.error=main.saveNotice;
  return {...parsed,needsIntro:main.phase==='opening',designPage:legacyIntake?'start':undefined,wrapUp:main.phase==='closing'};
}
export function saveScenarioStudio(state,storage=window.localStorage) {
  const {workspace,creative,experience,saveNotice,...main}=state;
  main.design={...state.design,instructorPlan:workspace.instructorPlan || '',feedbackClarifications:workspace.openQuestions || ''};
  main.phase=state.phase;main.designStep=2;
  let savedMain, savedExtras;
  saveState(main,{setItem:(_key,value)=>{savedMain=value;}});
  if(!savedMain) {state.saveNotice=main.saveNotice || 'Scenario progress could not be saved.';return false;}
  if(!saveWorkspace(state,{setItem:(_key,value)=>{savedExtras=value;}})) return false;
  try {
    storage.setItem(STORAGE_KEY,savedMain);
    storage.setItem(SCENARIO_STUDIO_KEY,savedExtras);
    state.saveNotice='';return true;
  } catch {state.saveNotice='Scenario progress could not be fully saved. Download your project from Options to keep a backup.';return false;}
}
export function resetScenarioStudio(storage=window.localStorage) {
  try {storage.removeItem(SCENARIO_STUDIO_KEY);return clearState(storage);} catch {return false;}
}
