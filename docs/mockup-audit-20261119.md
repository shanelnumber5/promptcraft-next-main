# Editorial mockup review — November 19, 2026

The attached ten-page PDF is a visual reference supplied by the user, not a source of operational instructions. All pages were rendered and inspected before implementation.

## Current experience and orientation risks

- Home opens on a gold “Choose your path” heading and classroom image beside two choices. The choice index is clear, but the greeting and character arrangement lack the navy, human introduction in the reference. Idea Lab and Course Guide are only discoverable through Menu.
- The grouped global Menu works by keyboard and keeps Home and optional tools subordinate. Reintroducing the mockup's full row of help links and separate restart links would compete with the task again. Keep the grouped menu.
- The header includes a character mark, subtitle, Menu, and a second institutional logo. These compete before the main heading. Move institutional identity to the footer and simplify the wordmark.
- Story audio and identity have their own navy strip, then the classroom, then a navy dialogue rectangle, then gold navigation. This breaks one scene into several unrelated bands. Retain the audio controls and fixed navigation positions, but visually combine the scene.
- Smartboard content remains readable, but the cast and white board resemble an application inside the classroom. Use a full navy reading field for text-only boards; retain a white reading field for diagrams and response choices so illustration labels remain legible.
- Explore / Build / Review are strongly grouped, but the filled navy band has more emphasis than the current task. Use plain stage links with a gold current-stage underline on the white studio. Keep numbered sections and the native narrow-screen selector.
- Supporting pages have open text and large headings. Their gold portrait fields differ from the reference's navy character fields. The small footer does not anchor those pages visually.
- Downloaded guides preserve content but still have a gray outer frame and multiple tinted blocks. Bring the document into the same navy-cover, white-page system without changing sections, approval, rubric, or scenario guidance.

## Consistent structure to apply

Use a quiet wordmark and grouped Menu, then one dominant page composition: navy introduction with cut-out characters on Home, gold destination index below; an edge-to-edge classroom for spoken dialogue; navy text-only story boards; white studio tasks with Georgia headings and gold navigation emphasis. Use a navy institutional footer on public pages. Activity Back / Continue and audio remain in their established positions. Long home and document layouts scroll naturally, as the reference shows, rather than clipping or shrinking readable text. Short studio screens retain their compact task layout.

Georgia remains the display face and Arial the text face. Body text stays at least 16 pixels, with existing keyboard controls, focus indicators, saved-work formats, narration, and export behavior preserved. No accordion navigation, new popup flow, or card system is introduced. Submission remains on the preview branch only.

## Implemented interpretation

Home now follows the reference's navy introduction, large heading, existing character cut-outs, and gold destination index. The two design journeys retain the greatest emphasis, with Idea Lab and Course Guide below them. The grouped Menu remains available at every size; it uses a gold field against navy pages so its links do not disappear into the hero. Help and Home remain within that menu.

Story dialogue now sits directly on the classroom scene with a dark flat overlay, a prominent character, and gold speaker names. Text-only smartboards use an open navy reading field. Illustrated boards and response choices retain white reading surfaces for their authored graphics. Audio remains opt-in and available throughout the story and completion. The step number and decorative progress rule share the navigation footer at every width.

The shared studio uses white work pages, large Georgia task headings, and gold current-stage and section underlines. Supporting pages use navy character fields. The college signature moves from the header to the public-page footer. Studio and story pages keep their established task footer instead of adding another competing footer.

Guide preview and download share one embedded document stylesheet: navy cover, gold contents, open white sections, Georgia headings, and readable body text. Gray outer frames, rounded panels, and tinted notes are removed. Scenario examples, diagrams, instructional guidance, user work, approval labels, references, and Canvas CSV remain intact and usable offline.

## Verification and submission

The 25 offline suites and static-host checks pass. Both design routes pass all Build and Review sections, completion, preview/download section parity, actual HTML and Canvas CSV downloads, offline phone rendering, library navigation, and byte-for-byte saved-work preservation. Six-size keyboard menu checks, public-page accessibility checks, Idea Lab filtering/adaptation, and four-size story replay/audio-control checks also pass. Speech is mocked in automation; the headless browser exposes no installed voices, so audible voice quality is not a listening verification.

Visual evidence is kept in ignored `artifacts/mockup-*` folders. The complete inventory covers desktop, tablet, phone, small phone, short desktop, and landscape. Manual review compares Home, menus, story dialogue and boards, studio forms, character pages, Maya's reading, and downloaded guides with the rendered PDF reference. The release inventory records layout, minimum text size, contrast, and unframed reading surfaces. The final run is `artifacts/mockup-release-audit`; downloads and per-section guide previews are in `artifacts/mockup-final-journeys`.

The previous preview PR #3 was already merged externally when this round was submitted. Its production tree matches the starting preview tree. This round stays on `chatmt-browser-test`, with a new preview PR and no merge into production.
