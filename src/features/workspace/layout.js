import { fitViewportPanel } from '../../shared/viewport-layout.js';

export function fitWorkspace(app, viewport = window) {
  fitViewportPanel(app, '.workspace-shell--focused', '--workspace-available-height', viewport);
}
