import { escapeHTML as e } from './html.js';

const fieldValue = (values, id) => values[id] ?? '';
const unsureId = (id) => `${id}Unsure`;

export function renderField(field, values) {
  const value = fieldValue(values, field.id),
    helpId = `${field.id}-help`;
  if (field.type === 'radio')
    return `<fieldset class="setup-field"><legend>${e(field.label)}</legend><p id="${helpId}" class="field-help">${e(field.help)}</p><div class="radio-cards" aria-describedby="${helpId}">${field.options.map(([id, label]) => `<label><input type="radio" name="${e(field.id)}" value="${e(id)}"${value === id ? ' checked' : ''}><span>${e(label)}</span></label>`).join('')}</div></fieldset>`;
  if (field.type === 'select')
    return `<div class="setup-field"><label for="${e(field.id)}">${e(field.label)}</label><p id="${helpId}" class="field-help">${e(field.help)}</p><select id="${e(field.id)}" name="${e(field.id)}" aria-describedby="${helpId}">${field.options.map(([id, label]) => `<option value="${e(id)}"${value === id ? ' selected' : ''}>${e(label)}</option>`).join('')}</select></div>`;
  const unsure = field.unsure
    ? `<label class="unsure"><input type="checkbox" name="${e(unsureId(field.id))}"${values[unsureId(field.id)] ? ' checked' : ''}> <span>Not sure yet</span></label>`
    : '';
  const control =
    field.type === 'textarea'
      ? `<textarea id="${e(field.id)}" name="${e(field.id)}" rows="${field.rows || 4}" aria-describedby="${helpId}" placeholder="${e(field.placeholder || '')}">${e(value)}</textarea>`
      : `<input id="${e(field.id)}" name="${e(field.id)}" type="text" value="${e(value)}" aria-describedby="${helpId}" placeholder="${e(field.placeholder || '')}">`;
  return `<div class="setup-field"><label for="${e(field.id)}">${e(field.label)}</label><p id="${helpId}" class="field-help">${e(field.help)}</p>${control}${unsure}</div>`;
}
