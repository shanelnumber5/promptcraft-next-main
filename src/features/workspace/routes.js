import { readWorkspace, saveWorkspace, resetWorkspace } from './storage.js';
import { readScenarioStudio, saveScenarioStudio, resetScenarioStudio } from './scenario-storage.js';

const routes={
  workspace:{id:'workspace',heading:'Creative Workspace',navigation:'Activity design stages',options:'Project options',restartLabel:'Reset workspace',read:readWorkspace,save:saveWorkspace,reset:resetWorkspace,
    resetDialog:{title:'Reset this activity workspace?',description:'This clears the Creative Workspace design and conversation. Scenario 1 progress stays saved.',confirmLabel:'Reset workspace'}},
  scenario:{id:'scenario',heading:'Scenario 1 · Design your activity',navigation:'Scenario design stages',options:'Scenario options',restartLabel:'Restart scenario',read:readScenarioStudio,save:saveScenarioStudio,reset:resetScenarioStudio,
    resetDialog:{title:'Restart Scenario 1?',description:'This clears Scenario 1 progress and its design. Your Creative Workspace stays saved. Download your project first to keep a copy.',confirmLabel:'Restart scenario'}},
};
export function designRoute(id='workspace') { return routes[id==='scenario'?'scenario':'workspace']; }
