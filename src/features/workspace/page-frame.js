import { escapeHTML as e } from '../../shared/html.js';

// All studio tasks share a heading, a scrollable body and one bottom action bar.
// Route-specific content and controls stay with their feature renderers.
export function renderStudioPage({
  title,
  titleId = 'workspace-view-title',
  content,
  actions = '',
  back = '',
  next = '',
  step = '',
  className = '',
  headingClass = '',
  titleClass = '',
  headingExtra = '',
  bodyClass = 'workspace-view-body',
  bodyAttributes = '',
  actionClass = '',
  actionLabel = 'Activity actions',
  saveStatus = true,
}) {
  return `<section class="workspace-view workspace-page ${e(className)}" aria-labelledby="${e(titleId)}"><header class="design-page-heading ${e(headingClass)}"><div class="studio-task-heading">${step ? `<p class="studio-step">${e(step)}</p>` : ''}<h2 class="${e(titleClass)}" id="${e(titleId)}" tabindex="-1">${e(title)}</h2></div>${headingExtra}</header><div class="design-page-fields ${e(bodyClass)}" ${bodyAttributes}>${content}</div><footer class="workspace-action-bar ${e(actionClass)}" aria-label="${e(actionLabel)}"><div class="studio-secondary-actions">${actions}${saveStatus ? '<span class="workspace-save-status">Saved in this browser.</span>' : ''}</div><div class="studio-navigation"><div class="studio-back">${back || '<button type="button" disabled>Back</button>'}</div><div class="studio-next">${next}</div></div></footer></section>`;
}
