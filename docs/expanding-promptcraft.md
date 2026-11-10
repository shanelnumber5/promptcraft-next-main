# Expanding PromptCraft

Start with [the source map](project-map.md). Scenario and Creative Workspace share the studio; add shared behavior there so both routes benefit. The app uses browser ES modules and native DOM events, with no build step or runtime dependencies.

## Responsibilities

| Layer                | Owns                                                                       | Main files                                                                               |
| -------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Route adapters       | Experience labels, loading, saving, reset                                  | `src/features/workspace/routes.js`, `storage.js`, `scenario-storage.js`                  |
| Studio composition   | Current state, navigation, rendering, delegated actions                    | `src/features/workspace/controller.js`                                                   |
| Studio configuration | Stage IDs/labels, planning-field names, text and saved-idea limits         | `src/features/workspace/config.js`                                                       |
| Build sections       | Ordered section definitions, field renderers, shared action bar            | `src/features/workspace/build-view.js`                                                   |
| Views                | Render HTML from state; escape user text                                   | `screen.js`, `views.js`, `review-view.js`, `partner-view.js`                             |
| Review lifecycle     | Automatic first check, manual retries, cancellation, request ownership     | `src/features/workspace/review-controller.js`                                            |
| AI adapters          | Request construction and response validation                               | `review-ai.js`, `creative.js`, `src/features/design/babbage-client.js`, `maya-client.js` |
| Editing              | Markdown rendering/serialization and delegated toolbar/paste/drop controls | `src/shared/directions.js`, `directions-editor.js`, `directions-editor-controls.js`      |

Paths without a directory in this table are under `src/features/workspace/`.

Keep DOM work in views and the mount controller. Keep request construction, validation, and state rules independent of the DOM where possible. The review controller accepts service overrides for offline tests; its `getState()` callback always reads the latest project after reset/import.

## Add a Build section

Add an entry to `buildSections` in `build-view.js` at the desired position. Its ID, title, and renderer drive the sidebar, section menu, current-section marker, and Next section destination. For example, after adding `reflectionPlan` to the planning-field list:

```js
{
  id: 'reflection',
  title: 'Reflection plan',
  render: state => metaField(
    'reflection-plan',
    'reflectionPlan',
    'How will students use feedback?',
    state.workspace.reflectionPlan,
  ),
},
```

The local `metaField` helper escapes the field value. Shared teacher fields use `renderField` from `src/shared/form-fields.js`. Use `data-workspace-meta` for workspace planning text, `data-setup-form` for teacher fields, or `data-design-form` for existing design fields so delegated edits follow the normal save and approval flow. For new HTML templates, escape user text with `escapeHTML`.

The optional `compile: true` setting makes the section's main action Build my activity. Otherwise, it advances to the next section. Keep the final `draft` section's existing ID: it owns the editable activity and the transition to Review. The `buildPages` export in `views.js` remains available for existing callers.

## Add a saved planning field

1. Add its name to `workspacePlanningFields` in `config.js`. This keeps edit handling and save restoration aligned and applies `MAX_WORKSPACE_TEXT` consistently. These fields default to an empty value when absent from old saves; render them with an empty fallback, as `metaField` does.
2. Add its control to a Build renderer. For a different field type, add an explicit default, validation/restoration rule in `storage.js`, and edit handling in the mount controller.
3. Workspace fields already participate in assignment context and are sent by `src/features/design/babbage-client.js`. Explain a new field's purpose in `prompt.js` when needed. Decide whether it affects review identity (`reviewFingerprint` in `review-ai.js`), final checks, guide output, or preview, and include it in the relevant functions. A saved field alone does not explain to an AI service how to use it.
4. Add a save/reload and project-import test. Add an approval-invalidation test if it changes the assignment's meaning.

`createWorkspaceRecord` in `storage.js` is the shared version-1 serializer used by browser saves and project downloads. Scenario extras also use it through `saveWorkspace`. It omits the transient save notice. Restoration deliberately validates known fields, so adding a field to state without adding its restoration rule is insufficient.

Retain existing storage keys and IDs. Scenario's original save and studio extras are separate from the Workspace save. Imports validate route identity; do not merge their storage as part of adding a feature. Structural save-format changes need an explicit migration and fixtures for existing saves.

## Add story content, ideas, or another experience

- **Story scenes:** edit `src/features/opening/content.js`. Follow the existing scene, board, dialogue, portrait, and choice shapes. Keep scene and option IDs stable for saved progress. `sceneReady` in `src/app/storage.js` handles progression; `allowAnyResponse` enables reflective choices where every response can continue. Changing `contentVersion` invalidates older saves, so use a deliberate compatibility decision.
- **Idea Lab entries:** extend `src/features/idea-lab/ideas.js` with a unique ID and the existing entry fields. `adapt.js` handles the handoff to Workspace. Review catalog-version and saved-idea compatibility before changing old IDs.
- **Characters:** follow [the character guide](characters/guide.md) and the shared artwork catalog in `src/shared/character-art.js`.
- **Another experience:** add its route, labels, and isolated storage adapter, then wire it through `src/app/entry.js` and the appropriate entry link. `designRoute` and the legacy opening save currently recognize the two existing experiences; a new scenario also needs explicit scenario-content selection and save validation. The Build registry alone does not create a new scenario.

## Add an action or AI workflow

Use a descriptive `data-action` value and handle it in the shared mount controller. Delegate from the stable app element because rendering replaces its children. Bind editor controls once per mount, not once per render. Reuse `syncFinalCheck`, `invalidateWorkspaceApproval`, and `controller.syncBabbage()` as appropriate before saving substantive edits.

For review behavior, use `reviews.check()`, `reviews.runAutomatic()`, and `reviews.cancel()`. Call cancellation before replacing the project. A request must not save, render, or open a deferred dialog for a different project. Keep the automatic-first-review/manual-recheck behavior unless the product flow intentionally changes. Keep Dev simulation labeled and free of live calls.

New AI workflows should use the shared JSON transport and existing service adapters. Preserve the `scenario1` request envelope unless the backend changes with it. Test timeouts, cancellation, stale results, and errors with injected or mocked services.

## Verify an expansion

Run `npm test` for the 16 offline suites and static-server checks. `workspace-workflow.test.cjs` covers review ownership, stale dialogs, retry behavior, and save/export consistency. Architecture and repository checks follow static/lazy imports, including cache-version query strings, and reject missing modules and unused assets.

Run `npm run test:browser` for both shared routes at four viewport sizes. The browser fixtures include editor heading/format/paste/drop behavior, replacement-editor bindings, layout, contrast, and keyboard focus. Update section fixtures when adding a section. Use `npm run test:lab` for Idea Lab changes and `npm run test:accessibility` for public-page changes. These fixtures mock AI; they do not establish live response quality.

Format changed files with the existing Prettier configuration. Put generated screenshots, logs, and audits in the ignored `artifacts/` directory.
