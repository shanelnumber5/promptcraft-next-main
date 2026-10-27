export function renderGuideHelp({ standalone = false } = {}) {
  const title=standalone ? '<h2>Using your downloaded guide</h2>' : '<h3>After downloading</h3>';
  return (standalone ? '' : '<div class="guide-download-help">')+title+'<ul><li>Double-click the HTML file to open it in your browser. The guide works offline.</li><li>Use the contents links to move between sections. External source links need internet.</li><li>Choose <strong>Print → Save as PDF</strong> to keep a PDF, or share the HTML file itself.</li><li>This is a snapshot of your work. Download a new copy after making changes in PromptCraft.</li></ul>'+(standalone ? '' : '</div>');
}
