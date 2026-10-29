# Bounded creative refinement: 2026-10-29

Explore now generates three candidate sketches, then makes one challenge-and-revision request before displaying the final three. The second request receives the same instructor context, feedback, prior possibilities, and validated candidates. It targets subject-specific decisions, consequential interaction, different mechanisms, and feasible workload/access tradeoffs. It does not grade educators or certify learning.

The scenario1 service envelope, sketch fields, storage keys, approval flow, and educator control over applying ideas remain unchanged. This implementation retains the prototype's discussion-forum scope. Cross-project preference memory and additional activity formats are separate future changes.

There are at most two AI calls per exploration, with increased usage and potential waiting time. The second call has a 30-second timeout within the existing overall exploration timeout. A failed refinement returns validated initial sketches with a visible notice. Overall cancellation or timeout preserves the existing project and does not publish partial results. No extra automatic retries or unbounded agent loops were added.

## Verification

All 12 offline unit suites passed before the final test-only additions. The expanded creative suite also passed: two-call limit, final-result selection, candidate/context forwarding, no project mutation, failed/malformed refinement fallback with notice, and mid-refinement cancellation. Browser and live-AI quality were not verified.

## Suggested live comparisons

Compare a few fresh explorations against previously saved possibilities, keeping course context and constraints the same. Instructor judgment should determine whether the added pass helps.

| Starting point | Useful evidence of improvement |
| --- | --- |
| Agree/disagree management discussion | A peer's evidence changes a staffing or policy decision, rather than adding another reply. |
| Poetry interpretation | Different readings must account for actual textual details; no generic workplace scenario. |
| Statistical output discussion | Interpretation depends on supplied outputs and assumptions, without invented data or results. |
| A rough idea with no goal yet | Bold mechanisms are offered, with tentative learning purposes rather than invented official objectives. |
| “No role-play; no new tools; 30 minutes” | The ideas remain distinct while honoring all three constraints. |
| Rejection: “These all feel like case studies” | The next set changes mechanisms, rather than renaming the same structure. |

Look for specificity, consequential student actions, usable instructions, meaningful differences between options, and an acceptable tradeoff. A model's private critique does not establish instructional effectiveness or creativity.
