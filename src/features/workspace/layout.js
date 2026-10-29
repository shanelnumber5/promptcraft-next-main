// Measure the space below the real app header instead of assuming its height.
export function fitWorkspace(app, viewport = window) {
  const shell = app.querySelector('.workspace-shell--focused');
  if (!shell) return;
  const documentTop = shell.getBoundingClientRect().top + viewport.scrollY;
  const height = Math.max(240, Math.floor(viewport.innerHeight - documentTop - 16));
  shell.style.setProperty('--workspace-available-height', `${height}px`);
}
