# Real-OpenAI steering findings

Live pipeline (`o4-mini` orchestrator prompts, `gpt-image-1` images), driven
through the app via the E2E bridge. Each entry is evidence-backed by saved
images under `qa-runs/real-exp/`.

## Pipeline versions

- **v0** baseline (after the mock-mode refinements): authoritative-reaction
  anchor block + chip-first trace signals.
- **v1 → v2** (this campaign): two refinements driven by the first real run.

## Evidence log

### Single-target probe — Mira Crust → matte editorial croissant

- `turn-0-board/`: first board, broad and diverse (good). Closest variant was
  a *warm oil painting of a sourdough loaf* (var-4). Everything else off
  (graphic posters, glossy 3D, illustrations).
- Liked var-4 with a **correcting** note (photographic not painted, cold north
  light, croissant not loaf, raw linen, oat/cream).
- `turn-1/` (refine, 4 imgs): **3/4 strongly on target** — photographic,
  cold-lit, hand-torn croissants on raw linen, no people, no gloss. The
  authoritative-reaction block successfully overrode the anchor's warm painted
  bread. **Steering works.**

#### Defects observed in the real run

1. **Negative constraints leak back.** `turn-1/var-3` reintroduced a human
   hand despite "no people" being in the warm intent and repeated cold
   context. Negatives lived only in prose, never promoted to a hard
   per-prompt exclusion.
2. **Refine recipe self-contradiction.** The static OBJECTIVE said *"Stay
   close to the anchor's visual core (medium, palette, subject role)"* and
   *"Do not drift into a different aesthetic family"* — directly against an
   authoritative reaction that overrides exactly medium/palette/subject. It
   resolved toward the user this time but is fragile.

### Refinement v2 (applied)

- **`promptOrchestrator.ts`**: added `hardExclusions()` — pulls cold reason
  chips + "no/without/avoid" phrases from intent, and injects a
  `NON-NEGOTIABLE EXCLUSIONS` block into refine / correct / edit /
  regenerate / save_direction. Every prompt must echo these in its
  exclusions slot.
- **`buildRefinePrompt`**: replaced the contradictory "stay close to anchor
  core / don't drift aesthetic family" bullets with "treat the user reaction
  as authoritative; the anchor is a starting point; change medium/palette/
  subject when the user asks; preserve only what they did not ask to change."

Gates green (typecheck, lint, test:feedback). Campaign run with v2 next.

## Campaign (10 scenarios × 5 generations)

### Headline: steering works; the proxy was the problem

Visually reviewed 8 scenarios (croissant probe + surf, bookstore, coffee,
sneaker, brutalist, ramen, stationery). **In every one the final generation
matched the target aesthetic** — moody espresso pour, monochrome brutalist
facade, single surfboard in golden dunes, cozy photographic reading nook,
pastel paper flat-lay, etc. `refine` reliably moved toward the target across
very different brands and mediums.

The keyword-proxy "regression" (e.g. surf 4→1, coffee 0→1) was a
**measurement artifact, sometimes inverted**: it scored an off-target but
keyword-rich first-board image (a polaroid collage *with a person*; a
watercolour illustration) above a genuinely on-target refined photo. It even
mis-steered the simulated user (liked the wrong anchor) — and the pipeline
**still converged**, which is a strong robustness result.

Conclusion: the unreliable component was the test harness's autonomous
evaluator, not the product. Real evaluation must be by eye (or a vision
scorer), not prompt-text keywords.

### Genuine defect found by eye → Refinement v3 (applied)

Two finals stamped the brand name on the product ("KESTREL" on a sneaker,
"TONKŌ" on a ramen bowl) despite "no text". Root cause: `socialPrompt.ts`
fed `Brand: <name>` into the *image* prompt; `gpt-image-1` renders a supplied
name as on-product text, overpowering a soft "avoid readable copy" line.

Fix (`lib/ai/images/socialPrompt.ts`): brand name is now explicitly
internal-context-only ("do NOT render this name, or any lettering/logo"), and
the Text rule is a hard default prohibition (no brand/product name, lettering,
signage, captions, labels, watermarks, typography — including on the product)
unless the prompt explicitly requests readable copy.

**v3 verification:** re-ran sneaker + ramen (same scenarios/recipe). Brand
text gone in both; target convergence preserved (clean floating sneaker on
saturated gradient; clean overhead ramen bowl). Confirmed by eye.

## Collaborator showcase

`qa-runs/real-exp/showcase/index.html` — self-contained, shareable.
Per scenario (coffee, brutalist, surf): each generation's board → the ACTION
(liked tile outlined green + kept traits, disliked tiles outlined red +
avoided traits, the refine intent) → the next board, ending on the converged
result. Built from the v3 real images via `qa-runs/build-showcase.mjs`.

## Diverse-like / slow-convergence campaign (`e2e/real-diverse.spec.ts`)

The single-anchor campaign always liked 1 / disliked many → instant
refine-only convergence. Added 3 scenarios where the user is torn between
TWO valid directions, likes several across both, and the scripted path is
`first board → split → combine → refine → refine`.

Recipe path fired exactly as designed in all 3 (coffee moody-vs-airy,
skincare clinical-vs-botanical, sneaker studio-vs-street).

Visual review of D1 coffee:
- gen-0: 2 diverse likes across competing facets.
- gen-1 `split`: **genuine two parallel paths** — bright-airy marble flat-lay
  *and* moody-dark espresso pull.
- gen-2 `combine`: a real blend — airy marble negative-space setting with a
  dark cup.
- gen-4 `refine`: converged cleanly on the moody dark espresso pour.

Conclusion: multi-anchor reconciliation works — `split` diverges into real
paths, `combine` blends, `refine` converges, slowly and across recipes.

Notable robustness result: at gen-0 the keyword proxy picked a **near-blank
failed render** as the facet-B "airy" anchor (its prompt had the words). The
`split` recipe still produced a correct airy path — the chips/intent carried
it despite a junk anchor image. Reconfirms: the weak link is the test's
proxy evaluator, not the steering pipeline. `formatBoardSnapshot` (used by
split/combine) still uses the older un-reconciled format, but real images do
not show it failing, so no change made (no evidence-driven need).

## Pipeline version summary

- v0: authoritative-reaction anchor block + chip-first trace signals (mock-validated).
- v2: `hardExclusions()` NON-NEGOTIABLE EXCLUSIONS block (refine/correct/edit/
  regenerate/save) + removed the refine "preserve anchor core vs override"
  contradiction. (Real run: warm painting-of-bread anchor → cold photographic
  croissant on linen, 3/4.)
- v3: brand-name/text suppression in the downstream image prompt.

All app gates (typecheck, lint, test:feedback) green at each version.
