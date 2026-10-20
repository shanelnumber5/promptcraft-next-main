# PromptCraft: Add Babbage's Idea Lab

I want to introduce a new feature called **Babbage's Idea Lab** to the existing PromptCraft game.

I like the current gameplay, interface, characters, and AI collaboration. Please preserve what is working. This should be an extension of PromptCraft, not a redesign or separate application.

## Purpose

Babbage's Idea Lab will be a creative space where college educators can:

1. Discover innovative teaching and assignment ideas.
2. Explore ideas shared by other educators.
3. Collaborate with Babbage to adapt an idea to their own course.
4. Develop an original assignment or improve an existing one.
5. Eventually contribute their own ideas for other educators to use.

The focus is on creative, purposeful instructional design, not simply generating assignments with AI.

## 1. Add an Idea Lab entry point

Explore adding **Babbage's Idea Lab** to the main menu and the Create an Assignment experience.

Do not interrupt the guided Scenario 1 experience.

Returning educators should be able to enter the Idea Lab without replaying the introductory sequence.

Keep navigation consistent with the current game.

## 2. Create an idea gallery

Start with a curated gallery of approximately 10–15 innovative teaching activities.

Each idea should have:

- A memorable title.
- A short explanation of the activity.
- The learning purpose.
- A description of what students actually do.
- Suggested disciplines or teaching contexts.
- A few searchable tags.
- An **Adapt with Babbage** action.

Ideas should be adaptable across disciplines rather than narrowly tied to one subject.

Include examples involving discussions, creative assessments, authentic projects, critical thinking, workplace scenarios, and responsible AI use.

Clearly label starter examples as illustrative rather than actual faculty submissions.

## 3. Connect ideas to Babbage

When an educator selects **Adapt with Babbage**, pass the selected idea into the existing AI collaboration workflow.

Babbage should help the educator adapt the idea by considering:

- What they teach.
- What students should learn.
- Their existing assignment or activity.
- Student needs.
- Time and resource constraints.
- What they want to improve.

Babbage should offer creative alternatives, ask useful questions, and explain possible tradeoffs.

The educator remains responsible for deciding what to accept, modify, or reject.

Reuse the current AI endpoint and interaction components where possible. Do not introduce a second AI system unnecessarily.

## 4. Make it feel like a creative workspace

Educators should be able to:

- Browse ideas without completing a tutorial.
- Start with an existing assignment or a rough idea.
- Explore alternatives with Babbage.
- Revise their assignment.
- Request Maya's student perspective where appropriate.
- Save a useful design summary to their Course Guide.

Avoid turning the experience into a long questionnaire.

Preserve the conversational and playful qualities of PromptCraft.

## 5. Design a future faculty-sharing feature

Eventually, I want educators to contribute ideas to a shared collection.

For now, inspect the existing architecture and recommend how we could support:

- Voluntary idea submissions.
- A preview before sharing.
- Contributor attribution or anonymous sharing.
- Explicit permission to publish.
- Removal of student-identifying information.
- Moderator approval.
- Editing or withdrawing submissions.
- Clear distinctions between educator-submitted and AI-generated ideas.

Do not build a public submission database or automatically publish content in this first phase.

Do not use private Course Guide content as public library content without explicit educator approval.

## 6. Preserve research integrity

PromptCraft is being developed for a planned study of instructional-design reasoning.

Keep Idea Lab activity separate from formal research participation unless the future study protocol explicitly includes it.

Do not introduce new research event fields, change existing event schemas, or begin collecting formal participant research data.

Preserve existing save/resume behavior and avoid overwriting Scenario 1 progress.

## 7. Accessibility and visual design

Use the existing PromptCraft blue-and-gold palette, typography, character assets, and navigation conventions.

Ensure:

- WCAG AA color contrast.
- Keyboard accessibility.
- Clear focus indicators.
- Screen-reader-friendly controls.
- Mobile responsiveness.
- Readable idea cards.
- No unnecessary animations or excessive scrolling.

## 8. Implementation sequence

Please work in small, testable stages.

**Stage 1: Audit and proposal**

Inspect the current repository and identify the existing components, navigation, AI contracts, storage, and Course Guide features we can reuse.

Recommend the smallest implementation and flag any risks before changing architecture.

**Stage 2: Local Idea Lab prototype**

After approval, implement a curated idea gallery with search/filtering, idea details, and a working Adapt with Babbage interaction.

**Stage 3: Integration and testing**

Verify that the Idea Lab can connect to the existing assignment-revision workflow without breaking Scenario 1, Maya, Babbage, the Course Guide, or saved progress.

Test navigation, keyboard use, mobile layouts, and saved-state recovery.

Document what was tested and any limitations.

## Important restrictions

- Do not rebuild PromptCraft.
- Do not replace existing character profiles.
- Do not duplicate the AI backend.
- Do not introduce an unmoderated public idea feed.
- Do not automatically share educator content.
- Do not deploy to Netlify. Credits are unavailable until October 22.
- Preserve the existing repository and make recoverable Git checkpoints.

**Start with the audit and implementation proposal. Do not begin major changes until we review the approach.**

The goal is to make PromptCraft useful both as a guided professional learning game and as an ongoing creative instructional-design resource for educators.