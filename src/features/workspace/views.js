import { escapeHTML as e } from '../../shared/html.js';
import { renderAssignmentDirections } from '../../shared/directions.js';

export const workspaceViews = () => ({ screen: 'work', index: 0, saved: false, part: 'overview', readingPage: 0 });
export const buildPages = [['start','Starting point'],['subject','Course or subject'],['learners','Learning goal'],['learner-group','Your learners'],['needs','Learner access'],['time','Time'],['requirements','Required elements'],['ai-use','Student AI use'],['concern','What to improve'],['intentions','Creative core'],['presence','Instructor presence'],['questions','Questions to revisit'],['draft','Write your draft']];
export function readingPages(text, size = typeof window !== 'undefined' && window.innerHeight < 650 ? 240 : typeof window !== 'undefined' && (window.innerWidth < 700 || window.innerHeight < 750) ? 420 : 650) {
  const words = text.trim().match(/\S+\s*/g) || [];
  const pages = []; let page = '';
  for (const word of words) {
    if (page && page.length + word.length + 1 > size) { pages.push(page); page = ''; }
    page += word;
  }
  if (page) pages.push(page);
  return pages.length ? pages : ['Nothing recorded yet.'];
}
export function renderReading(text, index = 0, renderer = renderAssignmentDirections) {
  const pages = readingPages(text);
  const current = Math.max(0,Math.min(index,pages.length-1));
  return `<div class="workspace-reading">${renderer(pages[current])}</div>${pages.length > 1 ? `<nav class="workspace-reading-nav" aria-label="Reading sections"><button type="button" data-reading-page="${current-1}"${current===0?' disabled':''}>Earlier section</button><span>${current+1} / ${pages.length}</span><button type="button" data-reading-page="${current+1}"${current===pages.length-1?' disabled':''}>Next section</button></nav>` : ''}`;
}
export function renderUtility(state, ai, ui) {
  let title, body;
  if (ui.screen === 'options') {
    title = 'Workspace options';
    body = `<nav class="workspace-utility-list" aria-label="Workspace tools"><button type="button" data-workspace-view="sections">Choose a Build section</button><button type="button" data-partner-page="history">Earlier conversation</button><button type="button" data-partner-page="options">AI connection</button><a href="?view=lab">Browse Idea Lab</a>${state.babbage.ready ? `<button type="button" data-action="generate-ai"${ai.pending?' disabled':''}>Draft directly with Babbage</button>` : ''}${state.creative.alternatives.length?'<button type="button" data-workspace-view="saved">Saved ideas</button>':''}</nav>`;
  } else if (ui.screen === 'sections') {
    title = 'What would you like to work on?';
    body = `<nav class="workspace-build-menu" aria-label="Build sections">${buildPages.map(([id,label])=>`<button type="button" data-design-page="${id}">${label}</button>`).join('')}</nav>`;
  } else if (ui.screen === 'idea') {
    const item = (ui.saved ? state.creative.alternatives : state.creative.directions)[ui.index];
    if (!item) return null;
    title = item.title;
    const parts = [['overview','The experience'],['learning','Learning & core'],['online','Online approach']];
    const text = ui.part === 'learning' ? `${item.learning}\n\nCreative core: ${item.core}` : ui.part === 'online' ? item.online : `${item.description}\n\n${item.experience}`;
    body = `<nav class="workspace-part-nav" aria-label="Idea sections">${parts.map(([id,label])=>`<button type="button" data-idea-part="${id}"${ui.part===id?' aria-current="page"':''}>${label}</button>`).join('')}</nav>${renderReading(text,ui.readingPage)}<div class="workspace-view-actions"><button type="button" class="primary" data-develop-direction="${ui.index}"${ui.saved?' data-saved-direction':''}>Develop this idea</button>${!ui.saved?`<button type="button" data-save-direction="${ui.index}">Save for later</button>`:''}</div>`;
  } else if (ui.screen === 'saved') {
    title = 'Saved ideas';
    const start = Math.max(0,Math.min(ui.index,Math.max(0,state.creative.alternatives.length-1)));
    body = state.creative.alternatives.length ? `<div class="workspace-short-list">${state.creative.alternatives.slice(start,start+3).map((item,offset)=>`<article><h3>${e(item.title)}</h3><p>${e(item.description.slice(0,140))}</p><button type="button" data-view-direction="${start+offset}" data-saved-direction>View idea</button></article>`).join('')}</div><nav class="workspace-reading-nav" aria-label="Saved ideas"><button type="button" data-saved-page="${Math.max(0,start-3)}"${start===0?' disabled':''}>Earlier ideas</button><span>${start+1}–${Math.min(start+3,state.creative.alternatives.length)} of ${state.creative.alternatives.length}</span><button type="button" data-saved-page="${start+3}"${start+3>=state.creative.alternatives.length?' disabled':''}>More ideas</button></nav>` : '<p>No alternatives saved yet.</p>';
  } else if (ui.screen === 'combine') {
    title = 'Combine ideas';
    body = `<p>Choose the mechanisms you want to bring together.</p><div class="workspace-combine-list">${state.creative.directions.map((item,index)=>`<label><input type="checkbox" data-combine-direction="${index}"><span><strong>${e(item.title)}</strong><span>${e(item.description.slice(0,140))}</span></span></label>`).join('')}</div><button type="button" class="primary" data-action="combine-directions">Develop a combination</button>`;
  } else if (ui.screen === 'feedback') {
    title = 'What should we try next?';
    body = `<label for="creative-feedback">A preference, change, or different direction</label><textarea id="creative-feedback" data-creative-field="feedback" rows="3">${e(state.creative.feedback)}</textarea><button type="button" class="primary" data-action="explore-directions"${ai.pending || ai.configured!==true || state.babbage.mode==='dev'?' disabled':''}>Explore three possibilities</button>`;
  } else if (ui.screen === 'earlier') {
    title = 'Earlier draft';
    body = `${renderReading(state.design.previousRevision,ui.readingPage)}<button type="button" data-action="restore-earlier">Restore this draft</button>`;
  } else if (ui.screen === 'maya') {
    title = 'Student perspective';
    body = `<p>Maya offers a fictional first reading of your current draft. You can keep designing without it.</p><div class="workspace-view-actions"><button type="button" class="primary" data-action="hear-maya"${!state.design.revision.trim()||ai.pending?' disabled':''}>Hear Maya’s first read</button><button type="button" data-action="${state.creative.mayaPaused?'resume-maya':'pause-maya'}">${state.creative.mayaPaused?'Enable student perspectives':'Pause student perspectives'}</button></div>`;
  } else if (ui.screen === 'review-options') {
    title = 'Keep working';
    body = `<nav class="workspace-utility-list"><button type="button" data-review-page="checks">Review checks</button><button type="button" data-action="edit-context">Edit the activity</button><button type="button" data-action="finish-workspace"${!state.finalCheck.approved?' disabled':''}>Finish with Pixel</button></nav>`;
  } else return null;
  return `<section class="workspace-view workspace-page" aria-labelledby="workspace-view-title"><h2 id="workspace-view-title" tabindex="-1">${e(title)}</h2><div class="workspace-view-body">${body}</div><footer class="workspace-view-back"><button type="button" data-workspace-view="work">Back to my work</button></footer></section>`;
}
