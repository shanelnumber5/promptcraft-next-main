# PromptCraft

A creative instructional-design playground for higher education instructors. Understand the requirements. Challenge the conventions. Protect the creative spark.

## Start

On Windows, double-click **start-local.cmd** and open **http://127.0.0.1:3080** in Chrome. The launcher uses installed Node or VS Code’s bundled runtime. With Node 22 or newer, `npm start` also works. There is no build step or runtime package dependency.

## Design an activity

- **Guided Scenario** starts with Pixel’s lemonade example, then opens the shared studio.
- **Creative Workspace** opens that studio directly.
- **Idea Lab** offers 12 illustrative starting points to adapt.
- **Course Guide** previews your saved design and approved teaching decisions.

Both routes use **Explore → Build → Review**. Explore offers three possibilities, combinations and saved alternatives. Build brings together the starting material, course and learners, requirements, creative direction, instructor interaction and activity directions. The board can support sharing, peer review, collaboration, direct responses or discussion. A post/reply/follow-up cycle is optional.

Review starts the first Babbage check automatically; subsequent checks are educator controlled. Maya and Pixel offer perspectives and questions to clarify. Teaching-note proposals change your saved wording only when you accept them. Complete the final checks to save the approved version, preview or download the guide, and finish with Pixel.

**Options** includes editable JSON project backup/import and reset. Scenario and Workspace saves are independent. Use project backup to move work between browsers or addresses. Existing saved-project keys and validation remain compatible. Scenario uses `promptcraft_next_opening_v1` plus `promptcraft_scenario_studio_v1`; Workspace uses `promptcraft_assignment_workspace_v1`. Browser addresses have separate local storage.

## AI and privacy

AI requests send assignment details and design notes to the configured Babbage service and OpenAI. Babbage is a collaborator; the educator decides what to accept. Maya is a fictional student perspective, not evidence of actual student experience. The prototype does not collect formal participant research data.

The browser uses the existing backend at `https://promptcraft-discussion.netlify.app/.netlify/functions/babbage`. Its API key stays on the backend. The `scenario1` request envelope and legacy response field names remain unchanged. The local server serves static files and needs no AI key. Errors preserve your work; Dev simulation is labeled and never silently substitutes for a failed live request.

## Checks

- `npm run test:unit`: 15 offline suites; unmocked global fetch is blocked.
- `npm test`: offline suites plus local static-server checks.
- `npm run test:browser`: shared Scenario and Workspace browser fixtures.
- `npm run test:lab`: Idea Lab browser fixtures.

Browser checks require installed Chrome or `PC_CHROME_EXECUTABLE`. They use mocked AI and temporary browser profiles. Set `PC_BROWSER_DEVICE` for selected viewports, or `PC_BROWSER_OUTPUT` for a screenshot destination. These fixtures are not a claim of browser verification for this cleanup. Live AI quality must be reviewed separately.

Manual live checks in `tests/manual/` require the explicit `RUN_LIVE_BABBAGE=1` or `RUN_LIVE_MAYA=1` opt-in and send fictional sample context to the backend.

Prettier is the only development dependency. `npm run format` and `npm run format:check` cover the source, server, tests and documentation. Generated outputs belong in the ignored `artifacts/` folder.

## Test samples

Type `good`, `bad`, `joke`, or `test` into the subject or starting-directions field to load a development example. This replaces the current route’s activity, retains the previous draft as the earlier version, makes no request at the moment of filling, and does not approve the activity. Subsequent AI actions use the normal connection. `?mockBabbage=1` enables labeled Dev simulation.

## Maintenance

See [the source map](docs/project-map.md), [cleanup record](docs/repository-cleanup-20261030.md), [artwork provenance](docs/asset-provenance.md), and [character guidance](docs/characters/guide.md). This is a complete cleaned repository. Extract it into a fresh folder rather than overlaying it on an older checkout, which would leave retired files behind. No deletion script is required. Historical development notes and retired artwork remain preserved in the original uploaded repository archive.
