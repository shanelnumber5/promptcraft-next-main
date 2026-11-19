# PromptCraft editorial visual direction — November 19, 2026

PromptCraft is a playful teaching studio where Pixel, Maya, and Babbage help educators turn familiar discussions into purposeful learning experiences.

The visual direction follows the user's references: [IDEO](https://www.ideo.com/), [Unseen](https://unseen.co/), and [Breakfast](https://wearebreakfast.com/). The interpretation uses oversized type, an exploratory numbered index, existing character cut-outs, and broad flat color fields. Reference-site assets, fonts, copy, and animations are not copied.

## Visual system

- Georgia is the display face; Arial is the plain text face. Main headlines scale fluidly up to 144 pixels, studio headings up to 64 pixels, and body text remains at least 16 pixels. Scale and weight establish hierarchy.
- The palette is navy `#1e2d59`, gold `#f3bf4b`, and white. Classroom and character artwork retains its original colors. Page fields use this small palette rather than many tinted containers.
- The page uses the full viewport width. Content has fluid side margins; imagery and color fields reach the edges. Reading measures may remain limited inside the loose grid.
- Home is an illustrated spread with a numbered text index. The studio uses plain stage and section navigation. Supporting information, Idea Lab, and the guide library share the typography and open spacing.
- Outer frames, cards, shadows, rounded panels, gradient effects, tinted feedback boxes, and decorative smartboard hardware are removed. Form affordances, selection indicators, focus rings, and semantic tables remain usable.
- Navigation is plain text. A task's primary action retains a navy fill. Existing dropdown menus use a flat navy field without a border or shadow. They remain keyboard accessible.

## Ownership and preserved behavior

`src/styles/editorial.css` owns the shared visual treatment. `entry.css` owns the full-bleed illustrated home index; `menus.css` retains the menu layout, and the shared theme supplies its appearance. Existing page and section components remain shared by both design routes.

The editorial pass changes application CSS only. Earlier changes from the preceding request consolidate scattered navigation into Menu, Activity tools, and Guide options; remove eyebrow labels and arrows; and retain predictable Back/Continue controls. The visual pass retains those interactions, authored scenario content, narration, approvals, saved-work formats, project backup/import, guide export, and AI service behavior.

The home screen and open menus fit the six audited desktop, tablet, phone, small-phone, short-desktop, and landscape viewports, including saved-work states. An unusually short narrow viewport can scroll rather than clipping readable text. Long forms and reading content retain scrolling where necessary.

## Verification

The browser inventory checks geometry, text size, contrast, and the absence of framed, rounded, or shadowed reading surfaces. Contrast checks also inspect WebKit text fill, which can differ from CSS `color`. Manual screenshots complement those checks.

Journey checks cover both studios, story replay, keyboard navigation, focus restoration, completion, and actual guide downloads. The guided download retains the illustrated scenario and teaching guidance. Browser AI and speech output use fixtures; live provider quality and audible voice quality are outside these checks.

Generated screenshots and reports are kept in ignored `artifacts/editorial-*` folders. All changes remain on the preview branch; production is not merged or deployed.

Final verification passed: 25 offline suites and static-server checks; 774 screenshots at six viewport sizes with no reported layout, text-size, contrast, or framed-surface failures; both shared design journeys and real HTML/Canvas CSV downloads; all seven story steps and saved-design replay; keyboard dropdowns and dialog focus restoration; and Idea Lab filtering, paging, details, and adaptation. Ordinary text is checked at 7:1, above the requested AA minimum. The final full inventory is in `artifacts/editorial-verified-audit`, with route downloads in `artifacts/editorial-final-routes/downloads` and focused navigation, story, accessibility, and Idea Lab evidence in the corresponding `editorial-*` folders.

## Menu structure follow-up

The global menu now separates the two design journeys, work/tools, and help into three semantic groups. The journey links carry the main visual emphasis; Home and support links stay quieter. The open menu has an explicit Close control and a navy focus outline that remains visible on the gold home page.

Explore / Build / Review sit together in a full-width navy navigation band. Numbered section choices align below it, and a single rule groups task tools and save status above Back / Continue. Information topics use a consistent numbered index. Idea Lab uses its labelled learning-focus dropdown at every width, replacing the duplicate category sidebar. These navigation rules live in `src/styles/navigation-structure.css`.

This follow-up passes 25 offline suites, static hosting checks, six-size keyboard menu checks, both design journeys and real guide downloads. Its visual inventory contains 516 captures across desktop, phone, small phone, and landscape, with no reported layout, contrast, text-size, or framed-surface failures. Evidence is in ignored `artifacts/menu-structure-*` folders. Submission uses the existing `chatmt-browser-test` preview PR; production remains outside the submission scope.
