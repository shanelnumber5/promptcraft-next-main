# PromptCraft repository audit and cleanup

Date: 2026-10-29

## Scope

Audited the current working repository, including the recent Workspace and Idea Lab changes. Reviewed entry routing, the shared Babbage request lifecycle, clarification handling, draft application, project restoration and approval, Guide output, active stylesheet ownership, and unit/browser test maintenance. This is a focused maintenance pass, not a claim that every runtime path or visual state has been verified.

Saved-data keys and formats, project import/export format, the `scenario1` response envelope, the existing AI endpoint, and the separate Scenario 1 and Workspace saves remain unchanged.

## Defects corrected

| Finding | Correction | Verification |
| --- | --- | --- |
| A canceled Babbage request could still process a response or clear the pending state of a newer request. | Capture each request controller locally; reject completions that are aborted, belong to another state, or no longer own the active request. Only the owning request performs final cleanup. | Simulated overlapping requests verify only the active response changes conversation history and delivers a suggestion. |
| An older connection check could overwrite a newer connection result. | Sequence connection checks and apply a result only when it is the newest check for the same state. | Deferred mocked responses complete in reverse order. |
| Two separate Workspace paths implemented suggested-draft application differently. An empty current draft could erase the saved predecessor. | Extract one `applySuggestedDraft` helper. Preserve a nonempty predecessor, set the current source directions, and invalidate final approval consistently. | Regression checks cover empty and nonempty current drafts, previous-draft preservation, and approval invalidation. |
| Maya failure copy could suggest a preview button that had been removed. | Remove the obsolete fallback wording and unused button listener. | Syntax/import checks and the existing mocked Maya suite. |

## Code and test cleanup

- Removed retired Options-group declarations from three active stylesheets. Updated mixed selectors to keep their active alternatives; removed empty media blocks and excessive blank lines.
- Removed obsolete Guide section identifiers from section ordering.
- Added `npm run test:unit`, a sequential offline runner for 12 suites. Its preload blocks accidental global `fetch` calls unless a test explicitly supplies a fixture. The normal `npm test` command now composes that runner with the separate local static-server suite.
- Added a current Idea Lab browser flow and routed `test:lab` to it, with checks for the current six-card browser, paging, filter restoration, detail pages, empty results, fixed footer, keyboard navigation, and safe Workspace adaptation. The older combined Idea Lab/Workspace browser-check file is retained as reference; its remaining coverage needs migration before retirement.
- Updated the Workspace layout browser checks for five Review pages. Disabled automatic Maya in that layout-only fixture so a modal does not obscure the screen under inspection.
- Corrected the project map's launch instructions, current CSS ownership, and verification guidance.

## Tests actually run

All 12 offline unit suites passed: JSON transport, design, Babbage, Maya, characters, Idea Lab, creative exploration, repository references, Workspace review, Workspace projects, the Babbage cameo, and shared-controller regression tests.

These cover mocked service contracts, cancellation and response ordering, draft and approval handling, project round trips, corrupt-save protection, storage isolation, catalog filtering and pagination, current Guide structure, character assets, and source references. Edited JavaScript files were syntax-checked; edited stylesheets were checked for balanced braces. The offline unit runner completed successfully.

## Not verified in this pass

- No browser suite was executed. Chrome was unavailable in this environment, so updated browser checks are prepared verification, not a passing browser result.
- No live Babbage or Maya request was made. Humor, creativity, relevance, and prompt adherence need live testing.
- The separate static-server suite was not run in this pass. It remains separate from the offline unit runner.
- CSS brace checks and text-contrast calculations do not establish complete visual accessibility or responsive correctness.

## Remaining cleanup priorities

1. Run the updated browser checks and inspect the full educator flow at desktop, tablet, and phone sizes, including rich-text selection/formatting, footer alignment, clarification recovery, and Maya scenes.
2. Consolidate active Workspace CSS by component, using browser comparisons before retiring inherited rules. The cascade still spans several legacy stylesheets; this pass only removed confirmed unused Options declarations.
3. `workspace.css` is not imported. Leave it untouched in this patch; a later repository-level deletion can remove it once historical references and any alternate build consumers are checked. A replacement-file ZIP cannot convey file deletion reliably.
4. Split the large Workspace controller into task-sized modules after behavior is covered by browser checks. Avoid restructuring navigation, storage, and AI work together in one unverified change.
5. Settle and version prompt behavior before any formal study. Automated tests verify contracts and deterministic behavior, not the educational quality of generated activities.

## Applying this patch

Replace the files in the ZIP at their original relative paths and hard-refresh the browser. Existing projects do not require a migration. The patch does not deploy the app or alter an already downloaded Guide; download a new Guide when reviewing exporter changes.
