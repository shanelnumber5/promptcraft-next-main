import { renderAssignmentDirections } from './directions.js';

export function renderDirectionsEditor(text) {
  return `<div class="setup-field"><label id="revision-label" for="revision">Discussion-board directions</label><p id="revision-help" class="field-help">Write your directions and use the toolbar to format the student-facing text.</p><div class="directions-toolbar" role="group" aria-label="Format discussion-board directions"><select data-editor-style aria-label="Text style"><option value="" disabled selected>Text style</option><option value="p">Paragraph</option><option value="h4">Heading</option></select><button type="button" data-editor-command="bold" aria-label="Bold" title="Bold"><strong>B</strong></button><button type="button" data-editor-command="italic" aria-label="Italic" title="Italic"><em>I</em></button><button type="button" data-editor-command="insertOrderedList" aria-label="Numbered list" title="Numbered list">1. List</button><button type="button" data-editor-command="insertUnorderedList" aria-label="Bullet list" title="Bullet list">• List</button></div><div id="revision" class="directions-editor assignment-directions" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="revision-label" aria-describedby="revision-help" data-assignment-editor="revision">${renderAssignmentDirections(text)}</div></div>`;
}

// Store supported formatting as text, never editable HTML or pasted attributes.
export function serializeDirectionsEditor(editor, { formatted = true } = {}) {
  const inline = (node) => {
    if (node.nodeType === 3) return node.textContent.replace(/\u00a0/g, ' ');
    if (node.nodeType !== 1) return '';
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(node.tagName)) return '';
    if (node.tagName === 'BR') return '\n';
    const text = [...node.childNodes].map(inline).join('');
    if (!text.trim()) return text;
    if (formatted && ['STRONG', 'B'].includes(node.tagName)) return `**${text}**`;
    if (formatted && ['EM', 'I'].includes(node.tagName)) return `*${text}*`;
    if (formatted && node.tagName === 'CODE') return `\`${text}\``;
    return text;
  };
  const list = (node, indent = '') => {
    let number = Number(node.getAttribute('start')) || 1;
    return [...node.children].filter((item) => item.tagName === 'LI').map((item) => {
      const nested = [...item.children].filter((child) => ['OL', 'UL'].includes(child.tagName));
      const text = [...item.childNodes].filter((child) => !nested.includes(child)).map(inline).join('').trim();
      const value = Number(item.getAttribute('value')) || number;
      number = value + 1;
      const marker = node.tagName === 'OL' ? `${value}. ` : '- ';
      return indent + marker + text.replace(/\n/g, '\n' + indent + '   ') +
        nested.map((child) => '\n' + list(child, indent + '   ')).join('');
    }).join('\n');
  };
  const blocks = (node) => [...node.childNodes].map((child) => {
    if (child.nodeType !== 1) return inline(child);
    if (['OL', 'UL'].includes(child.tagName)) return '\n\n' + list(child) + '\n\n';
    if (/^H[1-6]$/.test(child.tagName)) return '\n\n' + (formatted ? '### ' : '') + inline(child).trim() + '\n\n';
    if (['P', 'DIV', 'BLOCKQUOTE'].includes(child.tagName)) return '\n\n' + blocks(child).trim() + '\n\n';
    return inline(child);
  }).join('');
  return blocks(editor).replace(/\n{3,}/g, '\n\n').trim();
}

export function formatDirectionsEditor(editor, command, value = null) {
  editor.focus({ preventScroll: true });
  // Native editing commands preserve the browser's undo/redo history.
  document.execCommand(command, false, value);
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}
