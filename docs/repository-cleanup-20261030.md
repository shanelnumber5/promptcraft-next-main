# Repository cleanup · October 30, 2026

## Baseline and scope

The complete owner upload `promptcraft-next-main(3).zip` is authoritative. No earlier patch package was overlaid. The original upload preserves removed development history, old browser fixtures and inactive reference artwork.

This deliverable is a complete repository. Extract it into a fresh folder; merging it into an old folder leaves retired files behind. No deletion script is needed. Continue using the same browser address if you want the same local save; Options project backup/import can move editable work between addresses.

## Changes

- Removed eight unreachable guided/setup source modules and their obsolete unit suite.
- Replaced the large browser file containing the retired flow with a smaller shared harness for current Scenario, Workspace and Idea Lab fixtures.
- Removed obsolete browser feature fixtures, unimported stylesheet copies, the empty cascade patch, superseded development reports and inactive reference artwork.
- Removed 322 CSS rules whose selectors require retired screen containers. Mixed and shared rules remain; there was no broad visual redesign.
- Removed unused legacy panel navigation, Maya review-gating helpers, old Idea Lab illustrations and an unused evidence accordion renderer. Retained the current Maya session cache and dialogue callbacks.
- Updated README, source map and provenance; retained character guidance, source notes and font license.
- Added architecture checks for static/lazy imports, stylesheet reachability and test-helper references. Asset checks no longer exempt archived artwork.

## Preserved

The opening story, shared Explore/Build/Review studio, rich-text editor, Babbage/Maya interaction flow, Pixel closing, full-length Babbage portrait, approval and guide export remain. Storage keys, saved fields, legacy-save validation, project import/export and the scenario1 AI response envelope were retained. No AI prompt or participant-data collection change was made in this cleanup.

## Validation

- All 15 offline unit suites passed after cleanup.
- Local static-server tests passed, including private-file, traversal, origin and host checks. These requests stayed on loopback.
- JavaScript syntax and CSS brace/reference checks passed.
- Browser and live AI verification were not performed. The renamed browser harness was syntax checked, not executed.

## Removed or replaced files

Each original remains available in the uploaded baseline archive. The browser harness row is a replacement, not a loss of all browser testing.

| Original path | Reason |
| --- | --- |
| `src/shared/review-directions.js` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `src/shared/workflow-nav.js` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `src/features/design/pixel-advice-scene.js` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `src/features/design/final-check.js` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `src/features/design/screen.js` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `src/features/design/guided-screen.js` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `src/features/design/guided-followup.js` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `src/features/setup/screen.js` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `tests/unit/guided-followup.test.cjs` | Retired guided forms and their renderer-specific checks; shared studio replaces them. |
| `tests/browser/setup-checks.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/stabilization-checks.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/stabilization.test.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/guide-checks.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/idea-lab-checks.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/creative.test.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/setup.test.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/type-menu-checks.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/type-menu.test.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/creative-checks.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/type-audit.cjs` | Obsolete browser fixture for retired screen flow. |
| `tests/browser/design.test.cjs` | Replaced with current-route browser-harness.cjs; removed retired end-to-end flow. |
| `src/styles/workspace.css` | Not part of the stylesheet import graph, or contains no rules. |
| `src/styles/tablet-classroom.css` | Not part of the stylesheet import graph, or contains no rules. |
| `src/styles/interface-consistency.css` | Not part of the stylesheet import graph, or contains no rules. |
| `assets/people/charles-babbage.png` | Inactive reference artwork; current supplied portraits and repaired engine are retained. |
| `assets/characters/maya/neutral.png` | Inactive reference artwork; current supplied portraits and repaired engine are retained. |
| `assets/characters/maya/confident.png` | Inactive reference artwork; current supplied portraits and repaired engine are retained. |
| `assets/characters/pixel/listening.png` | Inactive reference artwork; current supplied portraits and repaired engine are retained. |
| `assets/characters/pixel/thinking.png` | Inactive reference artwork; current supplied portraits and repaired engine are retained. |
| `assets/characters/pixel/encouraging.png` | Inactive reference artwork; current supplied portraits and repaired engine are retained. |
| `docs/guided-reading-and-scenes-20261030.md` | Superseded development report or brief; preserved in original upload. |
| `docs/scenario-route-cleanup-20261030.md` | Superseded development report or brief; preserved in original upload. |
| `docs/scenario-feedback-followup-20261030.md` | Superseded development report or brief; preserved in original upload. |
| `docs/teaching-notes-and-guide-20261030.md` | Superseded development report or brief; preserved in original upload. |
| `docs/menu-refinement.md` | Superseded development report or brief; preserved in original upload. |
| `docs/shared-scenario-studio-20261030.md` | Superseded development report or brief; preserved in original upload. |
| `docs/repository-audit-20261029.md` | Superseded development report or brief; preserved in original upload. |
| `docs/stabilization-audit.md` | Superseded development report or brief; preserved in original upload. |
| `docs/gameplay-research-audit.md` | Superseded development report or brief; preserved in original upload. |
| `docs/scenario1-stabilization.md` | Superseded development report or brief; preserved in original upload. |
| `docs/responsive-layout-audit.md` | Superseded development report or brief; preserved in original upload. |
| `docs/idea-lab-implementation.md` | Superseded development report or brief; preserved in original upload. |
| `docs/creative-refinement-20261029.md` | Superseded development report or brief; preserved in original upload. |
| `docs/review-feedback-followup-20261030.md` | Superseded development report or brief; preserved in original upload. |
| `docs/visual-refresh.md` | Superseded development report or brief; preserved in original upload. |
| `docs/scenario-template.md` | Superseded development report or brief; preserved in original upload. |
| `docs/creative-workspace.md` | Superseded development report or brief; preserved in original upload. |
| `docs/briefs/gameplay-refinement-request.md` | Superseded development report or brief; preserved in original upload. |
| `docs/briefs/idea-lab-request.md` | Superseded development report or brief; preserved in original upload. |
