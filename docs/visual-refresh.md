# Great Falls College visual refresh — October 19, 2026

This local presentation checkpoint refreshes Home, Babbage’s Idea Lab, activity details, and the assignment workspace. It uses bold type, river-line graphics, rounded surfaces, colorful activity illustrations, and the college’s navy, blue, and gold. Existing character artwork is reused. The guided classroom retains its established layout and interactions.

Navigation, saved-state keys and structures, AI prompts and request infrastructure, Maya’s approved profile, Course Guide generation, and research event schema are unchanged by this checkpoint. The only entry-controller change identifies the active view on the body so presentation rules can be scoped. No participant collection, external runtime asset request, or deployment is added.

## Asset provenance

- Official colors: navy `#001F5B`, blue `#0069A6`, gold `#EDAA00`, from the college’s [graphic standards, page 15](https://gfcmsu.edu/wp-content/uploads/2024/12/GFCMSU_GRAPHIC_STANDARDS.pdf).
- `assets/brand/gfc-river-otters.png`: unchanged official college River Otter logotype, downloaded from the [college website](https://www.gfcmsu.edu/wp-content/uploads/2023/09/RiverOtter_Logotype_L_RGB.png). Its transparent white lettering is displayed on solid navy with surrounding space. College artwork remains college property.
- `assets/fonts/manrope.ttf`: self-hosted variable Manrope, from [Google Fonts’ source repository](https://github.com/google/fonts/tree/main/ofl/manrope). The SIL Open Font License is preserved in `docs/asset-licenses/manrope-OFL.txt`.
- Interface icons, river curves, and activity decorations are code-native SVG in `src/shared/lab-visuals.js`; they do not alter official artwork. Decorative SVG and character portraits are hidden from assistive technology. The official college image has descriptive alternative text.

## Verification

- `npm.cmd test`: PASS, all six suites (design, Babbage, Maya, Idea Lab, server, repository).
- `node tests/browser/idea-lab.test.cjs`: PASS at desktop 1440×1000, tablet 768×1024, phone 390×844, and small phone 320×568. Covers gallery/filter/detail, adaptation, shared Babbage accept/reject, Maya, guide preview/download, separate saves, resume/reset, malformed records, quota recovery, keyboard/accessible names, sampled text contrast, and layout overflow.
- Desktop, tablet, and phone Home plus desktop workspace screenshots were visually inspected. Screenshots are local ignored artifacts under `artifacts/screenshots/design/`.
- `$env:PC_BROWSER_DEVICE='desktop,phone'; node tests/browser/design.test.cjs`: PASS for the complete guided opening-to-guide workflow, Babbage accept/adapt/reject, Maya readings and revisions, keyboard/accessible names, guide download, resume/reset, and layout checks.
- `git diff --check`: PASS, with line-ending notices only.
- Browser AI responses are mocked. No live AI-service or output-quality result is claimed; this presentation work respects the existing Netlify service pause. No hands-on screen-reader speech test or comprehensive WCAG audit was performed.

The refreshed appearance and new entry-page wording may affect engagement and path selection in comparisons across versions. Record this presentation checkpoint separately from the previously documented Babbage prompt refinements; neither requires changing the research event schema.

## Follow-up: mechanical graphics and clearer browsing

Replaced generic small interface icons with custom SVG calculating-engine modules: drive wheels, numbered-drum-style linkages, punched tape, and brass-colored housings. The workspace Babbage header uses this machine treatment instead of the raster portrait mark; guided character artwork and official college artwork remain intact. The Home aside now reads “These ideas are otterly worth a look.”

Idea Lab cards now show the activity in plain language, what students make, and when an educator might choose it. Full purposes and steps remain in the detail view. The banner is shorter, tags are limited to two per card, and the decorative card header takes less space. All 12 starters retain their original IDs and underlying assignment content.

The workspace keeps starting material, course, learning goal, and draft visible. Optional improvement/context questions are expandable, repeated editor labels are reduced visually while retaining the accessible name, and helper copy is shorter. Arial with sans-serif fallbacks replaces Manrope on these entry/workspace surfaces; heading weights and sizes are reduced. The original self-hosted Manrope asset/license remains available from the earlier checkpoint.

Fixed the reported Babbage title contrast: `.workspace-shell h2` had overridden the dark panel’s white heading. A more specific white heading rule resolves that conflict. Browser contrast checks now include the Babbage heading and run while its panel is visible.

Verification after the follow-up: `npm.cmd test` passed all six suites; `node tests/browser/idea-lab.test.cjs` passed the complete workflow at 1440×1000, 768×1024, 390×844, and 320×568; `git diff --check` passed. Final desktop gallery/card/workspace and mobile layouts were visually inspected. The browser harness now waits for local gallery images/fonts and a short paint interval before capturing the gallery and adds scrolled card screenshots. AI remains mocked. The complete guided browser suite was not rerun in this follow-up; its shared renderer retains the original non-workspace branch, and the unit suites passed. No AI prompts, save structures, research collection, or deployment changed.

## Follow-up: simpler gallery and open workspace sections

Removed the gallery’s decorative banner, repeated college mark, and second promotional heading. A single page heading and subtitle sit beside a prominent white-on-navy “Return to my assignment workspace” button; search and category controls now share a quieter divider treatment. Restored the original Babbage portrait beside PromptCraft in the application header and in the Babbage collaboration panel. Mechanical activity-card graphics remain.

The Design tab now groups the starting point and draft together, then presents open sections for Learners & timing, Requirements & AI use, and What you want to improve. Optional fields remain optional. No workspace fields, earlier drafts, or conversation history use disclosure menus. All field IDs, input handlers, saved values, and existing workspace tabs remain compatible; no save migration is needed.

Validation: all six unit suites passed; four-layout Idea Lab/workspace browser checks passed (1440×1000, 768×1024, 390×844, 320×568), including explicit assertions that Design, archived drafts, and Babbage have no disclosure menus. The checks exercise the visible context fields, Babbage accept/reject, Maya, guide approval/export, isolated saves, resume/reset, accessibility names, sampled contrast, and overflow. AI remains mocked; no live-service quality check or deployment was performed. The full guided browser suite was not rerun for this presentation change. Gallery and workspace screenshots are under the same ignored local artifacts directory.
