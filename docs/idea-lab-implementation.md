# Babbage's Idea Lab: local prototype

Approved scope: retain Scenario 1; add a local illustrative gallery and a direct assignment workspace using existing Babbage, Maya, editing, and Course Guide components. No deployment, public submissions, or formal participant collection. Original requests are preserved under `docs/briefs/`.

## Audit and chosen approach

The application has one guided state machine and one browser save key. Babbage's controller already handles clarification, approval of suggestions, errors, stale responses, and Dev simulation. Maya has an approved identity and a grounded first-reading dialog. Guide generation already escapes content and exports offline HTML. Reuse those components.

Existing prompts, checks, and guide headings assume a discussion activity. A separate workspace presentation and prompt variant are necessary to support other assignment types while leaving the guided defaults unchanged. Keep the original `promptcraft_next_opening_v1` save and inner state shape. Add a versioned workspace wrapper under `promptcraft_assignment_workspace_v1`, plus a small last-path preference. The workspace contains one current design; browsing or selecting inspiration must never replace its original directions or current draft.

Foundation checkpoint: 12 original illustrative activities, local search/filtering, entry renderer, isolated save/restore/reset, and legacy-compatible restoration. The gallery is not a collection of real faculty submissions. Foundation unit checks and all five existing unit suites passed before wiring the new views into the application.

## Integrated prototype

The same `index.html` now loads a small entry module. `?view=home`, `?view=play`, `?view=workspace`, and `?view=lab` select views. Root visits resume valid saved progress automatically; explicit Home offers Continue and the entry choices. Existing guided phase IDs and the guided key are unchanged. The original app controller is imported only for the guided path.

The gallery has 12 AI-assisted illustrative starters, keyword search, category filtering, and activity details. Adapt with Babbage records inspiration and opens the workspace; it does not send an AI request automatically. For a new workspace, it seeds a starting idea. For an existing workspace, it keeps the starting text, draft, and rationale while resetting outdated conversation and approval, as described beside the action. One current workspace is supported in this prototype.

The workspace presents Design, Babbage, and Review & Course Guide as keyboard-accessible tabs. It reuses the formatted editor, AI panel and asynchronous controller, Maya dialog, final checks, preview, and HTML download. Starting material can be existing directions or an idea. General learner-needs text is optional. A final workspace guide requires a starting point, learning goal, rationale, draft, and reviewed checks; it omits the scenario example and identifies any illustrative inspiration. Nothing is published.

Workspace prompt version: `idea-lab-workspace-2026-10-19`. It is selected only for workspace requests; guided instructions retain their current version. Both retain the existing API envelope. Workspace metadata appears inside ordinary request content, not a research event. Maya's workspace instruction distinguishes an idea from an existing assignment. Session-only Maya readings and transient unapplied AI suggestions retain their existing refresh limitations.

The first integrated desktop Chrome check passed gallery search/details, adaptation, shared Babbage accept/edit/reject, Maya, approved guide preview/download, path switching, approval restoration, reset isolation, malformed workspace protection, and quota-failure recovery. All six unit suites pass. Browser AI calls are mocked; no live-service quality result is claimed. Broader responsive and guided regression checks follow this checkpoint.

## Verification and checkpoints

Foundation checkpoint: `c991e42`. Integration checkpoint: `f4681c0`. A final checkpoint records the regression checks and follow-up fixes. The guided save was not migrated or renamed.

| Command | Actual result |
| --- | --- |
| `npm.cmd test` before implementation | PASS: five existing unit suites |
| `node tests/unit/idea-lab.test.cjs` during foundation work | PASS: catalog fields/search, isolated saves, resume/reset, malformed records, and save failures |
| `npm.cmd test` after integration and final guide wording fix | PASS: all six suites (design, Babbage, Maya, Idea Lab, server, repository) |
| `$env:PC_BROWSER_DEVICE='desktop'; node tests/browser/idea-lab.test.cjs` | PASS: first integrated workflow |
| `node tests/browser/idea-lab.test.cjs` | PASS: desktop 1440×1000, tablet 768×1024, phone 390×844, small phone 320×568. Repeated after adding existing-assignment archive/restore and same-inspiration approval checks; all four passed again. |
| `$env:PC_BROWSER_DEVICE='desktop,short-desktop,tablet,phone,small-phone'; node tests/browser/design.test.cjs` | PASS: all five layouts, including the complete keyboard opening-to-guide flow, Babbage accept/adapt/reject, Maya, actual guide download, resume/reset, and layout checks. Exit 0. |
| `git diff --check` | PASS; Git emitted line-ending notices only |

