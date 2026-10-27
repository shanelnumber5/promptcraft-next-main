import { escapeHTML as e } from '../../shared/html.js';
export function renderSectionFrame(items,current,attribute,content,label) {
  const groups=[['Starting point',['start','subject']],['Learning & learners',['learners','learner-group','needs']],['Practical details',['time','requirements','ai-use']],['Design choices',['concern','intentions','presence','questions','draft']]];
  const build=attribute==='data-design-page';
  const activeGroup=groups.find(([,ids])=>ids.includes(current));
  const groupPicker=build ? '<label for="workspace-build-group">Build area</label><select id="workspace-build-group" data-workspace-section-group data-workspace-section-picker="data-design-page">'+groups.map(([title,ids])=>'<option value="'+ids[0]+'"'+(ids.includes(current)?' selected':'')+'>'+e(title)+'</option>').join('')+'</select>' : '';
  return '<div class="workspace-section-frame"><aside class="workspace-section-rail">'+groupPicker+'<nav aria-label="'+e(label)+'">'+items.map(([id,title])=>'<button type="button" '+attribute+'="'+id+'"'+(id===current?' aria-current="page"':'')+(build && !activeGroup?.[1].includes(id)?' hidden':'')+'>'+e(title)+'</button>').join('')+'</nav><label for="workspace-section-picker">'+e(label)+'</label><select id="workspace-section-picker" data-workspace-section-picker="'+attribute+'">'+items.map(([id,title])=>'<option value="'+id+'"'+(id===current?' selected':'')+'>'+e(title)+'</option>').join('')+'</select></aside><div class="workspace-section-main">'+content+'</div></div>';
}
