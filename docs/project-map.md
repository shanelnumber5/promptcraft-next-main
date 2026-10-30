# Current source map

Scenario and Creative Workspace share the same studio implementation. Scenario adds Pixel’s opening story. Route-specific labels, save adapters and resets live in `src/features/workspace/routes.js`.

| Change | Source |
| --- | --- |
| Entry and information routes | `src/app/entry.js`, `src/features/entry/` |
| Opening story, scenes and handoff | `src/features/opening/` |
| Shared studio lifecycle | `src/features/workspace/controller.js` |
| Six Build pages | `src/features/workspace/screen.js` |
| Section navigation and utility views | `src/features/workspace/section-frame.js`, `views.js` |
| Explore and creative refinement | `src/features/workspace/creative.js`, `creative-view.js`, `partner-view.js` |
| Review, clarification and teaching-note proposals | `src/features/workspace/review-view.js`, `review-ai.js`, `feedback-questions.js`, `teaching-notes.js` |
| Workspace saves and portable projects | `src/features/workspace/storage.js`, `project-file.js` |
| Scenario saves and legacy restoration | `src/features/workspace/scenario-storage.js`, `src/app/storage.js` |
| Shared active Babbage instructions | `src/features/workspace/prompt.js`, `src/shared/purposeful-redesign.js` |
| AI lifecycle and service adapter | `src/features/design/controller.js`, `babbage-client.js` |
| Maya reading and dialogue | `src/features/design/maya-client.js`, `maya-dialog.js` |
| Rich-text editor and directions rendering | `src/shared/directions-editor.js`, `directions.js` |
| Guide export and preview | `src/features/design/guide.js`, `guide-styles.js`, `guide-preview.js` |
| Pixel recap and spoken closing | `src/features/design/closing.js` |
| Field definitions and approval rules | `src/features/setup/content.js`, `src/features/design/content.js` |
| Stylesheet entry and cascade order | `src/styles/styles.css` |
| Current browser harness | `tests/browser/browser-harness.cjs` |

## Compatibility

Keep existing storage keys, saved fields and the scenario1 request envelope. `panels.js` still validates old saved panel names and supports the shared next-action helper. Starter text in `content.js` is still used to recognize and safely clean repeated legacy starter exchanges. The fallback Babbage prompt supports states without workspace metadata. These are active compatibility dependencies.

The stylesheet layers still include shared rules accumulated across development. Only rules proven to require removed screen containers were pruned. `guided-design.css` retains shared document, loading and conversation rules despite its historical filename. Do not remove a mixed stylesheet based on its name.

## Verification

The architecture suite follows static and lazy imports, checks every app module and stylesheet is reachable, and verifies relative test helpers exist. Repository tests reject unused assets and missing references. Other offline suites cover saved-state restoration, independent routes, project import/export, request ownership, cancellation, stale feedback and guide rendering.

Browser fixtures cover current shared routes and Idea Lab with mocked AI. A syntax check does not establish visual correctness. No live AI call is necessary for repository cleanup.
