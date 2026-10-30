import { readWorkspace, WORKSPACE_KEY } from './storage.js';

export const PROJECT_FILE_FORMAT = 'promptcraft-workspace-project';
export const MAX_PROJECT_BYTES = 2 * 1024 * 1024;

export function createProjectFile(state) {
  const { workspace, creative, saveNotice, ...saved } = state;
  const payload = { version: 1, workspace, creative, state: saved };
  return JSON.stringify({ format: PROJECT_FILE_FORMAT, fileVersion: 1, project: payload }, null, 2);
}

export function parseProjectFile(text) {
  if (typeof text !== 'string' || text.length > MAX_PROJECT_BYTES) throw new Error('Project file is too large.');
  let file;
  try { file = JSON.parse(text); } catch { throw new Error('This is not a valid PromptCraft project file.'); }
  if (file?.format !== PROJECT_FILE_FORMAT || file.fileVersion !== 1 || !file.project || Array.isArray(file.project)) {
    throw new Error('This file is not a supported PromptCraft project.');
  }
  const raw = JSON.stringify(file.project);
  const parsed = readWorkspace({ getItem(key) { return key === WORKSPACE_KEY ? raw : null; } });
  if (!parsed.exists || parsed.error) throw new Error('This project is damaged or incompatible with this version of PromptCraft.');
  if(file.project.state?.experience==='scenario') parsed.state.experience='scenario';
  return parsed.state;
}

export function downloadProjectFile(state) {
  const blob = new Blob([createProjectFile(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'promptcraft-project.json';
  document.body.append(link);
  try { link.click(); } finally { link.remove(); URL.revokeObjectURL(url); }
}
