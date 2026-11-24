import { readingPages } from '../../shared/reading-pages.js';

const cost = (node) =>
  node.textContent.trim().length + node.querySelectorAll('svg, img').length * 160;

// Split the immutable guide snapshot into reading steps without dropping content.
// The downloadable document keeps its complete grids and tables.
export function guidePreviewPages(sections, limit = 650) {
  function fragments(node) {
    if (node.nodeType === 3) return node.textContent.trim() ? [node.cloneNode(true)] : [];
    if (node.nodeType !== 1) return [];
    if (node.matches('table')) {
      const doc = node.ownerDocument;
      const labels = [...node.querySelectorAll('thead th')].map((cell) => cell.textContent);
      return [...node.querySelectorAll('tbody tr')].flatMap((row) => {
        const criterion = row.querySelector('th')?.textContent || 'Criterion';
        return [...row.children].flatMap((cell, index) => {
          const article = doc.createElement('article');
          const title = doc.createElement('h3');
          title.textContent = index
            ? `${criterion.split('Maximum:')[0].trim()} · ${labels[index] || 'Rating'}`
            : 'Criterion';
          article.append(title);
          const body = doc.createElement('p');
          body.textContent = cell.textContent;
          article.append(body);
          return fragments(article);
        });
      });
    }
    if (cost(node) <= limit || node.matches('svg, img, h2, h3, h4')) return [node.cloneNode(true)];
    if (!node.querySelector('p, li, div, section, article, table, svg, img')) {
      return readingPages(node.textContent, limit).map((text) => {
        const fragment = node.cloneNode(false);
        fragment.textContent = text;
        return fragment;
      });
    }
    return [...node.childNodes].flatMap((child) =>
      fragments(child).map((fragment) => {
        const shell = node.cloneNode(false);
        shell.append(fragment);
        return shell;
      }),
    );
  }
  return sections.flatMap((section, sectionIndex) => {
    const heading = section.querySelector('h2');
    const intro = section.querySelector('.guide-section-intro > p');
    const content = section.querySelector('.guide-section-content');
    const blocks = [intro, ...content.children].filter(Boolean).flatMap(fragments);
    const groups = [];
    let group = [],
      size = 0;
    for (const block of blocks) {
      const amount = block.nodeType === 1 ? cost(block) : block.textContent.length;
      if (group.length && size + amount > limit) {
        groups.push(group);
        group = [];
        size = 0;
      }
      group.push(block);
      size += amount;
    }
    if (group.length || !groups.length) groups.push(group);
    return groups.map((group, part) => {
      const page = section.cloneNode(false);
      page.dataset.guideFragment = '';
      const title = section.ownerDocument.createElement('header');
      title.className = 'guide-section-intro';
      title.append(heading.cloneNode(true));
      const body = section.ownerDocument.createElement('div');
      body.className = 'guide-section-content';
      group.forEach((block) => body.append(block));
      page.append(title, body);
      return { sectionIndex, part, parts: groups.length, html: page.outerHTML };
    });
  });
}
