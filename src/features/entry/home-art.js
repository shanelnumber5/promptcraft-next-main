// Reuse production game art. SVG viewports reveal the engine's actual brass mechanisms.
const engine = 'assets/people/babbage-engine-repaired.webp';
export function machineArtwork(id = 'engine') {
  return `<svg viewBox="0 0 480 430" aria-hidden="true" class="reference-machine">
    <image href="${engine}" x="8" y="-110" width="464" height="657"/>
    <defs><clipPath id="${id}-detail"><circle cx="0" cy="0" r="48"/></clipPath></defs>
    <g transform="translate(67 353)"><circle r="52" fill="#202d56" stroke="#d98f06" stroke-width="2"/><g clip-path="url(#${id}-detail)"><g class="brass-cw"><image href="${engine}" x="-180" y="-850" width="900" height="1274"/></g></g></g>
    <g transform="translate(408 363)"><circle r="42" fill="#202d56" stroke="#d98f06" stroke-width="2"/><g transform="scale(.76)" clip-path="url(#${id}-detail)"><g class="brass-ccw"><image href="${engine}" x="-360" y="-850" width="900" height="1274"/></g></g></g>
  </svg>`;
}
