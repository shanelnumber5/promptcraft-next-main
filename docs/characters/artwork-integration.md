# Character artwork integration

The October 20 guide supersedes earlier artwork descriptions. The supplied realistic portraits were inspected individually before use. The active catalog is `src/shared/character-art.js`; it separates the two identities and keeps the actual supplied filenames.

| Character | Available file | Visually observed use |
| --- | --- | --- |
| Maya | `maya_neutral.png` | Calm, attentive listening |
| Maya | `maya_explaining.png` | Direct explanation, open hand gesture |
| Maya | `maya_friendly.png` | Open, welcoming stance and subtle smile |
| Maya | `maya_skeptical.png` | Questioning expression |
| Pixel | `pixel_neutral.png` | Attentive, composed guide |
| Pixel | `pixel_explaining.png` | Explaining, open hand gesture |
| Pixel | `pixel_thoughtful.png` | Reflective, hand at chin |
| Pixel | `pixel_warm.png` | Warm, composed welcome |
| Pixel | `pixel_confident.png` | Assured explanation, inviting gesture |
| Pixel | `pixel_pleasant.png` | Warm smile and open welcome |
| Pixel | `pixel_skeptical.png` | Questioning an assumption |
| Pixel | `pixel_frustrated.png` | Concerned expression |
| Pixel | `pixel_surprised.png` | Curious surprise |
| Pixel | `pixel_amused.png` | Friendly humor |

These files have the specified 832 × 1177 PNG canvases. The image-format check verifies transparent outer edges and visible character pixels. Maya retains the ponytail, striped turtleneck, tied denim shirt, and beige pants. Pixel retains her layered hair, glasses, gray blazer, blue shirt, and jeans. No images were generated, repainted, renamed, mirrored, or reassigned.

The six additional Maya expressions and six additional Pixel expressions were supplied and visually inspected on October 21. The catalog now contains twenty poses. Maya’s confident, pleased, frustrated, thoughtful, surprised, and amused artwork is available under the matching expression names. Do not create emotional changes from guessed AI sentiment or apply criticism automatically to educator choices.

Home, topic portraits, the guided opening, Pixel's design guidance and recap, and Maya's reading dialog use the same catalog. Maya listens neutrally while a reading is requested and uses the explaining pose for an actual or cached simulated response. Excerpt previews remain neutral. Existing opening dialogue and AI request contracts remain unchanged; the current Maya prompt already supports appreciation, reconsideration, actual revisions, and educator choice.

Earlier `maya/neutral.png`, `maya/confident.png`, and Pixel's `listening.png`, `thinking.png`, and `encouraging.png` are inactive references and must not be rendered. They may be retained separately or removed from the checkout; repository checks enforce that they do not become active again. The historical Charles Babbage portrait is also retained as a reference; the computer represents Babbage in the menus.

Validation: all seven unit suites pass, including the PNG format/transparency/placement checks and retained-reference enforcement. Mocked menu/workspace browser checks pass at desktop, tablet, and phone sizes. The full guided scenario-to-guide browser flow passes on short desktop, tablet, and phone, including Maya responses, revision, save/resume, and reset. The updated Home and guided speaker screenshots were visually reviewed. No live AI call or deployment was made.

## Closer portrait framing

The owner approved waist-up presentation for narrative sections and main menus. `src/styles/portrait-framing.css` crops the displayed portraits inside stable frames, making faces and upper bodies larger without editing the original full-body PNGs. Home, character topics, narrative speakers, and Maya’s dialog use closer framing. Person captions, text areas, and menu heights keep their existing space; engine, classroom, logo, and QR images retain their original framing.

## Home placement and authored expressions

The QR code now sits beside the introduction, separate from the full-width character area below. The display framing gives each character room for their gesture while preserving the common menu height. Home uses Pixel’s pleasant pose and Maya’s explaining pose. In the scripted scenario Pixel is confident when explaining, skeptical when testing an assumption, thoughtful when considering the peer question, and pleasant at the transfer/closing. Maya uses skepticism for the authored account of a repetitive forum and a friendly pose when describing the useful exchange. These authored choices do not infer emotion from educator answers or live AI text. Unmatched surprised, concerned, or amused poses remain available without being forced into unsuitable dialogue.


## Expanded topic screens

How to Play, About PromptCraft, Meet the Characters, and Privacy & Progress now provide practical explanations in short, separate topics. Desktop artwork has a wider column. The newly supplied transparent `assets/people/babbage-engine.png` replaces the earlier photograph; a display frame removes excess canvas margins while preserving the machinery. Menu heights and saved progress remain unchanged.


## Maya and Pixel draft dialogue

The optional Maya reading in both paths now opens a classroom visual novel with large waist-up portraits, short dialogue beats, Back/Next, and return to the unchanged draft. Maya reacts to the actual current directions first; Pixel follows with a distinct explanation of the teaching implications. The existing scenario1 endpoint and outer response schema are unchanged. Its feedback_summary string carries a validated version-1 scene with Maya/Pixels text and allow-listed expressions. Both turns must quote the current revised directions. No text sentiment heuristic or inferred score drives the artwork. Older plain responses remain readable with neutral Maya and no invented Pixel response.

Re-reading includes up to two prior session readings. Changing the assignment invalidates cached context. Requests can be canceled, errors do not produce pretend dialogue, and excerpt preview sends no AI request. Dialogue uses textContent, not response HTML. No new saved fields or research logging were added. Model-generated pedagogical interpretations remain suggestions for the educator to assess.

Validation of the dialogue update: all seven unit suites pass. Menu/workspace dialogue checks pass on short desktop, tablet, and phone, including Maya-to-Pixel transitions, expression selection, Back, and return-to-draft focus without extra requests. Full guided flow checks pass on short desktop and phone, including cached and revised readings, cancellation, service errors, unchanged saves, and guide export. AI responses were mocked; live emotional and pedagogical quality has not been established. No deployment was performed.
