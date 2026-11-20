// Embedded in both preview and download; no network fonts or assets are required.
export const guideStyles = `
* { box-sizing:border-box; }
html { scroll-behavior:auto; }
body { --gutter:clamp(24px,5vw,80px); margin:0; padding:0; background:#fff; color:#1e2d59; font:16px/1.6 Arial,Helvetica,sans-serif; }
main { width:100%; max-width:none; margin:0; }
h1,h2,h3,h4,h5,h6 { font-family:Georgia,'Times New Roman',serif !important; font-weight:700; line-height:1.1; letter-spacing:-.035em; }
h1 { font-size:clamp(44px,7vw,112px); margin:0 0 32px; max-width:18ch; }
h2 { font-size:clamp(30px,3.6vw,56px); margin:0 0 32px; }
h3 { font-size:26px; margin:32px 0 16px; }
h4 { font-size:22px; margin:24px 0 12px; }
p { margin:0 0 18px; overflow-wrap:anywhere; white-space:normal; }
li { margin:10px 0; overflow-wrap:anywhere; }
a { color:#1e2d59; text-underline-offset:5px; overflow-wrap:anywhere; }
a:focus-visible { outline:3px solid #1e2d59; outline-offset:4px; }
::selection { background:#f3bf4b; color:#1e2d59; }
.guide-brand { display:flex; align-items:center; gap:16px; padding:24px var(--gutter); background:#1e2d59; color:#fff; }
.guide-brand img { width:48px; height:48px; flex:none; }
.wordmark { font-size:26px; font-weight:700; line-height:1.2; }
.guide-brand small { display:block; font-size:16px; margin-top:4px; }
.guide-heading { background:#1e2d59; color:#fff; padding:32px var(--gutter) 64px; }
.guide-heading p { max-width:62ch; font-size:18px; }
.guide-heading p:first-of-type { display:inline-block; color:#fff; border-bottom:3px solid #f3bf4b; padding-bottom:4px; }
.toc { background:#f3bf4b; padding:40px var(--gutter); }
.toc h2 { font-size:32px; margin-bottom:20px; }
.toc ol { columns:2; column-gap:64px; margin:0; padding-left:24px; }
.toc li { break-inside:avoid; padding-left:8px; margin:0 0 8px; }
.toc a { display:inline-block; padding:5px 0; font-size:16px; }
.toc-topic,.toc ul { display:none; }
.guide-section { scroll-margin-top:24px; background:#fff; }
.guide-section > section { margin:0; padding:48px var(--gutter); }
.guide-section > section > :is(p,ul,ol,blockquote) { max-width:78ch; }
.guide-section > section.assignment { padding:0; }
.assignment-banner { padding:48px var(--gutter) 16px; background:#fff; color:#1e2d59; }
.assignment-banner h2 { margin:0; }
.assignment-content { padding:24px var(--gutter) 48px; overflow-wrap:anywhere; }
.assignment-content :is(p,li),.rationale-prose { max-width:78ch; }
.assignment-content > h3:first-child { margin-top:0; }
.assignment-directions { line-height:1.6; }
.assignment-directions p { margin:0 0 18px; }
.assignment-directions .assignment-steps { margin:8px 0 24px; }
.assignment-directions li { margin:12px 0; }
.assignment-directions h4:first-child { margin-top:0; }
.assignment-steps { padding-left:26px; }
.assignment-steps li { padding-left:8px; }
.rationale { margin-top:40px; padding:0; background:transparent; }
.rationale > h3 { margin:0 0 20px; }
.rationale-prose { line-height:1.6; }
blockquote { margin:24px 0; padding:0; font-size:20px; background:transparent; }
.example-situation { display:grid; grid-template-columns:140px minmax(0,1fr); align-items:center; gap:32px; margin:32px 0; }
.example-situation h3 { margin-top:0; }
.lemonade-visual { width:100%; max-width:160px; height:85px; display:block; margin:auto; }
.plans { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:48px; margin:40px 0; }
.plans article { min-width:0; padding:0; background:transparent; }
.plans article > h3 { margin:0 0 24px; }
.flow { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:32px; list-style:none; padding:0; }
.flow li { margin:0; padding:16px 0; background:transparent; }
.flow p { margin:12px 0 0; font-size:16px; }
.plans .flow { grid-template-columns:1fr; }
.plans .flow li { display:grid; grid-template-columns:80px minmax(0,1fr); align-items:center; column-gap:16px; }
.plans .flow .lemonade-visual { grid-row:span 2; height:65px; }
.practice-title { font-size:28px; margin:40px 0 24px; }
.practice-steps strong { display:block; font-size:20px; line-height:1.3; margin-bottom:16px; }
.practice-steps p { margin:0; }
.practice-note,.guide-help-section li { font-size:16px; line-height:1.6; }
.guide-conversation-notes { display:grid; gap:32px; }
.guide-decision { padding:0; break-inside:avoid; background:transparent; }
.guide-decision p { margin:0 0 18px; white-space:pre-line; }
.guide-decision p:last-child { margin-bottom:0; }
.guide-sources ul { margin:0; padding:0; list-style:none; }
.guide-sources li { margin:0 0 28px; line-height:1.6; font-size:16px; }
.guide-sources li a { display:block; margin-bottom:8px; font-weight:700; }
.guide-sources li span { display:block; }
.guide-sources li p { margin-top:12px; }
.assignment-rubric { width:100%; border-collapse:collapse; table-layout:fixed; font:16px/1.5 Arial,Helvetica,sans-serif; }
.assignment-rubric caption { font:700 26px Georgia,serif; padding:16px 0; text-align:left; }
.assignment-rubric th,.assignment-rubric td { width:25%; overflow-wrap:normal; word-break:normal; border:1px solid #1e2d59; padding:16px; vertical-align:top; text-align:left; }
.assignment-rubric thead { background:#1e2d59; color:#fff; }
.assignment-rubric tbody th { background:#fff; }
.rubric-table-scroll { overflow-x:auto; }
.rubric-score { display:block; margin-bottom:16px; font-weight:700; }
.rubric-descriptor { line-height:1.6; }
.rubric-download a { display:inline-block; padding:12px 0; font-weight:700; }
.guide-preview-toolbar { flex-wrap:wrap; }
@media(min-width:1000px) {
 .guide-section > section > :is(p,ul,ol,blockquote),.assignment-content > :is(p,.assignment-directions,.rationale) { margin-left:24%; }
}
@media(max-width:700px) {
 .guide-brand { padding-block:24px 16px; }
 .guide-brand img { width:40px; height:40px; }
 .guide-brand small { margin-top:8px; }
 .guide-heading { padding-block:24px 40px; }
 .guide-heading h1 { font-size:clamp(36px,9vw,60px); }
 .toc { padding-block:32px; }
 .toc ol { columns:1; }
 .guide-section > section,.assignment-content { padding:32px var(--gutter); }
 .assignment-banner { padding:32px var(--gutter) 0; }
 .plans,.flow { grid-template-columns:1fr; gap:24px; }
 .example-situation { grid-template-columns:1fr; gap:16px; }
 .example-situation .lemonade-visual { max-width:120px; }
 .assignment-rubric th,.assignment-rubric td { padding:12px; }
}
@media print {
 body { --gutter:0px; padding:0; font-size:12pt; background:#fff; }
 .guide-brand,.guide-heading,.toc { background:#fff; color:#1e2d59; padding:16px 0; }
 .guide-heading h1 { font-size:40pt; }
 .guide-heading p:first-of-type { color:#1e2d59; }
 .guide-section > section,.assignment-content,.assignment-banner { padding:20px 0; }
 .guide-section > section > :is(p,ul,ol,blockquote),.assignment-content > :is(p,.assignment-directions,.rationale) { margin-left:0; }
 h2,h3,h4 { break-after:avoid; }
 .flow li,.plans article,.guide-sources li { break-inside:avoid; }
 .rubric-download { display:none; }
}
`;
