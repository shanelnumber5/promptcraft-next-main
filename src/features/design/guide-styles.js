// Embedded so the downloaded guide remains readable offline and in print.
export const guideStyles = `
* { box-sizing:border-box; }
html { scroll-behavior:auto; }
body { margin:0; padding:24px; background:#faf9f5; color:#001f5b; font:16px/1.6 Arial,Helvetica,sans-serif; }
main { max-width:1000px; margin:auto; }
a { color:#005f8b; text-underline-offset:3px; overflow-wrap:anywhere; }
a:focus-visible { outline:3px solid #edaa00; outline-offset:4px; }
h1,h2 { font-family:Georgia,'Times New Roman',serif; font-weight:400; line-height:1.2; }
h1 { font-size:32px; margin:0 0 12px; }
h2 { font-size:26px; margin:0 0 20px; }
h3 { font-size:18px; margin:24px 0 10px; }
h4 { font-size:19px; margin:24px 0 12px; }
p { margin:0 0 16px; overflow-wrap:anywhere; white-space:pre-wrap; }
li { margin:8px 0; overflow-wrap:anywhere; }
.guide-brand { display:flex; align-items:center; gap:12px; padding:18px 24px; background:#fff; }
.guide-brand img { width:48px; height:48px; flex:none; }
.wordmark { font-size:25px; font-weight:700; line-height:1.2; }
.wordmark span { color:#0072a5; }
.guide-brand small { display:block; font-size:14px; margin-top:4px; }
.guide-heading { background:#001f5b; color:#fff; border-bottom:4px solid #edaa00; padding:28px 32px; }
.guide-heading p { max-width:680px; margin-bottom:8px; }
.guide-heading p:first-of-type { color:#f5ca58; font-size:14px; }
.toc { padding:22px 28px; margin:0 0 28px; background:#efeff1; }
.toc h2 { font:700 15px Arial,sans-serif; margin:0 0 12px; }
.toc-topic { display:none; }
.toc ol { display:flex; flex-wrap:wrap; gap:10px 24px; list-style:none; margin:0; padding:0; }
.toc li { margin:0; }
.toc a { color:#001f5b; font-size:15px; }
.toc ul { display:none; }
.guide-section { scroll-margin-top:20px; margin-bottom:28px; background:#fff; border-radius:4px; }
.guide-section > section { margin:0; padding:28px 32px; }
.guide-section > section.assignment { padding:0; }
.assignment-banner { border-bottom:3px solid #edaa00; background:#001f5b; color:#fff; padding:22px 32px; border-radius:4px 4px 0 0; }
.assignment-banner span { color:#f5ca58; font-size:13px; }
.assignment-banner h2 { margin:6px 0 0; color:#fff; }
.assignment-content { padding:28px 32px; }
.assignment-content > h3:first-child { margin-top:0; }
.assignment-directions { line-height:1.65; }
.assignment-steps { padding-left:26px; }
.assignment-steps li { padding-left:4px; }
.rationale { margin-top:24px; padding:20px 24px; border-left:3px solid #edaa00; background:#faf9f5; }
.rationale h3 { margin-top:0; }
blockquote { padding:16px 20px; border-left:3px solid #edaa00; margin:20px 0; background:#faf9f5; }
.example-situation { display:grid; grid-template-columns:140px 1fr; align-items:center; gap:24px; padding:20px; background:#faf9f5; margin:20px 0; }
.example-situation h3 { margin-top:0; }
.lemonade-visual { width:100%; max-width:160px; height:85px; display:block; margin:auto; }
.plans { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin:24px 0; }
.plans article { min-width:0; padding:20px; background:#faf9f5; border-radius:3px; }
.plans article > h3 { margin:0 0 16px; }
.flow { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; list-style:none; padding:0; }
.flow li { margin:0; padding:16px; background:#f0f3f7; border-top:3px solid #edaa00; }
.flow p { margin:8px 0 0; font-size:15px; }
.plans .flow { grid-template-columns:1fr; }
.plans .flow li { display:grid; grid-template-columns:80px minmax(0,1fr); align-items:center; gap:0 12px; background:#fff; border:0; padding:12px; }
.plans .flow .lemonade-visual { grid-row:span 2; height:65px; }
.guide-sources { border-top:3px solid #edaa00; }
.guide-section > .guide-sources { padding:20px 28px; }
.guide-sources h2 { font:700 17px Arial,sans-serif; margin-bottom:8px; }
.guide-sources > p { color:#405674; font-size:13px; margin-bottom:12px; }
.guide-sources ul { margin:0; padding:0; list-style:none; }
.guide-sources li { margin:10px 0; line-height:1.45; font-size:13px; color:#405674; }
.guide-sources li a { font-size:14px; font-weight:600; display:block; margin-bottom:3px; }
.guide-sources li span { display:block; }
@media(max-width:600px) {
 body { padding:12px; }
 .guide-brand { padding:16px; }
 .guide-brand small { font-size:12px; }
 .guide-heading,.assignment-banner { padding:24px 20px; }
 h1 { font-size:29px; }
 h2 { font-size:25px; }
 .toc,.guide-section > section,.assignment-content { padding:20px; }
 .toc ol { gap:8px 18px; }
 .plans,.flow { grid-template-columns:1fr; }
 .example-situation { grid-template-columns:1fr; padding:16px; gap:12px; }
 .example-situation .lemonade-visual { max-width:120px; }
 .guide-section > .guide-sources { padding:20px; }
}
@media print {
 body { padding:0; background:#fff; font-size:11pt; color:#001f5b; }
 main { max-width:none; }
 .guide-section { margin:0 0 20px; }
 .guide-brand,.guide-heading,.assignment-banner { background:#fff; color:#001f5b; padding-left:0; padding-right:0; }
 .guide-heading { border-bottom:3px solid #edaa00; }
 .guide-heading p:first-of-type,.assignment-banner span,.assignment-banner h2 { color:#001f5b; }
 .toc { padding:16px 0; background:#fff; }
 .guide-section > section,.assignment-content { padding:16px 0; }
 h2,h3,h4 { break-after:avoid; }
 .flow li,.plans article,.guide-sources li { break-inside:avoid; }
 .guide-section > .guide-sources { padding:16px 0; }
 .guide-sources li { font-size:9pt; }
}

/* A clear contents list and matching navy section banners. */
.toc { background:#efeff1; padding:22px 28px; }
.toc h2 { font:700 17px Arial,sans-serif; margin-bottom:10px; }
.toc ol { display:block; list-style:decimal; padding-left:22px; }
.toc li { padding-left:6px; margin:3px 0; }
.toc li::marker { color:#405674; font-size:14px; }
.toc a { display:inline-block; padding:5px 0; font-size:15px; font-weight:600; text-decoration-thickness:1px; }
.guide-section > section > h2 { margin:-28px -32px 24px; padding:20px 32px; background:#001f5b; color:#fff; border-bottom:3px solid #edaa00; border-radius:4px 4px 0 0; }
.guide-section > .guide-sources { border:0; }
.guide-section > .guide-sources > h2 { margin:-20px -28px 16px; padding:16px 28px; font:400 23px/1.25 Georgia,'Times New Roman',serif; }
@media(max-width:600px) {
 .toc { padding:20px; }
 .guide-section > section > h2 { margin:-20px -20px 20px; padding:18px 20px; }
 .guide-section > .guide-sources > h2 { margin:-20px -20px 16px; padding:16px 20px; }
}
@media print {
 .guide-section > section > h2,.guide-section > .guide-sources > h2 { margin:0 0 16px; padding:12px 0; background:#fff; color:#001f5b; border-bottom:2px solid #edaa00; }
 .toc { padding:16px 0; background:#fff; }
}

.rationale { padding:0; border:0; background:transparent; margin-top:28px; }
.rationale > h3 { background:#001f5b; color:#fff; padding:14px 18px; font:400 22px/1.3 Georgia,'Times New Roman',serif; border-bottom:3px solid #edaa00; }
.rationale-prose { max-width:75ch; line-height:1.65; }
.rationale .rationale-prose p { margin:0 0 16px; }
@media print { .rationale > h3 { background:#fff; color:#001f5b; padding:12px 0; } }

/* Align the explanation with its heading and give each thought breathing room. */
.rationale { margin-top:32px; }
.rationale > h3 { margin-bottom:0; }
.rationale .rationale-prose { max-width:none; padding:20px 18px 4px; }
.rationale .rationale-prose p { line-height:1.75; margin:0 0 18px; }
.rationale .rationale-prose p:last-child { margin-bottom:0; }
@media(max-width:600px) { .rationale .rationale-prose { padding:18px 12px 4px; } }
@media print { .rationale .rationale-prose { padding:12px 0 0; } }

/* The three teaching moves echo the game's gold activity blocks. */
.practice-title { background:#001f5b; color:#fff; padding:14px 18px; margin:28px 0 14px; font:400 23px/1.3 Georgia,'Times New Roman',serif; border-radius:4px; }
.practice-steps { gap:14px; margin:0 0 22px; }
.practice-steps li { background:#edaa00; color:#001f5b; border:0; border-radius:4px; padding:22px 20px; }
.practice-steps strong { display:block; font:400 25px/1.2 Georgia,'Times New Roman',serif; margin-bottom:12px; }
.practice-steps p { margin:0; font-size:16px; line-height:1.55; }
.practice-note { color:#405674; font-size:14px; line-height:1.6; margin:0 0 28px; }
@media(max-width:600px) { .practice-steps { gap:10px; } .practice-steps li { padding:18px 20px; } }
@media print { .practice-title { background:#fff; color:#001f5b; padding:12px 0; } .practice-steps li { background:#fff; border:1px solid #edaa00; } }

.guide-help-section ul { padding-left:22px; margin:0; }
.guide-help-section li { font-size:15px; line-height:1.6; margin:12px 0; }
`;
