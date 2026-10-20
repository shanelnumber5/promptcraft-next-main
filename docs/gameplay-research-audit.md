# Scenario 1 audit and implementation sequence

Audit date: October 19, 2026. Scope: this checkout and available Git history.

## What already fits

The lemonade story is an interactive worked example of an instructional problem, a choice, peer questioning, and revision. Pixel guides and Maya speaks as a fictional student. The course setup then transfers the example to the educator's own discussion. Three reply approaches, independent drafting, the editable starter, optional Babbage suggestions, before/after review, and one final approval already support instructional-design reasoning. Preserve these interactions, blue/gold styling, responsive layouts, keyboard controls, and offline guide export.

Browser persistence retains the original assignment, current and previous drafts, reasoning notes, choices, and conversation. Approval is invalidated by relevant edits. Keep the storage key, scenario IDs, content version, and Babbage scenario1 adapter compatible.

## Refinements needed

The guide includes original/revised directions and rationale but omits an explicit challenge and learning-goal summary. The rationale prompt can ask how the educator would recognize learning, within the existing response rather than a new required form. Babbage's rationale can currently read like the educator's own judgment after applying a suggestion; ask the educator to evaluate it explicitly. Response length is not a measure of reasoning quality, and the existing nonempty-answer check should stay that way.

Maya's authored dialogue responds to the lemonade example only. At the initial audit, there was no course-specific student simulation or detailed Maya profile in this checkout. The project owner has since supplied her approved identity and personality, now preserved in [Maya's character profile](characters/maya.md); proposed dialogue examples remain pending review. Existing opening dialogue and artwork are compatible and retained. Do not invent a replacement identity or present keyword-generated judgments as authentic student feedback. A later increment should add an optional, grounded student reading of the actual revised instructions using this profile, clearly distinguishing simulation from observed student outcomes.

## Reuse and simplification

The available initial commit and subsequent formatting/revert history contain the same module foundations, character assets, starter exchanges, guide renderer, and backend adapter. Reuse the current versions rather than importing a competing implementation. No additional student profiles or legacy research infrastructure were found in the available source. The community-space setup example is a sample assignment, not a Community Innovation Hub storyline; it need not be removed. No Future of Work Studio branch is present.

Keep the single approval milestone. Add no required saves or questionnaire screens. Clarify existing prompts first; evaluate whether the separate notes and final reason screens repeat work before removing either. Preserve saved navigation targets during any later simplification.

## Research and technical risks, identified before implementation

No participant event logger, research event schema, consent gate, or research enrollment mode is implemented in this repository. Local progress snapshots and Babbage conversation history are not an incremental research record. The external backend is outside this checkout; its retention, consent behavior, and logging cannot be verified here. Do not claim research compatibility has been established for that service.

Dev fallback means simulated AI with no API call; live Babbage is a service mode, not research consent. Current development testing is not formal participant research. Live mode already sends assignment context and answers to the existing service and OpenAI. Do not add personal-data fields, research transmission, or inferred enrollment. Before a study, recover the original event contract and character profiles, review backend retention and consent, and specify a versioned research protocol. Prompt changes can affect response content and participant comparison even if JSON shapes stay unchanged; record the build used for each future study cohort.

The first increment changes guide presentation and instructional wording only. It adds no stored fields, request fields, events, consent assertions, or network destinations. Evidence of success remains the educator's expectation, never a claim of observed improvement. Existing saves without that expectation remain valid and show a transparent missing-information message.

## Sequence and validation

1. Commit this audit after running the existing unit checks as a baseline.
2. Add the decision summary to the existing guide, using existing fields; refine the existing reason prompt to include expected evidence and evaluation of AI help. Test escaping, old saves, draft/approved labels, and the complete mocked browser flow.
3. In a separate increment, implement grounded Maya feedback using the supplied approved profile after confirming the intended service contract. Verify feedback against contrasting drafts, edits, and resume behavior. New proposed dialogue examples remain subject to review.
4. Recover and audit the research logger and consent contract before integrating any incremental event collection. Validate meaningful decision records without treating word count as reasoning quality.

Use recoverable Git checkpoints. Do not deploy without approval.

## First increment validation

All four unit suites pass, including added guide milestone checks for escaping, approval labels, missing legacy notes, and links to the actual chosen directions. The mocked Chrome workflow passed desktop, wide-review, short-desktop, portrait tablet, medium-window, landscape tablet, and phone. The exhaustive viewport sweep was stopped after those first six passing sizes; the phone-only run then completed successfully. Desktop and phone rationale screenshots were visually reviewed. No live AI call or deployment was made. The complete viewport matrix was not run to completion.

## Subsequent stabilization

The later [Scenario 1 stabilization report](scenario1-stabilization.md) records the optional course-specific Maya reading, early-prediction clarification, focus/state fixes, Babbage prompt version, and current test results. Live service availability and generated-response quality are separate from mocked workflow validation.
