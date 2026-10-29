# Where to make changes

Run the app through the local static server (`npm start` or the Windows launcher). Opening `index.html` directly does not provide the module-serving environment. Use this map to edit the current source.

| Change                                                      | File                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| Opening story, questions, and expressions                   | `src/features/opening/content.js`                           |
| Classroom, smartboard, cast, and speech bubbles             | `src/features/opening/screen.js`                            |
| Teacher setup questions and example assignment              | `src/features/setup/content.js`                             |
| Setup steps and editable summary                            | `src/features/setup/screen.js`                              |
| Reusable form fields                                        | `src/shared/form-fields.js`                                 |
| Design steps, starter exchanges, and approval rules         | `src/features/design/content.js`                            |
| Design forms and before/after review                        | `src/features/design/screen.js`                             |
| Final assignment checks and guide actions                   | `src/features/design/final-check.js`                        |
| Clarification and suggested-direction interface             | `src/features/design/conversation-view.js`                  |
| Conversation lifecycle and stale-response protection        | `src/features/design/controller.js`                         |
| Existing endpoint, request/response adapter, Dev simulation | `src/features/design/babbage-client.js`                     |
| Instructions sent to Babbage                                | `src/features/design/babbage-prompt.js`                     |
| Maya's grounded student prompt and optional reading dialog | `src/features/design/maya-client.js`, `maya-dialog.js`      |
| Loading status and mechanical illustration                  | `src/features/design/loading.js`, `loading-illustration.js` |
| Guide content and HTML download                             | `src/features/design/guide.js`                              |
| Guide modal and its focus handling                          | `src/features/design/guide-preview.js`                      |
| Self-contained guide styles                                 | `src/features/design/guide-styles.js`                       |
| Professor Pixel's closing recap                             | `src/features/design/closing.js`                            |
| App navigation, field edits, and user actions               | `src/app/app.js`                                            |
| Saved progress, validation, and restoration                 | `src/app/storage.js`                                        |
| Entry routing and Home choices                             | `src/app/entry.js`, `src/features/entry/screen.js`            |
| Illustrative Idea Lab catalog, search, and details          | `src/features/idea-lab/ideas.js`, `screen.js`                 |
| Private assignment workspace and isolated persistence      | `src/features/workspace/controller.js`, `screen.js`, `storage.js` |
| Workspace-specific Babbage prompt                          | `src/features/workspace/prompt.js`                          |
| Safe text and assignment formatting                         | `src/shared/html.js`, `directions.js`                       |
| Lemonade illustrations                                      | `src/shared/lemonade-visuals.js`                            |
| Local static hosting                                        | `server/index.js`                                           |
| Windows launcher                                            | `start-local.cmd`                                           |

## Styles

`src/styles/styles.css` imports these files in order. Keep that order: later feature and layout rules refine the shared defaults.

| File            | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `base.css`      | Brand tokens, typography, shared controls, initial component defaults |
| `classroom.css` | Classroom stage, character framing, dialogue, story controls          |
| `setup.css`     | Setup and summary layout, scrolling on smaller displays               |
| `design.css`    | Drafts, comparisons, Babbage workspace, guide viewer                  |
| `finishing.css` | Final visual hierarchy, closing scene, background, loading animation  |

The guide embeds its own styles because downloads must work offline.

`idea-lab.css` owns the `.lab-*` Idea Lab browser and detail layout. `workflow-nav.css` owns the focused Workspace frame, navigation, fields, and gold footer. `workspace.css` is not imported by the entry stylesheet and should not receive new fixes. The workspace reuses the design editor, AI controller/panel, Maya dialog, final checks, and guide exporter. Its state wrapper is separate from the original guided save. `docs/briefs/` preserves the original requests; `docs/idea-lab-implementation.md` records architecture, sharing plans, research boundaries, and actual validation results.

`responsive.css` controls the phone classroom layout, with one portrait beside the dialogue and reachable navigation. The currently imported classroom and portrait styles handle tablet layouts: portrait tablets show a landscape-shaped board with dialogue above the current speaker, while landscape tablets and Nest Hub displays use the desktop arrangement with the board between Maya and Pixel. Tablet opening scenes keep their questions and navigation within the viewport.

## Assets and supporting files

- `docs/characters/maya.md`: approved Maya identity and dialogue rules; consult before changing her portrayal or implementing conversational feedback.
- `assets/backgrounds/classroom.png`: active wide classroom background.
- `assets/characters/maya/`, `assets/characters/pixel/`: used character expressions.
- `assets/brand/babbage-mark.svg`: PromptCraft emblem, including the offline guide.
- `tests/unit/`: state, adapter, server, and repository checks.
- `tests/browser/`: mocked browser flow and responsive checks.
- `tests/manual/`: explicitly enabled live-service check.
- `docs/`: current editing and provenance notes.
- `artifacts/`: ignored, disposable browser outputs.

Windows currently locks part of the retired `qa-design/browser-profile` folder. It is ignored, hidden in the editor, and unused by the app and tests. The unlocked contents were removed during cleanup; the remainder can be deleted after Windows releases it.

No build output, retired local AI provider, legacy Playwright suite, or private environment template is required. The deployed Babbage backend and its key remain outside this repository.

## Current maintenance boundaries (2026-10-29)

- `src/shared/purposeful-redesign.js`: shared creative-redesign and clarification expectations. Scenario 1 and Workspace retain their separate prompts and the existing response envelope.
- `src/features/design/controller.js`: shared asynchronous AI work. Each completion must still own the active request before changing state or UI.
- `src/features/workspace/draft.js`: applies a suggested draft, preserves a nonempty predecessor, records the starting directions, and invalidates final approval. Navigation and review sequencing remain in the Workspace controller.
- `src/shared/directions-editor.js`: rich-text rendering and text serialization, shared by Scenario 1 and Workspace.
- `src/features/idea-lab/adapt.js`: switches inspiration without replacing authored directions; invalidates old AI context and approval.
- `src/features/idea-lab/layout.js`: measures the browser frame so content scrolls above the gold footer.
- Workspace storage remains `promptcraft_assignment_workspace_v1`; Scenario 1 storage remains separate. No migration is part of this audit.

## Verification

`npm run test:unit` runs the offline unit suites, with accidental global `fetch` calls blocked unless a test explicitly installs its own fixture. `npm test` runs those suites and the separate local static-server suite. Browser suites require a supported Chrome installation; source updates to those checks are not evidence that browser verification passed. Live AI output quality is a separate validation task.
