import { isUncertainAnswer } from '../design/input-quality.js';
import { findIdea } from '../idea-lab/ideas.js';
import { teacherSetup } from '../setup/content.js';
import { renderDirectionsEditor } from '../../shared/directions-editor.js';
import { renderField } from '../../shared/form-fields.js';
import { escapeHTML as e } from '../../shared/html.js';
import { renderSectionFrame } from './section-frame.js';
import { renderCreativeCore } from './creative-view.js';

const teacherField = (state, id) => {
  const field = teacherSetup.steps.flatMap((step) => step.fields).find((field) => field.id === id);
  const compact = {
    subject: { label: 'Course or subject', help: '', unsure: false },
    learningGoal: { label: 'What should students learn?', help: '', rows: 2 },
    mustStay: { label: 'What must stay the same?', help: '', rows: 2 },
    workTime: { label: 'Work time per student', help: '' },
    daysAvailable: { label: 'Days to finish', help: '' },
    learnerLevel: { label: 'Who are your learners?', help: '' },
  };
  const suggestion =
    id === 'learningGoal' &&
    state.workspace.selectedDirection?.learning &&
    (!state.teacher.learningGoal.trim() || isUncertainAnswer(state.teacher.learningGoal))
      ? {
          help:
            'Possible starting point: ' +
            state.workspace.selectedDirection.learning +
            ' Change this to fit your course.',
        }
      : {};
  return renderField({ ...field, unsure: false, ...compact[id], ...suggestion }, state.teacher);
};
const metaField = (id, key, label, value, rows = 2) =>
  `<div class="setup-field"><label for="${id}">${label}</label><textarea id="${id}" data-workspace-meta="${key}" rows="${rows}">${e(value || '')}</textarea></div>`;
// Add a Build section here: its title, renderer, and position drive all section menus.
export const buildSections = [
  {
    id: 'start',
    title: 'Starting point',
    render: (state) =>
      `<fieldset><legend>What are you bringing?</legend>${[
        ['existing', 'Existing directions'],
        ['idea', 'A rough idea'],
      ]
        .map(
          ([value, label]) =>
            `<label><input type="radio" name="sourceKind" data-workspace-meta="sourceKind" value="${value}"${state.workspace.sourceKind === value ? ' checked' : ''}> ${label}</label>`,
        )
        .join(
          '',
        )}</fieldset><div data-setup-form><div class="setup-field"><label for="directions">${state.workspace.sourceKind === 'idea' ? 'Your starting idea' : 'Current directions'}</label><textarea id="directions" name="directions" rows="3">${e(state.teacher.directions)}</textarea></div></div>`,
  },
  {
    id: 'subject',
    title: 'Course & learners',
    render: (state) =>
      `<div class="workspace-combined-fields workspace-course-columns"><div class="workspace-course-short" data-setup-form>${teacherField(state, 'subject')}${teacherField(state, 'learnerLevel')}${teacherField(state, 'workTime')}${teacherField(state, 'daysAvailable')}</div><div class="workspace-course-long"><div data-setup-form>${teacherField(state, 'learningGoal')}</div><div>${metaField('student-needs', 'studentNeeds', 'Learner access needs (optional; no identifying details)', state.workspace.studentNeeds)}</div></div></div>`,
  },
  {
    id: 'ai-use',
    title: 'Activity requirements',
    render: (state) =>
      `<div class="workspace-combined-fields workspace-ai-columns"><p class="workspace-field-help workspace-field-wide">Choose what students may use AI for. Explain any required disclosure, verification, or limits in the instructions.</p><div data-setup-form>${renderField(
        {
          id: 'aiUse',
          type: 'radio',
          label: 'Student AI use',
          help: '',
          options: [
            ['No student AI use', 'No AI: students complete the activity themselves'],
            [
              'Brainstorming or feedback only; students write their own work.',
              'Ideas or feedback: students write their own work',
            ],
            [
              'AI drafting allowed; students verify claims and revise the output.',
              'Drafting allowed: students check and revise AI output',
            ],
            ['Not sure yet', 'Not sure yet: help me decide appropriate limits'],
          ],
        },
        state.teacher,
      )}</div><div data-setup-form>${renderField({ id: 'aiUseDetails', type: 'textarea', rows: 3, label: 'AI-use instructions and limits (optional)', help: '', placeholder: 'For example: name the tool, describe how it helped, verify claims, and identify the student’s own contribution.' }, { aiUseDetails: state.teacher.aiUse })}</div><div class="workspace-field-wide" data-setup-form>${teacherField(state, 'mustStay')}</div></div>`,
  },
  {
    id: 'intentions',
    title: 'Creative direction',
    render: (state) =>
      `${state.experience === 'scenario' ? '<p class="workspace-field-help">Use the board to support the activity: students might share work, compare approaches, collaborate, or give focused feedback.</p>' : ''}${state.workspace.ideaId ? '<p class="workspace-field-help"><strong>Selected inspiration: ' + e(findIdea(state.workspace.ideaId)?.title || 'Idea Lab') + '</strong>. Describe the creative core you want to keep, then develop the draft with Babbage.</p>' : ''}<div class="workspace-stacked-fields">${metaField('student-contribution', 'studentContribution', 'What will students share, create, decide, or investigate?', state.workspace.studentContribution || '', 3)}${metaField('peer-interaction', 'peerInteraction', 'How will students interact with one another’s work?', state.workspace.peerInteraction || '', 3)}${renderCreativeCore(state)}<div data-design-form>${renderField({ id: 'concern', label: 'What would you like to improve? (optional)', help: '', type: 'textarea', rows: 3 }, state.design)}</div></div>`,
  },
  {
    id: 'presence',
    title: 'Instructor interaction',
    compile: true,
    render: (state) =>
      `<p class="workspace-field-help">Where could your feedback, questions, or check-ins help students learn? Consider an approach that is realistic for your workload.</p><div class="workspace-stacked-fields"><div>${metaField('instructor-plan', 'instructorPlan', 'How will you interact with students?', state.workspace.instructorPlan)}</div><div>${metaField('open-questions', 'openQuestions', 'Questions to revisit (optional)', state.workspace.openQuestions)}</div></div>`,
  },
  {
    id: 'draft',
    title: 'Your activity',
    compile: true,
    render: (state) =>
      state.design.revision.trim()
        ? `<div class="workspace-writing" data-design-form>${renderDirectionsEditor(state.design.revision, { label: 'Activity directions' })}</div>`
        : '<div class="workspace-compile-summary"><h3>Put your activity together</h3><p>Babbage will combine your starting idea, course and learner details, requirements, creative direction, and instructor interaction plan into complete directions.</p><p>Select Build my activity. You can edit the finished draft here before reviewing it.</p></div>',
  },
];
export const buildPages = buildSections.map(({ id, title }) => [id, title]);

