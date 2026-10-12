import { teacherSetupDefaults, teacherSetup } from '../features/setup/content.js';
import { conversationDefaults, assignmentContext } from '../features/design/babbage-client.js';
import {
  designDefaults,
  designSteps,
  exchangeOptions,
  removeRepeatedStarterExchanges,
  finalCheckDefaults,
  finalCheckContext,
  finalCheckReady,
  syncDraftAssignment,
} from '../features/design/content.js';

export const STORAGE_KEY = 'promptcraft_next_opening_v1';
export function initialState(scenario) {
  return {
    version: 1,
    scenarioId: scenario.id,
    contentVersion: scenario.contentVersion,
    phase: 'opening',
    sceneId: scenario.scenes[0].id,
    answers: {},
    completed: false,
    setupStep: 0,
    teacher: teacherSetupDefaults(),
    designStep: 0,
    design: designDefaults(),
    finalCheck: finalCheckDefaults(),
    babbage: conversationDefaults(),
    saveNotice: '',
  };
}
export function loadState(scenario, storage = window.localStorage) {
  const fresh = initialState(scenario);
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    if (
      !saved ||
      saved.version !== 1 ||
      saved.scenarioId !== scenario.id ||
      saved.contentVersion !== scenario.contentVersion
    )
      return fresh;
    if (!scenario.scenes.some((s) => s.id === saved.sceneId)) return fresh;
    const answers = {};
    for (const s of scenario.scenes)
      if (s.choice?.options.some((o) => o.id === saved.answers?.[s.id]))
        answers[s.id] = saved.answers[s.id];
    const allowedText = [
      'aiUse',
      'subject',
      'learnerLevel',
      'directions',
      'learningGoal',
      'workTime',
      'daysAvailable',
      'mustStay',
    ];
    const allowedBooleans = [
      'subjectUnsure',
      'learnerLevelUnsure',
      'learningGoalUnsure',
      'workTimeUnsure',
      'daysAvailableUnsure',
      'mustStayUnsure',
    ];
    const teacher = teacherSetupDefaults();
    for (const key of allowedText)
      if (typeof saved.teacher?.[key] === 'string') teacher[key] = saved.teacher[key];
    for (const key of allowedBooleans) teacher[key] = saved.teacher?.[key] === true;
    if (['online', 'in-person', 'both', 'not-sure'].includes(saved.teacher?.participation))
      teacher.participation = saved.teacher.participation;
    if (['individual', 'group', 'both', 'not-sure'].includes(saved.teacher?.workMode))
      teacher.workMode = saved.teacher.workMode;
    const design = designDefaults();
    for (const key of [
      'concern',
      'notes',
      'revision',
      'reason',
      'previousRevision',
      'previousReason',
    ])
      if (typeof saved.design?.[key] === 'string') design[key] = saved.design[key];
    const example = teacherSetup.steps[1].example.directions;
    const legacyExampleMismatch =
      teacher.directions !== example && design.revision.startsWith(example);
    design.sourceDirections =
      typeof saved.design?.sourceDirections === 'string' && saved.design.sourceDirections
        ? saved.design.sourceDirections
        : legacyExampleMismatch
          ? example
          : teacher.directions;
    syncDraftAssignment(teacher, design);
    design.revision = removeRepeatedStarterExchanges(design.revision);
    if (exchangeOptions.some(([id]) => id === saved.design?.exchange))
      design.exchange = saved.design.exchange;
    const finalCheck = finalCheckDefaults();
    if (saved.finalCheck?.context === finalCheckContext(teacher, design)) {
      finalCheck.context = saved.finalCheck.context;
      for (const key of ['instructions', 'learning', 'requirements'])
        finalCheck[key] = saved.finalCheck[key] === true;
      finalCheck.completed =
        saved.finalCheck.completed === true && finalCheckReady({ teacher, design, finalCheck });
      finalCheck.approved = saved.finalCheck.approved === true && finalCheck.completed;
    }
    const designStep = Math.max(
      0,
      Math.min(designSteps.length - 1, Number.isInteger(saved.designStep) ? saved.designStep : 0),
    );
    let phase = ['opening', 'setup', 'summary', 'design', 'closing'].includes(saved.phase)
      ? saved.phase
      : 'opening';
    if (phase === 'closing' && !finalCheck.approved) phase = 'design';
    const setupStep = Math.max(
      0,
      Math.min(2, Number.isInteger(saved.setupStep) ? saved.setupStep : 0),
    );
    const babbage = conversationDefaults();
    if (saved.babbage?.context === assignmentContext({ teacher, design })) {
      babbage.context = saved.babbage.context;
      babbage.mode = saved.babbage.mode === 'dev' ? 'dev' : 'live';
      babbage.history = Array.isArray(saved.babbage.history)
        ? saved.babbage.history
            .filter(
              (turn) =>
                ['user', 'assistant'].includes(turn?.role) &&
                typeof turn.content === 'string' &&
                turn.content.length <= 30000 &&
                typeof turn.display === 'string' &&
                turn.display.length <= 30000,
            )
            .slice(-20)
        : [];
      babbage.questions = Array.isArray(saved.babbage.questions)
        ? saved.babbage.questions
            .filter(
              (q) =>
                typeof q?.id === 'string' &&
                /^question-\d+$|^dev-[a-z]+$|^learning-goal$|^ai-use$/.test(q.id) &&
                typeof q.text === 'string' &&
                q.text.length <= 3000,
            )
            .slice(0, 4)
            .map((q) => ({
              id: q.id,
              text: q.text,
              field: ['learningGoal', 'aiUse'].includes(q.field) ? q.field : '',
            }))
        : [];
      for (const q of babbage.questions)
        if (
          typeof saved.babbage.answers?.[q.id] === 'string' &&
          saved.babbage.answers[q.id].length <= 24000
        )
          babbage.answers[q.id] = saved.babbage.answers[q.id];
      babbage.ready =
        saved.babbage.ready === true &&
        babbage.questions.length === 0 &&
        teacher.learningGoal.trim() !== '' &&
        !teacher.learningGoalUnsure;
    }
    return {
      ...fresh,
      phase,
      sceneId: saved.sceneId,
      answers,
      completed: saved.completed === true,
      setupStep,
      teacher,
      design,
      designStep,
      finalCheck,
      babbage,
    };
  } catch {
    return {
      ...fresh,
      saveNotice: 'Progress could not be restored. You can still try the opening.',
    };
  }
}
export function saveState(state, storage = window.localStorage) {
  try {
    const { saveNotice, ...saved } = state;
    storage.setItem(STORAGE_KEY, JSON.stringify(saved));
    state.saveNotice = '';
  } catch {
    state.saveNotice = 'Progress cannot be saved in this browser. You can still continue.';
  }
}
export function clearState(storage = window.localStorage) {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
export function sceneReady(scene, state) {
  return (
    !scene.choice || scene.choice.options.some((o) => o.id === state.answers[scene.id] && o.correct)
  );
}
