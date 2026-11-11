# Screen and responsiveness review

Reviewed November 10, 2026, in headless Chrome, with screenshot inspection of desktop and phone layouts and automated checks across six viewport sizes.

## Changes

- Narrow studio screens use a labeled native section dropdown that displays the current Build or Review section. Desktop sidebars remain available. Selection preserves focus and supports keyboard navigation.
- Explore, Build, Review, and Options fit on one phone row. Smaller headings and hidden empty status rows leave more room for the current task.
- Both story speakers use a full-width dialogue panel on phones. Smaller portraits and shorter bottom navigation retain readable text and usable action targets.
- Story progress text and disabled forward buttons meet the existing contrast targets. Loading messages remain white on their navy background, including when nested in studio views.
- Reading dialogs keep Back and Next together within the dialog. Long readings scroll in the stage instead of pushing the actions out of view. Close buttons keep their labels intact, and idle/error cards use their content height.
- Public information pages and Idea Lab use more compact phone headers. Idea detail headings separate the learning category from the title, avoiding oversized combined headings on narrow screens.
- Added a repeatable screen inventory and more Idea Lab screenshots. The inventory waits for images and dialog cleanup, records layout/contrast issues for all captured screens, and fails after writing the complete audit if any screen fails.

## Coverage

| Viewport   | Purpose              |
| ---------- | -------------------- |
| 1280 × 800 | Desktop              |
| 820 × 1024 | Tablet               |
| 390 × 844  | Phone                |
| 320 × 568  | Small phone          |
| 1280 × 600 | Short desktop window |
| 844 × 390  | Landscape window     |

The screen inventory captures 111 states at each size: 666 screenshots, with no layout or contrast failures in the completed run. Coverage includes Home, every information topic, all seven story scenes in dialogue/board states, every question and answer variant, studio utility views, saved ideas and idea subsections, loading/unavailable/question/suggestion states, editable teaching-note proposals, review errors, approved checks, closing pages, guide preview, reading/character dialogs, references, reset, empty/saved Course Guide, both Idea Lab gallery pages, empty search results, and all 12 idea details.

The complementary interactive suites cover both studio routes' six Build sections and five Review sections, section selection, editor controls, keyboard focus, stable action bars, Idea Lab filtering/paging/adaptation, public-page navigation, skip links, and dialog Escape/focus restoration. They run at the existing desktop, tablet, phone, and small-phone sizes; Idea Lab also covers a short desktop window.

Checks passed:

- `npm test`: 16 offline unit suites and static-server checks.
- `npm run test:browser`: Scenario and Creative Workspace interactions and layouts.
- `npm run test:accessibility`: public routes, references/reset dialogs, names and focus.
- `npm run test:lab`: Idea Lab interactions and screenshots at five sizes.
- `npm run test:screens`: the expanded screen inventory at six sizes.

The latest screenshots, per-screen contrast records, and JSON audits are under the ignored `artifacts/responsive-review-20261110/` directory. `PC_BROWSER_OUTPUT` selects another output directory; `PC_BROWSER_DEVICE` can restrict the expanded inventory to comma-separated names from `desktop`, `tablet`, `phone`, `small-phone`, `short-desktop`, and `landscape`.

The screenshot inventory uses fixture states; the route suites exercise actual interactions. All browser AI requests use local mocked responses. Chrome testing does not establish behavior in other browser engines, on physical touch devices, with screen readers, or with arbitrary live AI responses. Existing save formats and activity content are preserved.
