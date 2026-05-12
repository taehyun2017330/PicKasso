# Scenario QA Summary

Date: 2026-05-08

Mode tested: `OPENAI_DEMO_PROFILE=test`, GPT-4o planners/feedback, GPT Image 2 low quality square outputs.

Full screenshot log: [report.md](report.md)

## Scenario Status

1. One image works, rest fail: verified after fixes. The flow now asks keep/avoid, generates one refinement, asks what changed after a dislike, and asks save/variations after the corrected like.
2. User dislikes all 4: verified. Repeated rejection now opens brief revision, and a finally-liked image asks what finally worked.
3. User likes everything: verified. All-liked asks what to optimize for and can generate one revised image.
4. Conflicting liked directions: verified. Skips no longer override liked signals; split results now ask whether to retire or keep part of the weaker path.
5. Direct edit: verified. Direct-edit text generates one image, and successful edited output now asks whether to use it as a reference.
6. Brief too vague / No Brand: verified. No Brand all-rejected asks what went wrong, non-edit free text preserves 4-image exploration, and recalibration can generate again.
7. Unsure / skips: partially browser-verified and test-verified. Browser confirmed the corrected `refine · 4 images` decision after reload and captured the generation trigger; the final real image wait timed out in automation. Unit tests cover the complete intended skip -> tentative like -> 4 variations -> preserve -> 1 image sequence.

## Fixes Made

- Stored concise direction prompts instead of recursively reusing expanded social-image prompts.
- Updated GPT Image batch prompting so each returned file is one full-bleed asset, not a nested grid/contact sheet.
- Stripped base64 image `src` data from GPT-4o planner payloads.
- Stopped automatically uploading liked parent images as edit/reference inputs unless explicitly selected or converging.
- Reordered single-image decision logic before all-liked/all-disliked aggregate logic.
- Added macro-memory branches for first positive signal after repeated rejection, split resolution, direct edits, No Brand vague briefs, and skip/unsure behavior.
- Fixed No Brand goal revision so applying an empty/default recalibration counts as answering the required step.
- Added regression tests for feedback scenarios and image-prompt guardrails.

## Verification

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test:feedback`: passed
- `npm run build`: passed
