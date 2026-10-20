// Code-native interface illustrations, separate from the official college artwork.
const paths = {
  spark: '<path d="m12 2 2.8 6.9L22 12l-7.2 3.1L12 22l-2.8-6.9L2 12l7.2-3.1Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.2 5.8L8 16l2.2-5.8Z"/>',
  pencil: '<path d="m15 4 5 5M4 20l5-1 12-12a2 2 0 0 0-5-5L4 14Z"/>',
  chat: '<path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z"/><path d="M7 8h8M7 12h5"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V4h8v3M3 12c5 4 13 4 18 0M10 13h4v4h-4Z"/>',
  shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  layers: '<path d="m12 2 10 6-10 6L2 8ZM3 13l9 6 9-6M3 18l9 5 9-5"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M7 10h6M10 7v6"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
};
export const labIcon = (kind = 'spark') => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[kind] || paths.spark}</svg>`;
export const campusSignature = () => '<div class="campus-signature"><img src="assets/brand/gfc-river-otters.png" alt="Great Falls College Montana State University, River Otters" width="1129" height="284"></div>';
export const riverLines = () => '<svg class="river-lines" viewBox="0 0 480 340" fill="none" aria-hidden="true" focusable="false"><path d="M-40 80C100-60 210 220 520 50M-40 110C100-30 210 250 520 80M-40 140C100 0 210 280 520 110M-40 170C100 30 210 310 520 140M-40 200C100 60 210 340 520 170M-40 230C100 90 210 370 520 200" stroke="currentColor" stroke-width="2"/></svg>';
export function ideaVisual(item, index) {
  const kind = item.tags.includes('Responsible AI') ? 'shield' : item.tags.includes('Discussion') ? 'chat' : item.tags.includes('Workplace') ? 'briefcase' : item.tags.includes('Creative assessment') ? 'spark' : 'search';
  return `<div class="idea-visual" data-tone="${index % 4}" aria-hidden="true"><span class="idea-visual-icon">${labIcon(kind)}</span><span class="idea-number">${String(index + 1).padStart(2, '0')}</span><span class="idea-orbit"></span></div>`;
}
