import { renderAssignmentDirections } from './directions.js';
import { formatDirectionsEditor } from './directions-editor.js';

/** Bind a toolbar once to a stable root; the editor may be replaced on every render. */
export function bindDirectionsEditorControls(root) {
  let savedRange = null;
  const editor = () => root.querySelector('[data-assignment-editor]');
  const rememberSelection = () => {
    const selection = window.getSelection?.();
    if (
      selection?.rangeCount &&
      editor()?.contains(selection.getRangeAt(0).commonAncestorContainer)
    ) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
  };

  root.addEventListener('focusin', (event) => {
    if (event.target.matches?.('[data-editor-style]')) rememberSelection();
  });
  root.addEventListener('pointerdown', (event) => {
    if (event.target.matches?.('[data-editor-style]')) rememberSelection();
    if (event.target.closest('[data-editor-command]')) event.preventDefault();
  });
  root.addEventListener('change', (event) => {
    if (!event.target.matches?.('[data-editor-style]')) return;
    const target = editor();
    const value = event.target.value;
    if (target && ['p', 'h4'].includes(value)) {
      target.focus({ preventScroll: true });
      if (savedRange && target.contains(savedRange.commonAncestorContainer)) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
      formatDirectionsEditor(target, 'formatBlock', value);
    }
    event.target.value = '';
  });
  root.addEventListener('click', (event) => {
    const command = event.target.closest('[data-editor-command]');
    if (command) {
      formatDirectionsEditor(
        editor(),
        command.dataset.editorCommand,
        command.dataset.editorValue || null,
      );
    }
  });
  for (const kind of ['paste', 'drop']) {
    root.addEventListener(kind, (event) => {
      const target = event.target.closest('[data-assignment-editor]');
      if (!target) return;
      event.preventDefault();
      const text = (event.clipboardData || event.dataTransfer).getData('text/plain');
      formatDirectionsEditor(target, 'insertHTML', renderAssignmentDirections(text));
    });
  }
}
