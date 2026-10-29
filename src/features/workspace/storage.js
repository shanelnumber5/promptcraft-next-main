import { initialState, loadState, STORAGE_KEY } from '../../app/storage.js';
import { discussionOpening } from '../opening/content.js';
import { findIdea, catalogVersion } from '../idea-lab/ideas.js';
import { creativeDefaults, restoreCreative, normalizeDirection } from './creative.js';

export const WORKSPACE_KEY = 'promptcraft_assignment_workspace_v1';
export const ENTRY_KEY = 'promptcraft_entry_v1';
export const workspaceDefaults = () => ({ sourceKind: 'existing', ideaId: '', studentNeeds: '', catalogVersion });
export function freshWorkspace() {
  const state = initialState(discussionOpening);
  state.phase = 'design';
  state.designStep = 2;
  state.designPanel = 'babbage';
  state.workspace = workspaceDefaults();
  state.creative = creativeDefaults();
  return state;
}
export function readWorkspace(storage = window.localStorage) {
  try {
    const raw = storage.getItem(WORKSPACE_KEY);
    if (!raw) return { state: freshWorkspace(), exists: false, error: '' };
    const record = JSON.parse(raw);
    if (record?.version !== 1 || !record.state || record.state.scenarioId !== discussionOpening.id ||
      record.state.version !== 1 || record.state.contentVersion !== discussionOpening.contentVersion ||
      !discussionOpening.scenes.some(scene => scene.id === record.state.sceneId)) throw Error('Invalid workspace');
    const metadata = workspaceDefaults();
    metadata.sourceKind = record.workspace?.sourceKind === 'idea' ? 'idea' : 'existing';
    metadata.ideaId = findIdea(record.workspace?.ideaId)?.id || '';
    metadata.studentNeeds = typeof record.workspace?.studentNeeds === 'string' ? record.workspace.studentNeeds.slice(0, 6000) : '';
    if (record.workspace?.selectedDirection) metadata.selectedDirection = normalizeDirection(record.workspace.selectedDirection);
    for (const key of ['creativeCore', 'instructorPlan', 'openQuestions']) {
      if (typeof record.workspace?.[key] === 'string') metadata[key] = record.workspace[key].slice(0, 6000);
    }
    const state = loadState(discussionOpening, { getItem: () => JSON.stringify(record.state) }, metadata);
    if (state.saveNotice) throw Error('Workspace restore failed');
    state.workspace = metadata;
    state.creative = restoreCreative(record.creative);
    state.phase = 'design';
    state.designStep = 2;
    state.designPanel = ['revision', 'babbage', 'reason'].includes(state.designPanel) ? state.designPanel : 'revision';
    return { state, exists: true, error: '' };
  } catch {
    return { state: freshWorkspace(), exists: false, error: 'Your saved workspace could not be read. It has not been overwritten. Reset this workspace to start again.' };
  }
}
export function saveWorkspace(state, storage = window.localStorage) {
  try {
    const { workspace, creative, saveNotice, ...saved } = state;
    storage.setItem(WORKSPACE_KEY, JSON.stringify({ version: 1, workspace, creative, state: saved }));
    state.saveNotice = '';
    return true;
  } catch {
    state.saveNotice = 'This browser could not save your workspace. Keep this page open and download your project from Options to preserve your editable work.';
    return false;
  }
}
export function resetWorkspace(storage = window.localStorage) {
  try { storage.removeItem(WORKSPACE_KEY); return true; } catch { return false; }
}
export function rememberPath(path, storage = window.localStorage) {
  try { storage.setItem(ENTRY_KEY, JSON.stringify({ lastPath: path })); } catch { /* Progress has its own visible save notice. */ }
}
export function resumePath(storage = window.localStorage) {
  let guided = false, workspace = false, last = '';
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    guided = raw?.version === 1 && raw.scenarioId === discussionOpening.id && raw.contentVersion === discussionOpening.contentVersion && discussionOpening.scenes.some(scene => scene.id === raw.sceneId);
  } catch { /* Invalid preferences must not erase either save. */ }
  workspace = readWorkspace(storage).exists;
  try { last = JSON.parse(storage.getItem(ENTRY_KEY) || 'null')?.lastPath; } catch { /* Resume a valid path without this preference. */ }
  if (last === 'workspace' && workspace) return 'workspace';
  if (last === 'play' && guided) return 'play';
  return guided ? 'play' : workspace ? 'workspace' : '';
}
