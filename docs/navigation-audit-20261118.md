# PromptCraft navigation audit — November 18, 2026

Reviewed the existing `chatmt-browser-test` preview before broad navigation changes. No AGENTS.md was present in this checkout or its parent folders. Production is outside the scope of this work.

## Where a new user can lose their place

- The dark global header, dark Explore/Build/Review strip, and selected dark sidebar item all look equally important. Home, resources, reset, Options, and another project-options button compete with the actual task.
- The route name and task heading repeat at similar sizes. Section links do not clearly say how far the learner has progressed within the stage.
- Build places its primary next action first, while Review places it last. Preview, rebuilding, downloading, and completion can compete in the same footer. On narrow screens, long controls and fixed sizing make the positions inconsistent.
- Opening Activity requirements immediately opens an AI-use dialog. Entering Review can interrupt the flow with a rubric-choice dialog. Revisiting Final checks can reopen the rubric. These transitions obscure the stage the user chose.
- Rubric creation appears in feedback, the sidebar, Final checks, and a modal. Guide help repeats download actions already available at completion and in the guide.
- The guide preview combines download controls, a second row of section buttons, and Previous/Next controls. Its toolbar and footer overflow at phone widths.
- The guide library reads the older scenario save without studio extras and routes its Continue designing link into Creative Workspace. The guide exporter mistakes scenario studio metadata for Workspace identity, omitting the completed scenario and its teaching guidance.

## Proposed shared screen structure

1. A compact identity header with quiet Home and Project text controls. These are secondary exits and tools.
2. One dominant Explore / Build / Review stage navigation, with the current stage indicated in gold.
3. A task frame with a Georgia heading and a small stage / step indicator. Desktop section links use a subdued rail; narrow screens use one labelled native select. Neither is another dark menu.
4. One main reading or editing surface. AI-use and optional rubric choices stay in the task. Rubric review and editing use the shared frame rather than opening automatically over another task.
5. One bottom action row: Back at the left, Continue or the task's completion action at the right, and quiet optional actions between. Save status is consistent and never masks an action. Story and completion keep the classroom, characters, and the same Back/Continue positions.

Scenario content remains in the scenario modules. Shared page, section, step, and action components own the interface. Storage keys, entered drafts, conversation answers, rubric data, approval rules, and independent route saves remain compatible.

## Evidence and verification

The initial inventory captured 666 screens across desktop, tablet, phone, small phone, short desktop, and landscape. An expanded inventory captured 256 desktop/phone screens, including all Build pages and AI/rubric views. Screenshots and machine-readable layout/contrast reports are in ignored `artifacts/preview-before-navigation*` folders. A stale dialogue check included intentionally hidden buttons; its selector was corrected to audit visible controls.

The initial expanded audit found phone overflow in the guide preview, save-status and Idea Lab footer contrast failures, and low-contrast rubric editor borders. Subsequent screenshots and journey checks will verify the new hierarchy, visible footer actions, keyboard focus, completion, independent saves, and actual downloaded HTML and Canvas CSV files. AI responses are mocked; live provider quality is not established by these checks.

## Final result

The short-screen layout also removes inherited Idea Lab padding, keeps Back/Continue visible, and uses the existing section chooser instead of repeating the task title when vertical space is very limited. A viewport check covers the navigation row and a minimum editing area.

The final visual audit passed 768 captures across all six viewport sizes with no layout or contrast failures. Visual inspection also caught an inline requirements overlap that the general audit missed; it was repaired and a dedicated geometry check now covers it.

Both route journeys pass at 1280, 820, 390 and 320 pixels: stage arrow-key navigation, section chooser focus, saved inputs through Back/Continue, custom AI-use instructions, rubric preference, approval, completion, guide-library resume and read-only preservation of saved bytes. The guided journey starts at the first classroom scene and completes all seven story steps. Guide Back/Next controls are also checked from the keyboard.

Actual downloaded HTML is opened offline at desktop and phone widths. Every preview section is compared with its exported counterpart, including the guided scenario's illustrated example and teaching guidance. The embedded Canvas CSV is downloaded and checked against the saved rubric. All 24 offline unit suites and static-server checks pass. These checks use temporary browser profiles and mocked AI; live provider response quality was not tested.

Final screenshots and downloadable samples are in `artifacts/final-hierarchy-audit`, `artifacts/final-workspace-journey` and `artifacts/final-scenario-journey` (ignored generated output). Production was not merged or deployed.
