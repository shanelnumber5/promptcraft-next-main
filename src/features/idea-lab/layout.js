import { fitViewportPanel } from '../../shared/viewport-layout.js';

export function fitIdeaLab(app, viewport = window) {
  fitViewportPanel(app, '.lab-browser', '--lab-available-height', viewport);
}
