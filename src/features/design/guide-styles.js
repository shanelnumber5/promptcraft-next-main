import { guideFontStyles } from './guide-fonts.js';

// One self-contained theme for previews, offline guides, and rubric downloads.
export const guideStyles = `${guideFontStyles}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { --guide-gutter: clamp(20px, 4.5vw, 72px); margin: 0; background: #f6f1e7; color: #1e2d59; font: 18px/1.65 Manrope, Arial, sans-serif; }
main { width: 100%; margin: 0; padding: 0 var(--guide-gutter) 40px; }
main > header { margin-inline: calc(-1 * var(--guide-gutter)); padding-inline: var(--guide-gutter); background: #1e2d59; color: #fff; }
h1, h2, h3, h4 { font-family: Fraunces, Georgia, serif; line-height: 1.15; letter-spacing: -.025em; }
h1 { max-width: 18ch; margin: 0 0 32px; font-size: clamp(52px, 6vw, 96px); overflow-wrap: anywhere; }
h2 { margin: 0; font-size: clamp(32px, 3.3vw, 48px); }
h3 { margin: 32px 0 16px; font-size: 28px; }
h4 { margin: 24px 0 12px; font-size: 23px; }
p { margin: 0 0 20px; }
li { margin-block: 8px; }
a { color: inherit; text-decoration-color: #d98f06; text-decoration-thickness: 3px; text-underline-offset: 6px; overflow-wrap: anywhere; }
a:focus-visible { outline: 3px solid #d98f06; outline-offset: 5px; }
img, svg { max-width: 100%; }
.guide-brand { display: flex; align-items: center; gap: 16px; padding-block: 28px; }
.guide-brand img { width: 48px; height: 48px; }
.wordmark { font-size: 26px; font-weight: 700; }
.guide-brand small { font-size: 16px; }
.guide-heading { padding-block: 20px 32px; }
.guide-heading p { max-width: 62ch; }
.guide-status { display: inline-block; margin-bottom: 24px; padding-bottom: 6px; border-bottom: 4px solid #d98f06; font: 600 18px/1.5 Manrope, Arial, sans-serif; }
.toc { position: sticky; top: 0; z-index: 1; padding-block: 16px; background: #f6f1e7; }
.toc h2 { font: 700 18px/1.5 Manrope, Arial, sans-serif; margin-bottom: 16px; }
.toc ol { display: flex; flex-wrap: wrap; gap: 4px 18px; list-style: none; padding: 0; margin: 0; }
.toc li { margin: 0; }
.toc a { display: inline-block; padding-block: 4px; font-size: 18px; }
.toc-topic, .toc ul { display: none; }
.guide-section { display: block; padding-block: 28px; scroll-margin-top: 120px; }
.guide-section-intro { display: grid; gap: 20px; margin-bottom: 24px; }
.guide-section-intro.has-lead { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 40px; align-items: start; }
.guide-section-intro p { margin: 0; }
.guide-section-content { min-width: 0; }
.guide-section-content > section { margin: 0; padding: 0; }
.guide-section-content :is(p, ul, ol, blockquote) { max-width: none; }
.assignment-banner:empty { display: none; }
.assignment-content { padding: 0; }
.assignment-directions { columns: 2; column-gap: 48px; overflow-wrap: anywhere; }
.assignment-directions > :is(h3, h4) { break-after: avoid; }
.assignment-directions > :is(p, li) { break-inside: avoid; }
.assignment-steps { padding-left: 24px; }
.rationale { margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e2d5940; }
blockquote { margin: 16px 0; padding: 0; background: transparent; font: 600 22px/1.45 Fraunces, Georgia, serif; }
.example-situation { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 24px; align-items: center; margin-block: 24px; }
.lemonade-visual { display: block; width: 140px; height: 86px; object-fit: contain; margin: 0 0 12px; }
.plans, .flow { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.flow { grid-template-columns: repeat(3, minmax(0, 1fr)); list-style: none; padding: 0; }
.plans article { min-width: 0; }
.plans .flow { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.flow li { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; min-width: 0; }
.flow p { margin: 0; }
.guide-quotes, .teaching-moves { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.teaching-moves { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.guide-question-row { display: grid; grid-template-columns: 1fr 2fr 2fr; gap: 32px; align-items: start; margin-block: 28px; }
.guide-sources ul { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
.guide-sources li { min-width: 0; }
.plans .flow li, .guide-decision, .guide-sources li { padding-block: 8px; }
.practice-steps strong { display: block; margin-bottom: 8px; }
.guide-sources ul { list-style: none; padding: 0; }
.guide-sources span { display: block; margin-block: 8px; }
.rubric-table-scroll { overflow-x: auto; }
.assignment-rubric { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 18px; }
.assignment-rubric caption { text-align: left; font: 700 28px/1.3 Fraunces, Georgia, serif; padding-bottom: 24px; }
.assignment-rubric :is(th, td) { width: 25%; padding: 16px; vertical-align: top; text-align: left; border: 0; border-bottom: 1px solid #1e2d5940; overflow-wrap: anywhere; }
.assignment-rubric thead th { background: #1e2d59; color: white; }
.assignment-rubric tbody th p { font-weight: 400; }
.rubric-score { display: table; margin-bottom: 16px; font-weight: 700; border-bottom: 3px solid #d98f06; }
.rubric-document main { padding-top: 32px; }
.rubric-document .guide-section { display: block; }
body[data-guide-preview] main { padding-bottom: 0; }
body[data-guide-preview] .guide-section { padding-block: 16px; }
body[data-guide-preview] .guide-section-intro { margin-bottom: 16px; }
body[data-guide-preview] .guide-section-intro h2 { font-size: 32px; }
body[data-guide-preview] :is(.plans,.flow,.guide-quotes,.teaching-moves,.guide-question-row,.guide-sources ul,.assignment-directions) { display: block; columns: 1; }
@media (max-width: 900px) {
  .guide-section-intro.has-lead, .plans, .guide-quotes, .guide-question-row, .teaching-moves, .guide-sources ul { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .assignment-directions { columns: 1; }
  .toc { position: static; }
  .assignment-rubric { table-layout: auto; min-width: 0; }
}
@media (max-width: 600px) {
  .plans, .flow, .plans .flow, .example-situation { grid-template-columns: minmax(0, 1fr); }
  .guide-heading { padding-block: 24px 40px; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
@media print {
  html { scroll-behavior: auto; }
  body { background: white; color: #1e2d59; font-size: 11pt; }
  main { padding: 0; }
  main > header { margin: 0; padding: 0; background: white; color: #1e2d59; }
  .guide-heading { padding-block: 16px; }
  h1 { font-size: 36pt; }
  h2 { font-size: 22pt; }
  .toc, .rubric-download { display: none; }
  .guide-section { display: block; padding-block: 20px; }
  .guide-section-intro, .guide-section-intro.has-lead, .plans, .flow, .guide-quotes, .guide-question-row, .teaching-moves, .guide-sources ul { display: block; }
  .assignment-directions { columns: 1; }
  .guide-section-intro, article, blockquote, .flow li, .guide-decision { break-inside: avoid; }
  .guide-section-intro h2 { margin-bottom: 16px; }
  .plans, .flow { display: block; }
  .assignment-rubric { min-width: 0; font-size: 9pt; }
  .assignment-rubric :is(th, td) { padding: 8px; }
  .assignment-rubric thead th { background: white; color: #1e2d59; border-bottom: 2px solid #1e2d59; }
  thead { display: table-header-group; }
  tr, .guide-decision { break-inside: avoid; }
  blockquote { font-size: 18pt; }
}
`;
