// The public header shares one page list across desktop links and the native chooser.
export function syncPublicNavigation(view) {
  document.querySelectorAll('.public-navigation a, #site-menu-panel a').forEach((link) => {
    const destination = new URL(link.href).searchParams.get('view');
    if (destination === view || (view === 'scenario' && destination === 'play'))
      link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const chooser = document.getElementById('public-page');
  if (chooser) chooser.value = view === 'play' || view === 'scenario' ? 'play&story=1' : view;
}

export function mountPublicNavigation() {
  document.getElementById('public-page')?.addEventListener('change', (event) => {
    const value = event.target.value;
    const destination = new URL('?view=' + value, window.location.href);
    const link = [...document.querySelectorAll('.public-navigation a, #site-menu-panel a')].find(
      (item) => new URL(item.href).search === destination.search,
    );
    // Public information pages keep their existing in-place navigation and focus handling.
    if (link) link.click();
    else window.location.assign(destination);
  });
}
