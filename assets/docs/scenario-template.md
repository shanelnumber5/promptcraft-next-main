# Add a scenario without rebuilding the interface

Use `src/features/opening/content.js` as the first working content example. Each feature pairs its content.js with a screen.js in the same folder.

1. Create a new content module with a stable `id`, `contentVersion`, `title`, `characters`, `endNote`, and `scenes`.
2. Give each scene a stable `id`, a short `part`, accessible `title`, `speaker`, `dialogue`, and `board`.
3. A board supports `label`, `title`, `text`, `quote`, `facts`, `nodes`, and `note`. Each flow node has `title` and `detail`. Use text alongside any future custom diagram.
4. An optional `choice` has `question` and `options`. Each option has `id`, `label`, `feedback`; exactly one has `correct: true` for this opening's single-answer activity.
5. Optional `portraits` overrides map character IDs to expression image paths. Characters supply `id`, `name`, `side`, `src`, and useful `alt` text.
6. Select the content module in the app entry point. The rendering engine receives the scenario as data; do not clone it or introduce a scenario-index global.
7. Add the scenario's keyboard/browser fixtures and content checks. Verify long dialogue, missing artwork, small screens, wrong choices, Back, reload, and replay.

Example scene shape:

```js
{
  id: 'unique-scene-id',
  part: 'The example',
  title: 'Accessible description of the scene',
  speaker: 'pixel',
  dialogue: 'One clear teaching point.',
  board: {label: 'On the smartboard', title: 'A visible title', text: 'The example.'}
}
```

## What stays shared

- `src/shared/html.js`: safe text escaping.
- `src/features/opening/screen.js`: board, cast, dialogue, choices, and story actions.
- `src/app/app.js`: navigation, focus, field updates, and lifecycle.
- `src/app/storage.js`: isolated storage, validation, restore, and save.
- `src/styles/styles.css`: colors, typography, layout, and responsive styles.

Change a shared component only for a behavior genuinely needed across content. Introduce a new component when an activity needs a different interaction; do not force every task into a correct-answer quiz.

## Current features and extensions

Teacher setup lives in `src/features/setup`. Babbage clarification, optional live suggestions, approval, guide export, and Professor Pixel's recap live in `src/features/design`. Research recording and additional scenarios remain future extensions.

The app currently registers one opening scenario. Dev tools and their shortcuts have been removed.
