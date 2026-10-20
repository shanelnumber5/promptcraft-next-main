# Scenario 1 stabilization

Development date: October 19, 2026. Baseline: `3e24bff`. No deployment.

## Validation first

Before editing, `npm.cmd test` passed all four existing unit suites (design, Babbage, server, repository). The existing mocked Chrome workflow passed desktop (1440 × 1000) and phone (390 × 844). It covered the worked-example scenes and course/design screens, Babbage clarification and revision, explicit accept/reject, editing, stale responses, guide preview, approval, reload, and reset. The initial suite seeded parts of the flow; the expanded suite now additionally walks the actual opening and course setup with keyboard input before continuing through design and guide download.

The audit found that Maya had no response to the educator's assignment. Her existing lemonade dialogue and approved artwork remain intact. The approved identity is available in [Maya's profile](characters/maya.md).

## Maya's first reading

The existing rationale screen now offers **Hear Maya’s first read (optional)**. It opens a blue-and-gold dialog without adding a required stage, form, or save. The educator can hear Maya, close the dialog, return to the editable directions, and revise before writing their final rationale.

Maya uses the original directions and current revision, plus at most two earlier readings in the current session. Her prompt uses the approved adult-student identity, requires concrete assignment details and an actual change, allows appreciation and questions, and prohibits grading, invented biography, and disciplinary expertise. She may reconsider a mistaken reading when the wording changes. A response without an exact phrase from the current revision is rejected rather than replaced with generic feedback. This is a grounding check, not proof of accurate interpretation or character quality.

Maya uses the existing endpoint and `scenario1` envelope with a separate system prompt and conversation; Babbage's history is not converted into student memories. Maya never edits or approves an assignment. Responses are rendered as text. They are cached only in memory for this state object; an edited draft needs a fresh reading, refresh drops readings, reset creates a fresh state, and closing the dialog aborts a pending request. The UI explains this behavior.

Dev mode and the explicit offline alternative provide original/revised **excerpt previews only**. They make no API call and do not pretend to interpret the assignment or reproduce Maya's judgment. A live service failure never silently produces simulated student feedback.

## Early reflection

The `design.notes` reflection already accepted a blank answer, but its wording overlapped with the final rationale. Retain it during stabilization as an explicitly optional, short prediction: **What might this reply help students notice?** This captures an initial hypothesis before drafting. The final rationale records the chosen change, why it was chosen, evaluation of AI help, and expected evidence in student work. These are distinct moments; neither response is scored by length.

Recommendation for a future usability increment: place the optional prediction beside the reply choice instead of giving it a separate screen. Do not remove the final rationale. This change deliberately preserves saved panel targets and navigation for now; no saved early notes are deleted.

## Accessibility and state fixes

- Summary tabs now have one tab stop, Arrow Left/Right and Home/End handling, linked tab/panel names, and focus retained on the selected tab.
- Babbage completion restores focus to the next clarification/suggestion control. When the educator is editing while a request finishes, completion updates status without replacing the editor DOM or losing its focus.
- Maya has a named dialog, an announced status region, a named response region, explicit forward/reverse Tab boundaries, Escape dismissal, and return focus to its opener. Empty responses do not create an extra tab stop.
- Restoring a save with stale conversation context preserves Dev mode while discarding stale history. This prevents a selected offline mode from reverting to live assistance on refresh.
- The opening handoff no longer says the already-implemented course activity is coming in a future build.

Keyboard events and Chrome's accessibility tree are tested, including control names, labels, ARIA references, status semantics, and focus behavior. This is not a hands-on NVDA, JAWS, or VoiceOver test; spoken output with those applications remains unverified. Existing colors, artwork, and responsive rules are retained, with a scoped stylesheet for the new dialog.

## Prompt change and research boundary

Babbage prompt content version: `scenario1-collaborator-2026-10-19`, exported from `babbage-prompt.js`. It now explicitly treats early notes as a prediction, gives a possible benefit and relevant tradeoff, preserves educator authority to accept/adapt/question/reject, and asks for expected evidence without claiming improved learning. The earlier guide/rationale refinement is documented in [the audit](gameplay-research-audit.md).

These prompt changes, the optional Maya exposure, the clarified reflection wording, and the Dev-mode restore fix may change behavior across builds. Compare future participants only with the instructional build, prompt content, mode, and available interactions documented in the study protocol. This document does not add tracking fields or collect participant data.

No research event schema, storage key/version, scenario ID, event logger, consent gate, or enrollment flag has been changed or introduced. No personal-data field or network destination has been added. Asking Maya makes an additional, explicit request containing existing assignment/design content and session readings to the same service; the UI discloses it. The external service's retention and consent behavior remain outside this checkout. Local snapshots and transient readings are not an incremental research record. Formal participant data collection is not implemented or activated.

## Commands and results

