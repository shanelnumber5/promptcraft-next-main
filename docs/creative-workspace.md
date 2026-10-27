# Creative Workspace implementation

The discussion-focused workspace now offers Explore, Build, and Review. Build sections are optional destinations rather than a required intake sequence. Scenario 1 remains a separate guided path.

## Direct task views

Workspace menus use direct views rather than accordions. Build opens one section at a time. Idea details, combinations, saved ideas, connection settings, student perspectives, and activity previews have their own views with a return control. Preview navigation restores the opener's focus and text selection. Long reading content is divided into sections; the editable draft retains its full text.

The short opening, idea list, and creative-core tasks fit the tested desktop and standard phone viewports. Small screens and longer user content can still scroll naturally; content is never clipped to enforce a fixed height.

## Creative exploration

After entering starting material and a working learning goal, educators can request three short sketches. A workspace-only adapter uses the existing Babbage endpoint and `scenario1` response envelope, encoding structured sketches inside `feedback_summary`, as the Maya adapter already does for character scenes. This does not require a backend schema change. Responses must contain three complete sketches with distinct titles and student-experience text. Semantic variety still needs human evaluation; those validations cannot establish creative quality.

Each sketch names its description, student experience, learning connection, asynchronous approach, and creative core. Educators can select a sketch, combine selected sketches, save one for later, or supply feedback and request another set. Combining retains the selected sketches' mechanisms for educator editing; it does not pretend that an AI has synthesized a finished assignment.

Selection never overwrites student directions. It records a chosen possibility and an editable creative core, then opens Build. Applying a generated draft remains explicit and preserves the previous draft and rationale. Workspace-specific drafting instructions ask Babbage to protect the core when adapting constraints. The guided prompt is unchanged.

## Persistence and approval

The existing version-1 workspace record gains optional creative metadata: current sketches, saved alternatives (up to 30), exploration feedback, and a paused-Maya preference. Workspace context can include the selected sketch, edited creative core, instructor interaction plan, and unresolved questions. Older records receive defaults in memory; reading a record does not rewrite it or migrate storage. Unreadable creative records preserve the original raw save and show the existing recovery screen. The separate guided save is untouched.

Requests are bound to their original context and abort signal. Changed context or a reset prevents a late exploration from replacing current possibilities. The current draft remains editable while exploration runs.

Maya invitations appear with a developed draft and can be paused. Opening an invitation uses the existing disclosure and explicit request controls; no student-perspective request is sent automatically. Workspace review and approval do not require Maya or Pixel to respond. Scenario 1 keeps its existing review behavior.

HTML Course Guides include chosen possibility, creative core, instructor interaction, and unresolved questions when recorded. Approval is an educator decision, not compliance certification.

## Verification

`npm test` includes creative-adapter tests for response validation, repeated and malformed sketches, errors, cancellation, context changes, combinations, escaped text, persistence, old and corrupt saves, guided-state isolation, and guide content.

`npm run test:creative` checks the keyboard exploration-to-guide flow on desktop and phone with mocked AI. `test:lab` retains the broader workspace, gallery, saving, recovery, and export checks with optional Maya behavior.

The browser harness supports an isolated `PC_BROWSER_PROFILE` and `PC_BROWSER_OUTPUT` directory. In restricted Windows environments where Chrome's child GPU process fails, the test-only `PC_BROWSER_SANDBOX_WORKAROUND=1` opts into headless Chrome's `--no-sandbox` and `--in-process-gpu` flags. Defaults and the application server do not change. Browser tests send fictional fixtures only to their local mocked endpoint.

Verified for the direct-view revision: all unit suites passed; creative flows passed at 1280×720, 390×844, and 320×568; the broader Idea Lab/workspace suite passed at 1280×720 and 390×844, including explicit AI draft application, Maya, approval, downloaded guides, resets, and quota recovery. Screenshots were visually inspected. AI responses were mocked.

The live service's structured creative responses and their pedagogical quality have not been verified in this work. No automated web research or official course lookup was added. Multiple independent projects, structured project import/export, broader activity formats, and the extended Design Foundations catalog remain future work.
