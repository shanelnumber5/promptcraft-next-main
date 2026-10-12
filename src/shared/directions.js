import { escapeHTML as e } from './html.js';

// Small, escaped Markdown subset; never accept generated HTML or active links.
export function renderAssignmentDirections(text, { approved = false } = {}) {
  const inline = (value) =>
    e(value)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  const parts = [];
  let paragraph = [],
    items = [],
    kind = '',
    nested = [],
    continued = false,
    lastNumber = 0;
  const flushParagraph = () => {
    if (paragraph.length) {
      parts.push(`<p>${inline(paragraph.join('\n'))}</p>`);
      paragraph = [];
    }
  };
  const flushNested = () => {
    if (nested.length) {
      items[items.length - 1] = items.at(-1).replace(/<\/li>$/, `<ul>${nested.join('')}</ul></li>`);
      nested = [];
      continued = true;
    }
  };
  const flushList = () => {
    flushNested();
    if (items.length) {
      parts.push(`<${kind} class="assignment-steps">${items.join('')}</${kind}>`);
      items = [];
      kind = '';
      lastNumber = 0;
      continued = false;
    }
  };
  for (const line of String(text).split(/\r?\n/)) {
    const heading =
        line.match(/^#{1,6}\s+(.+)$/) ||
        line.match(/^(Step\s+\d+\s*:\s*.+)$/i) ||
        line.match(/^(Week\s+\d+\s+Forum\s*:\s*.+)$/i),
      number = line.match(/^\s*(\d+)\.\s+(.*)$/),
      bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (!line.trim()) {
      flushParagraph();
      flushList();
    } else if (heading || line.trim() === 'Peer exchange (draft)') {
      flushParagraph();
      flushList();
      parts.push(
        `<h4>${inline(heading ? heading[1] : approved ? 'Peer exchange' : 'Peer exchange (draft)')}</h4>`,
      );
    } else if (bullet && kind === 'ol' && items.length) {
      nested.push(`<li>${inline(bullet[1])}</li>`);
    } else if (number || bullet) {
      flushParagraph();
      flushNested();
      const nextKind = number ? 'ol' : 'ul';
      if (kind && kind !== nextKind) flushList();
      kind = nextKind;
      const value = number
        ? continued && Number(number[1]) <= lastNumber
          ? lastNumber + 1
          : Number(number[1])
        : 0;
      lastNumber = value;
      items.push(
        `<li${number ? ` value="${value}"` : ''}>${inline(number ? number[2] : bullet[1])}</li>`,
      );
    } else if (items.length && /^\s{2,}/.test(line)) {
      items[items.length - 1] = items.at(-1).replace('</li>', `<br>${inline(line.trim())}</li>`);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return parts.join('');
}
