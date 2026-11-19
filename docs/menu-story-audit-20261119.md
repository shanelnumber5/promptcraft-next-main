# Main menu, story, and narration review — November 19, 2026

This follows the November 18 navigation audit and the user's feedback on the main menu. Work stays on `chatmt-browser-test`. No AGENTS.md exists in the checkout or its parent directories.

## Where the current experience loses a new or returning user

- The main menu presents four similar text links next to a plain welcome panel. It gives the classroom and characters little presence and gives optional tools the same prominence as starting an activity.
- Selecting Guided Scenario after reaching the studio redirects to the studio. A returning learner cannot tell how to revisit Pixel and Maya's classroom. The content still exists, but the entry path hides it.
- Dialogue has no spoken-audio implementation. Calling Pixel a narrator does not provide audio.
- Several secondary labels, status messages, and rubric cells use 14–15 pixel text. They fall below the requested 12 point minimum.
- Cream backgrounds and white panels dominate the studio. Navigation is quieter, but the overall experience loses much of its classroom identity.

## Consistent structure applied

The menu emphasizes two journeys: a gold Guided Scenario link and a sky-blue Creative Workspace link on navy. Saved work is a separate continuation link; Idea Lab and Course Guide are quieter supporting links. Existing Maya, Pixel, and classroom artwork establish the setting. At narrow widths, the journey choices precede the longer introduction so the menu remains useful before scrolling through the artwork. The published-site QR moves to About, with its destination explicitly identified.

Both design routes retain the shared Explore / Build / Review stage navigation, secondary section chooser, task heading, scrolling work surface, and bottom Back / Continue row. Sky blue replaces the cream surroundings; navy supplies readable text and gold identifies the active stage and action area. Georgia remains the heading family; body text and controls use Arial. Authored interface and guide text is at least 16 CSS pixels (12 points). The contrast audit continues to require 7:1 for ordinary text.

The guided story has a visible identity and optional Read aloud / Stop narration / Read again controls. Audio follows the current dialogue, smartboard, and selected-answer feedback. Opening and completion share the audio engine and controls. The speech content comes from the authored scenario; device speech playback is separate from content and persistence. Narration starts only after the learner opts in. Changing screens cancels stale speech; leaving the page stops it. Errors keep the text available and display an explanation.

Returning learners can replay the classroom or return directly to their saved activity. Replay uses temporary story state and does not rewrite the scenario save, studio extras, independent Workspace, or approval. The existing Continue link still resumes the saved task. A story link is also available under the scenario's Project tools.

## Verification

- Unit checks cover the entire replay for in-progress and approved/completed designs, comparing saved records byte for byte. Speech tests cover authored dialogue, all choice feedback, smartboards, cancellation, stale callbacks, unavailable speech, and errors.
- Browser checks cover keyboard menu entry and narration, all seven replay steps, both save states, and completion narration at desktop, 390 pixels, 320 pixels, and landscape. Browser speech is mocked to inspect the exact content and lifecycle. The headless Chrome run exposes the API but reports no device voices; audible output and voice quality have not been verified by listening.
- The shared-route journeys cover both studios at desktop, tablet, and two phone widths, including entered work, approval, completion, guide-library resume, and real HTML and Canvas CSV downloads. Downloaded scenario guides include the illustrated lemonade example and teaching guidance. Every preview section matches its exported section, and downloaded guides open offline at desktop and phone widths.
- A broad visual inventory covers public topics, all seven story scenes and choice states, studio screens, dialogs, completion, and Idea Lab at six viewport sizes. Text-size checking was added alongside contrast and geometry checks. Manual screenshot inspection caught a cramped mobile introduction and inherited menu row sizing; those are checked explicitly in the final pass.

The browser fixtures mock AI responses; live AI quality is outside these checks. Production has not been merged or deployed.

Final results: 25 offline suites and static-server checks pass. The six-size inventory contains 774 captures with no reported layout, text-size, or contrast failures. A further 129 landscape captures pass after removing the classroom's horizontal scrollbar. Screenshots and reports are in ignored `artifacts/identity-final-audit` and `artifacts/identity-landscape-final`; actual downloaded guides and CSVs are in `artifacts/identity-route-verification/downloads`. Narration and replay screenshots are in `artifacts/story-audio-verification`.

Implementation references: [browser speech](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) and [W3C contrast and point/pixel guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
