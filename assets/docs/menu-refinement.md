# Menu refinement · October 20, 2026

## Shared menu frame and portraits

Home, the supporting pages, and Course Guide now use the same panel height, heading row, header spacing, and footer spacing at each viewport. Home keeps its resume space reserved whether or not progress exists. The main choices sit within one compact panel, with text labels instead of decorative icons. The existing GFC River Otters logo is restored in the header on a navy background. Menu screens retain one visible Home control in the navigation; the duplicate header button and return links were removed. Narrow phones retain a taller, consistent frame so readable content is not clipped.

Information pages use text topic buttons on the left and Previous/Next controls. Short groups of topics keep the side list compact; Previous/Next advances through every topic and updates that list. Redundant Earlier/More links were removed. There is no topic dropdown, duplicate topic list, numbering, or page counter. Larger Pixel or Babbage artwork and the supplied Shanel portrait sit beside the reading area; phones place the topic buttons and portrait above it. The portrait is copied unchanged to `assets/people/shanel-profile.png`; cropping is presentation-only CSS.

Each topic explicitly selects its own image, caption, and alternative text instead of inheriting one portrait for an entire tab. The developer and graduate-work topics use Shanel, college context uses the existing GFC artwork, project/testing topics use the classroom, AI collaboration uses Babbage, student perspectives use Maya, and guidance/reflection uses Pixel with an appropriate existing expression. Image presentation follows the selected image type while the menu frame stays fixed.

The supplied engine image now illustrates Evaluate, Revise, Why Babbage?, AI requests, and external-service privacy. The computer image also represents Babbage on his character introduction; Charles Babbage is described only as the historical namesake. The WebP is copied unchanged and shown in full with a descriptive caption; static serving and asset-reference checks support the WebP format.

Meet the Characters now introduces Babbage, Professor Pixel, and Maya individually, explaining their roles and why they are part of the experience. Additional short topics cover the Babbage namesake, Maya’s simulated first reading, and educator choice. Maya’s biography follows the approved character profile; no new dialogue, character identity, AI behavior, or permanent biographical facts are introduced.

The supplied QR image appears on desktop/tablet Home with “Scan to play,” using the same published test-site link as the old project. It is hidden on phones. The requested “Private work · Progress saves in this browser” line under the choices is removed; Privacy & Progress remains available. Both supplied image files are copied unchanged. No deployment or save-format change is involved.

Browser checks compare exact panel top, height, and footer position across Home, every information topic, and Course Guide. They also check Home choices stay inside the panel, topic text fits its allocated area, keyboard focus, and unchanged save values.

## Supporting pages from the earlier menu

Added How to Play, About PromptCraft, Meet the Characters, and Privacy & Progress with secondary navigation on Home and those pages. The footer links to privacy from every path. These routes render information only, without saving progress, updating the resume preference, or invoking AI. They reuse the current blue/gold styles and available Babbage emblem. The developer photo was subsequently supplied and added as described above; the supplied mechanical engine now represents Babbage on Meet the Characters. Neither portrait was extracted from a screenshot.

How to Play introduces the six-part loop and existing entry paths. About uses the supplied developer and academic context with the revised teaching-design purpose and independent-project wording. Meet the Characters describes collaboration and educator choice. Privacy replaces the old menu's collection claims with browser-save behavior, explicit AI request disclosures, confidential-information guidance, and the separation from future research. External service retention remains unverified.

The information layout shows one topic at a time in the shared menu frame described above. Topic changes focus the heading and return to the top. Longer privacy and academic sections are divided into smaller topics. Content stays at readable sizes, with natural page scrolling available on small screens or with enlarged text; nothing is trapped in an internal scroll area.

Reader validation checks every topic, keyboard Next/Previous, heading focus, direct page navigation, unchanged saves, and zero AI requests. Desktop, short-desktop, tablet, and standard-phone checks verify that topics fit without document scrolling; small-phone checks retain natural scrolling when necessary. Desktop and phone screenshots were visually reviewed. Five unit suites pass. The latest repository asset-reference suite fails on newly present, unreferenced character assets, beginning with `assets/characters/pixel/asset-manifest.json`; these files were not added or changed by the reader work.

Inspection found a working guided scenario with the lemonade example, a direct private discussion workspace, 12 curated illustrative Idea Lab starters, adaptation with Babbage, separate saved paths, and guide preview/export within each path. These were reused.

