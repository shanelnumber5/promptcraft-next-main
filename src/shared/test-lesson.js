import { teacherSetupDefaults } from '../features/setup/content.js';
import { designDefaults, finalCheckDefaults } from '../features/design/content.js';
import { conversationDefaults, assignmentContext } from '../features/design/babbage-client.js';

const sampleWords = new Set(['test', 'good', 'bad', 'joke', 'dev']);
export const isTestLessonKeyword = control => ['subject', 'directions'].includes(control.name) && sampleWords.has(control.value.trim().toLowerCase());

// Explicit sample data, never a simulated AI response or an approved design.
export function fillTestLesson(state, keyword = 'test') {
  const sample = keyword.trim().toLowerCase();
  if (!sampleWords.has(sample)) throw Error('Unknown sample lesson.');
  const previousRevision = state.design.revision;
  const previousReason = state.design.reason;
  state.teacher = { ...teacherSetupDefaults(), subject:'Office Management & Supervision',
    learnerLevel:'Returning adult college students', participation:'online', workMode:'individual',
    aiUse:'Students may brainstorm with AI, but must verify claims against the supplied case and explain their own decision.',
    directions:'Read the supplied workplace staffing case. Recommend one of the two staffing schedules in 250–350 words. Explain how it balances coverage and fairness. Post by Thursday and reply to two classmates by Sunday.',
    learningGoal:'Compare staffing options, justify a practical decision with case evidence, and reconsider a tradeoff after a peer question.',
    workTime:'60–90 minutes', daysAvailable:'One week', mustStay:'Use the supplied fictional staffing case, keep the 250–350 word first post, and retain the Thursday and Sunday deadlines.' };
  state.design = { ...designDefaults(), previousRevision, previousReason,
    sourceDirections:state.teacher.directions, concern:'Replies can become agreement without examining a tradeoff.', exchange:'evidence',
    notes:'I expect peer questions to reveal assumptions about fairness and coverage.',
    revision:'By Thursday, compare the two staffing schedules in the supplied fictional workplace case. Recommend one schedule in 250–350 words, citing two case details and explaining a tradeoff between coverage and fairness.\n\nBy Saturday, reply to one classmate whose choice or reasoning differs from yours. Compare their evidence with yours and ask a specific question about the tradeoff.\n\nBy Sunday, return to your own post. Explain how the peer question affects your recommendation. Revise it, or defend it using case evidence. If no peer replies, test your recommendation against the other schedule yourself.',
    reason:'The reply tests a real tradeoff instead of counting agreement. The follow-up asks students to use that question in their reasoning. I would look for a specific change or a supported defense, rather than assume participation proves learning.' };
  if (sample === 'bad') {
    state.design.concern='Students make brief replies without examining one another’s decisions.';
    state.design.notes='I want frequent posts to count as engagement.';
    state.design.revision='Write 1,200 words defining good management without using the supplied staffing case. Post tonight. Reply to ten classmates tonight with at least 200 words each. Say whether you agree and repeat the main point of their post. Do not ask questions or disagree. You do not need to return after posting your replies. Marks depend on the number and length of posts.';
    state.design.reason='I increased the amount of posting to encourage engagement. I have not explained how the replies should change or test a staffing decision.';
  } else if (sample === 'joke') {
    state.teacher.subject='Office Management & Supervision · fictional workplace comedy';
    state.teacher.directions='The office printer has applied for a promotion to Assistant Manager of Paper Jams. Write a recommendation about whether it should be promoted, and reply to two classmates.';
    state.teacher.learningGoal='Justify a resource-allocation decision, distinguish amusing claims from useful evidence, and consider a competing recommendation.';
    state.teacher.mustStay='Use only the fictional printer case, keep the first post at 250–350 words, and keep Thursday and Sunday deadlines.';
    state.design.concern='A funny premise could distract from the evidence and the actual management decision.';
    state.design.notes='I want to see whether students use the joke as a starting point for reasoning rather than just trading punchlines.';
    state.design.revision='The office printer has nominated itself for Assistant Manager of Paper Jams. Its campaign slogan is "More toner, fewer meetings." Fictional case facts: it jams six times a day, handles 40% of office printing, and a replacement costs $900. Staff lose about 30 minutes daily clearing jams.\n\nBy Thursday, write 250–350 words recommending repair, replacement, or a change in printing practices. Use two case facts, explain a tradeoff, and identify one piece of information still needed. A funny opening is welcome; evidence must support the decision.\n\nBy Saturday, compare a classmate’s recommendation with yours and ask a question about a tradeoff. By Sunday, revise or defend your recommendation in response. If nobody replies, test your choice against a different option yourself.';
    state.design.reason='The absurd promotion is an invitation to engage. The case facts, comparison and follow-up keep the management decision at the center. I would look for evidence that students reconsider a tradeoff, not count jokes as learning.';
    state.design.sourceDirections=state.teacher.directions;
  }
  if (state.workspace) Object.assign(state.workspace, {sourceKind:'existing',ideaId:'',studentNeeds:'Students balance coursework with work and family. Use the fictional case only.'});
  if (sample === 'dev' && state.workspace) Object.assign(state.workspace, {
    creativeCore:'Students test a staffing choice against a peer’s case-based question, then revise or defend it with evidence.',
    instructorPlan:'Before the discussion, clarify the case and model one focused question. During the exchange, ask students to explain overlooked tradeoffs. Afterward, give feedback on how they used peer input.',
    openQuestions:'Can students complete the exchange in 60–90 minutes? What support is needed if a peer reply arrives late?'
  });
  state.completed=false;
  state.phase='design'; state.designStep=2; state.designPanel='babbage'; state.designReturnPanel=''; state.designReadPage=0;
  if (sample === 'dev' && state.workspace) {
    // Seed inputs for a real conversation, never present canned text as AI output.
    state.design.revision=''; state.design.reason=''; state.designPanel='babbage';
    delete state.workspace.selectedDirection;
    if(state.creative) Object.assign(state.creative,{directions:[],basis:'',feedback:''});
  }
  state.finalCheck=finalCheckDefaults();
  state.babbage={...conversationDefaults(),context:assignmentContext(state)};
}
