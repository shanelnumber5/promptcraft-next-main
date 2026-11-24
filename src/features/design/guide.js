import { savedFeedbackNotes } from './feedback-conversation.js';
import { renderRubricTable, rubricCSV, rubricForState } from '../workspace/rubric.js';
import { renderGuideHelp } from '../../shared/guide-help.js';
import { guideStyles } from './guide-styles.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { teacherSetup } from '../setup/content.js';
import { escapeHTML as e } from '../../shared/html.js';
import { scenarioGuideSections } from '../opening/guide-content.js';
import { designRoute } from '../workspace/routes.js';
import { designEvidence, renderDesignRationale } from '../../shared/design-evidence.js';

// Bake the final guide theme into downloads so preview and offline HTML agree.
// The theme is authored in editorial-fixes.css, not another inline override layer.
function editorialGuideStyles() {
  if (typeof document === 'undefined' || !document.styleSheets) return '';
  const rules = [], seen = new Set();
  const visit = (sheet) => {
    if (!sheet || seen.has(sheet)) return;
    seen.add(sheet);
    try {
      for (const rule of sheet.cssRules) {
        if (rule.styleSheet) visit(rule.styleSheet);
        else if (rule.cssText.includes('guide-export')) rules.push(rule.cssText);
        else if (rule.type === 5 && /Fraunces|Manrope/.test(rule.style.fontFamily)) {
          rules.push(rule.cssText.replace(/url\(["']?([^"')]+)["']?\)/g,
            (_, url) => `url("${new URL(url, sheet.href || document.baseURI).href}")`));
        }
      }
    } catch { /* A third-party stylesheet is not part of the guide theme. */ }
  };
  [...document.styleSheets].forEach(visit);
  return rules.join('\n');
}

export function renderConversationNotes(notes) {
  return (
    '<div class="guide-conversation-notes">' +
    notes
      .trim()
      .split(/\n\s*\n/)
      .map((block) => {
        const match = block.match(/^(Maya|Pixel):\s*([\s\S]*?)\nEducator:\s*([\s\S]*)$/);
        return match
          ? `<section class="guide-decision"><p class="guide-question"><strong>${e(match[1])} asked</strong><br>${e(match[2])}</p><p><strong>Your decision</strong><br>${e(match[3])}</p></section>`
          : `<section class="guide-decision"><p>${e(block)}</p></section>`;
      })
      .join('') +
    '</div>'
  );
}

function alignmentGuidance(teacher) {
  const labels = {
    'montana-k12': 'Montana K–12 Content Standards',
    'msu-outcomes': 'MSU course description or learning outcomes',
    oscqr: 'OSCQR online course quality rubric',
  };
  const guide = labels[teacher?.alignmentGuide];
  if (!guide) return null;
  return `<section><h2>Optional assignment guidance</h2><p><strong>Selected guide:</strong> ${e(guide)}</p>${teacher.alignmentReference?.trim() ? `<h3>Reference supplied by the instructor</h3><p>${e(teacher.alignmentReference)}</p>` : '<p>No standard, outcome, or rubric item was supplied.</p>'}<p>This guide was used as an optional design reference, not as verification of official alignment or compliance.</p></section>`;
}

// Preview, download and the library must describe the same saved experience.
// Keep scenario identity separate from the shared studio's planning metadata.
export function guideOptions(state) {
  return {
    approved: state.finalCheck.approved,
    conversationNotes: savedFeedbackNotes(state),
    rubric: structuredClone(rubricForState(state)),
    experience: state.experience || (state.workspace ? 'workspace' : 'scenario'),
    teacher: { ...state.teacher },
    workspace: state.workspace ? { ...state.workspace } : null,
    scenarioSections:
      designRoute(
        state.experience || (state.workspace ? 'workspace' : 'scenario'),
      ).guideSections?.() || [],
  };
}