PowerShell was available. `npm.cmd` avoided the PowerShell npm wrapper; Node v22.14.0 ran the scripts. Chrome browser checks required execution outside the restricted sandbox.

| Command | Result |
| --- | --- |
| `npm.cmd test` before edits | PASS: original four suites |
| `$env:PC_BROWSER_DEVICE='desktop,phone'; node tests/browser/design.test.cjs` before edits | PASS: both viewports |
| `$env:RUN_LIVE_BABBAGE='1'; node tests/manual/babbage-smoke.cjs` | FAIL: service unavailable; reported connection failure. Direct diagnostic confirmed HTTP 404 and `text/html` instead of API JSON. No generated revision was tested. |
| `npm.cmd test` after implementation | PASS: design, Babbage, Maya, server, repository |
| Expanded desktop browser diagnostic runs | Initially failed because the keyboard harness omitted native Enter/Space text; corrected. The next run caught reverse-Tab escaping Maya's modal; corrected. Subsequent desktop and short-desktop flows passed; that sweep was intentionally stopped to add the editor-focus and Dev-mode regression checks before a final run. |
| `$env:RUN_LIVE_MAYA='1'; node tests/manual/maya-smoke.cjs` | FAIL at health check: HTTP 404, `text/html`. No Maya response or follow-up quality result exists. |
| Expanded five-viewport browser run, first attempt | Desktop and short-desktop passed; tablet stopped on a test race that reopened Maya before the native close event completed. Added explicit close-lifecycle waits. |
| `$env:PC_BROWSER_DEVICE='desktop,short-desktop,tablet,phone,small-phone'; node tests/browser/design.test.cjs` | PASS: 1440 × 1000, 1280 × 720, 768 × 1024, 390 × 844, and 320 × 568. Exit 0; 325 screenshot/layout checks recorded. |
| `$env:PC_BROWSER_DEVICE='phone'; node tests/browser/design.test.cjs` after compact mobile-header adjustment | PASS: exit 0; 65 screenshot/layout checks. Final phone Maya screenshots visually reviewed. |
| `git diff --check` | PASS, with Git line-ending notices only |

The Maya unit/browser checks use substantially different fictional statistics and poetry assignments, different student responses, and a follow-up timing clarification. They verify current assignment transport, different fixture content, acknowledgment of a revision, earlier-reading context, cross-assignment rejection, cancellation, error handling, and offline labeling. These mocked responses are test fixtures, not evidence that the live model produces meaningful differences. The opt-in `tests/manual/maya-smoke.cjs` is ready to collect live readings and follow-ups for review once the service returns.

The user reports Netlify credits may renew on October 22. Exhausted credits are a plausible explanation for paused hosting, but account billing status was not inspected and the cause is not confirmed. Keep the URL unchanged. Live Babbage and Maya validation must be repeated when service is restored; do not describe the current build as fully validated against live AI.

Final browser artifacts go under ignored `artifacts/screenshots/design/`; the five-layout record is preserved as `responsive-audit-five-viewports.json`. The guide downloads under ignored `artifacts/downloads/`. Desktop and phone Maya screenshots were visually reviewed; the mobile header was then compacted to leave more room for her response. No generated test data is committed. The remaining default viewport matrix was not run.

## Checkpoint file inventory

| Files | Purpose |
| --- | --- |
| `src/features/design/maya-client.js`, `maya-dialog.js` (new) | Approved Maya prompt, existing-service adapter, grounded response handling, optional accessible dialog, transient reading history |
| `src/styles/maya.css` (new), `src/styles/styles.css` | Scoped blue-and-gold Maya dialog styling and import |
| `src/app/app.js` | Optional Maya action and keyboard summary-tab handling |
| `src/app/storage.js` | Preserve Dev preference when stale history is discarded |
| `src/features/design/controller.js` | Babbage completion focus and editor DOM preservation |
| `src/features/design/babbage-prompt.js` | Versioned collaborator/prediction/tradeoff refinement |
| `src/features/design/content.js`, `guided-screen.js` | Explicit optional prediction and Maya entry point on existing rationale screen |
| `src/features/setup/screen.js` | Linked tab/panel roles and roving tab stops |
| `src/features/opening/content.js` | Correct the outdated transition message |
| `tests/unit/maya.test.cjs` (new), `package.json` | Grounding, distinct assignment fixtures, error/state/schema checks, unit-test script |
| `tests/browser/design.test.cjs` | Continuous keyboard handoff, Maya behavior, accessibility-tree checks, guide download, and focus/state regressions |
| `tests/manual/maya-smoke.cjs` (new) | Opt-in live student-reading and revision comparison using fictional assignments |
| `README.md`, `docs/project-map.md`, `docs/characters/maya.md`, `docs/gameplay-research-audit.md`, `docs/scenario1-stabilization.md` (new report) | Usage, file locations, preserved profile, development/research effects, exact validation scope |
