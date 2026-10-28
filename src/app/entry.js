import { campusSignature } from '../shared/lab-visuals.js';
import { renderHome } from '../features/entry/screen.js';
import { renderGallery, renderIdeaCards, renderIdeaDetail } from '../features/idea-lab/screen.js';
import { readWorkspace, rememberPath, resumePath } from '../features/workspace/storage.js';
import { infoPages, renderInfoNavigation, mountInfoPage } from '../features/entry/info-screen.js';
const params = new URLSearchParams(window.location.search);
const requested = params.get('view');
const resume = resumePath();
const view = ['home', 'play', 'lab', 'workspace', 'guide', ...infoPages.map(([id]) => id)].includes(requested) ? requested : 'home';
document.body.dataset.appView = view;
const app = document.getElementById('app');
if (['home', 'guide', ...infoPages.map(([id]) => id)].includes(view)) document.body.dataset.infoReader = '';
if (['home', 'guide'].includes(view) || infoPages.some(([id]) => id === view)) {
  document.querySelector('.header-actions a[href="?view=home"]').hidden = true;
  document.querySelector('.header-actions').insertAdjacentHTML('beforeend', campusSignature());
  app.insertAdjacentHTML('beforebegin', renderInfoNavigation(view));
  // Switch information tabs in place instead of loading a second page/menu.
  // Keep normal navigation for other experiences and modified clicks.
  document.querySelector('.info-nav-select')?.addEventListener('change', event => {
    const destination = new URL(window.location.href);
    destination.searchParams.set('view', event.target.value);
    const matchingLink = document.querySelector(`.info-nav a[href="?view=${event.target.value}"]`);
    if (matchingLink && infoPages.some(([id]) => id === event.target.value) && infoPages.some(([id]) => id === document.body.dataset.appView)) matchingLink.click();
    else window.location.href = destination.href;
  });
}
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
  if (view === 'guide') {
    const { mountCourseGuide } = await import('../features/entry/guide-screen.js');
    mountCourseGuide(app);
  } else if (infoPages.some(([id]) => id === view) || view === 'home') {
    let dispose = null;
    let currentView = view;
    const infoNav = document.querySelector('.info-nav');
    const navigate = nextView => {
      if (nextView !== 'home' && !infoPages.some(([id]) => id === nextView)) return false;
      dispose?.();
      dispose = null;
      currentView = nextView;
      document.body.dataset.appView = nextView;
      if (nextView === 'home') app.innerHTML = renderHome(resumePath());
      else dispose = mountInfoPage(app, nextView);
      infoNav.querySelectorAll('a[href^="?view="]').forEach(link => {
        if (new URL(link.href).searchParams.get('view') === nextView) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      const picker = infoNav.querySelector('.info-nav-select');
      if (picker) picker.value = nextView;
      return true;
    };
    navigate(view);
    const navigateLink = event => {
      const link = event.target.closest('a[href^="?view=home"], a[href^="?view=how-to-play"], a[href^="?view=about"], a[href^="?view=babbage"], a[href^="?view=privacy"]');
      if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const destination = new URL(link.href);
      if (destination.origin !== location.origin || !navigate(destination.searchParams.get('view'))) return;
      event.preventDefault();
      history.pushState(null, '', destination.href);
    };
    // Intercept header/brand/footer Home and information links as well as the top tabs.
    document.addEventListener('click', navigateLink);
    window.addEventListener('popstate', () => {
      const requestedView = new URL(location.href).searchParams.get('view');
      if (!navigate(requestedView)) location.reload();
    });
  }
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
