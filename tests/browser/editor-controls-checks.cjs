const assert = require('node:assert/strict');

// Exercise the extracted bindings in a real contenteditable, including a replaced editor.
module.exports = async function checkEditorControls({ evaluate, choose, scenarioMode }) {
  const savedDraft = () =>
    evaluate(
      `JSON.parse(localStorage.getItem(${JSON.stringify(scenarioMode ? 'promptcraft_next_opening_v1' : 'promptcraft_assignment_workspace_v1')}))${scenarioMode ? '' : '.state'}.design.revision`,
    );
  await choose('[data-design-page="draft"]');
  await evaluate(`(() => {
    const editor = document.querySelector('[data-assignment-editor]');
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor.firstElementChild);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const style = document.querySelector('[data-editor-style]');
    style.dispatchEvent(new Event('pointerdown', {bubbles:true}));
    style.focus();
    style.value = 'h4';
    style.dispatchEvent(new Event('change', {bubbles:true}));
  })()`);
  assert.match(await savedDraft(), /^### Compare the evidence/, 'Heading changes reach autosave');
  await evaluate(`(() => {
    const heading = document.querySelector('[data-assignment-editor] h4');
    const range = document.createRange();
    range.selectNodeContents(heading);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  })()`);
  await choose('[data-editor-command="italic"]');
  assert.match(await savedDraft(), /\*Compare the evidence/, 'Toolbar formats the selected text');

  await choose('[data-design-page="subject"]');
  await choose('[data-design-page="draft"]');
  await evaluate(`(() => {
    const editor = document.querySelector('[data-assignment-editor]');
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const transfer = new DataTransfer();
    transfer.setData('text/plain', 'Inspect <script>untrusted()</script> evidence.');
    transfer.setData('text/html', '<img src=x onerror="untrusted()">');
    editor.dispatchEvent(new ClipboardEvent('paste', {bubbles:true, cancelable:true, clipboardData:transfer}));
  })()`);
  assert(
    await evaluate(
      '!document.querySelector("[data-assignment-editor] script, [data-assignment-editor] img")',
    ),
    'Paste inserts rendered text without pasted HTML',
  );
  assert.match(
    await savedDraft(),
    /Inspect/,
    'Replacement editor keeps paste and autosave bindings',
  );
  await evaluate(`(() => {
    const editor = document.querySelector('[data-assignment-editor]');
    const transfer = new DataTransfer();
    transfer.setData('text/plain', ' Keep course evidence.');
    editor.dispatchEvent(new DragEvent('drop', {bubbles:true, cancelable:true, dataTransfer:transfer}));
  })()`);
  assert.match(
    await savedDraft(),
    /Keep course evidence/,
    'Drop shares the safe text insertion path',
  );
};
