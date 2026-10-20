# Babbage's Idea Lab: local prototype

Approved scope: retain Scenario 1; add a local illustrative gallery and a direct assignment workspace using existing Babbage, Maya, editing, and Course Guide components. No deployment, public submissions, or formal participant collection. Original requests are preserved under `docs/briefs/`.

## Audit and chosen approach

The application has one guided state machine and one browser save key. Babbage's controller already handles clarification, approval of suggestions, errors, stale responses, and Dev simulation. Maya has an approved identity and a grounded first-reading dialog. Guide generation already escapes content and exports offline HTML. Reuse those components.

Existing prompts, checks, and guide headings assume a discussion activity. A separate workspace presentation and prompt variant are necessary to support other assignment types while leaving the guided defaults unchanged. Keep the original `promptcraft_next_opening_v1` save and inner state shape. Add a versioned workspace wrapper under `promptcraft_assignment_workspace_v1`, plus a small last-path preference. The workspace contains one current design; browsing or selecting inspiration must never replace its original directions or current draft.

Foundation checkpoint: 12 original illustrative activities, local search/filtering, entry renderer, isolated save/restore/reset, and legacy-compatible restoration. The gallery is not a collection of real faculty submissions. Foundation unit checks and all five existing unit suites passed before wiring the new views into the application.

## Research, privacy, and version effects

No event schema or participant enrollment is introduced. Workspace metadata describes a private design, not research participation. Any optional learner-needs description must concern general access or learning needs, without names or identifying details. Babbage and Maya continue using the same external endpoint and API envelope. A workspace prompt variant changes the educational task and outputs, so it must be documented separately from the guided prompt.

The shared `analysis_type: scenario1` is an existing transport label. Backend retention/logging is outside this checkout; separate browser keys cannot guarantee separation in remote logs. Future research integration requires a reviewed consent and exclusion contract before formal participant collection. Choosing either path is not consent. Idea Lab exposure may affect later scenario performance even with separate saves.

## Future sharing proposal (not implemented)

Use a separate service for voluntary submissions: private draft → preview → attribution choice and explicit publication permission → moderator review → publication. Keep an authenticated private ownership record even when public attribution is anonymous. Distinguish starter examples, educator contributions, and AI-assisted content. Review for student-identifying information; automated checks alone cannot guarantee removal. Edits should return published content to review, and contributors need a withdrawal mechanism. Private Course Guides must never become submissions automatically.

No public database, submission endpoint, publishing button, faculty identities, or automatic sharing belongs in this phase.