PowerShell and direct Node commands were available; `npm.cmd` avoids the PowerShell npm wrapper. Chrome checks required permission to run outside the sandbox. While wiring the application, the repository checker initially treated query-only navigation links as file paths, then flagged the not-yet-added test launcher; both were corrected before the integration checkpoint. No final unit failure remains.

The Idea Lab browser run checks gallery filtering and empty results; activity details; selected idea/context reaching the shared request; explicit accept/reject and draft editing; Maya's grounded mocked reading; approved preview/download and restoration; keyboard tabs and accessible names/references; foreground/background AA thresholds for sampled new visible text; no horizontal or dialog overflow; guided-save byte preservation; independent reset; malformed-record protection; and recovery from a simulated storage quota failure. The final check also covers opening the same inspiration without discarding approval and archiving/restoring a draft after its baseline changes.

Layout artifacts: ignored `artifacts/screenshots/design/idea-lab-audit.json` records four viewports and 32 screenshot/layout checks. Desktop, phone, and 320px gallery/workspace screenshots were visually inspected. Guide downloads are under ignored `artifacts/downloads/`. Hands-on NVDA/JAWS/VoiceOver speech and full WCAG conformance auditing were not performed; accessibility-tree, keyboard, status semantics, and sampled contrast checks are not substitutes for that broader review.

The guided run's five-layout audit is preserved separately as `artifacts/screenshots/design/guided-after-idea-lab-audit.json` (325 screenshot/layout checks). The rest of the optional viewport matrix was not run.

No live AI request was made during this feature work, respecting the stated Netlify credit pause through October 22. The previous stabilization found HTTP 404 at the configured endpoint. Live endpoint compatibility, generated alternatives, and Maya response quality must be checked when service returns. The local Dev fallback is explicitly simulated; Maya's offline option is an excerpt preview, not a student judgment. No deployment was attempted.

Known limits: one current workspace; browser-local progress; session-only unapplied suggestions and Maya readings; no faculty submissions or publication. Different inspiration resets obsolete conversation/approval but preserves the starting material, draft, and rationale. Reopening the same inspiration preserves approval. The empty workspace guide now points back to workspace tabs instead of a guided tutorial step.

Main additions are the entry module, gallery catalog/views, workspace controller/view/storage/prompt, scoped Idea Lab stylesheet, browser/unit checks, and preserved briefs. Shared editor, conversation lifecycle, endpoint adapter, Maya, final checks, and guide components remain in use. Guided defaults are covered by the original regression suite.

## Research, privacy, and version effects

No event schema or participant enrollment is introduced. Workspace metadata describes a private design, not research participation. Any optional learner-needs description must concern general access or learning needs, without names or identifying details. Babbage and Maya continue using the same external endpoint and API envelope. A workspace prompt variant changes the educational task and outputs, so it must be documented separately from the guided prompt.

The shared `analysis_type: scenario1` is an existing transport label. Backend retention/logging is outside this checkout; separate browser keys cannot guarantee separation in remote logs. Future research integration requires a reviewed consent and exclusion contract before formal participant collection. Choosing either path is not consent. Idea Lab exposure may affect later scenario performance even with separate saves.

## Future sharing proposal (not implemented)

Use a separate service for voluntary submissions: private draft → preview → attribution choice and explicit publication permission → moderator review → publication. Keep an authenticated private ownership record even when public attribution is anonymous. Distinguish starter examples, educator contributions, and AI-assisted content. Review for student-identifying information; automated checks alone cannot guarantee removal. Edits should return published content to review, and contributors need a withdrawal mechanism. Private Course Guides must never become submissions automatically.

No public database, submission endpoint, publishing button, faculty identities, or automatic sharing belongs in this phase.
