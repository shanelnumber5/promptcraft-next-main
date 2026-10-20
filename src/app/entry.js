import { renderHome } from '../features/entry/screen.js';
import { renderGallery, renderIdeaCards, renderIdeaDetail } from '../features/idea-lab/screen.js';
import { readWorkspace, rememberPath, resumePath } from '../features/workspace/storage.js';
const params = new URLSearchParams(window.location.search);
const requested = params.get('view');
const resume = resumePath();
// Root visits preserve the existing automatic resume behavior. Home remains explicit.
const view = ['home', 'play', 'lab', 'workspace'].includes(requested) ? requested : resume || 'home';
document.body.dataset.appView = view;
const app = document.getElementById('app');
const restart = document.querySelector('[data-action="restart-module"]');
if (params.get('mockBabbage') === '1') document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="?"]');
  if (!link) return;
  const url = new URL(link.href);
  url.searchParams.set('mockBabbage', '1');
  link.href = url.href;
});
if (restart) restart.hidden = view !== 'play';
document.querySelector('.skip-link')?.setAttribute('href', view === 'play' ? '#scene-title' : view === 'workspace' ? '#setup-title' : '#entry-title');
if (view === 'play') {
  rememberPath('play');
  await import('./app.js');
} else if (view === 'workspace') {
  rememberPath('workspace');
  const { mountWorkspace } = await import('../features/workspace/controller.js');
  mountWorkspace(app, params);
} else {
  const references = document.querySelector('[data-action="open-references"]');
  if (references) references.hidden = true;
  if (view === 'home') app.innerHTML = renderHome(resume);
  else if (params.has('idea')) app.innerHTML = renderIdeaDetail(params.get('idea'), readWorkspace().exists);
  else {
    app.innerHTML = renderGallery();
    const update = () => {
      const results = renderIdeaCards(document.getElementById('idea-search').value, document.getElementById('idea-category').value);
      document.getElementById('idea-cards').innerHTML = results.html;
      document.getElementById('idea-results').textContent = `${results.count} of 12 ideas`;
    };
    document.getElementById('idea-search').addEventListener('input', update);
    document.getElementById('idea-category').addEventListener('change', update);
  }
}
