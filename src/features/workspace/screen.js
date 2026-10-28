import { renderWorkflowNav } from '../../shared/workflow-nav.js';
import { renderSectionFrame } from './section-frame.js';
import { renderCreativeCore } from './creative-view.js';
import { renderField } from '../../shared/form-fields.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { renderPartner } from './partner-view.js';
import { renderReview } from './review-view.js';
import { buildPages, renderUtility, renderReading } from './views.js';
import { teacherSetup } from '../setup/content.js';
import { escapeHTML as e } from '../../shared/html.js';

const teacherField = (state, id) => {
  const field = teacherSetup.steps.flatMap(step => step.fields).find(field => field.id === id);
  const compact = {subject:{label:'Course or subject',help:'',unsure:false},learningGoal:{label:'What should students learn?',help:'',rows:2},mustStay:{label:'What must stay the same?',help:'',rows:2},workTime:{label:'Work time per student',help:''},daysAvailable:{label:'Days to finish',help:''},learnerLevel:{label:'Who are your learners?',help:''}};
  return renderField({...field,unsure:false,...compact[id]},state.teacher);
};
const metaField = (id,key,label,value,rows=2) => `<div class="setup-field"><label for="${id}">${label}</label><textarea id="${id}" data-workspace-meta="${key}" rows="${rows}">${e(value || '')}</textarea></div>`;
export function renderWorkspace(state, ai, error='', designPage='start', partnerPage='work', reviewPage='rationale', ui={screen:'work',readingPage:0}) {
  if(error) return `<section class="entry-shell"><h1 id="setup-title" tabindex="-1">Your workspace needs attention</h1><p role="status">${e(error)}</p><button type="button" data-action="reset-workspace">Reset this workspace</button><a href="?view=home">Return home</a></section>`;
  const panel=state.designPanel;
  const tabs=[['babbage','Explore'],['revision','Build'],['reason','Review']];
  let body=renderUtility(state,ai,ui);
  if(ui.screen==='preview') body=`<section class="workspace-view workspace-page"><h2 id="workspace-view-title" tabindex="-1">${workspacePreview(state,designPage).label}</h2>${renderWorkspacePreview(state,designPage,ui)}<footer class="workspace-view-back"><button type="button" data-workspace-view="work">Back to my work</button></footer></section>`;
  if(!body && panel==='babbage') body=renderPartner(state,ai,partnerPage,'',ui);
  else if(!body && panel==='reason') body=renderReview(state,ai,reviewPage,'');
  else if(!body) {
    const title=buildPages.find(([id])=>id===designPage)?.[1] || 'Starting point';
    let fields;
    if(designPage==='intentions') fields=renderCreativeCore(state);
    else if(designPage==='presence') fields=`<p class="workspace-field-help">Where could your questions, content-specific feedback, or proactive check-ins help students think more deeply? For asynchronous courses, consider when you would respond and what is realistic for your workload. Peer replies and automated messages are not instructor interaction.</p>${metaField('instructor-plan','instructorPlan','How will you interact with students as they learn?',state.workspace.instructorPlan)}`;
    else if(designPage==='questions') fields=metaField('open-questions','openQuestions','Questions to revisit (optional)',state.workspace.openQuestions);
    else if(designPage==='learners') fields=`<div data-setup-form>${teacherField(state,'learningGoal')}</div>`;
    else if(designPage==='learner-group') fields=`<div data-setup-form>${teacherField(state,'learnerLevel')}</div>`;
    else if(designPage==='subject') fields=`<div data-setup-form>${teacherField(state,'subject')}</div>`;
    else if(designPage==='needs') fields=metaField('student-needs','studentNeeds','Learner needs (optional; no identifying details)',state.workspace.studentNeeds);
    else if(designPage==='time') fields=`<div data-setup-form>${teacherField(state,'workTime')}${teacherField(state,'daysAvailable')}</div>`;
    else if(designPage==='requirements') fields='<div data-setup-form>'+teacherField(state,'mustStay')+'</div>';
    else if(designPage==='ai-use') fields='<div data-setup-form>'+teacherField(state,'aiUse')+'</div>';
    else if(designPage==='concern') fields='<div data-design-form>'+renderField({id:'concern',label:'What would you like to improve? (optional)',help:'',type:'textarea',rows:3},state.design)+'</div>';
    else if(designPage==='draft') fields=`<div class="workspace-writing" data-design-form><label for="revision">Discussion forum directions</label><textarea id="revision" name="revision" rows="7" placeholder="Write your activity here.">${e(state.design.revision)}</textarea></div>`;
    else fields=`<fieldset><legend>What are you bringing?</legend>${[['existing','Existing directions'],['idea','A rough idea']].map(([value,label])=>`<label><input type="radio" name="sourceKind" data-workspace-meta="sourceKind" value="${value}"${state.workspace.sourceKind===value?' checked':''}> ${label}</label>`).join('')}</fieldset><div data-setup-form><div class="setup-field"><label for="directions">${state.workspace.sourceKind==='idea'?'Your starting idea':'Current directions'}</label><textarea id="directions" name="directions" rows="3">${e(state.teacher.directions)}</textarea></div></div>`;
    fields=fields.replace(/<label for=/g,'<label class="workspace-build-label" for=').replace(/<legend>/g,'<legend class="workspace-build-label">');
    body=`<section class="workspace-view workspace-page"><header class="design-page-heading"><h2 class="workspace-build-title" id="design-page-title" tabindex="-1">${title}</h2></header><div class="design-page-fields build-page-fields" data-build-page="${designPage}">${fields}</div><nav class="workspace-view-actions${designPage==='ai-use'?' workspace-view-actions--gold':''}" aria-label="Design actions">${designPage==='draft'?'<button type="button" class="primary" data-workspace-panel="reason">Review my design</button><button type="button" data-action="ask-ai">Ask Babbage for help</button>':'<button type="button" class="primary" data-design-page="'+buildPages[Math.min(buildPages.findIndex(([id])=>id===designPage)+1,buildPages.length-1)][0]+'">Next section</button>'}<button type="button" id="workspace-show-preview" data-workspace-view="preview">Preview activity</button><span class="workspace-save-status">Saved in this browser.</span>${designPage==='draft'&&state.design.previousRevision?'<button type="button" data-workspace-view="earlier">Earlier draft</button>':''}${designPage==='draft'&&state.design.revision.trim()?'<button type="button" data-workspace-view="maya">Student perspective</button>':''}${designPage==='draft'?`<button type="button" data-action="use-starting"${state.design.revision.trim()?' hidden':''}${!state.teacher.directions.trim()?' disabled':''}>Use starting material</button>`:''}</nav></section>`;
    body=renderSectionFrame(buildPages,designPage,'data-design-page',body,'Build sections');
  }
  return `<section class="workspace-shell workspace-shell--focused" aria-labelledby="setup-title"><header class="workspace-heading"><h1 id="setup-title" tabindex="-1">Creative Workspace</h1><button type="button" id="workspace-options" data-workspace-view="options">Options</button></header>${renderWorkflowNav({context:"workspace",babbageAction: panel === "babbage" ? "" : '<button type="button" data-workspace-panel="babbage">Ask Babbage</button>'})}<div class="workspace-tabs" role="tablist" aria-label="Creative Workspace">${tabs.map(([id,label])=>`<button type="button" role="tab" id="workspace-tab-${id}" aria-controls="workspace-panel" aria-selected="${panel===id}" tabindex="${panel===id?0:-1}" data-workspace-panel="${id}">${label}</button>`).join('')}</div><div id="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-${panel}">${body}</div><p class="design-notice" role="status" aria-live="polite"></p><p class="save-notice" role="status" aria-live="polite">${e(state.saveNotice)}</p><p class="workspace-privacy">Saved in this browser.</p></section>`;
}
export function renderDraftPreview(text,empty='Write directions to see them here.') { return text.trim()?renderAssignmentDirections(text):`<p>${e(empty)}</p>`; }
export function workspacePreview(state,designPage) {
  const starting=state.designPanel!=='reason'&&((state.designPanel==='revision'&&designPage==='start')||(!state.design.revision.trim()&&designPage!=='draft'));
  return starting?{text:state.teacher.directions,label:state.workspace.sourceKind==='idea'?'Starting idea':'Starting directions'}:{text:state.design.revision,label:'Working draft'};
}
export function renderWorkspacePreview(state,designPage,ui={readingPage:0}) {
  const model=workspacePreview(state,designPage);
  return `<div class="workspace-reading-preview" data-live-preview>${renderReading(model.text,ui.readingPage)}</div>`;
}
