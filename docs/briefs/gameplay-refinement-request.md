# PromptCraft: Gameplay Refinement and Research Alignment

I want to refine the existing PromptCraft game using the educational and research direction we've recently established.

**Important: I like how the current game is working. This is not a request to rebuild PromptCraft from scratch.**

Please inspect the current repository, identify what can be preserved, and make targeted improvements to the existing gameplay, characters, interactions, and Course Guide.

## 1. Updated educational purpose

PromptCraft is a scenario-based professional learning game that helps college educators improve familiar online teaching activities.

The primary learning goal is to help educators develop and demonstrate **instructional-design reasoning**.

Two supporting goals are:

- Purposeful creativity when improving learning activities.
- Critical evaluation of AI-generated suggestions.

The game should help educators recognize instructional problems, explore possibilities, consider student needs, explain decisions, and make purposeful revisions.

We are not developing the previously proposed Community Innovation Hub or Future of Work Studio storyline.

## 2. Preserve the existing game

Before changing anything, audit the current implementation.

Preserve working elements wherever possible, including:

- The current interface and visual style.
- Professor Pixel and existing narration.
- Babbage's AI collaboration features.
- Maya and the established student characters.
- Existing scenario interactions.
- The personalized Course Guide.
- Save and resume functionality.
- Existing research event logging and compatible data structures.
- Accessibility features and responsive behavior.

Do not replace functioning interactions with static explanations or additional forms.

## 3. Refine Scenario 1: Start With the Learning

Scenario 1 should remain our first complete, polished gameplay experience.

Preserve the progression from a small, playable instructional-design example to improving an educator's own course.

The experience should help educators:

1. Encounter a recognizable instructional problem.
2. Examine how the learning goal connects to activities and evidence of learning.
3. Explore possible improvements.
4. Consider feedback from Babbage and Maya.
5. Make and explain an instructional-design decision.
6. Apply that reasoning to their own teaching context.
7. Save an approved final milestone to the Course Guide.

Avoid repetitive questions, unnecessary mandatory steps, and multiple required Course Guide saves.

Do not reduce Scenario 1 to a sequence of input forms.

## 4. Clarify the characters' roles

**Professor Pixel: The guide**

Pixel introduces situations, explains concepts when needed, and helps the educator understand the purpose of an activity.

Keep explanations brief, conversational, and integrated into gameplay.

**Babbage: The AI collaborator**

Babbage should help educators think creatively and critically.

Babbage can:

- Suggest alternative instructional approaches.
- Ask useful clarifying questions.
- Explain possible advantages and tradeoffs.
- Help revise activities.
- Offer ideas appropriate to the educator's course context.

Babbage should not automatically determine the correct answer or act as the final authority.

Educators must be able to accept, adapt, question, or reject suggestions.

**Maya: The simulated student**

Maya should respond from a believable student perspective.

Her feedback should reflect the educator's actual decisions, assignment instructions, and revisions.

She should not behave like an instructional-design expert, rubric, or automated grading system.

Preserve Maya's established character identity and profile.

Do not substitute generic feedback that would appear regardless of what the educator entered.

Preserve the other established student characters and their assets. Do not create replacement profiles without reviewing the originals.

## 5. Make reasoning visible

We need to collect meaningful evidence of how educators approach instructional-design problems.

Look for natural moments in gameplay where educators can demonstrate that they:

- Recognized an instructional problem.
- Considered alternative approaches.
- Evaluated AI suggestions.
- Considered the student experience.
- Made a purposeful revision.
- Explained why the revision might improve learning.

These should emerge through meaningful decisions and interactions, not through a lengthy questionnaire.

Do not assume a longer written response indicates better reasoning.

## 6. Improve the Course Guide

The Course Guide should be a useful record of the educator's decisions and learning.

For Scenario 1, the final approved milestone should summarize:

- The instructional challenge.
- The learning goal.
- The educator's chosen improvement.
- Why they selected it.
- How they expect to recognize whether the improvement worked.

Avoid repeated mandatory saves throughout the scenario.

Preserve compatibility with the existing research logging system. The final Course Guide should not replace incremental records of meaningful decisions and revisions.

## 7. Protect research integrity

PromptCraft is being developed for a planned mixed-methods action research study.

We are not collecting formal participant research data during current development testing.

Preserve existing research infrastructure, but distinguish development testing from future consent-based research participation.

Do not introduce new personal-data collection or silently change the research event schema.

Identify any changes that could affect research data quality, consent, privacy, or comparison across participants before implementing them.

## 8. Improve the experience without expanding its complexity

Prioritize:

- Shorter, clearer instructions.
- More meaningful choices.
- Better continuity between interactions.
- Feedback that reflects the educator's actual input.
- Fewer repetitive screens.
- Consistent blue-and-gold visual styling.
- Accessible controls and keyboard navigation.
- Reliable state management and resume behavior.

Avoid adding elaborate mechanics, unnecessary characters, or new scenario branches unless they directly improve learning.

## 9. Implementation approach

First, inspect the current game and compare it against these requirements.

Provide:

1. What already meets the updated goals.
2. What needs refinement.
3. What can be reused from earlier PromptCraft implementations.
4. What should be removed or simplified.
5. Any technical risks or research-data compatibility concerns.
6. A recommended implementation sequence.

**Do not immediately rewrite the entire game.**

Once the audit is complete, begin with small, testable changes to Scenario 1.

Preserve existing working functionality, use Git commits for recoverable checkpoints, and verify the game after each meaningful change.

Do not deploy without approval.

Our goal is to make PromptCraft more educationally meaningful, more responsive to educators' decisions, and more useful for studying instructional-design reasoning while preserving the game we have already built.