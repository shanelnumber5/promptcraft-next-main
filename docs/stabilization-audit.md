# PromptCraft stabilization audit

Date: October 28, 2026

## Scope and starting state

No AGENTS.md was found in the repository or checked parent directories. The repository already had uncommitted navigation, Workspace, stylesheet, and JSON transport changes. Those changes were preserved and integrated; no saved-state keys, storage schemas, backend endpoints, or provider settings were changed.

This is a source cleanup and regression repair, with no new product feature or additional CSS override layer. Apply the ZIP over the existing repository root; it is a changes-only package, not a standalone application.

## Stylesheet audit and ownership

The entry stylesheet previously loaded base and feature CSS followed by interface-consistency.css, visual-hierarchy.css, studio-consistency.css, typography.css containing layout patches, and workflow-nav.css containing unrelated feature/theme patches. The same header, controls, selected states, palette variables, dialogue dimensions, and Workspace geometry were repeatedly redefined.

- base.css owns the River Otter palette, shared variables, foundational controls, placeholders, high-contrast checkbox/radio states, focus defaults, and application chrome.
- typography.css owns type roles. Layout and palette declarations were returned to their components.
- workspace.css owns Creative Workspace exploration, Build, Review, component states, and responsive sizing. 232 Workspace-related rule blocks were moved out of the gallery stylesheet.
- design.css, guided-design.css, maya.css, scene-focus.css, navigation.css, setup.css, and info.css own their relevant dialogue, navigation, form, and reader states.
- workflow-nav.css owns shortcut navigation rather than unrelated feature colors or selected states.
- styles.css no longer imports the three consistency/hierarchy patch sheets. Their files contain retirement notes so a changes-only ZIP can replace them without a deletion step.

The consolidation removed 245 shadowed exact-property declarations and 14 redundant gallery-owned header rules and rejoined adjacent selectors sharing identical declarations. Responsive conditions and component-specific layouts remain explicit. The unused tablet-classroom.css remains unimported; its type declarations also respect the new minimum.

## Palette and contrast

Brand tokens are Navy #1E2D59, Sky #63BBF2, Gold #D98F06, and Light gray #F2F2F2. Supporting near-black #111111 is used on gold and sky; white is used on navy. Navy on gold is only about 5:1 and was replaced where it was used for text. Muted labels, placeholders, disabled labels, header hover states, sidebar selections, and action-bar helper text were corrected at their owning declarations.

Control borders use a supporting dark tone, and checkbox/radio visuals explicitly retain a dark outline when disabled. Checked state retains the native HTML semantics and keyboard behavior. Forced-colors mode restores native appearance. Both downloaded HTML guide styles and the app use the River Otter colors and readable text selection.

Computed browser audits require 7:1 for visible text, inputs, placeholders, and selection; meaningful control edges require 4:1. Alpha backgrounds are composited through ancestors. Image/gradient backgrounds are reported for manual review rather than assumed to pass. The audit exercises normal, selected, hover/focus, and disabled states and records JSON alongside screenshots in temporary folders.

## Phase 1 exploration failure

The unchanged unit assertion "Initial exploration uses the creative workflow" failed when a saved draft and old clarification questions existed without any creative direction. Both the renderer and controller had treated a nonempty draft as evidence that initial exploration was complete.

A shared needsInitialExploration predicate now bases that decision on actual generated/saved possibilities and a chosen direction. Existing drafts remain untouched. The original failing assertion is retained, with added checks that saved drafts do not skip exploration and existing possibilities or a chosen direction do not restart it.

The draft-help control remains available after choosing a direction. Initial exploration cannot bypass Phase 1 through a duplicate draft-help action. The AI request format, cancellation, stale-response checks, quote repair, error handling, and approval boundaries are preserved.

Older browser checks referenced removed section selectors, the earlier clarification-first route, obsolete Review options, and an earlier guide heading. Their navigation now follows the current controls and explicitly exercises Phase 1 before the existing drafting checks. Assertions for stable panel/action placement, keyboard access, saved-state isolation, combinations, approval, draft ownership, guide content/download, and recovery remain. Guide checks additionally verify the selected possibility and the educator's actual final edit.

## Verification

The local static app was started at http://127.0.0.1:3080. Chrome regression tests serve the same repository files locally on port 8783 with mocked AI responses, using isolated temporary Chrome profiles and screenshot directories.

Verified results:

- `npm test`: all nine unit suites passed, including the original exploration regression and additional saved-draft/chosen-direction coverage.
- Scenario 1: full desktop (1440×1000) and phone (390×844) flow passed with strict contrast, including automatic Maya, quote repair, Babbage accept/adapt/reject, guide download, resume, and reset.
- Creative Workspace Phase 1: desktop (1280×720), phone (390×844), and small phone (320×568) passed. Stable Build/Review actions, combinations, saved possibilities, approval without Maya, corrupt records, and save failures remain covered.
- Idea Lab integration: all five widths (1440, 1280, 768, 390, 320) passed, including adaptations through Phase 1 into drafting, optional student feedback, export, resume/reset, and storage recovery. The short-phone preview check traverses its real reading pages to verify the exact typed text rather than assuming it is on page one.
- Teacher setup: all seven widths (1693, 1440, 1280, 932, 820, 390, 320) passed, with five setup and five summary sections each. Desktop learning-goal summaries retain a full-width main field and place optional guidance fields beside each other. The compact summary keeps its uncertainty control, full help text, and programmatic heading.
- Home, Workspace, Scenario 1, Babbage, Maya, and Course Guide were visually inspected in captured Chrome views at desktop and phone widths. The dedicated state audit also covers hover/focus, selected, disabled, and text-selection colors.
- `git diff --check` passed. Source/module references, character assets, static-host protections, and existing request/storage contracts remain covered by the unit suite.

