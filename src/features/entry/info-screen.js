import { characterArt } from '../../shared/character-art.js';
export const infoPages = [
  ['how-to-play', 'How to Play'],
  ['about', 'About PromptCraft'],
  ['babbage', 'Meet the Characters'],
  ['privacy', 'Privacy & Progress'],
];

export function renderInfoNavigation(view) {
  return `<nav class="info-nav" aria-label="About and help"><a href="?view=home"${view === 'home' ? ' aria-current="page"' : ''}>Home</a>${infoPages.map(([id, label]) => `<a href="?view=${id}"${view === id ? ' aria-current="page"' : ''}>${label}</a>`).join('')}<select class="info-nav-select" aria-label="About and help page"><option value="home">Home</option>${view === 'guide' ? '<option value="guide" selected>Course Guide</option>' : ''}${infoPages.map(([id, label]) => `<option value="${id}"${view === id ? ' selected' : ''}>${label}</option>`).join('')}</select></nav>`;
}

export function renderInfoPage(view, index = 0) {
  const page = pages[view];
  if (!page) return '';
  const current = Math.max(0, Math.min(index, page.sections.length - 1));
  const section = page.sections[current];
  const groupStart = Math.floor(current / 3) * 3;
  const shortTitle = title => ({ "Good company, different perspectives": "Maya’s view", "Institutional context": "College context", "Independent project": "Independence", "Academic context": "Graduate work", "Browsing and testing": "Browsing", "Resume and reset": "Resume &amp; reset", "About this prototype": "This prototype", "Meet the developer": "The developer", "External service privacy": "Service privacy", "Choose where to begin": "Where to begin", "Keep student information out": "Student privacy", "When you ask for AI help": "AI requests", "You make the decisions": "Your decisions", "Professor Pixel": "Professor Pixel", "A student’s first read": "Maya’s first read" }[title] || title);
  const visual = topicVisuals[section.visual];
  const portrait = `<img src="${visual.src}" alt="${visual.alt}" class="info-portrait">`;
  const artwork = ['character', 'shanel'].includes(visual.kind)
    ? `<div class="portrait-crop">${portrait}</div>` : visual.kind === 'engine' ? `<div class="engine-crop">${portrait}</div>` : portrait;
  return `<section class="entry-shell info-shell menu-shell" aria-labelledby="entry-title">
    <header class="info-heading"><h1 id="entry-title" tabindex="-1">${page.label}</h1></header>
    <div class="info-book menu-board">
      <aside class="info-sidebar"><nav aria-label="${page.label} topics" data-topic-count="${page.sections.length}" data-current-topic="${current}">${page.sections.slice(groupStart, groupStart + 3).map((item, offset) => `<button type="button" data-info-section="${groupStart + offset}"${groupStart + offset === current ? ' aria-current="step"' : ''}>${shortTitle(item.title)}</button>`).join('')}</nav></aside>
      <div class="info-reading"><article class="info-page" aria-labelledby="info-topic-title"><h2 id="info-topic-title" tabindex="-1">${section.title}</h2><div class="info-copy">${section.body}</div></article><nav class="info-pager" aria-label="Topic navigation"><button type="button" data-info-section="${current - 1}"${current === 0 ? ' disabled' : ''}>Previous</button><button type="button" class="primary" data-info-section="${current + 1}"${current === page.sections.length - 1 ? ' disabled' : ''}>Next</button></nav></div>
      <figure class="info-art info-art--${visual.kind}">${artwork}${visual.caption ? `<figcaption>${visual.caption}</figcaption>` : ''}</figure>
    </div></section>`;
}

