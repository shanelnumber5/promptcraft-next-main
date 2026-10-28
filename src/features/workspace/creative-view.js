import { escapeHTML as e } from '../../shared/html.js';
export function renderPossibilities(state, ai, extraActions='', includeActions=true) {
  const items=state.creative.directions;
  return `<section class="creative-possibilities" aria-labelledby="possibilities-title" tabindex="-1"><h3 id="possibilities-title">${items.length?'Choose an idea to explore.':'Where could this go?'}</h3>${items.length?`<div class="workspace-short-list">${items.map((item,index)=>`<article class="creative-sketch"><h4>${e(item.title.slice(0,100))}</h4><p>${e(item.description.slice(0,160))}${item.description.length>160?'\u2026':''}</p><button type="button" id="workspace-idea-${index}" data-view-direction="${index}">View idea</button></article>`).join('')}</div>`:'<p>Try three approaches to your idea or activity. A learning purpose can take shape as you explore.</p>'}${includeActions?`<div class="workspace-view-actions">${renderPossibilityActions(state,ai,extraActions)}</div>`:''}</section>`;
}
export function renderPossibilityActions(state, ai, extraActions='') {
  const disabled=ai.pending||state.babbage.mode==='dev'||ai.configured!==true||!state.teacher.directions.trim();
  return (state.creative.directions.length
    ? '<button type="button" data-workspace-view="combine">Combine ideas</button><button type="button" data-workspace-view="feedback">Try different ideas</button>'
    : `<button type="button" class="primary" data-action="explore-directions"${disabled?' disabled':''}>Explore three possibilities</button><button type="button" data-workspace-view="feedback">Add a preference</button>`)
    +extraActions+(state.creative.alternatives.length?`<button type="button" data-workspace-view="saved">Saved possibilities (${state.creative.alternatives.length})</button>`:'');
}
export function renderCreativeCore(state) {
  return `<div class="creative-core">${state.workspace.selectedDirection?`<p>${e(state.workspace.selectedDirection.title)}</p>`:''}<label for="creative-core">What makes this idea worth protecting?</label><textarea id="creative-core" data-workspace-meta="creativeCore" rows="3">${e(state.workspace.creativeCore||'')}</textarea><p>Keep this learning experience intact.</p></div>`;
}
