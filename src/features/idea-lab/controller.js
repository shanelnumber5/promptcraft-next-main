import { fitIdeaLab } from './layout.js';
import { renderGallery, renderIdeaCards, renderIdeaDetail, renderLabPagination } from './screen.js';
import { readWorkspace } from '../workspace/storage.js';

export function mountIdeaLab(app, params) {
  if (params.has('idea')) app.innerHTML = renderIdeaDetail(params.get('idea'), readWorkspace().exists, {query:params.get('q')||'',tag:params.get('category')||'',page:Number(params.get('page'))||0});
  else {
    let page=Number(params.get('page'))||0;
    app.innerHTML = renderGallery(params.get('q')||'',params.get('category')||'',page);
    const update = (reset=false) => {
      if(reset) page=0;
      const query=document.getElementById('idea-search').value, tag=document.getElementById('idea-category').value;
      const results=renderIdeaCards(query,tag,page); page=results.page;
      document.getElementById('idea-cards').innerHTML=results.html;
      document.getElementById('idea-results').textContent=`${results.count} matching ideas`;
      document.getElementById('lab-pagination').innerHTML=renderLabPagination(results);
      app.querySelectorAll('[data-lab-category]').forEach(button => {
        if (button.dataset.labCategory === tag) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      const url=new URL(location.href);
      for(const [key,value] of [['q',query],['category',tag],['page',page?String(page):'']]) { if(value) url.searchParams.set(key,value); else url.searchParams.delete(key); }
      history.replaceState(null,'',url);
    };
    document.getElementById('idea-search').addEventListener('input',()=>update(true));
    document.getElementById('idea-category').addEventListener('change',()=>update(true));
    app.addEventListener('click',event=>{
      const clear=event.target.closest('[data-lab-clear]'), paging=event.target.closest('[data-lab-page]');
      const category=event.target.closest('[data-lab-category]');
      if(category) { document.getElementById('idea-category').value=category.dataset.labCategory; update(true); }
      if(clear) { document.getElementById('idea-search').value=''; document.getElementById('idea-category').value=''; update(true); document.getElementById('idea-search').focus(); }
      if(paging && !paging.disabled) { page=Number(paging.dataset.labPage); update(); document.querySelector('#idea-cards .lab-button')?.focus(); }
    });
  }
  fitIdeaLab(app);
  window.addEventListener('resize', () => fitIdeaLab(app));
  document.fonts?.ready.then(() => fitIdeaLab(app));
}
