import { renderGuideHelp } from '../../shared/guide-help.js';
import { guideStyles } from './guide-styles.js';
import { renderAssignmentDirections } from '../../shared/directions.js';
import { teacherSetup } from '../setup/content.js';
import { escapeHTML as e } from '../../shared/html.js';
import { discussionOpening } from '../opening/content.js';
import { lemonadeVisual, planVisuals } from '../../shared/lemonade-visuals.js';
import { designEvidence, renderDesignRationale } from '../../shared/design-evidence.js';
import { findIdea } from '../idea-lab/ideas.js';

function lemonadeExample() {
  const scene = (id) => discussionOpening.scenes.find((item) => item.id === id);
  const flow = (board) =>
    `<ol class="flow" aria-label="${e(board.flowLabel)}">${board.nodes.map((node, index) => `<li>${planVisuals(board)[index]}<strong>${e(node.title)}</strong><p>${e(node.detail)}</p></li>`).join('')}</ol><p>${e(board.note)}</p>`;
  return `<section><h2>The lemonade example</h2><p>The old assignment asked students to describe a lemonade stand and reply to two classmates. Maya could finish without using anyone else’s ideas. The revised discussion gives the reply a purpose: examine a choice and use the question to revise or defend it.</p><div class="example-situation"><div>${lemonadeVisual('stand')}</div><div><h3>The situation</h3><ul>${scene(
    'meet-plan',
  )
    .board.facts.map((fact) => `<li>${e(fact)}</li>`)
    .join(
      '',
    )}</ul></div></div><div class="plans"><article><h3>First plan</h3>${flow(scene('spot-hole').board)}</article><article><h3>A revision to test</h3>${flow(scene('revised-plan').board)}</article></div><h3>The useful peer question</h3><blockquote>${e(scene('peer-question').board.quote)}</blockquote><p>The question points to a specific concern: Alex handles both payments and drinks while Sam may have no supplies to restock. It helps the group reconsider how the helpers share service work.</p><h3 class="practice-title">What students practice</h3><ol class="flow practice-steps"><li><strong>Propose</strong><p>Choose a plan and explain the helper roles.</p></li><li><strong>Question</strong><p>Name a choice, explain a concern, and ask a question about it.</p></li><li><strong>Respond</strong><p>Revise or defend the plan with reasons that address the question.</p></li></ol><p class="practice-note">The revised plan is a possibility to test, not proof of faster service. Defending the original plan can also be a useful response if the group addresses the concern.</p><h3>Use the same approach in your course</h3><p>Choose a decision students need to explain. Ask classmates to test one part of that decision. Then ask students to show how the reply informed their revision or defense.</p></section>`;
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

let logoPromise;
export function loadGuideLogo() {
  return (logoPromise ??= fetch(new URL('../../../assets/brand/babbage-mark.svg', import.meta.url), { signal: AbortSignal.timeout(5000) })
    .then((response) => {
      if (!response.ok) throw Error('Logo unavailable');
      return response.text();
    })
    .then((svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
    .catch(() => null));
}

export function createGuide(design, { approved = true, logo = null, teacher = null, workspace = null } = {}) {
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
  const chosenTitle = workspace ? 'Your chosen assignment design' : 'Your revised discussion board';
  const milestoneTitle = 'Your assignment design summary';
  const inspiration = workspace && findIdea(workspace.ideaId);
  const sections = workspace ? [] : [
    { id: 'lemonade-example', title: 'The lemonade example', body: lemonadeExample() },
  ];
  if (workspace && (workspace.selectedDirection || workspace.creativeCore || workspace.instructorPlan || workspace.openQuestions)) {
    sections.push({ id: 'creative-intentions', title: 'Creative core and design intentions', body: `<section><h2>Creative core and design intentions</h2>${workspace.selectedDirection ? `<h3>Chosen possibility</h3><p>${e(workspace.selectedDirection.title)}</p><p>${e(workspace.selectedDirection.description)}</p>` : ''}<h3>The creative core I want to protect</h3><p>${e(workspace.creativeCore || 'Not recorded yet.')}</p><h3>My instructor interaction plan</h3><p>${e(workspace.instructorPlan || 'Not recorded yet.')}</p><h3>Questions to revisit</h3><p>${e(workspace.openQuestions || 'No questions recorded. This does not establish that every issue is resolved.')}</p><p>These are the educator’s design intentions. Peer interaction and simulated AI responses are distinct from instructor interaction. Approval does not certify compliance or establish learning outcomes.</p></section>` });
  }
  const alignmentSection = teacher && alignmentGuidance(teacher);
  if (alignmentSection) sections.push({ id: 'assignment-guidance', title: 'Optional assignment guidance', body: alignmentSection });
  if (inspiration) sections.push({ id: 'idea-inspiration', title: 'Idea Lab inspiration', body: `<section><h2>Idea Lab inspiration: ${e(inspiration.title)}</h2><p>Illustrative AI-assisted starter idea · not a faculty submission or tested intervention.</p><p>${e(inspiration.summary)}</p><p>The educator adapted this starting point; the final choices are their own.</p></section>` });
  if (workspace && teacher && design.revision.trim())
    sections.push({
      id: 'decision-milestone',
      title: milestoneTitle,
      body: `<section><h2>${e(milestoneTitle)}</h2><p>${approved ? 'Approved milestone' : 'Draft milestone · awaiting your approval'}</p><h3>${workspace ? 'Design purpose or challenge' : 'Instructional challenge'}</h3><p>${e(design.concern || 'Not recorded in this saved version.')}</p><h3>Learning goal</h3><p>${e(teacher.learningGoal || 'Not recorded in this saved version.')}</p><h3>Chosen improvement</h3><p>Your complete chosen directions appear in <a href="#revised-directions">${e(chosenTitle)}</a>.</p><h3>Why I chose it and how I will recognize progress</h3>${design.reason?.trim() ? renderDesignRationale(design.reason, { showSources: false, paragraphBreaks: true }) : '<p>Not recorded in this saved version.</p>'}<p>This is your design expectation. Look for evidence in student work when you try the activity; approval does not establish that learning improved.</p></section>`,
    });
  if (teacher && !design.revision.trim())
    sections.push({
      id: 'assignment-pending',
      title: workspace ? 'Your assignment · design in progress' : 'Discussion-board component · design in progress',
      body: workspace
        ? '<section class="assignment"><div class="assignment-banner"><h2>Your assignment design is still in progress</h2></div><div class="assignment-content"><p>Use Build to write directions, or collaborate with Babbage and choose a suggestion to edit. Return to Review &amp; Course Guide to explain and approve your design before downloading.</p></div></section>'
        : '<section class="assignment"><div class="assignment-banner"><h2>Your discussion-board component is still in progress</h2></div><div class="assignment-content"><p>Return to Design one focused discussion-board activity. Write a bounded forum exchange that supports the larger assignment, or generate a suggestion to adapt. This component is not an all-in-one replacement. Review and approve your directions before downloading the guide.</p></div></section>',
    });
  if (design.revision.trim() || design.reason.trim())
    sections.push({
      id: 'your-assignment',
      title: chosenTitle,
      body: `<section class="assignment"><div class="assignment-banner"><span>Your course · ${approved ? 'Approved version' : 'Draft'}</span><h2>${e(chosenTitle)}</h2></div><div class="assignment-content">${!workspace && teacher?.learningGoal ? `<p><strong>Learning goal:</strong> ${e(teacher.learningGoal)}</p>` : ''}${design.revision.trim() ? `<h3 id="revised-directions">Discussion-board directions</h3><div class="assignment-directions">${renderAssignmentDirections(design.revision, { approved })}</div>` : ''}${design.reason.trim() && !workspace ? `<aside class="rationale"><h3 id="change-reason">Why I made this change</h3><div class="design-rationale">${renderDesignRationale(design.reason, { showSources: false, paragraphBreaks: true })}</div></aside>` : ''}</div></section>`,
    });
  sections.push({
    id: 'design-sources',
    title: 'Sources',
    body: '<section class="guide-sources"><h2>Sources</h2><p>References behind the teaching moves. The lemonade example is a fictional illustration.</p><ul>'+designEvidence.map(source=>'<li><a href="'+e(source.url)+'" target="_blank" rel="noopener noreferrer">'+e(source.short)+'</a><span>'+e(source.citation)+'</span></li>').join('')+'</ul></section>',
  });
  sections.push({ id:'using-guide',title:'Using your downloaded guide',body:'<section class="guide-help-section">'+renderGuideHelp({standalone:true})+'</section>' });
  const order = ['lemonade-example','your-assignment','assignment-pending','decision-milestone','assignment-guidance','creative-intentions','idea-inspiration','design-sources','using-guide'];
  sections.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
  const contents = sections.map(section => '<li><a href="#'+section.id+'">'+e(section.title)+'</a></li>').join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PromptCraft assignment guide</title>
<style>${guideStyles}</style></head>


<body><main><header><div class="guide-brand">${logo ? `<img src="${e(logo)}" alt="PromptCraft Babbage emblem">` : ''}<div><div class="wordmark">Prompt<span>Craft</span></div><small>The Prompt Lab · Great Falls College MSU</small></div></div><div class="guide-heading"><h1>${workspace ? 'Course Guide · Your discussion forum' : 'Discussion guide'}</h1><p>${approved ? 'Your approved version' : 'Draft preview · Not yet approved'}</p><p>${workspace ? 'Your forum design, teaching decisions, and ideas to carry into your course.' : 'Your discussion directions, teaching decisions, and a worked example to revisit.'}</p></div></header><nav class="toc" aria-labelledby="contents-title"><h2 id="contents-title">In this guide</h2><ol>${contents}</ol></nav>${sections.map((section) => `<div class="guide-section" id="${section.id}">${section.body}</div>`).join('')}</main></body></html>`;
}

export function downloadGuide(design, options) {
  if (
    options?.teacher &&
    (!design.revision.trim() || design.sourceDirections !== options.teacher.directions)
  )
    throw Error('Review a revision for the current assignment before downloading.');
  const url = URL.createObjectURL(
    new Blob([createGuide(design, options)], { type: 'text/html;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'promptcraft-assignment-guide.html';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
