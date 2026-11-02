import { renderHome } from './screen.js';
import { infoPages, mountInfoPage } from './info-screen.js';
import { resumePath } from '../workspace/storage.js';

export function mountInformation(app, view) {
  let dispose = null;
  const infoNav = document.querySelector('.info-nav');
  const navigate = (nextView, focus = true) => {
    if (nextView !== 'home' && !infoPages.some(([id]) => id === nextView)) return false;
    dispose?.();
    dispose = null;
    document.body.dataset.appView = nextView;
    if (nextView === 'home') app.innerHTML = renderHome(resumePath());
    else dispose = mountInfoPage(app, nextView);
    infoNav.querySelectorAll('a[href^="?view="]').forEach(link => {
      if (new URL(link.href).searchParams.get('view') === nextView) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const picker = infoNav.querySelector('.info-nav-select');
    if (picker) picker.value = nextView;
    const heading = app.querySelector('h1');
    document.title = 'PromptCraft | ' + (heading?.textContent || 'The Prompt Lab');
    if (focus) heading?.focus();
    return true;
  };
  navigate(view, false);
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
