import { fitIdeaLab } from './layout.js';
import { renderGallery, renderIdeaCards, renderIdeaDetail } from './screen.js';
import { readWorkspace } from '../workspace/storage.js';

export function mountIdeaLab(app, params) {
  if (params.has('idea')) app.innerHTML = renderIdeaDetail(params.get('idea'), readWorkspace().exists, {query:params.get('q')||'',tag:params.get('category')||'',page:Number(params.get('page'))||0});
  else {
    let tag=params.get('category')||'';
    app.innerHTML = renderGallery(params.get('q')||'',tag);
    const update = () => {
      const query=document.getElementById('idea-search').value;
      const results=renderIdeaCards(query,tag);
      document.getElementById('idea-cards').innerHTML=results.html;
      document.getElementById('idea-results').textContent=`${results.count} matching ideas`;
      app.querySelectorAll('[data-lab-category]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.labCategory === tag));
      });
      const url=new URL(location.href);
      for(const [key,value] of [['q',query],['category',tag],['page','']]) { if(value) url.searchParams.set(key,value); else url.searchParams.delete(key); }
      history.replaceState(null,'',url);
    };
    document.getElementById('idea-search').addEventListener('input',()=>update(true));
    app.addEventListener('click',event=>{
      const clear=event.target.closest('[data-lab-clear]');
      const category=event.target.closest('[data-lab-category]');
      if(category) { tag=category.dataset.labCategory; update(); }
      if(clear) { document.getElementById('idea-search').value=''; tag=''; update(); document.getElementById('idea-search').focus(); }
    });
  }
  fitIdeaLab(app);
  window.addEventListener('resize', () => fitIdeaLab(app));
  document.fonts?.ready.then(() => fitIdeaLab(app));
}
