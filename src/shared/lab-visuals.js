// Code-native interface illustrations, separate from the official college artwork.
const paths = { arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>' };
// Brass calculating-engine modules: drums, drive wheels, punched tape and linkages.
const mechanism = '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M4 20v2m16-2v2M2 17h20M6 6V3h12v3"/>';
const modules = {
  compass: '<circle cx="8" cy="12" r="3"/><circle cx="17" cy="12" r="2"/><path d="M8 8v8m-4-4h8m3 0h4M8 12l9-1"/>',
  pencil: '<path d="M6 8v7m4-7v7m4-7v7m4-7v7M5 10h2m2 3h2m2-3h2m2 3h2"/>',
  spark: '<path d="M5 9h14v5H5zM7 11h1m3 0h1m3 0h1M9 3V1m6 2V1"/>',
  chat: '<path d="M5 9h14v5H5zM7 11h9M9 14v2"/>',
  briefcase: '<path d="M6 8v7m4-7v7m4-7v7m4-7v7M5 11h2m2-2h2m2 4h2m2-3h2"/>',
  shield: '<path d="m12 8 5 2v3l-5 3-5-3v-3zM10 12l2 1 2-2"/>',
  search: '<circle cx="10" cy="11" r="3"/><path d="m12 13 4 3M17 9h2m-2 3h2"/>',
};
export const labIcon = (kind = 'spark') => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${kind === 'arrow' ? paths.arrow : mechanism + (modules[kind] || modules.spark)}</svg>`;
export const campusSignature = () => '<div class="campus-signature"><img src="assets/brand/gfc-river-otters.png" alt="Great Falls College Montana State University, River Otters" width="1129" height="284"></div>';
export const riverLines = () => '<svg class="river-lines" viewBox="0 0 480 340" fill="none" aria-hidden="true" focusable="false"><path d="M-40 80C100-60 210 220 520 50M-40 110C100-30 210 250 520 80M-40 140C100 0 210 280 520 110M-40 170C100 30 210 310 520 140M-40 200C100 60 210 340 520 170M-40 230C100 90 210 370 520 200" stroke="currentColor" stroke-width="2"/></svg>';
export function ideaVisual(item, index) {
  const kind = item.tags.includes('Responsible AI') ? 'shield' : item.tags.includes('Discussion') ? 'chat' : item.tags.includes('Workplace') ? 'briefcase' : item.tags.includes('Creative assessment') ? 'spark' : 'search';
  return `<div class="idea-visual" data-tone="${index % 4}" aria-hidden="true"><span class="idea-visual-icon">${labIcon(kind)}</span><span class="idea-number">${String(index + 1).padStart(2, '0')}</span><span class="idea-orbit"></span></div>`;
}