export function mountInfoPage(app, view) {
  app.innerHTML = renderInfoPage(view);
  const show = index => {
    app.innerHTML = renderInfoPage(view, index);
    app.querySelector('#info-topic-title').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  app.addEventListener('click', event => {
    const button = event.target.closest('[data-info-section]');
    if (button && !button.disabled) show(Number(button.dataset.infoSection));
  });

}

const topicVisuals = {
  engine: { src: 'assets/people/babbage-engine-repaired.png', alt: 'Babbage, represented by a mechanical calculating engine', caption: 'Babbage', kind: 'engine' },
  pixel: { src: characterArt.pixel.pleasant, alt: 'Professor Pixel', caption: 'Professor Pixel', kind: 'character' },
  pixelThinking: { src: characterArt.pixel.thoughtful, alt: 'Professor Pixel considering a teaching choice', caption: 'Professor Pixel', kind: 'character' },
  pixelListening: { src: characterArt.pixel.neutral, alt: 'Professor Pixel listening', caption: 'Professor Pixel', kind: 'character' },
  maya: { src: characterArt.maya.neutral, alt: 'Maya, the simulated student', caption: 'Maya', kind: 'character' },
  mayaSpeaking: { src: characterArt.maya.explaining, alt: 'Maya sharing her perspective', caption: 'Maya', kind: 'character' },
  shanel: { src: 'assets/people/shanel-profile.png', alt: 'Shanel Lara Locke', caption: 'Shanel Lara Locke', kind: 'shanel' },
  classroom: { src: 'assets/backgrounds/classroom.png', alt: 'PromptCraft’s classroom setting', caption: '', kind: 'classroom' },
  college: { src: 'assets/brand/gfc-river-otters.png', alt: 'Great Falls College Montana State University, River Otters', caption: '', kind: 'college' },
};

const pages = {
  "how-to-play": {
    "label": "How to Play",
    "sections": [
      {
        "title": "Encounter",
        "body": "<p>Start with a teaching challenge in Professor Pixel’s guided scenario. Read the dialogue, examine the discussion activity, and choose a response on the board.</p><p>Look for the problem students are experiencing before choosing a solution. The example gives you a shared situation to explore before you work on your own course.</p>",
        "visual": "pixel"
      },
      {
        "title": "Explore",
        "body": "<p>Identify what students should learn and what they actually have to do. Consider their preparation, available time, access to materials, and the purpose of interacting with classmates.</p><p>For example, replying to two posts describes a task. Explaining how a peer’s evidence changes a decision gives that exchange a learning purpose.</p>",
        "visual": "pixelThinking"
      },
      {
        "title": "Evaluate",
        "body": "<p>Read Babbage’s suggestion against your learning goal, course context, and original directions. Check assumptions, accuracy, workload, and whether students have a meaningful reason to interact.</p><p>Ask Maya for a simulated student’s first read. Use her questions to spot unclear expectations, then decide which concerns matter for your students.</p>",
        "visual": "engine"
      },
      {
        "title": "Decide",
        "body": "<p>Accept, adapt, question, or reject a suggestion. A polished AI response can still miss the purpose of your activity or ask more of students than you intend.</p><p>Keep the parts that support learning and explain your reasoning. You can ask Babbage for clarification before making a choice; agreement with the AI is not the goal.</p>",
        "visual": "pixelListening"
      },
      {
        "title": "Revise",
        "body": "<p>Turn your chosen idea into directions students can use. State the task, explain what a useful contribution looks like, and show how students should use one another’s work.</p><p>For example, ask students to compare approaches and revise a recommendation after a peer responds. Check that the revised activity still fits your course and available time.</p>",
        "visual": "engine"
      },
      {
        "title": "Reflect",
        "body": "<p>Explain why you chose the change and what you hope it will help students do. Identify evidence you could look for, such as stronger reasoning or purposeful use of peer feedback.</p><p>Review the final checks and save your design to the Course Guide. Download the guide to keep a copy of your directions and reasoning.</p>",
        "visual": "pixelThinking"
      },
      {
        "title": "Choose where to begin",
        "body": "<p>Play the Scenario introduces the challenge with Pixel. Create an Assignment opens a workspace for your own activity. Babbage’s Idea Lab offers illustrative starters you can adapt.</p><p>This prototype focuses on discussion forums. The scenario and workspace keep separate current designs. Course Guide lets you review either saved path; Continue Where You Left Off returns to your recent path.</p>",
        "visual": "pixel"
      }
    ]
  },
  "about": {
    "label": "About PromptCraft",
    "sections": [
      {
        "title": "The project",
        "body": "<p>PromptCraft is a faculty development experience for practicing teaching decisions with AI. Work through a realistic challenge, explore alternatives, revise an activity, and explain your choices.</p><p>Pixel guides the experience, Babbage offers possibilities, and Maya brings a simulated student perspective. The emphasis is on learning goals, course context, critical evaluation, and your professional judgment.</p>",
        "visual": "classroom"
      },
      {
        "title": "Meet the developer",
        "body": "<p><strong>Shanel Lara Locke, MFA</strong> is an instructional designer in the Teaching &amp; Learning Center at Great Falls College Montana State University.</p><p>Her work supports faculty development, online course design, digital accessibility, course review, instructional technology, and thoughtful AI use. PromptCraft brings those interests into scenario-based practice with room to experiment and reflect.</p>",
        "visual": "shanel"
      },
      {
        "title": "Academic context",
        "body": "<p>PromptCraft is connected to Shanel’s graduate work in Montana State University’s Education Specialist program. The proposed study examines how postsecondary educators develop and demonstrate instructional-design reasoning.</p><p>Choices, explanations, revisions, and reflections are central to that research direction. The prototype provides a setting for this work; it does not establish that the experience improves learning.</p>",
        "visual": "shanel"
      },
      {
        "title": "Prototype status",
        "body": "<p>PromptCraft is being developed and tested. The current experience focuses on discussion forums, with a guided scenario, an assignment workspace, and illustrative Idea Lab starters.</p><p>Content and features may change as testing identifies problems. Formal participant research has not begun, and effectiveness has not been established. Playing the prototype does not enroll you in a study.</p>",
        "visual": "classroom"
      },
      {
        "title": "Institutional context",
        "body": "<p>PromptCraft grows from instructional design and faculty professional development at Great Falls College MSU. Its teaching situations invite educators to consider learning goals, student needs, and practical course constraints.</p><p>Adapt ideas to your own institution and discipline. The college identity provides context for the project; the activities do not establish institutional policy.</p>",
        "visual": "college"
      },
      {
        "title": "Independent project",
        "body": "<p>PromptCraft is an educational and scholarly project developed by Shanel. Its examples and character perspectives are designed to support exploration and discussion.</p><p>The content, interpretations, and design choices do not necessarily represent official policy or positions of Great Falls College MSU, Montana State University, or the Montana University System. Consult your institution’s guidance when applying ideas in practice.</p>",
        "visual": "shanel"
      }
    ]
  },
  "babbage": {
    "label": "Meet the Characters",
    "sections": [
      {
        "title": "Babbage",
        "body": "<p>Babbage is PromptCraft’s computer-based AI collaborator, represented by the mechanical engine. He helps you explore possibilities, clarify your goals, and consider the tradeoffs in a discussion activity.</p><p>Bring your course context and ask questions. His suggestions can be useful, incomplete, or mistaken. You decide what to accept, adapt, question, or reject before it becomes part of your design.</p>",
        "visual": "engine"
      },
      {
        "title": "Professor Pixel",
        "body": "<p>Professor Pixel is the narrator, facilitator, and learning guide. She introduces the teaching challenge, explains useful concepts, and helps connect each activity to its purpose.</p><p>Her role is to support your reasoning and keep the experience moving. She is distinct from Babbage, the AI collaborator, and Maya, the simulated student whose experience you consider.</p>",
        "visual": "pixel"
      },
      {
        "title": "Maya",
        "body": "<p>Maya is a returning adult student studying Office Management &amp; Supervision at Great Falls College. She balances college, work, and family responsibilities and hopes to become a supportive supervisor.</p><p>Direct, practical, and independent, she values fair expectations and meaningful feedback. She enjoys realistic workplace decisions and questions repetitive tasks that give students little reason to engage.</p>",
        "visual": "maya"
      },
      {
        "title": "Why Babbage?",
        "body": "<p>The computer character takes its name from Charles Babbage and the early history of programmable computing. Charles is the historical namesake; the mechanical engine represents the collaborator you meet here.</p><p>The character gives AI assistance a recognizable presence. It invites you to examine how a tool supports your thinking while keeping responsibility for teaching decisions with you.</p>",
        "visual": "engine"
      },
      {
        "title": "A student’s first read",
        "body": "<p>Maya reads your actual assignment and revision as a simulated student. She can describe what seems clear, confusing, engaging, or difficult and reconsider when the directions change.</p><p>She is not an instructional-design expert or a stand-in for every learner. Her response is a prompt for reflection. Check it against your course knowledge and feedback from real students.</p>",
        "visual": "mayaSpeaking"
      },
      {
        "title": "You make the decisions",
        "body": "<p>Pixel provides guidance, Babbage offers possibilities, and Maya shares a student perspective. You bring knowledge of your subject, course, students, and teaching responsibilities.</p><p>Ask for clarification, revise a suggestion, or reject it with a reason. Suggestions enter your assignment only when you choose to apply them. You can continue editing and explain the tradeoffs behind your final design.</p>",
        "visual": "classroom"
      }
    ]
  },
  "privacy": {
    "label": "Privacy & Progress",
    "sections": [
      {
        "title": "About this prototype",
        "body": "<p>Playing or testing PromptCraft does not enroll you in research. These screens explain how the current prototype handles progress and AI requests; they are not research consent.</p><p>Your work is not automatically published. Progress is saved in this browser, while asking for AI help sends relevant context to the external service. The following topics explain the distinction and how to keep a copy.</p>",
        "visual": "classroom"
      },
      {
        "title": "Browser saves",
        "body": "<p>The scenario and assignment workspace keep separate current progress in this browser. Saves include course context, choices, drafts, explanations, review checks, and saved Babbage conversation.</p><p>A preference remembers which path to resume. Course Guide reads these current designs; it is not an archive of every earlier version. Save a downloaded copy when you want to preserve a finished design.</p>",
        "visual": "pixel"
      },
      {
        "title": "Keeping a copy",
        "body": "<p>Your progress belongs to this browser and site address. It does not automatically follow you to another device or browser, and clearing browser data can remove it.</p><p>Download a finished Course Guide to keep a separate copy. Before resetting a path or replacing its current design, check that you have saved anything you want to retain.</p>",
        "visual": "pixel"
      },
      {
        "title": "When you ask for AI help",
        "body": "<p>Sending a Babbage message shares assignment context and your answers with the existing Babbage service and OpenAI.</p><p>Requesting Maya’s reading shares your original and revised directions, design context, and earlier readings with the same service. Use fictional examples and remove identifying information before requesting help.</p>",
        "visual": "engine"
      },
      {
        "title": "Browsing and testing",
        "body": "<p>Reading these topic screens, browsing Idea Lab starters, and previewing a guide do not send your assignment to AI. Requests happen when you ask Babbage or request Maya’s reading.</p><p>Maya readings and unapplied suggestions do not persist across refresh. The development testing fallback is simulated and makes no AI call; it is used to test the interface.</p>",
        "visual": "pixelThinking"
      },
      {
        "title": "External service privacy",
        "body": "<p>AI requests use the existing Babbage service and OpenAI. Information sent with a request leaves the browser to receive a response.</p><p>This prototype does not establish those services’ retention or deletion practices. Resetting a local workspace clears that path’s browser save; it does not request deletion from an external service. Keep confidential information out of requests.</p>",
        "visual": "engine"
      },
      {
        "title": "Keep student information out",
        "body": "<p>Use fictional examples and general descriptions of student needs. Do not enter student names, grades, course records, health information, passwords, or other confidential or identifying information.</p><p>For example, describe “a student balancing shift work and study” rather than copying a real student’s message. Check assignment text, AI messages, and reflections before submitting them.</p>",
        "visual": "maya"
      },
      {
        "title": "Private work",
        "body": "<p>Your assignments, conversations, and Course Guide entries are not automatically published as community contributions. AI requests still send the relevant context to the external service when you ask for assistance.</p><p>The Idea Lab contains illustrative AI-assisted starters, not a public faculty-sharing community. Downloading or sharing a guide is your choice; review its contents before passing it on.</p>",
        "visual": "pixelListening"
      },
      {
        "title": "Future research",
        "body": "<p>Playing or testing this build does not enroll you in research. This checkout has no participant research event logger or enrollment process.</p><p>Future formal research would require separately designed consent and logging. Any participant information and research procedures would need to be explained through that process. Current prototype testing and the proposed study are separate.</p>",
        "visual": "shanel"
      },
      {
        "title": "Resume and reset",
        "body": "<p>Continue Where You Left Off returns to a saved path. Course Guide lets you review the current scenario and workspace designs without changing their progress.</p><p>Restart module and Reset workspace each ask for confirmation and affect their respective paths. Download a guide before replacing work. Resetting one path does not reset the other or delete information already sent to an external service.</p>",
        "visual": "pixel"
      }
    ]
  }
};
