# Responsive layout review

Reviewed the complete PromptCraft workflow in Chrome using 20 viewport sizes, from 320 × 568 to 1920 × 1080, including portrait and landscape phones, tablets, short desktop windows, and responsive breakpoint boundaries.

## Screens covered

- All five setup screens and all assignment summary sections.
- Every opening dialogue, plan, smartboard question, and feedback state.
- Design concern, original directions, reply choice, reply explanation, drafting choices, Babbage clarification and loading, suggestions, formatted editor, and explanation of the change.
- Requirements, earlier drafts, conversation history, and Babbage rationale.
- Before-and-after review, final check, assignment guide preview, closing screen, and restart confirmation.
- All three cited sources and all four samples.

## Adjustments

- Fill the speaker scene with the classroom background at every aspect ratio, preserving the different camera views.
- Give phone navigation buttons equal space and stable heights, with room for longer labels and padding below the controls.
- Keep portrait-tablet design navigation inside the design card and reserve enough space below phone content for the fixed navigation.
- Use compact header spacing at intermediate widths so both header actions remain visible.
- Reduce the phone guide toolbar's size and prevent background scrolling while a dialog is open.
- Use flowing layouts in short windows where a fixed scene would clip the question or feedback.

## Verification

The browser harness checks horizontal overflow, clipped button labels, dialog overflow, workflow navigation and persistence, story content bounds, and consistent summary/design card widths. Screenshot inspection supplements those checks. The affected sizes are rechecked after visual fixes, including header control bounds and modal background scroll locking.

Results: the full 20-size sweep passed, followed by a passing five-size recheck after the final header and modal fixes. All four unit suites passed, and `git diff --check` reported no whitespace errors.

Run `node tests/browser/design.test.cjs`. Filter a targeted run with `PC_BROWSER_DEVICE`, using comma-separated device names from the test. Screenshots and machine-readable results are written to `artifacts/screenshots/design/`.

This covers Chrome viewport emulation rather than separate physical devices or Safari/Firefox. Long documents and small-screen content remain scrollable so text is readable. AI responses in the browser harness are fixtures; this review does not test live AI output.
