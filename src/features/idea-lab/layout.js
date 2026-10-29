export function fitIdeaLab(app, viewport = window) {
  const frame = app.querySelector('.lab-browser');
  if (!frame) return;
  const top = frame.getBoundingClientRect().top + viewport.scrollY;
  frame.style.setProperty('--lab-available-height', `${Math.max(240, Math.floor(viewport.innerHeight - top - 16))}px`);
}
