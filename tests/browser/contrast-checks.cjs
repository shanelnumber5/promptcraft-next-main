// Evaluate the rendered cascade, including alpha-composited ancestor backgrounds.
module.exports = async function auditContrast(evaluate) {
  return evaluate(`(${function () {
    const parse = value => {
      const n = value.match(/[\d.]+/g)?.map(Number);
      return n && n.length >= 3 ? [...n.slice(0, 3), n[3] ?? 1] : [0, 0, 0, 0];
    };
    const blend = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3])).concat(1);
    const luminance = rgb => rgb.slice(0, 3).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
    const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const visible = element => {
      const r = element.getBoundingClientRect(), s = getComputedStyle(element);
      const modal = document.querySelector('dialog[open]');
      return r.width && r.height && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && s.visibility === 'visible' && s.display !== 'none' && Number(s.opacity) > 0 && !element.closest('[hidden],.sr-only') && (!modal || modal.contains(element));
    };
    const background = element => {
      const chain = []; let e = element;
      while (e) { chain.unshift(e); e = e.parentElement; }
      let bg = [255, 255, 255, 1], unknown = false;
      for (const ancestor of chain) {
        const s = getComputedStyle(ancestor), color = parse(s.backgroundColor);
        if (color[3] === 1) unknown = false;
        bg = blend(color, bg);
        if (s.backgroundImage !== 'none') unknown = true;
      }
      return {bg, unknown};
    };
    const failures = [], manual = [], samples = [];
    const check = (element, text, foreground, minimum, kind = 'text') => {
      const {bg, unknown} = background(element);
      const record = {kind, text: text.slice(0, 100), selector: element.tagName.toLowerCase() + (element.id ? '#' + element.id : '.' + [...element.classList].join('.')), foreground, background: bg.slice(0,3), ratio: +ratio(blend(parse(foreground), bg), bg).toFixed(3), minimum};
      if (unknown) manual.push(record);
      else { samples.push(record); if (record.ratio < minimum) failures.push(record); }
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, parent = node.parentElement;
      if (node.textContent.trim() && !parent.closest('script,style,option') && visible(parent)) check(parent, node.textContent.trim(), getComputedStyle(parent).color, 7);
    }
    for (const el of document.querySelectorAll('input:not([type=radio]):not([type=checkbox]),textarea,select')) {
      if (!visible(el)) continue;
      const placeholder = !el.value && el.placeholder;
      check(el, el.value || el.placeholder || el.tagName, getComputedStyle(el, placeholder ? '::placeholder' : null).color, 7, placeholder ? 'placeholder' : 'input');
    }
    for (const el of document.querySelectorAll('button,input,textarea,select,a.action-link,.workflow-nav a')) {
      if (!visible(el)) continue;
      const s = getComputedStyle(el);
      // The rendered control edge must be distinguishable from its interior or surroundings.
      if (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none' && parse(s.borderTopColor)[3] > 0) {
        const inside = background(el), outside = background(el.parentElement);
        if (!inside.unknown && !outside.unknown) {
          const edge = parse(s.borderTopColor);
          const value = Math.max(ratio(blend(edge, inside.bg), inside.bg), ratio(blend(edge, outside.bg), outside.bg));
          const record = {kind:'control-edge', text:el.textContent.trim().slice(0,80) || el.id, selector:el.tagName.toLowerCase()+'.'+[...el.classList].join('.'), ratio:+value.toFixed(3), minimum:4};
          samples.push(record); if (record.ratio < 4) failures.push(record);
        }
      }
    }
    const selectionTarget = Array.from(document.querySelectorAll('h1,h2,p,label')).find(visible) || document.body;
    const selection = getComputedStyle(selectionTarget, '::selection');
    const selectedBackground = parse(selection.backgroundColor);
    if (selectedBackground[3] === 1) {
      const selected = {kind:'selection', text:'Selected text', foreground:selection.color, background:selectedBackground.slice(0,3), ratio:+ratio(blend(parse(selection.color),selectedBackground),selectedBackground).toFixed(3), minimum:7};
      samples.push(selected); if(selected.ratio < 7) failures.push(selected);
    }
    return {url:location.href, width:innerWidth, height:innerHeight, failures, manual, samples};
  }.toString()})()`);
};