/** Render one section inside the shared Build frame and action bar. */
export function renderBuildPage(state, ai, pageId = 'start') {
  const section = buildSections.find(({ id }) => id === pageId) || buildSections[0];
  const { id: designPage, title } = section;
  let fields = section.render(state);
  fields = fields
    .replace(/<label for=/g, '<label class="workspace-build-label" for=')
    .replace(/<legend>/g, '<legend class="workspace-build-label">');
  const nextPage =
    buildPages[
      Math.min(buildPages.findIndex(([id]) => id === designPage) + 1, buildPages.length - 1)
    ][0];
  const hasDraft = designPage === 'draft' && state.design.revision.trim();
  const primaryAction = hasDraft
    ? '<button type="button" class="primary" data-workspace-panel="reason">Review my activity</button>'
    : section.compile
      ? `<button type="button" class="primary" data-action="compile-activity"${ai.pending ? ' disabled' : ''}>Build my activity</button>`
      : `<button type="button" class="primary" data-design-page="${nextPage}">Next section</button>`;
  const rebuildAction = hasDraft
    ? `<button type="button" data-action="compile-activity"${ai.pending ? ' disabled' : ''}>Rebuild with Babbage</button>`
    : '';
  const body = `<section class="workspace-view workspace-page"><header class="design-page-heading"><h2 class="workspace-build-title" id="design-page-title" tabindex="-1">${title}</h2></header><div class="design-page-fields build-page-fields" data-build-page="${designPage}">${fields}</div><nav class="workspace-action-bar workspace-view-actions${designPage === 'ai-use' ? ' workspace-view-actions--gold' : ''}" aria-label="Design actions">${primaryAction}<button type="button" id="workspace-show-preview" data-workspace-view="preview">Preview activity</button><span class="workspace-save-status">Saved in this browser.</span>${rebuildAction}</nav></section>`;
  return renderSectionFrame(buildPages, designPage, 'data-design-page', body, 'Build sections');
}
