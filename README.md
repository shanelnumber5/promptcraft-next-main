# PromptCraft Next

PromptCraft offers a guided discussion-design scenario and a private assignment workspace. Explore the lemonade example with Professor Pixel, create an assignment from your own starting point, or browse Babbage’s Idea Lab for an illustrative activity to adapt.

## Run locally

On Windows, open **start-local.cmd** and visit **http://127.0.0.1:3080** in Chrome. The launcher uses installed Node or VS Code's bundled runtime. With Node 22 or newer, use `npm start`. VS Code Live Server also works. There is no build step and no runtime package dependency.

Guided progress saves under `promptcraft_next_opening_v1`; existing saves remain compatible. The separate assignment workspace saves under `promptcraft_assignment_workspace_v1`. `promptcraft_entry_v1` remembers which path to resume. Different browser addresses have separate saved progress.

Fresh visits show the entry menu. Returning visits resume a valid saved path; **Home** offers **Continue Where You Left Off** and both paths. Direct links use `?view=play`, `?view=workspace`, and `?view=lab`. The Idea Lab contains 12 AI-assisted illustrative starters with search, category filtering, and details. **Adapt with Babbage** opens the private workspace without changing Scenario 1 progress or making an AI call automatically.

In the workspace, use **Design**, **Babbage**, and **Review & Course Guide** to move freely. Bring an existing assignment or an idea, edit the draft, consider Maya, and review the final design. Selecting different gallery inspiration keeps your starting material and draft while resetting outdated conversation and approval. Reopening the same idea preserves approval. **Reset workspace** clears only that workspace. It currently holds one design; export a guide before deliberately replacing it. Unapplied AI suggestions and Maya readings remain session-only.

Use **Restart module** in the header to begin again. A confirmation lets you keep your work or clear the module's saved answers, assignment setup, draft, and conversation. Download your guide first if you want to keep it. Restart preserves your selected live or Dev testing mode.

## Babbage and Dev testing

Current development testing is not formal participant research. Live Babbage and Dev fallback select how AI assistance runs; neither enrolls a participant or records research consent. This checkout saves browser progress but has no participant research event logger. See the [gameplay and research audit](docs/gameplay-research-audit.md) for the preservation plan and study integration limits.

The browser connects to the existing server at `https://promptcraft-test.netlify.app/.netlify/functions/babbage`. Its API key stays on that backend. No local key is needed; the local server only serves the app's static files. Private environment files are ignored and excluded from static serving.

On the drafting step, select **Check assignment details**, answer clarification questions, then select **Generate revision**. Teacher context and answers are sent to the Babbage service and OpenAI when you send a turn. Suggestions enter your draft only when you choose **Use these directions in my draft**. Changes to the assignment invalidate outdated suggestions and approval.

Select **Use Dev testing fallback**, or open `?mockBabbage=1`, to test without AI calls. Results are labeled **Dev testing fallback — simulated Babbage; no API call**. Switching modes resets the conversation. Live errors never silently substitute simulated output.

The rationale screen offers **Hear Maya’s first read (optional)**. Maya uses her approved student profile to read your original and revised directions, including relevant earlier readings in this session. Close her response to keep working; she never edits or approves your assignment. Readings are not saved across refresh. Dev mode and the explicit offline alternative show excerpts only, without AI interpretation. Live Maya calls use the same service as Babbage and share the assignment and design context as disclosed in the dialog.

The early reply reflection is an optional prediction before drafting. The final rationale explains the change you actually chose and what you will look for in student work. You can leave the prediction blank.

The adapter uses the existing backend's `scenario1` request format. It maps `feedback_summary`, `input_quality`, `revised_discussion_prompt`, and `revision_review.why_these_changes` into the clarification and revision workflow. The original backend repository is separate and unchanged.

## Guide and completion

Review the before and after, complete the three assignment checks, and go to your assignment guide. Preview it at any time; downloading requires an approved current revision. The downloaded HTML includes its logo, illustrations, and styles, so it can be opened offline and printed or saved as PDF. Finish the module for Professor Pixel's recap.

The Scenario 1 milestone collects your existing challenge, learning goal, chosen directions, and explanation into the guide. Use the explanation to say why you chose the change and what evidence you will look for in student work. Older saves remain valid; missing notes are labeled rather than inferred.

Desktop and tablet introductions fit the viewport, including their answer choices and navigation. Portrait tablets use a landscape-shaped smartboard with dialogue above the speaking character. Landscape tablets and Nest Hub displays place the board between the characters, matching the desktop classroom. Maya stays on the left and Pixel on the right. Phones show only the current speaker and scroll as needed. Text is at least 16px (12pt).

## Edit the project

Use [the project map](docs/project-map.md) to find the file for a specific change. Source is organized by feature under `src/features`, reusable renderers under `src/shared`, and app navigation and persistence under `src/app`. Styles are grouped under `src/styles`.

## Checks and formatting

```sh
npm test
npm run test:browser
npm run test:lab
```

Unit checks cover persistence, draft ownership, navigation, guide formatting, the active Babbage adapter, static server protection, and repository references. Browser checks cover the complete flow on desktop, short desktop, and phone. They mock Babbage and make no live AI calls. Browser tests use an installed Chrome; set `PC_CHROME_EXECUTABLE` to use another Chromium browser.

Set `PC_BROWSER_DEVICE` to a comma-separated list such as `desktop,short-desktop,tablet,phone,small-phone` for targeted browser validation. Checks include keyboard navigation, accessibility-tree names, Maya's mocked readings, approved guide downloads, and resume/reset. Live Maya checks are opt-in: set `RUN_LIVE_MAYA=1` and run `node tests/manual/maya-smoke.cjs`. Review its fictional outputs for student voice and substantive differences; automated grounding alone does not establish response quality. See the [Scenario 1 stabilization report](docs/scenario1-stabilization.md) for actual results and service limits.

Optional live check: set `RUN_LIVE_BABBAGE=1` and run `node tests/manual/babbage-smoke.cjs`. This sends fictional sample data to the deployed service and reports status and output lengths only.

`test:lab` reuses the mocked Chrome harness to check gallery/adaptation, existing assignments and starting ideas, Babbage and Maya, guide download, isolated saves, recovery, keyboard access, and sampled AA text contrast at desktop, tablet, phone, and small-phone sizes. No live AI call is made. See the [Idea Lab implementation and results](docs/idea-lab-implementation.md), [original Idea Lab brief](docs/briefs/idea-lab-request.md), and [original gameplay brief](docs/briefs/gameplay-refinement-request.md).

For consistent formatting, install development dependencies with `npm install`, then use `npm run format` or `npm run format:check`. Prettier is the only development dependency. Editor indentation is defined in `.editorconfig`.

Generated screenshots and browser profiles belong in the ignored `artifacts/` directory. They are not app source and can be cleared after closing the test browser. API keys must never be added to browser code or committed files.
