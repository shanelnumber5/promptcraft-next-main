import { machineArtwork } from '../entry/home-art.js';
// Home and waiting screens use the same production artwork and reduced-motion animation.
export function renderBabbageEngine() {
  return `<div class="babbage-engine babbage-engine--production" aria-hidden="true">${machineArtwork('waiting-engine')}</div>`;
}
