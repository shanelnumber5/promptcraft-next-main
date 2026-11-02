# Responsiveness, accessibility and refactor review

Reviewed November 1, 2026.

## Changes

- Extracted information-page navigation and Idea Lab interaction handling from the application entry point into feature controllers.
- Shared viewport measurement now reserves actual application bottom margins and padding. This fixes the extra desktop scrollbar rather than hiding overflowing content.
- Studio frames retain usable space on short screens; the document can scroll when headings and navigation need more room. Action labels remain on one line inside the existing horizontally scrollable action bar.
- Short-phone Idea Lab layouts retain a bounded, readable card/detail area instead of collapsing the cards underneath filters.
- Information-page navigation updates the document title and focuses the new heading. Other routes receive descriptive document titles on mount.
- Shared native-dialog lifecycle handles removal and return focus for references, restart confirmation and guide preview. Native dialog keyboard containment and Escape behavior are preserved.
- Fixed save-status contrast on gold action bars and the mobile information-topic label on its dark sidebar.
- Removed the retired teacher-intake stylesheet and its scoped rules in setup and studio styles. No current JavaScript renderer emits its root class.
- Removed unused prompt-version constants, the retired reading-pagination helper, its event handler and transient state, and unused entry variables. Full-text reading remains covered by tests. Saved-project schemas and migration code remain intact.

## Verification

- All 15 offline unit suites and static-server checks.
- Both studio routes: six Build sections, five Review sections, Explore and Options at 1280×800, 820×1024, 390×844 and 320×568. Includes layout overflow, clipped buttons, labels, ARIA references, accessible names, keyboard focus, action placement and rendered contrast.
- Idea Lab: search, categories, pagination, detail navigation, empty results and adaptation without replacing the authored draft at five desktop, tablet and phone sizes.
- Added `npm run test:accessibility`: Home, four information pages, Course Guide, Idea Lab and the opening scenario at four sizes, plus dialog Escape/focus restoration, skip-link destinations and information navigation. Uses the existing rendered-contrast checks.
- Browser assertions compare footer positions in document coordinates when the page can scroll, so legitimate focus scrolling does not cause false failures. Browser protocol commands now time out instead of hanging indefinitely, and report JavaScript exception details.

Automated Chrome checks are regression coverage, not a WCAG conformance certification. Screen-reader testing, other browser engines and live AI response quality were not evaluated. Browser AI requests use local fixtures.
