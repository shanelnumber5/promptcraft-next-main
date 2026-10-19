// Decorative mechanical computer inspired by the Analytical Engine reference.
const gear = (x, y, r, reverse = false) =>
  `<g transform="translate(${x} ${y})"><g class="engine-gear${reverse ? ' engine-gear--reverse' : ''}"><circle r="${r}" fill="#172638" stroke="#d0ac62" stroke-width="4"/>${Array.from({ length: 12 }, (_, i) => `<path transform="rotate(${i * 30})" d="M-3 ${-r - 4}h6v8h-6Z" fill="#c3a166"/>`).join('')}<circle r="${r - 7}" fill="none" stroke="#705e43" stroke-width="2"/><path d="M${-r + 6} 0H${r - 6}M0 ${-r + 6}V${r - 6}" stroke="#c3a166" stroke-width="3"/><circle r="4" fill="#ecd69b"/></g></g>`;
const drumColumn = (x, index) =>
  `<g transform="translate(${x} 0)"><g class="engine-column" style="animation-delay:${index * 0.4}s"><path d="M6 35V102" stroke="url(#engine-steel)" stroke-width="5"/>${Array.from({ length: 7 }, (_, i) => `<g transform="translate(0 ${37 + i * 9})"><rect x="-7" width="27" height="8" rx="2" fill="url(#engine-brass)" stroke="#715430" stroke-width=".7"/><path d="M-8 1H21M-8 7H21" stroke="#e7cb8f" stroke-width="1"/><svg x="-5" y="1" width="23" height="6" viewBox="0 0 23 6" overflow="hidden"><g class="engine-number-strip" style="animation-delay:-${index * 0.6 + i * 0.25}s"><text x="0" y="5.5" fill="#352b20" font-family="monospace" font-size="6.5" letter-spacing="1.8">01234567890123456789</text></g></svg></g>`).join('')}</g></g>`;
export function renderBabbageEngine() {
  return `<div class="babbage-engine" aria-hidden="true"><svg viewBox="0 0 240 170" focusable="false">
 <defs><linearGradient id="engine-brass"><stop stop-color="#715430"/><stop offset=".45" stop-color="#eed29a"/><stop offset="1" stop-color="#94703e"/></linearGradient><linearGradient id="engine-steel"><stop stop-color="#283546"/><stop offset=".5" stop-color="#84919a"/><stop offset="1" stop-color="#273343"/></linearGradient></defs>
 <ellipse cx="120" cy="157" rx="109" ry="7" fill="#08172e" opacity=".5"/>
 <path d="M17 145H223V156H17Z" fill="#65452e" stroke="#bc9860" stroke-width="2"/>
 <path d="M28 29H208M28 103H208" stroke="url(#engine-brass)" stroke-width="7"/>
 ${[32, 77, 122, 167, 205].map((x) => `<path d="M${x} 22V145" stroke="url(#engine-brass)" stroke-width="6"/><circle cx="${x}" cy="23" r="5" fill="#d4b375"/>`).join('')}
 ${[49, 94, 139, 184].map(drumColumn).join('')}
 <g class="engine-linkage" stroke="#b89b65" stroke-width="2">${[46, 64, 82].map((y) => `<path d="M67 ${y}H86M112 ${y}H131M157 ${y}H176"/>`).join('')}</g>
 <path d="M26 121H214" stroke="url(#engine-steel)" stroke-width="7"/>
 ${gear(60, 123, 20)}${gear(104, 123, 17, true)}${gear(143, 123, 17)}${gear(185, 123, 20, true)}
 <path d="M216 119h12v-15" fill="none" stroke="#d0ac62" stroke-width="4" stroke-linecap="round"/>
 <rect x="88" y="146" width="64" height="9" rx="2" fill="#c3a166"/>
 </svg></div>`;
}
