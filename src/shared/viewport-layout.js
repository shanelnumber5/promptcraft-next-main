// Reserve the app's actual bottom spacing so a fixed-height panel does not
// create a second page scrollbar at desktop sizes.
export function fitViewportPanel(app, selector, property, viewport = window) {
  const panel = app.querySelector(selector);
  if (!panel) return;
  const style = viewport.getComputedStyle(app);
  const bottom = (parseFloat(style.marginBottom) || 0) + (parseFloat(style.paddingBottom) || 0);
  const top = panel.getBoundingClientRect().top + viewport.scrollY;
  panel.style.setProperty(property, `${Math.max(240, Math.floor(viewport.innerHeight - top - bottom))}px`);
}