let logoPromise;
export function loadGuideLogo() {
  return (logoPromise ??= fetch(
    new URL('../../../assets/brand/babbage-mark-small.svg', import.meta.url),
    { signal: AbortSignal.timeout(5000) },
  )
    .then((response) => {
      if (!response.ok) throw Error('Logo unavailable');
      return response.text();
    })
    .then((svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
    .catch(() => null));
}

export function createGuide(
  design,
  {
    approved = true,
    logo = null,
    teacher = null,
    workspace = null,
    experience = workspace ? 'workspace' : 'scenario',
    scenarioSections = null,
    conversationNotes = '',
    rubric = null,
  } = {},
) {
  const isScenario = experience === 'scenario';
  const example = teacherSetup.steps[1].example.directions;
  const stale =
    teacher &&
    ((design.sourceDirections && design.sourceDirections !== teacher.directions) ||
      (!design.sourceDirections &&
        design.revision.startsWith(example) &&
        teacher.directions !== example));
  if (stale) {
    design = { ...design, revision: '', reason: '' };
    approved = false;
  }
  const assignmentTitle =
    workspace?.assignmentTitle?.trim() ||
    (rubric?.title && rubric.title !== 'Assignment rubric'
      ? rubric.title.replace(/\s+rubric$/i, '')
      : '');
  const chosenTitle = workspace
    ? assignmentTitle || 'Activity directions'
    : 'Your revised discussion board';
  const sections = isScenario ? [...(scenarioSections || scenarioGuideSections())] : [];
  const scenarioOrder = sections.map((section) => section.id);
  const alignmentSection = teacher && alignmentGuidance(teacher);
  if (alignmentSection)
    sections.push({
      id: 'assignment-guidance',
      title: 'Optional assignment guidance',
      body: alignmentSection,
    });
  if (teacher && !design.revision.trim())
    sections.push({
      id: 'assignment-pending',
      title: workspace
        ? 'Your assignment · design in progress'
        : 'Discussion-board component · design in progress',
      body: workspace
        ? '<section class="assignment"><div class="assignment-banner"><h2>Your assignment design is still in progress</h2></div><div class="assignment-content"><p>Use Build to write directions, or collaborate with Babbage and choose a suggestion to edit. Return to Review &amp; Course Guide to explain and approve your design before downloading.</p></div></section>'
        : '<section class="assignment"><div class="assignment-banner"><h2>Your discussion-board component is still in progress</h2></div><div class="assignment-content"><p>Return to Design one focused discussion-board activity. Write a bounded forum exchange that supports the larger assignment, or generate a suggestion to adapt. This component is not an all-in-one replacement. Review and approve your directions before downloading the guide.</p></div></section>',
    });
  if (design.revision.trim() || design.reason.trim())
    sections.push({
      id: 'your-assignment',
      title: chosenTitle,
      body: `<section class="assignment"><div class="assignment-banner"><h2>${e(chosenTitle)} · ${approved ? 'Approved version' : 'Draft'}</h2></div><div class="assignment-content">${teacher?.learningGoal ? `<p><strong>Learning goal:</strong> ${e(teacher.learningGoal)}</p>` : ''}${design.revision.trim() ? `${workspace ? '' : '<h3 id="revised-directions">Discussion-board directions</h3>'}<div class="assignment-directions"${workspace ? ' id="revised-directions"' : ''}>${renderAssignmentDirections(design.revision, { approved })}</div>` : ''}${!workspace && design.instructorPlan?.trim() ? `<aside class="rationale"><h3>Instructor interaction</h3><p>${e(design.instructorPlan)}</p></aside>` : ''}${design.reason.trim() && !workspace ? `<aside class="rationale"><h3 id="change-reason">Why I made this change</h3><div class="design-rationale">${renderDesignRationale(design.reason, { showSources: false, paragraphBreaks: true })}</div></aside>` : ''}</div></section>`,
    });
  sections.push({
    id: 'design-sources',
    title: workspace ? 'Design references' : 'Sources',
    body:
      `<section class="guide-sources"><h2>${workspace ? 'Design references' : 'Sources'}</h2><p>${workspace ? 'References supporting the teaching and design choices.' : 'References behind the teaching moves. The lemonade example is a fictional illustration.'}</p><ul>` +
      designEvidence
        .map(
          (source) =>
            '<li><a href="' +
            e(source.url) +
            '" target="_blank" rel="noopener noreferrer">' +
            e(source.short) +
            '</a><span>' +
            e(source.citation) +
            '</span><p><strong>How PromptCraft uses this:</strong> ' +
            e(
              source.id === 'alignment'
                ? 'The learning-goal check and rubric ask whether the activity and assessment give students practice with the intended learning.'
                : source.id === 'discussion'
                  ? 'The design prompts ask instructors to give sharing and peer responses a specific purpose, such as examining evidence or comparing decisions. This study informs the discussion-design approach; it does not validate this particular assignment.'
                  : 'The feedback prompts invite students to judge a peer contribution and explain a revision or a reasoned decision to keep their work. This connects feedback with an action students take.',
            ) +
            '</p></li>',
        )
        .join('') +
      '</ul></section>',
  });
  sections.push({
    id: 'using-guide',
    title: 'Using your downloaded guide',
    body:
      '<section class="guide-help-section">' + renderGuideHelp({ standalone: true }) + '</section>',
  });
  if (rubric?.rows?.length)
    sections.push({
      id: 'assignment-rubric',
      title: 'Assessment rubric',
      body:
        '<section><h2>Assessment rubric</h2>' +
        (rubric.basis !== design.revision
          ? '<p>Assignment changed after rubric creation. Review this rubric before use.</p>'
          : '') +
        '<p class="rubric-download"><a download="assignment-rubric-canvas.csv" href="data:text/csv;charset=utf-8,' +
        encodeURIComponent(rubricCSV(rubric)) +
        '">Download rubric (.csv)</a></p><p>Import this CSV into Canvas Rubrics, then attach the imported rubric to your assignment. Review the criteria and points before using it with students.</p>' +
        renderRubricTable(rubric) +
        '</section>',
    });
  const order = [
    ...scenarioOrder,
    'your-assignment',
    'assignment-rubric',
    'assignment-pending',
    'decision-milestone',
    'assignment-guidance',
    'design-sources',
    'using-guide',
  ];
  sections.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const contents = sections
    .map((section) => '<li><a href="#' + section.id + '">' + e(section.title) + '</a></li>')
    .join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(assignmentTitle || 'PromptCraft assignment guide')}</title>
<style>${guideStyles}${editorialGuideStyles()}</style></head>


<body data-app-view="guide-export"${workspace ? ' class="workspace-guide"' : ''}><main><header><div class="guide-brand">${logo ? `<img src="${e(logo)}" alt="PromptCraft Babbage emblem">` : ''}<div><div class="wordmark">Prompt<span>Craft</span></div><small>The Prompt Lab · Great Falls College MSU</small></div></div><div class="guide-heading"><h1>${isScenario ? 'Course Guide · Guided scenario' : workspace ? e(assignmentTitle || 'Course Guide · Your activity') : 'Discussion guide'}</h1><p>${approved ? 'Your approved version' : 'Draft preview · Not yet approved'}</p><p>${isScenario ? 'Your scenario example, teaching guidance, activity directions, and assessment rubric.' : 'Your activity directions and assessment rubric.'}</p></div></header>${`<nav class="toc" aria-labelledby="contents-title"><h2 id="contents-title">In this guide</h2><ol>${contents}</ol></nav>`}${sections.map((section) => `<div class="guide-section" id="${section.id}">${section.body}</div>`).join('')}</main></body></html>`;
}

export function downloadGuide(design, options) {
  if (
    options?.teacher &&
    (!design.revision.trim() ||
      (design.sourceDirections && design.sourceDirections !== options.teacher.directions))
  )
    throw Error('Review a revision for the current assignment before downloading.');
  downloadGuideHTML(createGuide(design, options));
}
export function downloadGuideHTML(html) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'promptcraft-assignment-guide.html';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
