# Menu and typography follow-up — November 19, 2026

Rechecked the supplied mockup against the current Home at widths from 320 to 1920 pixels. At 1920 pixels, the word “teaching.” breaks across two lines. The inherited home shell stops growing at approximately 1280 pixels while the headline keeps growing with the viewport. Its inherited `overflow-wrap: anywhere` permits the final letters to split. The same capped shell leaves large empty outer margins on wide screens.

The public navigation also differs from the reference: a floating three-group dropdown replaces its horizontal desktop navigation and full-width mobile page chooser. Underline styles remain on hover, saved-work links, and current navigation. The navy introduction has no explicit cue that the gold destination index continues below it.

Apply one public navigation row on desktop and one labelled full-width native page chooser on narrow screens. Keep activity-specific menus in the studios. Remove capped outer shells, keep words intact, and give the four open destination rows a single rectangular button each. Add a visible “Choose your path” control and scroll guidance inside the introduction. Replace link underlines with button treatments and selected navigation fields while preserving focus rings, authored content, saved work, audio, and downloads. The source mockup is a visual reference; its text is not an instruction source.

## Implemented and verified

The public header now follows the reference's desktop row and phone chooser. Desktop navigation uses rectangular controls, without underlined hyperlinks. The current page has a gold selection field. The chooser announces the current page, supports native keyboard interaction, and reuses the existing information-page navigation and focus handling. Studio menus remain grouped, open across the available screen width, and retain Escape, outside-click, and focus restoration.

Home has a visible “Choose your path” button and “Scroll down for all four options” message before its introduction. The button scrolls to the destination index and moves keyboard focus there. Each destination has a single navy action button; large titles are no longer hyperlinks. Saved work has its own compact resume button. Ordinary link underlines are removed from the app and guides; retained reference and download links have button treatments.

The home shell and workspace panel no longer cap their outer width. Georgia headings wrap between words, with the Home headline's two words kept intact. Home typography now has one owner in `entry.css`. Reading measures within the open page remain limited where appropriate. The studio retains its shared side margin and one action-footer rule.

The reported word geometry is checked from 320 through 2560 pixels, including 1920, where the failure was reproduced. Eight viewport configurations verify the visible scroll cue, jump focus, all four destination buttons, desktop/mobile public navigation, full-width task menus, and preserved saved work. The full inventory contains 774 captures at six sizes with no reported layout, minimum-text-size, contrast, or framed-reading-surface failures. Four-size accessibility and narration/replay checks pass. Both complete design journeys, every guide section, actual HTML and Canvas CSV downloads, offline phone guides, library reads, and correct resume routes are verified. The 25 offline suites pass. Narration output and AI use test fixtures; automated speech checks do not verify audible voice quality.

Evidence is in ignored `artifacts/menu-refinement-*` directories. This follow-up remains on `chatmt-browser-test` and the unmerged preview PR #4.