Home now describes the scenario in terms of teaching decisions and labels the direct path Create an Assignment, while explicitly stating the current discussion-forum scope. The Idea Lab remains a curated gallery; no public faculty community is implied. Course Guide is now reachable from Home and reads both existing snapshots without changing progress, approval, or the last-used path. Unapproved work is labeled as a draft. Unreadable saves are reported and left intact. The guide dialog uses the existing renderer and returns focus to its opening button.

The existing loop supports encountering the worked example, exploring context, evaluating optional Babbage suggestions and Maya readings, choosing and editing directions, and explaining the change and expected evidence. Character profiles, artwork, AI requests, storage versions, and research infrastructure are unchanged. The workspace remains limited to one current design; guides can be downloaded from the existing workflow for longer-term retention.

Staged rollout: retain the functioning forum workspace and curated lab now. Additional activity formats, a multi-entry guide archive, and voluntary faculty sharing remain proposals. Public sharing would need explicit permission, moderation, and a separate implementation. Formal research consent and logging require a separate design review. No research collection or deployment is added here.

Validation: all six unit suites pass. Mocked browser checks pass on desktop, short desktop, tablet, phone, and small phone, covering navigation, keyboard/accessible names, guide preview and focus return, unchanged saved values, adaptation, Babbage/Maya, approval/export, resume, and corrupt-save recovery. The phone Home screenshot was visually inspected. Browser fixture detection now uses workspace request metadata instead of an obsolete prompt phrase. No live AI calls were used.


## Shared interface treatment

`src/styles/interface-consistency.css` unifies the navy/blue palette, Arial type, white application header, rounded rectangular controls, primary/secondary states, selected tabs, disabled states, and keyboard focus across information menus, the guided story, setup, workspace, Idea Lab, and dialogs. Each feature retains its existing layout and navigation placement. The Babbage topic illustration panel has the owner-requested clipped upper-right corner; the image itself is unchanged. Unit checks and menu/workspace checks pass on short desktop, tablet, and phone.

The full keyboard opening-to-guide flow also passes on short desktop, tablet, and phone, including Babbage choices, Maya readings, revisions, setup, dialogs, guide preview/export, and resume/reset. Browser AI responses are mocked. The engine-panel and guided-story screenshots were visually reviewed. No deployment was performed.


## Sample lesson shortcut

Type `test` in the subject or original assignment field in either path to load a complete fictional staffing lesson. This fills teacher context, the original task, a revised forum and rationale, then opens the reading/review screen. It uses live mode so Maya and Pixel can respond to the sample; filling alone makes no AI request. Checks remain unapproved, prior draft/reason are retained as the earlier version, and the other path is unaffected. The visible Dev-mode switches are removed. Offline controller fixtures remain available to automated tests. Unit checks and short-desktop/phone workspace and shortcut checks pass.

The sample words now include `good` (purposeful staffing comparison), `bad` (excessive posting, agreement quotas, no useful peer follow-up), and `joke` (an office printer applying for promotion, with a real evidence-based decision). `test` remains an alias for `good`. Keywords select lesson content only; no emotion, reaction or AI response is preset. Enter them in the subject or original directions field.


## Workspace finish

An approved Course Guide offers **Finish with Pixel** as the primary next step. It opens the existing classroom presentation with a local Pixel recap, a return to the saved guide, and **Return Home**. The recap works without the AI service, does not alter approval or saved work, and can be replayed from the guide. The original guided scenario closing remains unchanged.

The workspace closing scene now opts out of non-game page styles whenever `.focused-scene` is present. This restores the original opening frame, header sizing, camera geometry and scene navigation, and hides the workspace footer. The route and saved workspace stay intact; returning to the guide restores workspace styling. Full-width scene and hidden-footer browser checks pass on desktop, short desktop, tablet and phone.


## Required workspace reading

The rationale textarea grows into the available review-panel space instead of being capped at 110px. The separate optional Maya button is removed from the workspace. **Check your design** starts the reading automatically, presents Maya followed by Pixel, and continues to the checks only after the final dialogue beat. Closing, previewing excerpts, stale context, and service errors do not complete the step. A completed reading is reused within the session for the same teacher context and draft; changing the assignment requires another reading. Previously saved approved guides remain accessible. No new save schema is introduced.

Reading states are now distinct from character dialogue: loading and connection failures hide the actor and speech bubble and show a neutral status card. In the required reading, failure offers Retry reading and Back to draft; excerpt-preview and a redundant Ask button are absent. Only validated returned dialogue appears under Maya or Pixel’s name. Desktop and phone browser checks cover both failure and successful dialogue.