The dedicated six-area state audit checked 66 screens/states and 1800 computed samples, including text selection, with no computed failures; its lowest measured text contrast was approximately 7.09:1 and its lowest meaningful control-edge contrast was approximately 5.01:1. Screenshot and JSON evidence are generated in the temporary directory printed by each test. Generated outputs are excluded from the changes-only ZIP.

Reproduction:

```powershell
npm test
$env:PC_CONTRAST_AUDIT = '1'
$env:PC_CONTRAST_STRICT = '1'
$env:PC_BROWSER_DEVICE = 'desktop,phone'
npm run test:browser
Remove-Item Env:PC_BROWSER_DEVICE
npm run test:creative
npm run test:lab
node tests/browser/setup.test.cjs
npm run test:stabilization
```

## Limits

Live provider quality, rate limits, and credentials were not exercised; AI regressions use the existing mocked service contract. Computed checks cover the rendered states and viewports exercised by the tests, not every possible user-authored document, browser, operating-system high-contrast theme, or image pixel. Very short phone screens intentionally scroll vertically rather than collapse the editor. No deployment or GitHub submission is part of this ZIP delivery.


## Typography and stable menus follow-up (October 28)

Raised source font declarations to at least 16 CSS pixels (12 points), including help text, controls, disabled text, mobile states, and exported guide styles. Headings have a larger computed size than surrounding body text. Maya's title is larger than her dialogue. Mobile Workspace titles and fixed-height button line spacing were adjusted so larger type remains usable.

Main menu pages share one frame height at each viewport. Switching tabs or topics keeps the gold footer at the same vertical position (within one CSS pixel in browser checks). Long pages scroll within the frame. The mobile Home grid uses content-sized rows so its introduction and choices cannot overlap. Source frame geometry lives in info.css; the old per-topic height probing was replaced with shared frame measurement. No new global override stylesheet was added.

Setup keeps its full-width primary learning field, gives the form more desktop width, and uses concise optional-reference guidance retaining the source text, grade/subject, course outcome, and blank-field instructions. Very narrow screens retain readable text and vertical scrolling.

Added computed typography and stable-menu browser checks, including a Home overlap assertion. Reproduction: `node tests/browser/type-menu.test.cjs`. The six-area stabilization audit also checks minimum text sizes and heading/body size relationships.

Latest verification: all nine unit suites passed; Scenario 1 desktop/phone passed with strict contrast auditing; Creative Phase 1 passed at 1280, 390, and 320 pixels; setup passed seven viewport sizes; main menu type/height/overlap checks passed four sizes. The six-area audit covered 66 states and 1,806 contrast samples with no failures: minimum sampled text/selection 7.087:1 and meaningful control edges 5.005:1. Screenshot review included Home, Workspace, Scenario 1, Babbage, Maya, and Course Guide at desktop and phone widths. AI calls remain mocked.

Final Idea Lab regression: passed at all five sizes (1440, 1280, 768, 390, and 320 pixels), including Home frame containment, filters, separate saved work, Babbage/Maya, approval/export, keyboard access, and failure recovery. Final main-menu checks passed after correcting the mobile variable load order. No existing test assertions were weakened.

## Uniform button shape

All button and button-style link corner declarations now reference the shared `--button-radius: 3px` token in base.css. The source changes replace pill, square, and mixed-radius button styles rather than adding a late override layer. Dimensions, labels, colors, and behavior are preserved. Nine unit suites passed. Main-menu checks passed four viewport sizes; six-area browser checks passed at desktop and phone sizes, verifying all four computed button corners in normal, hover/focus, and disabled states alongside typography and strict contrast checks.


## Workspace bottom action bar

The Explore welcome content now fills available space instead of leaving space beneath its action bar. Possibility and clarification actions render in a footer outside scrolling content. Idea detail, combine, preference, earlier-draft, and Maya utility actions share their bottom footer with the return control; connection actions likewise share the utility footer. Buttons and event attributes retain their existing behavior. Loading states retain the footer. Long content scrolls above it.

The Creative browser regression now checks each captured gold bar against the Workspace panel bottom (under two CSS pixels tolerance), in addition to the existing stable Build/Review geometry and saved-state assertions. Screenshots were visually checked on desktop and phone.

Footer follow-up validation passed: all nine unit suites; Creative flow and bottom-position assertions at 1280, 390, and 320 pixels (including Options and AI connection); full Scenario 1 desktop/phone; six-area strict contrast, type, and button-shape checks at desktop/phone. Mocked AI only.
