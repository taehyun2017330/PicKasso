# Scenario QA Record - Image Exploration Thread

Date: 2026-05-08
App: http://127.0.0.1:3000/
Mode: test profile, GPT-4o planners/feedback, GPT Image 2 low quality square outputs.

## Preflight Fixes
- Fixed a real backend blocker found during Scenario 1: expanded social-image prompts were being stored on variants and recursively reused, causing later generations to exceed model context. Stored prompts are now compact direction prompts while the server still sends the full creative-director prompt only for the active image request.



## Scenario 1 - One image works, rest fail

Persona: Cora, bakery owner preparing spring pastry social posts. Brand: Cora Bakehouse; category: bakery; goal: product imagery; audience: neighborhood brunch customers. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/044-scenario-1-one-image-works-rest-fail-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/045-scenario-1-one-image-works-rest-fail-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Cora Bakehouse","category":"bakery","goal":"product imagery","audience":"neighborhood brunch customers"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/046-scenario-1-one-image-works-rest-fail-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/047-scenario-1-one-image-works-rest-fail-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/048-scenario-1-one-image-works-rest-fail-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/049-scenario-1-one-image-works-rest-fail-thread-started-generating.png)


### Generation ready: turn 1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready turn 1 ready](screenshots/050-scenario-1-one-image-works-rest-fail-generation-ready-turn-1-ready.png)


### Turn 1 ready

System showed four generated images.

![s1 turn1 generated](screenshots/051-scenario-1-one-image-works-rest-fail-s1-turn1-generated.png)


### React Like to Image 1

Clicked Like for Image 1.

![react Like image 1](screenshots/052-scenario-1-one-image-works-rest-fail-react-like-image-1.png)


### Turn 1 reaction

Liked Image 1.

![s1 turn1 liked image 1](screenshots/053-scenario-1-one-image-works-rest-fail-s1-turn1-liked-image-1.png)


### React Dislike to Image 2

Clicked Dislike for Image 2.

![react Dislike image 2](screenshots/054-scenario-1-one-image-works-rest-fail-react-dislike-image-2.png)


### Turn 1 reaction

Disliked Image 2.

![s1 turn1 disliked image 2](screenshots/055-scenario-1-one-image-works-rest-fail-s1-turn1-disliked-image-2.png)


### React Dislike to Image 3

Clicked Dislike for Image 3.

![react Dislike image 3](screenshots/056-scenario-1-one-image-works-rest-fail-react-dislike-image-3.png)


### Turn 1 reaction

Disliked Image 3.

![s1 turn1 disliked image 3](screenshots/057-scenario-1-one-image-works-rest-fail-s1-turn1-disliked-image-3.png)


### React Dislike to Image 4

Clicked Dislike for Image 4.

![react Dislike image 4](screenshots/058-scenario-1-one-image-works-rest-fail-react-dislike-image-4.png)


### Turn 1 reaction

Disliked Image 4.

![s1 turn1 all reviewed](screenshots/059-scenario-1-one-image-works-rest-fail-s1-turn1-all-reviewed.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: CB
  - generic: Cora Bakehouse
  - text: Threads
  - button "Cora Bakehouse Directions":
    - generic: Cora Bakehouse Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Cora Bakehouse Directions":
    - generic: CB
    - paragraph: Cora Bakehouse
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Cora Bakehouse Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - generic: 1/3
    - paragraph: Why did you dislike Image 2?
    - button "lacks warmth"
    - button "too minimal"
    - button "missing rustic elements"
    - button "palette too clean for brand"
    - generic: Answer this before the next question.
    - button "Next question" [disabled]:
      - text: Next question
- button "Open Next
```

![question shown](screenshots/060-scenario-1-one-image-works-rest-fail-question-shown.png)


### Turn 1 follow-up question

- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: CB
  - generic: Cora Bakehouse
  - text: Threads
  - button "Cora Bakehouse Directions":
    - generic: Cora Bakehouse Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Cora Bakehouse Directions":
    - generic: CB
    - paragraph: Cora Bakehouse
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Cora Bakehouse Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - generic: 1/3
    - paragraph: Why did you dislike Image 2?
    - button "lacks warmth"
    - button "too minimal"
    - button "missing rustic elements"
    - button "palette too clean for brand"
    - generic: Answer this before the next question.
    - button "Next question" [disabled]:
      - text: Next question
- button "Open Next.js Dev Tools":
- alert

![s1 turn1 question](screenshots/061-scenario-1-one-image-works-rest-fail-s1-turn1-question.png)



## Scenario 1 Rerun After Feedback Fix

Persona: Mira, local bakery owner testing breakfast launch product imagery. Brand: Mira Crust; category: bakery; goal: product imagery; audience: office commuters. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/062-scenario-1-rerun-after-feedback-fix-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/063-scenario-1-rerun-after-feedback-fix-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Mira Crust","category":"bakery","goal":"product imagery","audience":"office commuters"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/064-scenario-1-rerun-after-feedback-fix-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/065-scenario-1-rerun-after-feedback-fix-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/066-scenario-1-rerun-after-feedback-fix-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/067-scenario-1-rerun-after-feedback-fix-thread-started-generating.png)


### Generation ready: s1 rerun turn 1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s1 rerun turn 1 ready](screenshots/068-scenario-1-rerun-after-feedback-fix-generation-ready-s1-rerun-turn-1-ready.png)


### Turn 1 ready

System showed four generated images after the feedback merge fix.

![s1 rerun turn1 generated](screenshots/069-scenario-1-rerun-after-feedback-fix-s1-rerun-turn1-generated.png)


### React Like to Image 1

Clicked Like for Image 1.

![react Like image 1](screenshots/070-scenario-1-rerun-after-feedback-fix-react-like-image-1.png)


### Turn 1 reaction

Liked Image 1.

![s1 rerun liked image 1](screenshots/071-scenario-1-rerun-after-feedback-fix-s1-rerun-liked-image-1.png)


### React Dislike to Image 2

Clicked Dislike for Image 2.

![react Dislike image 2](screenshots/072-scenario-1-rerun-after-feedback-fix-react-dislike-image-2.png)


### Turn 1 reaction

Disliked Image 2.

![s1 rerun disliked image 2](screenshots/073-scenario-1-rerun-after-feedback-fix-s1-rerun-disliked-image-2.png)


### React Dislike to Image 3

Clicked Dislike for Image 3.

![react Dislike image 3](screenshots/074-scenario-1-rerun-after-feedback-fix-react-dislike-image-3.png)


### Turn 1 reaction

Disliked Image 3.

![s1 rerun disliked image 3](screenshots/075-scenario-1-rerun-after-feedback-fix-s1-rerun-disliked-image-3.png)


### React Dislike to Image 4

Clicked Dislike for Image 4.

![react Dislike image 4](screenshots/076-scenario-1-rerun-after-feedback-fix-react-dislike-image-4.png)


### Turn 1 reaction

Disliked Image 4.

![s1 rerun all reviewed](screenshots/077-scenario-1-rerun-after-feedback-fix-s1-rerun-all-reviewed.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: MC
  - generic: Mira Crust
  - text: Threads
  - button "Mira Crust Directions":
    - generic: Mira Crust Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Mira Crust Directions":
    - generic: MC
    - paragraph: Mira Crust
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Mira Crust Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - button "too childish"
    - button "missing fresh-baked texture"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 1 image
    - button "Generate 1 image" [disabled]:
      - text: Generate 1 image
- button "Open Next
```

![question shown](screenshots/078-scenario-1-rerun-after-feedback-fix-question-shown.png)


### Turn 1 follow-up question

What should we keep from Image 1 and avoid from the others?

![s1 rerun question](screenshots/079-scenario-1-rerun-after-feedback-fix-s1-rerun-question.png)


### Answer feedback option

Selected option: warm morning bakery feel

![answer option warm morning bakery feel](screenshots/080-scenario-1-rerun-after-feedback-fix-answer-option-warm-morning-bakery-feel.png)


### Turn 1 feedback answer

Selected the first contextual reason chip for what to keep/avoid.

![s1 rerun answered keep avoid](screenshots/081-scenario-1-rerun-after-feedback-fix-s1-rerun-answered-keep-avoid.png)


### Generate next turn

Clicked Generate 1 image.

![clicked Generate 1 image](screenshots/082-scenario-1-rerun-after-feedback-fix-clicked-generate-1-image.png)


### Generate Turn 2

Clicked Generate 1 image after answering the keep/avoid question.

![s1 rerun turn2 generating](screenshots/083-scenario-1-rerun-after-feedback-fix-s1-rerun-turn2-generating.png)


### Generation ready: s1 rerun turn 2 ready

Detected 4 ready image like controls; expected at least 1.

![generation ready s1 rerun turn 2 ready](screenshots/084-scenario-1-rerun-after-feedback-fix-generation-ready-s1-rerun-turn-2-ready.png)


### Turn 2 ready

One refined image appeared below the first turn.

![s1 rerun turn2 generated](screenshots/085-scenario-1-rerun-after-feedback-fix-s1-rerun-turn2-generated.png)


### Bug found - image model created grids inside grid cells

Observed that some returned images contained their own multi-panel/grid composition. Cause: the batch prompt asked for multiple directions in one request without sufficiently saying each API output must be one standalone full-canvas image. Fix applied in lib/ai/images/socialPrompt.ts: each returned file is now explicitly one full-bleed square asset, never a contact sheet, collage, 2x2 grid, four-panel layout, or split-screen comparison. Added tests/imagePrompt.test.ts to guard this wording.

![bug nested image grid before prompt fix](screenshots/086-scenario-1-rerun-after-feedback-fix-bug-nested-image-grid-before-prompt-fix.png)



## Scenario 1 Post Nested-Grid Fix

Persona: Nia, bakery owner testing single-image social assets after the nested-grid prompt fix. Brand: Nia Oven; category: bakery; goal: product imagery; audience: office commuters. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/087-scenario-1-post-nested-grid-fix-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/088-scenario-1-post-nested-grid-fix-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Nia Oven","category":"bakery","goal":"product imagery","audience":"office commuters"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/089-scenario-1-post-nested-grid-fix-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/090-scenario-1-post-nested-grid-fix-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/091-scenario-1-post-nested-grid-fix-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/092-scenario-1-post-nested-grid-fix-thread-started-generating.png)


### Generation ready: s1 post fix turn 1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s1 post fix turn 1 ready](screenshots/093-scenario-1-post-nested-grid-fix-generation-ready-s1-post-fix-turn-1-ready.png)


### Turn 1 ready after nested-grid fix

System generated four separate API outputs. Visually check that each cell is one asset rather than a 2x2 composition inside the cell.

![s1 post fix turn1 generated](screenshots/094-scenario-1-post-nested-grid-fix-s1-post-fix-turn1-generated.png)


### Nested-grid fix verification

Post-fix generation shows the outer app review grid only. Each returned image cell is a single full-bleed asset rather than a grid inside the image.

![nested grid fixed evidence](screenshots/095-scenario-1-post-nested-grid-fix-nested-grid-fixed-evidence.png)


### React Like to Image 1

Clicked Like for Image 1.

![react Like image 1](screenshots/096-scenario-1-post-nested-grid-fix-react-like-image-1.png)


### Turn 1 reaction

Liked Image 1.

![s1 post fix liked image 1](screenshots/097-scenario-1-post-nested-grid-fix-s1-post-fix-liked-image-1.png)


### React Dislike to Image 2

Clicked Dislike for Image 2.

![react Dislike image 2](screenshots/098-scenario-1-post-nested-grid-fix-react-dislike-image-2.png)


### Turn 1 reaction

Disliked Image 2.

![s1 post fix disliked image 2](screenshots/099-scenario-1-post-nested-grid-fix-s1-post-fix-disliked-image-2.png)


### React Dislike to Image 3

Clicked Dislike for Image 3.

![react Dislike image 3](screenshots/100-scenario-1-post-nested-grid-fix-react-dislike-image-3.png)


### Turn 1 reaction

Disliked Image 3.

![s1 post fix disliked image 3](screenshots/101-scenario-1-post-nested-grid-fix-s1-post-fix-disliked-image-3.png)


### React Dislike to Image 4

Clicked Dislike for Image 4.

![react Dislike image 4](screenshots/102-scenario-1-post-nested-grid-fix-react-dislike-image-4.png)


### Turn 1 reaction

Disliked Image 4.

![s1 post fix all reviewed](screenshots/103-scenario-1-post-nested-grid-fix-s1-post-fix-all-reviewed.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: "NO"
  - generic: Nia Oven
  - text: Threads
  - button "Nia Oven Directions":
    - generic: Nia Oven Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Nia Oven Directions":
    - generic: "NO"
    - paragraph: Nia Oven
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Nia Oven Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - button "too childish"
    - button "missing fresh-baked texture"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 1 image
    - button "Generate 1 image" [disabled]:
      - text: Generate 1 image
- button "Open Next
```

![question shown](screenshots/104-scenario-1-post-nested-grid-fix-question-shown.png)


### Turn 1 follow-up question

What should we keep from Image 1 and avoid from the others?

![s1 post fix question](screenshots/105-scenario-1-post-nested-grid-fix-s1-post-fix-question.png)


### Answer feedback option

Selected option: warm morning bakery feel

![answer option warm morning bakery feel](screenshots/106-scenario-1-post-nested-grid-fix-answer-option-warm-morning-bakery-feel.png)


### Turn 1 answer

Selected the first contextual chip.

![s1 post fix answer q1](screenshots/107-scenario-1-post-nested-grid-fix-s1-post-fix-answer-q1.png)


### Generate next turn

Clicked Generate 1 image.

![clicked Generate 1 image](screenshots/108-scenario-1-post-nested-grid-fix-clicked-generate-1-image.png)


### Generate Turn 2

Clicked Generate 1 image.

![s1 post fix turn2 loading](screenshots/109-scenario-1-post-nested-grid-fix-s1-post-fix-turn2-loading.png)


### Generation ready: s1 post fix turn2 ready

Detected 4 ready image like controls; expected at least 1.

![generation ready s1 post fix turn2 ready](screenshots/110-scenario-1-post-nested-grid-fix-generation-ready-s1-post-fix-turn2-ready.png)


### Turn 2 ready

One refined image appeared below the first turn.

![s1 post fix turn2 ready](screenshots/111-scenario-1-post-nested-grid-fix-s1-post-fix-turn2-ready.png)


### Bug found - refinement exceeded context window

After selecting keep/avoid and generating one refined image, the API returned a context-window error. Cause: any liked parent image was automatically sent as an image edit/reference input. Fix applied in components/generation/runNode.ts: continuation nodes now use liked images as text memory by default, and only send image files when explicitly marked as references or used for convergence.

![bug context window error before reference fix](screenshots/112-scenario-1-post-nested-grid-fix-bug-context-window-error-before-reference-fix.png)



## Scenario 1 Final Rerun After Reference Fix

Persona: Owen, bakery owner reviewing commuter breakfast visuals. Brand: Owen Bake; category: bakery; goal: product imagery; audience: office commuters. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/113-scenario-1-final-rerun-after-reference-fix-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/114-scenario-1-final-rerun-after-reference-fix-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Owen Bake","category":"bakery","goal":"product imagery","audience":"office commuters"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/115-scenario-1-final-rerun-after-reference-fix-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/116-scenario-1-final-rerun-after-reference-fix-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/117-scenario-1-final-rerun-after-reference-fix-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/118-scenario-1-final-rerun-after-reference-fix-thread-started-generating.png)


### Generation ready: s1 final turn 1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s1 final turn 1 ready](screenshots/119-scenario-1-final-rerun-after-reference-fix-generation-ready-s1-final-turn-1-ready.png)


### Turn 1 ready

Four full-bleed image assets generated; no nested grids in the generated images.

![s1 final turn1 generated](screenshots/120-scenario-1-final-rerun-after-reference-fix-s1-final-turn1-generated.png)


### React Like to Image 1

Clicked Like for Image 1.

![react Like image 1](screenshots/121-scenario-1-final-rerun-after-reference-fix-react-like-image-1.png)


### Turn 1 reaction

Liked Image 1.

![s1 final liked image 1](screenshots/122-scenario-1-final-rerun-after-reference-fix-s1-final-liked-image-1.png)


### React Dislike to Image 2

Clicked Dislike for Image 2.

![react Dislike image 2](screenshots/123-scenario-1-final-rerun-after-reference-fix-react-dislike-image-2.png)


### Turn 1 reaction

Disliked Image 2.

![s1 final disliked image 2](screenshots/124-scenario-1-final-rerun-after-reference-fix-s1-final-disliked-image-2.png)


### React Dislike to Image 3

Clicked Dislike for Image 3.

![react Dislike image 3](screenshots/125-scenario-1-final-rerun-after-reference-fix-react-dislike-image-3.png)


### Turn 1 reaction

Disliked Image 3.

![s1 final disliked image 3](screenshots/126-scenario-1-final-rerun-after-reference-fix-s1-final-disliked-image-3.png)


### React Dislike to Image 4

Clicked Dislike for Image 4.

![react Dislike image 4](screenshots/127-scenario-1-final-rerun-after-reference-fix-react-dislike-image-4.png)


### Turn 1 reaction

Disliked Image 4.

![s1 final all reviewed](screenshots/128-scenario-1-final-rerun-after-reference-fix-s1-final-all-reviewed.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: OB
  - generic: Owen Bake
  - text: Threads
  - button "Owen Bake Directions":
    - generic: Owen Bake Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Owen Bake Directions":
    - generic: OB
    - paragraph: Owen Bake
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Owen Bake Product Imagery for Commuters
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - button "too childish"
    - button "missing fresh-baked texture"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 1 image
    - button "Generate 1 image" [disabled]:
      - text: Generate 1 image
- button "Open Next
```

![question shown](screenshots/129-scenario-1-final-rerun-after-reference-fix-question-shown.png)


### Turn 1 follow-up question

Expected: What should we keep from Image 1 and avoid from the others? Actual question captured in screenshot.

![s1 final question keep avoid](screenshots/130-scenario-1-final-rerun-after-reference-fix-s1-final-question-keep-avoid.png)


### Answer feedback option

Selected option: warm morning bakery feel

![answer option warm morning bakery feel](screenshots/131-scenario-1-final-rerun-after-reference-fix-answer-option-warm-morning-bakery-feel.png)


### Turn 1 answer

Selected the first contextual reason chip.

![s1 final answer keep avoid](screenshots/132-scenario-1-final-rerun-after-reference-fix-s1-final-answer-keep-avoid.png)


### Generate next turn

Clicked Generate 1 image.

![clicked Generate 1 image](screenshots/133-scenario-1-final-rerun-after-reference-fix-clicked-generate-1-image.png)


### Generate Turn 2

Clicked Generate 1 image.

![s1 final turn2 loading](screenshots/134-scenario-1-final-rerun-after-reference-fix-s1-final-turn2-loading.png)


### Retest note - stale client bundle still failed

The first retest after patch still hit the context-window error, likely because the active browser tab had not reloaded the patched client-side reference filtering code. Reloading and clearing before the next retest.

![s1 stale bundle context failure](screenshots/135-scenario-1-final-rerun-after-reference-fix-s1-stale-bundle-context-failure.png)



## Scenario 1 Hard-Reload Retest

Persona: Rae, bakery owner reviewing commuter breakfast visuals after a hard reload. Brand: Rae Bakes; category: bakery; goal: product imagery; audience: office commuters. Tone and avoid notes left blank.

### Hard reload

Reloaded the app so patched client-side reference filtering is active.

![s1 hard reload before clear](screenshots/136-scenario-1-hard-reload-retest-s1-hard-reload-before-clear.png)


### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/137-scenario-1-hard-reload-retest-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/138-scenario-1-hard-reload-retest-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Rae Bakes","category":"bakery","goal":"product imagery","audience":"office commuters"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/139-scenario-1-hard-reload-retest-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/140-scenario-1-hard-reload-retest-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/141-scenario-1-hard-reload-retest-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/142-scenario-1-hard-reload-retest-thread-started-generating.png)


### Generation ready: s1 hard reload turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s1 hard reload turn1 ready](screenshots/143-scenario-1-hard-reload-retest-generation-ready-s1-hard-reload-turn1-ready.png)


### Turn 1 ready

Four single full-bleed image assets generated.

![s1 hard reload turn1 generated](screenshots/144-scenario-1-hard-reload-retest-s1-hard-reload-turn1-generated.png)


### React Like to Image 1

Clicked Like for Image 1.

![react Like image 1](screenshots/145-scenario-1-hard-reload-retest-react-like-image-1.png)


### Turn 1 reaction

Liked Image 1.

![s1 hard liked image1](screenshots/146-scenario-1-hard-reload-retest-s1-hard-liked-image1.png)


### React Dislike to Image 2

Clicked Dislike for Image 2.

![react Dislike image 2](screenshots/147-scenario-1-hard-reload-retest-react-dislike-image-2.png)


### Turn 1 reaction

Disliked Image 2.

![s1 hard disliked image2](screenshots/148-scenario-1-hard-reload-retest-s1-hard-disliked-image2.png)


### React Dislike to Image 3

Clicked Dislike for Image 3.

![react Dislike image 3](screenshots/149-scenario-1-hard-reload-retest-react-dislike-image-3.png)


### Turn 1 reaction

Disliked Image 3.

![s1 hard disliked image3](screenshots/150-scenario-1-hard-reload-retest-s1-hard-disliked-image3.png)


### React Dislike to Image 4

Clicked Dislike for Image 4.

![react Dislike image 4](screenshots/151-scenario-1-hard-reload-retest-react-dislike-image-4.png)


### Turn 1 reaction

Disliked Image 4.

![s1 hard all reviewed](screenshots/152-scenario-1-hard-reload-retest-s1-hard-all-reviewed.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: RB
  - generic: Rae Bakes
  - text: Threads
  - button "Rae Bakes Directions":
    - generic: Rae Bakes Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Rae Bakes Directions":
    - generic: RB
    - paragraph: Rae Bakes
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Rae Bakes Product Imagery Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - button "too childish"
    - button "missing fresh-baked texture"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 1 image
    - button "Generate 1 image" [disabled]:
      - text: Generate 1 image
- button "Open Next
```

![question shown](screenshots/153-scenario-1-hard-reload-retest-question-shown.png)


### Turn 1 follow-up

Expected keep/avoid question appears after all four reactions.

![s1 hard question](screenshots/154-scenario-1-hard-reload-retest-s1-hard-question.png)


### Answer feedback option

Selected option: warm morning bakery feel

![answer option warm morning bakery feel](screenshots/155-scenario-1-hard-reload-retest-answer-option-warm-morning-bakery-feel.png)


### Turn 1 answer

Selected first contextual chip.

![s1 hard answer](screenshots/156-scenario-1-hard-reload-retest-s1-hard-answer.png)


### Generate next turn

Clicked Generate 1 image.

![clicked Generate 1 image](screenshots/157-scenario-1-hard-reload-retest-clicked-generate-1-image.png)


### Generate Turn 2

Clicked Generate 1 image after hard reload.

![s1 hard turn2 loading](screenshots/158-scenario-1-hard-reload-retest-s1-hard-turn2-loading.png)


### Bug found - planner payload included base64 images

The context-window error was happening before image generation: selected parent variants were sent to the GPT-4o planner with full base64 src fields. Fix applied in components/generation/runNode.ts: planner and trace memory now receive compact variants with src removed and prompts shortened.

![bug planner payload context failure](screenshots/159-scenario-1-hard-reload-retest-bug-planner-payload-context-failure.png)



## Scenario 1 Final Pass After Planner Payload Fix

Persona: Sol, bakery owner reviewing commuter breakfast visuals. Brand: Sol Pastry; category: bakery; goal: product imagery; audience: office commuters. Tone and avoid notes left blank.

### Hard reload

Reloaded after stripping image src fields from planner payloads.

![s1 planner fix reload](screenshots/160-scenario-1-final-pass-after-planner-payload-fix-s1-planner-fix-reload.png)


### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/161-scenario-1-final-pass-after-planner-payload-fix-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/162-scenario-1-final-pass-after-planner-payload-fix-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Sol Pastry","category":"bakery","goal":"product imagery","audience":"office commuters"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/163-scenario-1-final-pass-after-planner-payload-fix-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/164-scenario-1-final-pass-after-planner-payload-fix-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/165-scenario-1-final-pass-after-planner-payload-fix-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/166-scenario-1-final-pass-after-planner-payload-fix-thread-started-generating.png)


### Generation ready: s1 planner fix turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s1 planner fix turn1 ready](screenshots/167-scenario-1-final-pass-after-planner-payload-fix-generation-ready-s1-planner-fix-turn1-ready.png)


### Turn 1 ready

Four generated images appeared as single full-bleed assets.

![s1 planner fix turn1 generated](screenshots/168-scenario-1-final-pass-after-planner-payload-fix-s1-planner-fix-turn1-generated.png)


### React Like to Image 1

Clicked Like for Image 1.

![react Like image 1](screenshots/169-scenario-1-final-pass-after-planner-payload-fix-react-like-image-1.png)


### Turn 1 reaction

Liked Image 1.

![s1 planner liked image1](screenshots/170-scenario-1-final-pass-after-planner-payload-fix-s1-planner-liked-image1.png)


### React Dislike to Image 2

Clicked Dislike for Image 2.

![react Dislike image 2](screenshots/171-scenario-1-final-pass-after-planner-payload-fix-react-dislike-image-2.png)


### Turn 1 reaction

Disliked Image 2.

![s1 planner disliked image2](screenshots/172-scenario-1-final-pass-after-planner-payload-fix-s1-planner-disliked-image2.png)


### React Dislike to Image 3

Clicked Dislike for Image 3.

![react Dislike image 3](screenshots/173-scenario-1-final-pass-after-planner-payload-fix-react-dislike-image-3.png)


### Turn 1 reaction

Disliked Image 3.

![s1 planner disliked image3](screenshots/174-scenario-1-final-pass-after-planner-payload-fix-s1-planner-disliked-image3.png)


### React Dislike to Image 4

Clicked Dislike for Image 4.

![react Dislike image 4](screenshots/175-scenario-1-final-pass-after-planner-payload-fix-react-dislike-image-4.png)


### Turn 1 reaction

Disliked Image 4.

![s1 planner all reviewed](screenshots/176-scenario-1-final-pass-after-planner-payload-fix-s1-planner-all-reviewed.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: SP
  - generic: Sol Pastry
  - text: Threads
  - button "Sol Pastry Directions":
    - generic: Sol Pastry Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Sol Pastry Directions":
    - generic: SP
    - paragraph: Sol Pastry
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Sol Pastry Image Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - button "too childish"
    - button "missing fresh-baked texture"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 1 image
    - button "Generate 1 image" [disabled]:
      - text: Generate 1 image
- button "Open Next
```

![question shown](screenshots/177-scenario-1-final-pass-after-planner-payload-fix-question-shown.png)


### Turn 1 follow-up

Keep/avoid question appears after all images are reviewed.

![s1 planner keep avoid question](screenshots/178-scenario-1-final-pass-after-planner-payload-fix-s1-planner-keep-avoid-question.png)


### Answer feedback option

Selected option: warm morning bakery feel

![answer option warm morning bakery feel](screenshots/179-scenario-1-final-pass-after-planner-payload-fix-answer-option-warm-morning-bakery-feel.png)


### Turn 1 answer

Selected first contextual reason chip.

![s1 planner answer](screenshots/180-scenario-1-final-pass-after-planner-payload-fix-s1-planner-answer.png)


### Generate next turn

Clicked Generate 1 image.

![clicked Generate 1 image](screenshots/181-scenario-1-final-pass-after-planner-payload-fix-clicked-generate-1-image.png)


### Generate Turn 2

Clicked Generate 1 image after planner payload fix.

![s1 planner turn2 loading](screenshots/182-scenario-1-final-pass-after-planner-payload-fix-s1-planner-turn2-loading.png)


### Turn 2 ready

Second generation node has 1 generated image and no context-window error.

![s1 planner turn2 ready](screenshots/183-scenario-1-final-pass-after-planner-payload-fix-s1-planner-turn2-ready.png)


### React Dislike to Image 1

Clicked Dislike for Image 1.

![react Dislike image 1](screenshots/184-scenario-1-final-pass-after-planner-payload-fix-react-dislike-image-1.png)


### Turn 2 reaction

Disliked the single refined image.

![s1 turn2 disliked](screenshots/185-scenario-1-final-pass-after-planner-payload-fix-s1-turn2-disliked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: SP
  - generic: Sol Pastry
  - text: Threads
  - button "Sol Pastry Directions":
    - generic: Sol Pastry Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Sol Pastry Directions":
    - generic: SP
    - paragraph: Sol Pastry
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Sol Pastry Image Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Are these missing because of style, audience, or goal?
    - button "style"
    - button "audience"
    - button "goal"
    - button "subject focus"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: explore · 4 images
    - button "Again · 4" [disabled]:
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Morning Commuter Delight
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - paragraph: Review every image first.
    - paragraph: React to each image with like, dislike, or skip. The next question appe
```

![question shown](screenshots/186-scenario-1-final-pass-after-planner-payload-fix-question-shown.png)


### Turn 2 follow-up

Expected a correction question about what changed in the wrong way.

![s1 turn2 correction question](screenshots/187-scenario-1-final-pass-after-planner-payload-fix-s1-turn2-correction-question.png)


### Answer feedback option

Selected option: style

![answer option style](screenshots/188-scenario-1-final-pass-after-planner-payload-fix-answer-option-style.png)


### Turn 2 answer

Selected first correction reason chip.

![s1 turn2 answer](screenshots/189-scenario-1-final-pass-after-planner-payload-fix-s1-turn2-answer.png)


### Generate next turn

Clicked Again · 4.

![clicked Again · 4](screenshots/190-scenario-1-final-pass-after-planner-payload-fix-clicked-again-4.png)


### Generate Turn 3

Clicked Generate 1 image for correction.

![s1 turn3 loading](screenshots/191-scenario-1-final-pass-after-planner-payload-fix-s1-turn3-loading.png)


### Turn 3 ready

Third generation node has 4 corrected image.

![s1 turn3 ready](screenshots/192-scenario-1-final-pass-after-planner-payload-fix-s1-turn3-ready.png)



## Scenario 1 Clean Scoped Pass

Persona: Tess, bakery owner choosing commuter breakfast imagery. Brand: Tess Croissant; category: bakery; goal: product imagery; audience: office commuters. Tone and avoid notes left blank. This pass uses scoped turn controls after fixing planner payload and QA automation targeting.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/193-scenario-1-clean-scoped-pass-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/194-scenario-1-clean-scoped-pass-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Tess Croissant","category":"bakery","goal":"product imagery","audience":"office commuters"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/195-scenario-1-clean-scoped-pass-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/196-scenario-1-clean-scoped-pass-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/197-scenario-1-clean-scoped-pass-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/198-scenario-1-clean-scoped-pass-thread-started-generating.png)


### Generation ready: s1 clean turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s1 clean turn1 ready](screenshots/199-scenario-1-clean-scoped-pass-generation-ready-s1-clean-turn1-ready.png)


### Turn 1 ready

Four generated image assets appeared.

![s1 clean turn1 generated](screenshots/200-scenario-1-clean-scoped-pass-s1-clean-turn1-generated.png)


### Turn 1 reaction

Liked Image 1.

![s1 clean liked image1](screenshots/201-scenario-1-clean-scoped-pass-s1-clean-liked-image1.png)


### Turn 1 reaction

Disliked Image 2.

![s1 clean disliked image2](screenshots/202-scenario-1-clean-scoped-pass-s1-clean-disliked-image2.png)


### Turn 1 reaction

Disliked Image 3.

![s1 clean disliked image3](screenshots/203-scenario-1-clean-scoped-pass-s1-clean-disliked-image3.png)


### Turn 1 reaction

Disliked Image 4.

![s1 clean all reviewed](screenshots/204-scenario-1-clean-scoped-pass-s1-clean-all-reviewed.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: TC
  - generic: Tess Croissant
  - text: Threads
  - button "Tess Croissant Directions":
    - generic: Tess Croissant Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Tess Croissant Directions":
    - generic: TC
    - paragraph: Tess Croissant
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Tess Croissant Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "simple social-post layout"
    - button "missing fresh-baked texture"
    - button "not breakfast-focused"
    - button "too polished"
    - button "warm morning bakery feel"
    - button "cozy local bakery mood"
    - button "too dark"
    - button "too childish"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 1 image
    - button "Generate 1 image" [disabled]:
      - text: Generate 1 image
- button "Open Next
```

![question shown](screenshots/205-scenario-1-clean-scoped-pass-question-shown.png)


### Turn 1 follow-up

What should we keep from Image 1 and avoid from the others?

![s1 clean keep avoid question recovered](screenshots/206-scenario-1-clean-scoped-pass-s1-clean-keep-avoid-question-recovered.png)


### Turn 1 answer

Selected feedback chip: fresh-baked texture.

![s1 clean keep avoid answered recovered](screenshots/207-scenario-1-clean-scoped-pass-s1-clean-keep-avoid-answered-recovered.png)


### Generate Turn 2

Clicked Generate 1 image.

![s1 clean turn2 loading recovered](screenshots/208-scenario-1-clean-scoped-pass-s1-clean-turn2-loading-recovered.png)


### Turn 2 ready

Gen 2 rendered 1 image.

![s1 clean turn2 ready recovered](screenshots/209-scenario-1-clean-scoped-pass-s1-clean-turn2-ready-recovered.png)


### Turn 2 reaction

Disliked the refined image.

![s1 clean turn2 disliked recovered](screenshots/210-scenario-1-clean-scoped-pass-s1-clean-turn2-disliked-recovered.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: TC
  - generic: Tess Croissant
  - text: Threads
  - button "Tess Croissant Directions":
    - generic: Tess Croissant Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Tess Croissant Directions":
    - generic: TC
    - paragraph: Tess Croissant
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Tess Croissant Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "missing commuter context"
    - button "lacks fresh-baked texture"
    - button "too busy background"
    - button "not minimalist enough"
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: edit · 1 image
    - button "Again · 1":
      - text: Again · 1
  - article:
    - generic: 
```

![question shown](screenshots/211-scenario-1-clean-scoped-pass-question-shown.png)


### Turn 2 follow-up

Should we revise the brief before continuing?

![s1 clean turn2 correction question recovered](screenshots/212-scenario-1-clean-scoped-pass-s1-clean-turn2-correction-question-recovered.png)


### Turn 2 answer

Selected correction chip: Apply brief revision.

![s1 clean turn2 answered recovered](screenshots/213-scenario-1-clean-scoped-pass-s1-clean-turn2-answered-recovered.png)


### Generate Turn 3

Clicked Generate 1 image for corrected continuation.

![s1 clean turn3 loading recovered](screenshots/214-scenario-1-clean-scoped-pass-s1-clean-turn3-loading-recovered.png)


### Turn 3 ready

Gen 3 rendered 1 corrected image.

![s1 clean turn3 ready recovered](screenshots/215-scenario-1-clean-scoped-pass-s1-clean-turn3-ready-recovered.png)


### Turn 3 reaction

Liked the corrected image.

![s1 clean turn3 liked recovered](screenshots/216-scenario-1-clean-scoped-pass-s1-clean-turn3-liked-recovered.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: TC
  - generic: Tess Croissant
  - text: Threads
  - button "Tess Croissant Directions":
    - generic: Tess Croissant Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Tess Croissant Directions":
    - generic: TC
    - paragraph: Tess Croissant
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Tess Croissant Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "fresh-baked texture"
    - button "modern minimalist appeal"
    - button "city background not impactful enough"
    - button "missing breakfast vibe"
    - button "too tech-focused"
    - button "warm morning bakery feel"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: edit · 1 image
    - button "Again · 1":
      - text: Again · 1
  - article:
    - 
```

![question shown](screenshots/217-scenario-1-clean-scoped-pass-question-shown.png)


### Turn 3 follow-up

All four work. What should we optimize for?

![s1 clean final question recovered](screenshots/218-scenario-1-clean-scoped-pass-s1-clean-final-question-recovered.png)


### Bug found - one-image turns used four-image logic

Scenario 1 reached Gen 2 and Gen 3, but the follow-up questions were wrong: one disliked refinement asked to revise the brief, and one liked correction said all four work. Fix applied in lib/feedback/decisionEngine.ts: single-image like/dislike handling now runs before all-liked/all-disliked aggregate logic. Added feedback scenario tests for both cases.

![bug single image wrong followup](screenshots/219-scenario-1-clean-scoped-pass-bug-single-image-wrong-followup.png)



## Scenario 1 Verified Pass After Single-Image Decision Fix

Persona: Bea, bakery owner reviewing commuter breakfast imagery. Brand: Bea Bakery; category: bakery; goal: product imagery; audience: office commuters. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/220-scenario-1-verified-pass-after-single-image-decision-fix-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/221-scenario-1-verified-pass-after-single-image-decision-fix-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Bea Bakery","category":"bakery","goal":"product imagery","audience":"office commuters"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/222-scenario-1-verified-pass-after-single-image-decision-fix-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/223-scenario-1-verified-pass-after-single-image-decision-fix-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/224-scenario-1-verified-pass-after-single-image-decision-fix-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/225-scenario-1-verified-pass-after-single-image-decision-fix-thread-started-generating.png)


### Generation ready: s1 verified turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s1 verified turn1 ready](screenshots/226-scenario-1-verified-pass-after-single-image-decision-fix-generation-ready-s1-verified-turn1-ready.png)


### Turn 1 ready

Four generated single-image assets appeared.

![s1 verified turn1 generated](screenshots/227-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn1-generated.png)


### Turn 1 reaction

Liked Image 1.

![s1 verified liked image1](screenshots/228-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-liked-image1.png)


### Turn 1 reaction

Disliked Image 2.

![s1 verified disliked image2](screenshots/229-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-disliked-image2.png)


### Turn 1 reaction

Disliked Image 3.

![s1 verified disliked image3](screenshots/230-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-disliked-image3.png)


### Turn 1 reaction

Disliked Image 4.

![s1 verified all reviewed](screenshots/231-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-all-reviewed.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: BB
  - generic: Bea Bakery
  - text: Threads
  - button "Bea Bakery Directions":
    - generic: Bea Bakery Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Bea Bakery Directions":
    - generic: BB
    - paragraph: Bea Bakery
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Bea Bakery Image Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - button "too childish"
    - button "missing fresh-baked texture"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 1 image
    - button "Generate 1 image" [disabled]:
      - text: Generate 1 image
- button "Open Next
```

![question shown](screenshots/232-scenario-1-verified-pass-after-single-image-decision-fix-question-shown.png)


### Turn 1 follow-up

What should we keep from Image 1 and avoid from the others?

![s1 verified keep avoid question](screenshots/233-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-keep-avoid-question.png)


### Turn 1 answer

Selected feedback chip: warm morning bakery feel.

![s1 verified answer keep avoid](screenshots/234-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-answer-keep-avoid.png)


### Generate Turn 2

Clicked Generate 1 image.

![s1 verified turn2 loading](screenshots/235-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn2-loading.png)


### Turn 2 ready

Gen 2 rendered 1 image.

![s1 verified turn2 ready](screenshots/236-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn2-ready.png)


### Turn 2 reaction

Disliked the refined image.

![s1 verified turn2 disliked](screenshots/237-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn2-disliked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: BB
  - generic: Bea Bakery
  - text: Threads
  - button "Bea Bakery Directions":
    - generic: Bea Bakery Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Bea Bakery Directions":
    - generic: BB
    - paragraph: Bea Bakery
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Bea Bakery Image Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - button "too childish"
    - button "missing fresh-baked texture"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: edit · 1 image
    - button "Again · 1":
      - text: Again · 1
  - article:
    - generic: Gen 2
    - generic: Cozy Urban Morning
    - button "Image 1":
      - img "Image 1"
    - button "Like":
```

![question shown](screenshots/238-scenario-1-verified-pass-after-single-image-decision-fix-question-shown.png)


### Turn 2 follow-up

You liked open subject direction and warm before. What changed in the wrong way?

![s1 verified turn2 correction question](screenshots/239-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn2-correction-question.png)


### Turn 2 answer

Selected correction chip: too polished.

![s1 verified turn2 answered](screenshots/240-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn2-answered.png)


### Generate Turn 3

Clicked Generate 1 image for corrected continuation.

![s1 verified turn3 loading](screenshots/241-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn3-loading.png)


### Turn 3 ready

Gen 3 rendered 1 corrected image.

![s1 verified turn3 ready](screenshots/242-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn3-ready.png)


### Turn 3 reaction

Liked the corrected image.

![s1 verified turn3 liked](screenshots/243-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-turn3-liked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: BB
  - generic: Bea Bakery
  - text: Threads
  - button "Bea Bakery Directions":
    - generic: Bea Bakery Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Bea Bakery Directions":
    - generic: BB
    - paragraph: Bea Bakery
    - paragraph: bakery · product imagery
  - article:
    - generic: Gen 1
    - generic: Bea Bakery Image Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What should we keep from Image 1 and avoid from the others?
    - button "warm morning bakery feel"
    - button "fresh-baked texture"
    - button "croissant as hero"
    - button "cozy local bakery mood"
    - button "simple social-post layout"
    - button "too polished"
    - button "too dark"
    - button "not breakfast-focused"
    - button "too childish"
    - button "missing fresh-baked texture"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: edit · 1 image
    - button "Again · 1":
      - text: Again · 1
  - article:
    - generic: Gen 2
    - generic: Cozy Urban Morning
    - button "Image 1":
      - img "Image 1"
    - button "Like":
```

![question shown](screenshots/244-scenario-1-verified-pass-after-single-image-decision-fix-question-shown.png)


### Turn 3 follow-up

Should this become the direction, or should we make variations?

![s1 verified final question](screenshots/245-scenario-1-verified-pass-after-single-image-decision-fix-s1-verified-final-question.png)



## Scenario 2 - User Dislikes All 4 Twice

Persona: Mina, skincare founder testing trust-building launch visuals. Brand: Dewleaf Skin; category: skincare; goal: social ads; audience: busy urban women. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/246-scenario-2-user-dislikes-all-4-twice-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/247-scenario-2-user-dislikes-all-4-twice-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Dewleaf Skin","category":"skincare","goal":"social ads","audience":"busy urban women"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/248-scenario-2-user-dislikes-all-4-twice-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/249-scenario-2-user-dislikes-all-4-twice-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/250-scenario-2-user-dislikes-all-4-twice-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/251-scenario-2-user-dislikes-all-4-twice-thread-started-generating.png)


### Generation ready: s2 turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s2 turn1 ready](screenshots/252-scenario-2-user-dislikes-all-4-twice-generation-ready-s2-turn1-ready.png)


### Turn 1 ready

Four skincare social ad directions generated.

![s2 turn1 generated](screenshots/253-scenario-2-user-dislikes-all-4-twice-s2-turn1-generated.png)


### Turn 1 reaction

Disliked all four generated images.

![s2 turn1 all disliked](screenshots/254-scenario-2-user-dislikes-all-4-twice-s2-turn1-all-disliked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: DS
  - generic: Dewleaf Skin
  - text: Threads
  - button "Dewleaf Skin Directions":
    - generic: Dewleaf Skin Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Dewleaf Skin Directions":
    - generic: DS
    - paragraph: Dewleaf Skin
    - paragraph: skincare · social ads
  - article:
    - generic: Gen 1
    - generic: Dewleaf Skin Social Ads Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Are these missing because of style, audience, or goal?
    - button "style"
    - button "audience"
    - button "goal"
    - button "subject focus"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: explore · 4 images
    - button "Generate 4 images" [disabled]:
      - text: Generate 4 images
- button "Open Next
```

![question shown](screenshots/255-scenario-2-user-dislikes-all-4-twice-question-shown.png)


### Turn 1 follow-up

Are these missing because of style, audience, or goal?

![s2 turn1 all missed question](screenshots/256-scenario-2-user-dislikes-all-4-twice-s2-turn1-all-missed-question.png)


### Turn 1 answer

Selected reason: style.

![s2 turn1 answered](screenshots/257-scenario-2-user-dislikes-all-4-twice-s2-turn1-answered.png)


### Generate Turn 2

Clicked Generate 4 images for shifted alternatives.

![s2 turn2 loading](screenshots/258-scenario-2-user-dislikes-all-4-twice-s2-turn2-loading.png)


### Turn 2 ready

Second generation rendered 4 images.

![s2 turn2 generated](screenshots/259-scenario-2-user-dislikes-all-4-twice-s2-turn2-generated.png)


### Turn 2 reaction

Disliked all four shifted alternatives.

![s2 turn2 all disliked](screenshots/260-scenario-2-user-dislikes-all-4-twice-s2-turn2-all-disliked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: DS
  - generic: Dewleaf Skin
  - text: Threads
  - button "Dewleaf Skin Directions":
    - generic: Dewleaf Skin Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Dewleaf Skin Directions":
    - generic: DS
    - paragraph: Dewleaf Skin
    - paragraph: skincare · social ads
  - article:
    - generic: Gen 1
    - generic: Dewleaf Skin Social Ads Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Should we revise the brief before continuing?
    - textbox "Sharper goal": social ads
    - textbox "Audience": busy urban women
    - textbox "Tone, comma separated"
    - textbox "Avoid"
    - button "Apply brief revision"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: revise goal · 4 images
    - button "Again · 4" [disabled]:
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Brand Image Trace - Style Shift
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      -
```

![question shown](screenshots/261-scenario-2-user-dislikes-all-4-twice-question-shown.png)


### Turn 2 follow-up

Should we revise the brief before continuing?

![s2 turn2 goal revision question](screenshots/262-scenario-2-user-dislikes-all-4-twice-s2-turn2-goal-revision-question.png)


### Apply goal revision

Applied the goal revision form using the existing brand fields for this test pass.

![s2 goal revision applied](screenshots/263-scenario-2-user-dislikes-all-4-twice-s2-goal-revision-applied.png)


### Generate Turn 3

Clicked Generate 4 images from the revised brief state.

![s2 turn3 loading](screenshots/264-scenario-2-user-dislikes-all-4-twice-s2-turn3-loading.png)


### Turn 3 ready

Third generation rendered 4 revised-goal images.

![s2 turn3 generated](screenshots/265-scenario-2-user-dislikes-all-4-twice-s2-turn3-generated.png)


### Turn 3 reaction

Liked Image 3 after the revised-goal generation.

![s2 turn3 liked image3](screenshots/266-scenario-2-user-dislikes-all-4-twice-s2-turn3-liked-image3.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: DS
  - generic: Dewleaf Skin
  - text: Threads
  - button "Dewleaf Skin Directions":
    - generic: Dewleaf Skin Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Dewleaf Skin Directions":
    - generic: DS
    - paragraph: Dewleaf Skin
    - paragraph: skincare · social ads
  - article:
    - generic: Gen 1
    - generic: Dewleaf Skin Social Ads Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Should we revise the brief before continuing?
    - textbox "Sharper goal": social ads
    - textbox "Audience": busy urban women
    - textbox "Tone, comma separated"
    - textbox "Avoid"
    - button "Apply brief revision"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: revise goal · 4 images
    - button "Again · 4" [disabled]:
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Brand Image Trace - Style Shift
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      -
```

![question shown](screenshots/267-scenario-2-user-dislikes-all-4-twice-question-shown.png)


### Turn 3 follow-up

Skip remaining

![s2 turn3 what worked question](screenshots/268-scenario-2-user-dislikes-all-4-twice-s2-turn3-what-worked-question.png)


### Turn 3 complete signal

Skipped the other three images so the single liked Image 3 becomes the clear signal.

![s2 turn3 liked one skipped rest](screenshots/269-scenario-2-user-dislikes-all-4-twice-s2-turn3-liked-one-skipped-rest.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: DS
  - generic: Dewleaf Skin
  - text: Threads
  - button "Dewleaf Skin Directions":
    - generic: Dewleaf Skin Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Dewleaf Skin Directions":
    - generic: DS
    - paragraph: Dewleaf Skin
    - paragraph: skincare · social ads
  - article:
    - generic: Gen 1
    - generic: Dewleaf Skin Social Ads Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Should we revise the brief before continuing?
    - textbox "Sharper goal": social ads
    - textbox "Audience": busy urban women
    - textbox "Tone, comma separated"
    - textbox "Avoid"
    - button "Apply brief revision"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: revise goal · 4 images
    - button "Again · 4" [disabled]:
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Brand Image Trace - Style Shift
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      -
```

![question shown](screenshots/270-scenario-2-user-dislikes-all-4-twice-question-shown.png)


### Turn 3 follow-up after complete signal

What feels closest?

![s2 turn3 final question after skips](screenshots/271-scenario-2-user-dislikes-all-4-twice-s2-turn3-final-question-after-skips.png)


### Bug found - post-rejection positive signal too generic

After two all-disliked turns and one finally liked image, the app asked generic “What feels closest?” instead of “What finally worked here?”. Fix applied in lib/feedback/decisionEngine.ts: macro memory now detects a first positive signal after repeated rejection and asks what finally worked, then plans a 1-image refinement. Added scenario test coverage.

![bug scenario2 generic finally worked](screenshots/272-scenario-2-user-dislikes-all-4-twice-bug-scenario2-generic-finally-worked.png)


### Reload Scenario 2 state

Reloaded persisted Scenario 2 state after the decision-engine fix so the Turn 3 follow-up recomputes.

![s2 reload after finally worked fix](screenshots/273-scenario-2-user-dislikes-all-4-twice-s2-reload-after-finally-worked-fix.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: DS
  - generic: Dewleaf Skin
  - text: Threads
  - button "Dewleaf Skin Directions":
    - generic: Dewleaf Skin Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Dewleaf Skin Directions":
    - generic: DS
    - paragraph: Dewleaf Skin
    - paragraph: skincare · social ads
  - article:
    - generic: Gen 1
    - generic: Dewleaf Skin Social Ads Visual Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Should we revise the brief before continuing?
    - textbox "Sharper goal": social ads
    - textbox "Audience": busy urban women
    - textbox "Tone, comma separated"
    - textbox "Avoid"
    - button "Apply brief revision"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: revise goal · 4 images
    - button "Again · 4" [disabled]:
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Brand Image Trace - Style Shift
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      -
```

![question shown](screenshots/274-scenario-2-user-dislikes-all-4-twice-question-shown.png)


### Turn 3 corrected follow-up

What finally worked here?

![s2 turn3 finally worked fixed](screenshots/275-scenario-2-user-dislikes-all-4-twice-s2-turn3-finally-worked-fixed.png)



## Scenario 3 - User Likes Everything

Persona: Jules, coffee founder choosing launch campaign visuals. Brand: North Cup; category: coffee; goal: launch campaign; audience: remote workers. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/276-scenario-3-user-likes-everything-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/277-scenario-3-user-likes-everything-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"North Cup","category":"coffee","goal":"launch campaign","audience":"remote workers"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/278-scenario-3-user-likes-everything-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/279-scenario-3-user-likes-everything-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/280-scenario-3-user-likes-everything-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/281-scenario-3-user-likes-everything-thread-started-generating.png)


### Generation ready: s3 turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s3 turn1 ready](screenshots/282-scenario-3-user-likes-everything-generation-ready-s3-turn1-ready.png)


### Turn 1 ready

Four coffee launch directions generated.

![s3 turn1 generated](screenshots/283-scenario-3-user-likes-everything-s3-turn1-generated.png)


### Turn 1 reaction

Liked all four images.

![s3 turn1 all liked](screenshots/284-scenario-3-user-likes-everything-s3-turn1-all-liked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: NC
  - generic: North Cup
  - text: Threads
  - button "North Cup Directions":
    - generic: North Cup Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "North Cup Directions":
    - generic: NC
    - paragraph: North Cup
    - paragraph: coffee · launch campaign
  - article:
    - generic: Gen 1
    - generic: "North Cup: Visual Exploration for Launch Campaign"
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like" [active]:
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: All four work. What should we optimize for?
    - button "make one specific revision"
    - button "help me choose"
    - button "adapt for campaign format"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 4 images
    - button "Generate 4 images" [disabled]:
      - text: Generate 4 images
- button "Open Next
```

![question shown](screenshots/285-scenario-3-user-likes-everything-question-shown.png)


### Turn 1 follow-up

All four work. What should we optimize for?

![s3 turn1 optimize question](screenshots/286-scenario-3-user-likes-everything-s3-turn1-optimize-question.png)


### Turn 1 answer

Selected option: make one specific revision.

![s3 turn1 answered](screenshots/287-scenario-3-user-likes-everything-s3-turn1-answered.png)


### Generate Turn 2

Clicked Generate after all-liked optimization choice.

![s3 turn2 loading](screenshots/288-scenario-3-user-likes-everything-s3-turn2-loading.png)


### Turn 2 ready

Turn 2 rendered 1 image.

![s3 turn2 generated](screenshots/289-scenario-3-user-likes-everything-s3-turn2-generated.png)


### Turn 2 reaction

Liked the revised single image.

![s3 turn2 liked](screenshots/290-scenario-3-user-likes-everything-s3-turn2-liked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: NC
  - generic: North Cup
  - text: Threads
  - button "North Cup Directions":
    - generic: North Cup Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "North Cup Directions":
    - generic: NC
    - paragraph: North Cup
    - paragraph: coffee · launch campaign
  - article:
    - generic: Gen 1
    - generic: "North Cup: Visual Exploration for Launch Campaign"
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Should this become the preferred direction?
    - button "save direction"
    - button "make close variations"
    - button "create a small campaign set"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: save direction · 1 image
    - button "Save direction" [disabled]:
      - text: Save direction
  - article:
    - generic: Gen 2
    - generic: "Refined Coziness: Optimize & Evoke Tranquility"
    - button "Image 1":
      - img "Image 1"
    - button "Like" [active]:
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Should this become the d
```

![question shown](screenshots/291-scenario-3-user-likes-everything-question-shown.png)


### Turn 2 follow-up

Should this become the direction, or should we make variations?

![s3 turn2 followup](screenshots/292-scenario-3-user-likes-everything-s3-turn2-followup.png)



## Scenario 4 - User Likes Two Conflicting Directions

Persona: Kai, fashion brand owner choosing campaign direction. Brand: Patchline; category: fashion; goal: visual identity; audience: Gen Z streetwear shoppers. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/293-scenario-4-user-likes-two-conflicting-directions-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/294-scenario-4-user-likes-two-conflicting-directions-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Patchline","category":"fashion","goal":"visual identity","audience":"Gen Z streetwear shoppers"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/295-scenario-4-user-likes-two-conflicting-directions-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/296-scenario-4-user-likes-two-conflicting-directions-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/297-scenario-4-user-likes-two-conflicting-directions-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/298-scenario-4-user-likes-two-conflicting-directions-thread-started-generating.png)


### Generation ready: s4 turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s4 turn1 ready](screenshots/299-scenario-4-user-likes-two-conflicting-directions-generation-ready-s4-turn1-ready.png)


### Turn 1 ready

Four fashion direction images generated.

![s4 turn1 generated](screenshots/300-scenario-4-user-likes-two-conflicting-directions-s4-turn1-generated.png)


### Turn 1 reaction

Liked Image 1 as one direction.

![s4 liked image1](screenshots/301-scenario-4-user-likes-two-conflicting-directions-s4-liked-image1.png)


### Turn 1 reaction

Skipped Image 2.

![s4 skipped image2](screenshots/302-scenario-4-user-likes-two-conflicting-directions-s4-skipped-image2.png)


### Turn 1 reaction

Skipped Image 3.

![s4 skipped image3](screenshots/303-scenario-4-user-likes-two-conflicting-directions-s4-skipped-image3.png)


### Turn 1 reaction

Liked Image 4 as a second direction.

![s4 liked image4](screenshots/304-scenario-4-user-likes-two-conflicting-directions-s4-liked-image4.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: PA
  - generic: Patchline
  - text: Threads
  - button "Patchline Directions":
    - generic: Patchline Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Patchline Directions":
    - generic: PA
    - paragraph: Patchline
    - paragraph: fashion · visual identity
  - article:
    - generic: Gen 1
    - generic: "Patchline: Visual Identity Directions"
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like" [active]:
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Not seeing a strong direction?
    - button "show broader alternatives"
    - button "stay closer to brand"
    - button "try a different tone"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: explore · 4 images
    - button "Generate 4 images" [disabled]:
      - text: Generate 4 images
- button "Open Next
```

![question shown](screenshots/305-scenario-4-user-likes-two-conflicting-directions-question-shown.png)


### Turn 1 follow-up

Not seeing a strong direction?

![s4 conflicting question](screenshots/306-scenario-4-user-likes-two-conflicting-directions-s4-conflicting-question.png)


### Bug found - skips overrode conflicting likes

Scenario 4 liked Image 1 and Image 4 while skipping the others, but the app asked “Not seeing a strong direction?” because skip-count logic ran before positive-signal logic. Fix applied in lib/feedback/decisionEngine.ts: skip-heavy behavior only wins when there are no likes or dislikes. Added test coverage.

![bug scenario4 skips overrode likes](screenshots/307-scenario-4-user-likes-two-conflicting-directions-bug-scenario4-skips-overrode-likes.png)


### Reload Scenario 4 state

Reloaded after skip-priority fix so the existing liked/skipped reactions recompute.

![s4 reload after skip priority fix](screenshots/308-scenario-4-user-likes-two-conflicting-directions-s4-reload-after-skip-priority-fix.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: PA
  - generic: Patchline
  - text: Threads
  - button "Patchline Directions":
    - generic: Patchline Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Patchline Directions":
    - generic: PA
    - paragraph: Patchline
    - paragraph: fashion · visual identity
  - article:
    - generic: Gen 1
    - generic: "Patchline: Visual Identity Directions"
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: These point to different directions. Explore both or combine them?
    - button "explore both"
    - button "combine what works"
    - button "pick one direction"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: split · 4 images
    - button "Generate 4 images" [disabled]:
      - text: Generate 4 images
- button "Open Next
```

![question shown](screenshots/309-scenario-4-user-likes-two-conflicting-directions-question-shown.png)


### Turn 1 corrected follow-up

These point to different directions. Explore both or combine them?

![s4 conflicting question fixed](screenshots/310-scenario-4-user-likes-two-conflicting-directions-s4-conflicting-question-fixed.png)


### Turn 1 answer

Selected option: explore both.

![s4 explore both selected](screenshots/311-scenario-4-user-likes-two-conflicting-directions-s4-explore-both-selected.png)


### Generate Turn 2

Clicked Generate 4 images for the split/conflicting directions.

![s4 turn2 loading](screenshots/312-scenario-4-user-likes-two-conflicting-directions-s4-turn2-loading.png)


### Turn 2 ready

Split continuation rendered 4 images.

![s4 turn2 generated](screenshots/313-scenario-4-user-likes-two-conflicting-directions-s4-turn2-generated.png)


### Turn 2 reaction

Disliked Image 1 as the weaker branch.

![s4 turn2 disliked image1](screenshots/314-scenario-4-user-likes-two-conflicting-directions-s4-turn2-disliked-image1.png)


### Turn 2 reaction

Liked Image 2 as the stronger branch.

![s4 turn2 liked image2](screenshots/315-scenario-4-user-likes-two-conflicting-directions-s4-turn2-liked-image2.png)


### Turn 2 complete signal

Skipped the two remaining split images.

![s4 turn2 complete signal](screenshots/316-scenario-4-user-likes-two-conflicting-directions-s4-turn2-complete-signal.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: PA
  - generic: Patchline
  - text: Threads
  - button "Patchline Directions":
    - generic: Patchline Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Patchline Directions":
    - generic: PA
    - paragraph: Patchline
    - paragraph: fashion · visual identity
  - article:
    - generic: Gen 1
    - generic: "Patchline: Visual Identity Directions"
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: These point to different directions. Explore both or combine them?
    - button "explore both"
    - button "combine what works"
    - button "pick one direction"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: split · 4 images
    - button "Again · 4":
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Patchline Visual Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "U
```

![question shown](screenshots/317-scenario-4-user-likes-two-conflicting-directions-question-shown.png)


### Turn 2 follow-up

What makes Image 2 appealing to you?

![s4 turn2 retire or keep question](screenshots/318-scenario-4-user-likes-two-conflicting-directions-s4-turn2-retire-or-keep-question.png)


### Bug found - split result asked generic like question

After “explore both,” the second turn with one liked and one disliked branch asked “What makes Image 2 appealing?” instead of resolving the split. Fix applied in lib/feedback/decisionEngine.ts: prior split + mixed like/dislike now asks whether to retire the weaker path or keep a small part, and plans one combined image. Added scenario test coverage.

![bug scenario4 split generic question](screenshots/319-scenario-4-user-likes-two-conflicting-directions-bug-scenario4-split-generic-question.png)


### Reload Scenario 4 state

Reloaded after adding the split-resolution branch.

![s4 reload split resolution](screenshots/320-scenario-4-user-likes-two-conflicting-directions-s4-reload-split-resolution.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: PA
  - generic: Patchline
  - text: Threads
  - button "Patchline Directions":
    - generic: Patchline Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Patchline Directions":
    - generic: PA
    - paragraph: Patchline
    - paragraph: fashion · visual identity
  - article:
    - generic: Gen 1
    - generic: "Patchline: Visual Identity Directions"
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: These point to different directions. Explore both or combine them?
    - button "explore both"
    - button "combine what works"
    - button "pick one direction"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: split · 4 images
    - button "Again · 4" [disabled]:
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Patchline Visual Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    
```

![question shown](screenshots/321-scenario-4-user-likes-two-conflicting-directions-question-shown.png)


### Turn 2 corrected follow-up

Should we retire the weaker path or keep a small part of it?

![s4 split resolution question fixed](screenshots/322-scenario-4-user-likes-two-conflicting-directions-s4-split-resolution-question-fixed.png)


### Turn 2 answer

Selected option: retire the weaker path.

![s4 split resolution answered](screenshots/323-scenario-4-user-likes-two-conflicting-directions-s4-split-resolution-answered.png)


### Generate Turn 3

Clicked Generate 1 merged image.

![s4 turn3 loading](screenshots/324-scenario-4-user-likes-two-conflicting-directions-s4-turn3-loading.png)


### Turn 3 ready

Merged continuation rendered 1 image.

![s4 turn3 generated](screenshots/325-scenario-4-user-likes-two-conflicting-directions-s4-turn3-generated.png)


### Turn 3 reaction

Liked the merged image.

![s4 turn3 liked](screenshots/326-scenario-4-user-likes-two-conflicting-directions-s4-turn3-liked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: PA
  - generic: Patchline
  - text: Threads
  - button "Patchline Directions":
    - generic: Patchline Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Patchline Directions":
    - generic: PA
    - paragraph: Patchline
    - paragraph: fashion · visual identity
  - article:
    - generic: Gen 1
    - generic: "Patchline: Visual Identity Directions"
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: These point to different directions. Explore both or combine them?
    - button "explore both"
    - button "combine what works"
    - button "pick one direction"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: split · 4 images
    - button "Again · 4" [disabled]:
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Patchline Visual Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    
```

![question shown](screenshots/327-scenario-4-user-likes-two-conflicting-directions-question-shown.png)


### Turn 3 follow-up

Should this become the direction, or should we make variations?

![s4 save direction question](screenshots/328-scenario-4-user-likes-two-conflicting-directions-s4-save-direction-question.png)



## Scenario 5 - User Gives a Direct Edit

Persona: Imani, SaaS marketer refining a product visual. Brand: ForgeDesk; category: SaaS; goal: product imagery; audience: operations leaders. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/329-scenario-5-user-gives-a-direct-edit-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/330-scenario-5-user-gives-a-direct-edit-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"ForgeDesk","category":"SaaS","goal":"product imagery","audience":"operations leaders"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/331-scenario-5-user-gives-a-direct-edit-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/332-scenario-5-user-gives-a-direct-edit-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/333-scenario-5-user-gives-a-direct-edit-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/334-scenario-5-user-gives-a-direct-edit-thread-started-generating.png)


### Generation ready: s5 turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s5 turn1 ready](screenshots/335-scenario-5-user-gives-a-direct-edit-generation-ready-s5-turn1-ready.png)


### Turn 1 ready

Four SaaS product imagery directions generated.

![s5 turn1 generated](screenshots/336-scenario-5-user-gives-a-direct-edit-s5-turn1-generated.png)


### Turn 1 reaction

Liked Image 2 and skipped the others.

![s5 liked image2 skipped others](screenshots/337-scenario-5-user-gives-a-direct-edit-s5-liked-image2-skipped-others.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: FO
  - generic: ForgeDesk
  - text: Threads
  - button "ForgeDesk Directions":
    - generic: ForgeDesk Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "ForgeDesk Directions":
    - generic: FO
    - paragraph: ForgeDesk
    - paragraph: SaaS · product imagery
  - article:
    - generic: Gen 1
    - generic: ForgeDesk Visual Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip" [active]:
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Why did you like Image 2?
    - button "Effective use of vibrant colors (blue and green)"
    - button "Subtle monogram integration"
    - button "Represents efficiency and connectivity"
    - button "Fits tech and growth theme"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: refine · 1 image
    - button "Generate 1 image" [disabled]:
      - text: Generate 1 image
- button "Open Next
```

![question shown](screenshots/338-scenario-5-user-gives-a-direct-edit-question-shown.png)


### Turn 1 initial follow-up before direct edit

Why did you like Image 2?

![s5 direct edit before typing](screenshots/339-scenario-5-user-gives-a-direct-edit-s5-direct-edit-before-typing.png)


### Direct edit typed

Typed: Remove the text and make the background warmer.

![s5 direct edit typed](screenshots/340-scenario-5-user-gives-a-direct-edit-s5-direct-edit-typed.png)


### Turn 1 state after direct edit text

Next generation: edit · 1 image

### Generate Turn 2

Clicked Generate after direct edit text.

![s5 turn2 loading](screenshots/341-scenario-5-user-gives-a-direct-edit-s5-turn2-loading.png)


### Turn 2 ready

Direct edit continuation rendered 1 image.

![s5 turn2 edited image](screenshots/342-scenario-5-user-gives-a-direct-edit-s5-turn2-edited-image.png)


### Turn 2 reaction

Marked edited image as better/liked before giving another direct edit.

![s5 turn2 liked before second edit](screenshots/343-scenario-5-user-gives-a-direct-edit-s5-turn2-liked-before-second-edit.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: FO
  - generic: ForgeDesk
  - text: Threads
  - button "ForgeDesk Directions":
    - generic: ForgeDesk Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "ForgeDesk Directions":
    - generic: FO
    - paragraph: ForgeDesk
    - paragraph: SaaS · product imagery
  - article:
    - generic: Gen 1
    - generic: ForgeDesk Visual Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - textbox "Optional steer, e.g. remove text and make the background warmer": Remove the text and make the background warmer.
    - text: "Another option:"
    - generic: edit · 1 image
    - button "Again · 1":
      - text: Again · 1
  - article:
    - generic: Gen 2
    - generic: Warm Gradient Network
    - button "Image 1":
      - img "Image 1"
    - button "Like" [active]:
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Should this become the direction, or should we make variations?
    - button "save direction"
    - button "make close variations"
    - button "adapt for campaign format"
    - textbox "Optional steer, e.g. remove text and make 
```

![question shown](screenshots/344-scenario-5-user-gives-a-direct-edit-question-shown.png)


### Turn 2 follow-up before second edit

Should this become the direction, or should we make variations?

![s5 turn2 question before second edit](screenshots/345-scenario-5-user-gives-a-direct-edit-s5-turn2-question-before-second-edit.png)


### Second direct edit typed

Typed in Turn 2 optional steer: Better, but the product feels too small.

![s5 second direct edit typed scoped](screenshots/346-scenario-5-user-gives-a-direct-edit-s5-second-direct-edit-typed-scoped.png)


### Turn 2 state after scoped edit text

Next generation: refine · 1 image

### Generate Turn 3

Clicked Generate after product focus edit.

![s5 turn3 loading scoped](screenshots/347-scenario-5-user-gives-a-direct-edit-s5-turn3-loading-scoped.png)


### Turn 3 ready

Second edit continuation rendered 1 image.

![s5 turn3 improved image scoped](screenshots/348-scenario-5-user-gives-a-direct-edit-s5-turn3-improved-image-scoped.png)


### Turn 3 reaction

Liked the improved image.

![s5 turn3 liked scoped](screenshots/349-scenario-5-user-gives-a-direct-edit-s5-turn3-liked-scoped.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: FO
  - generic: ForgeDesk
  - text: Threads
  - button "ForgeDesk Directions":
    - generic: ForgeDesk Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "ForgeDesk Directions":
    - generic: FO
    - paragraph: ForgeDesk
    - paragraph: SaaS · product imagery
  - article:
    - generic: Gen 1
    - generic: ForgeDesk Visual Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - textbox "Optional steer, e.g. remove text and make the background warmer": Remove the text and make the background warmer.
    - text: "Another option:"
    - generic: edit · 1 image
    - button "Again · 1":
      - text: Again · 1
  - article:
    - generic: Gen 2
    - generic: Warm Gradient Network
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - textbox "Optional steer, e.g. remove text and make the background warmer": Better, but the product feels too small.
    - text: "Another option:"
    - generic: refine · 1 image
    - button "Again · 1":
      - text: Again · 1
  - article:
    - ge
```

![question shown](screenshots/350-scenario-5-user-gives-a-direct-edit-question-shown.png)


### Turn 3 follow-up

Should this become the direction, or should we make variations?

![s5 reference future question scoped](screenshots/351-scenario-5-user-gives-a-direct-edit-s5-reference-future-question-scoped.png)


### Bug found - direct edit and final reference question too weak

Scenario 5 showed “product feels too small” as refine instead of edit, and after successful edits asked the generic save/variations question. Fixes applied: direct-edit detection now recognizes product size/focus language, and one-image likes after prior edits ask “Use this as a reference for future generations?”. Added tests.

![bug scenario5 direct edit weak](screenshots/352-scenario-5-user-gives-a-direct-edit-bug-scenario5-direct-edit-weak.png)


### Reload Scenario 5 state

Reloaded after direct-edit detection and reference-question fixes.

![s5 reload after direct edit fix](screenshots/353-scenario-5-user-gives-a-direct-edit-s5-reload-after-direct-edit-fix.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: FO
  - generic: ForgeDesk
  - text: Threads
  - button "ForgeDesk Directions":
    - generic: ForgeDesk Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "ForgeDesk Directions":
    - generic: FO
    - paragraph: ForgeDesk
    - paragraph: SaaS · product imagery
  - article:
    - generic: Gen 1
    - generic: ForgeDesk Visual Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What feels closest in the current image?
    - button "clear workflow story"
    - button "calm operator feel"
    - button "trustworthy interface mood"
    - button "clean product focus"
    - button "modern team context"
    - button "open subject direction"
    - button "clean visual direction"
    - button "balanced palette"
    - button "generous framing"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: refine · 1 image
    - button "Again · 1" [disabled]:
      - text: Again · 1
  - article:
    - generic: Gen 2
    - generic: Warm Gradient Network
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - butt
```

![question shown](screenshots/354-scenario-5-user-gives-a-direct-edit-question-shown.png)


### Turn 3 corrected follow-up

Use this as a reference for future generations?

![s5 reference question fixed](screenshots/355-scenario-5-user-gives-a-direct-edit-s5-reference-question-fixed.png)



## Scenario 6 - Brief Is Too Vague / No Brand

Persona: Rowan, creator exploring vague lifestyle visuals without a brand. Starting point: No Brand / lifestyle. No tone or avoid notes.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/356-scenario-6-brief-is-too-vague-no-brand-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/357-scenario-6-brief-is-too-vague-no-brand-after-clear.png)


### Open thread picker

Clicked New Thread from the main workspace.

![thread picker opened for no brand](screenshots/358-scenario-6-brief-is-too-vague-no-brand-thread-picker-opened-for-no-brand.png)


### Start No Brand thread

Selected No Brand for purely exploratory visual direction.

![no brand thread started](screenshots/359-scenario-6-brief-is-too-vague-no-brand-no-brand-thread-started.png)


### Generation ready: s6 turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s6 turn1 ready](screenshots/360-scenario-6-brief-is-too-vague-no-brand-generation-ready-s6-turn1-ready.png)


### Turn 1 ready

Four No Brand lifestyle directions generated.

![s6 turn1 generated](screenshots/361-scenario-6-brief-is-too-vague-no-brand-s6-turn1-generated.png)


### Turn 1 reaction

Disliked all four vague No Brand images.

![s6 turn1 all disliked](screenshots/362-scenario-6-brief-is-too-vague-no-brand-s6-turn1-all-disliked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - text: Threads
  - button "No Brand Trace":
    - generic: No Brand Trace
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "No Brand Trace":
    - generic: NB
    - paragraph: No Brand
    - paragraph: thread memory only
  - article:
    - generic: Gen 1
    - generic: Image Exploration Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What do you think we got wrong?
    - button "style feels wrong"
    - button "subject is unclear"
    - button "too broad"
    - button "wrong tone"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: explore · 4 images
    - button "Generate 4 images" [disabled]:
      - text: Generate 4 images
- button "Open Next
```

![question shown](screenshots/363-scenario-6-brief-is-too-vague-no-brand-question-shown.png)


### Turn 1 follow-up

What do you think we got wrong?

![s6 turn1 what wrong question](screenshots/364-scenario-6-brief-is-too-vague-no-brand-s6-turn1-what-wrong-question.png)


### Turn 1 answer

Selected reason: style feels wrong.

![s6 turn1 answered](screenshots/365-scenario-6-brief-is-too-vague-no-brand-s6-turn1-answered.png)


### Turn 1 free-text steer

Typed that the lifestyle direction is too vague and not specific enough.

![s6 turn1 free text](screenshots/366-scenario-6-brief-is-too-vague-no-brand-s6-turn1-free-text.png)


### Generate Turn 2

Clicked Generate 4 images from the vague-brief feedback.

![s6 turn2 loading](screenshots/367-scenario-6-brief-is-too-vague-no-brand-s6-turn2-loading.png)


### Bug found - vague feedback free text forced 1 image

In Scenario 6, rejecting all four No Brand images and typing a vague-brief explanation produced a 1-image refinement instead of 4 exploratory alternatives. Fix applied in lib/feedback/decisionEngine.ts: non-edit custom text now preserves the local decision preview, while true direct edits still generate 1 image. Added test coverage.

![bug scenario6 free text forced one image](screenshots/368-scenario-6-brief-is-too-vague-no-brand-bug-scenario6-free-text-forced-one-image.png)



## Scenario 6 Rerun After Vague-Feedback Fix

Persona: Rowan, creator exploring vague lifestyle visuals without a brand. Starting point: No Brand / lifestyle.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/369-scenario-6-rerun-after-vague-feedback-fix-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/370-scenario-6-rerun-after-vague-feedback-fix-after-clear.png)


### Open thread picker

Clicked New Thread from the main workspace.

![thread picker opened for no brand](screenshots/371-scenario-6-rerun-after-vague-feedback-fix-thread-picker-opened-for-no-brand.png)


### Start No Brand thread

Selected No Brand for purely exploratory visual direction.

![no brand thread started](screenshots/372-scenario-6-rerun-after-vague-feedback-fix-no-brand-thread-started.png)


### Generation ready: s6 rerun turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s6 rerun turn1 ready](screenshots/373-scenario-6-rerun-after-vague-feedback-fix-generation-ready-s6-rerun-turn1-ready.png)


### Turn 1 ready

Four No Brand lifestyle directions generated.

![s6 rerun turn1 generated](screenshots/374-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-turn1-generated.png)


### Turn 1 reaction

Disliked all four vague No Brand images.

![s6 rerun turn1 all disliked](screenshots/375-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-turn1-all-disliked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - text: Threads
  - button "No Brand Trace":
    - generic: No Brand Trace
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "No Brand Trace":
    - generic: NB
    - paragraph: No Brand
    - paragraph: thread memory only
  - article:
    - generic: Gen 1
    - generic: Image Exploration for Brand Identity
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike" [active]:
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: What do you think we got wrong?
    - button "style feels wrong"
    - button "subject is unclear"
    - button "too broad"
    - button "wrong tone"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: explore · 4 images
    - button "Generate 4 images" [disabled]:
      - text: Generate 4 images
- button "Open Next
```

![question shown](screenshots/376-scenario-6-rerun-after-vague-feedback-fix-question-shown.png)


### Turn 1 follow-up

What do you think we got wrong?

![s6 rerun what wrong question](screenshots/377-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-what-wrong-question.png)


### Turn 1 answer

Selected reason: style feels wrong.

![s6 rerun answer](screenshots/378-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-answer.png)


### Turn 1 free-text steer

Typed that the direction feels too vague and not specific enough.

![s6 rerun free text](screenshots/379-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-free-text.png)


### Generate Turn 2

Clicked Generate after vague-brief feedback; expected 4 images.

![s6 rerun turn2 loading](screenshots/380-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-turn2-loading.png)


### Turn 2 ready

Second No Brand generation rendered 4 images after non-edit free text.

![s6 rerun turn2 generated](screenshots/381-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-turn2-generated.png)


### Turn 2 reaction

Disliked all four second-pass No Brand images.

![s6 rerun turn2 all disliked](screenshots/382-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-turn2-all-disliked.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - text: Threads
  - button "No Brand Trace":
    - generic: No Brand Trace
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "No Brand Trace":
    - generic: NB
    - paragraph: No Brand
    - paragraph: thread memory only
  - article:
    - generic: Gen 1
    - generic: Image Exploration for Brand Identity
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: We may need to recalibrate the goal before continuing.
    - textbox "Sharper goal"
    - textbox "Audience"
    - textbox "Tone, comma separated"
    - textbox "Avoid"
    - button "Apply brief revision"
    - textbox "Optional steer, e.g. remove text and make the background warmer": The lifestyle direction feels too vague and not specific enough.
    - text: "Another option:"
    - generic: revise goal · 4 images
    - button "Again · 4" [disabled]:
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Lifestyle Image Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    -
```

![question shown](screenshots/383-scenario-6-rerun-after-vague-feedback-fix-question-shown.png)


### Turn 2 follow-up

We may need to recalibrate the goal before continuing.

![s6 rerun recalibrate question](screenshots/384-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-recalibrate-question.png)


### Apply goal recalibration

Applied the No Brand goal revision form to confirm recalibration flow works.

![s6 rerun goal revision applied](screenshots/385-scenario-6-rerun-after-vague-feedback-fix-s6-rerun-goal-revision-applied.png)


### Bug found - empty No Brand goal revision did not enable generation

In Scenario 6, applying the No Brand recalibration form with empty/default fields left Generate disabled because the answer text was empty. Fix applied in components/thread/GoalRevisionPanel.tsx: applying a revision now records “goal recalibrated” when no fields are filled, so the required step is answered.

![bug scenario6 empty revision disabled](screenshots/386-scenario-6-rerun-after-vague-feedback-fix-bug-scenario6-empty-revision-disabled.png)


### Reload Scenario 6 state

Reloaded after No Brand revision-answer fix.

![s6 reload after revision fix](screenshots/387-scenario-6-rerun-after-vague-feedback-fix-s6-reload-after-revision-fix.png)


### Apply goal recalibration

Applied the No Brand recalibration form again.

![s6 revision applied fixed](screenshots/388-scenario-6-rerun-after-vague-feedback-fix-s6-revision-applied-fixed.png)


### Generate Turn 3

Clicked Generate 4 images after recalibration.

![s6 turn3 loading fixed](screenshots/389-scenario-6-rerun-after-vague-feedback-fix-s6-turn3-loading-fixed.png)


### Turn 3 ready

Recalibrated No Brand generation rendered 4 images.

![s6 turn3 generated fixed](screenshots/390-scenario-6-rerun-after-vague-feedback-fix-s6-turn3-generated-fixed.png)



## Scenario 7 - User Is Unsure / Skips Images

Persona: Lena, education founder exploring mood directions. Brand: Maple Learn; category: education; goal: mood exploration; audience: parents and students. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/391-scenario-7-user-is-unsure-skips-images-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/392-scenario-7-user-is-unsure-skips-images-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Maple Learn","category":"education","goal":"mood exploration","audience":"parents and students"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/393-scenario-7-user-is-unsure-skips-images-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/394-scenario-7-user-is-unsure-skips-images-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/395-scenario-7-user-is-unsure-skips-images-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/396-scenario-7-user-is-unsure-skips-images-thread-started-generating.png)


### Generation ready: s7 turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s7 turn1 ready](screenshots/397-scenario-7-user-is-unsure-skips-images-generation-ready-s7-turn1-ready.png)


### Turn 1 ready

Four education mood directions generated.

![s7 turn1 generated](screenshots/398-scenario-7-user-is-unsure-skips-images-s7-turn1-generated.png)


### Turn 1 reaction

Skipped all four images without liking or disliking.

![s7 turn1 all skipped](screenshots/399-scenario-7-user-is-unsure-skips-images-s7-turn1-all-skipped.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: ML
  - generic: Maple Learn
  - text: Threads
  - button "Maple Learn Directions":
    - generic: Maple Learn Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Maple Learn Directions":
    - generic: ML
    - paragraph: Maple Learn
    - paragraph: education · mood exploration
  - article:
    - generic: Gen 1
    - generic: Maple Learn Image Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip" [active]:
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Not seeing a strong direction?
    - button "show broader alternatives"
    - button "stay closer to brand"
    - button "try a different tone"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: explore · 4 images
    - button "Generate 4 images" [disabled]:
      - text: Generate 4 images
- button "Open Next
```

![question shown](screenshots/400-scenario-7-user-is-unsure-skips-images-question-shown.png)


### Turn 1 follow-up

Not seeing a strong direction?

![s7 turn1 unsure question](screenshots/401-scenario-7-user-is-unsure-skips-images-s7-turn1-unsure-question.png)


### Turn 1 answer

Selected option: show broader alternatives.

![s7 turn1 answered](screenshots/402-scenario-7-user-is-unsure-skips-images-s7-turn1-answered.png)


### Generate Turn 2

Clicked Generate 4 broader/alternative images.

![s7 turn2 loading](screenshots/403-scenario-7-user-is-unsure-skips-images-s7-turn2-loading.png)


### Turn 2 ready

Second generation rendered 4 alternatives.

![s7 turn2 generated](screenshots/404-scenario-7-user-is-unsure-skips-images-s7-turn2-generated.png)


### Turn 2 reaction

Liked Image 2 tentatively and skipped the rest.

![s7 turn2 maybe liked one](screenshots/405-scenario-7-user-is-unsure-skips-images-s7-turn2-maybe-liked-one.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: ML
  - generic: Maple Learn
  - text: Threads
  - button "Maple Learn Directions":
    - generic: Maple Learn Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Maple Learn Directions":
    - generic: ML
    - paragraph: Maple Learn
    - paragraph: education · mood exploration
  - article:
    - generic: Gen 1
    - generic: Maple Learn Image Directions
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Not seeing a strong direction?
    - button "show broader alternatives"
    - button "stay closer to brand"
    - button "try a different tone"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: explore · 4 images
    - button "Again · 4":
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: "Maple Learn: Broad Exploration 2026"
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as 
```

![question shown](screenshots/406-scenario-7-user-is-unsure-skips-images-question-shown.png)


### Turn 2 follow-up before maybe text

What did you like about the Urban Rooftop School image?

![s7 turn2 what feels closest question](screenshots/407-scenario-7-user-is-unsure-skips-images-s7-turn2-what-feels-closest-question.png)


### Turn 2 answer step 1

Selected first contextual option: Integration of technology.

![s7 turn2 answer step1](screenshots/408-scenario-7-user-is-unsure-skips-images-s7-turn2-answer-step1.png)


### Turn 2 advance question

Advanced to the second sequential follow-up question.

![s7 turn2 question step2](screenshots/409-scenario-7-user-is-unsure-skips-images-s7-turn2-question-step2.png)


### Turn 2 answer step 2

Selected first contextual option: Too fantastical settings.

![s7 turn2 answer step2](screenshots/410-scenario-7-user-is-unsure-skips-images-s7-turn2-answer-step2.png)


### Generate Turn 3

Clicked Generate after the tentative direction feedback.

![s7 turn3 loading](screenshots/411-scenario-7-user-is-unsure-skips-images-s7-turn3-loading.png)


### Bug found - tentative like after skips generated 1 image

Scenario 7 skipped all images, then liked one tentative direction. The app generated 1 image instead of 4 close variations. Fix applied in lib/feedback/decisionEngine.ts: skip-heavy macro memory now treats the first liked signal as tentative and generates 4 close variations; a later clear like asks “What should we preserve?” and generates 1. Added tests.

![bug scenario7 tentative like one image](screenshots/412-scenario-7-user-is-unsure-skips-images-bug-scenario7-tentative-like-one-image.png)



## Scenario 7 Rerun After Unsure-Memory Fix

Persona: Nora, education founder exploring mood directions. Brand: Birch Learn; category: education; goal: mood exploration; audience: parents and students. Tone and avoid notes left blank.

### Before interaction

Fresh reload before starting the scenario.

![before interaction](screenshots/413-scenario-7-rerun-after-unsure-memory-fix-before-interaction.png)


### Clear demo state

Clicked the visible Clear action to start from an empty local state.

![after clear](screenshots/414-scenario-7-rerun-after-unsure-memory-fix-after-clear.png)


### Open brand wizard

Opened Create Brand. Brand inputs: {"name":"Birch Learn","category":"education","goal":"mood exploration","audience":"parents and students"}. Tone and avoid notes intentionally left blank.

![brand wizard opened](screenshots/415-scenario-7-rerun-after-unsure-memory-fix-brand-wizard-opened.png)


### Fill brief brand profile

Entered name, category, goal, and audience only. No tone chips or avoid notes.

![brand profile filled](screenshots/416-scenario-7-rerun-after-unsure-memory-fix-brand-profile-filled.png)


### Create brand

Submitted the brand wizard.

![brand created ready panel](screenshots/417-scenario-7-rerun-after-unsure-memory-fix-brand-created-ready-panel.png)


### Start first exploration

Started the first generation thread for this brand.

![thread started generating](screenshots/418-scenario-7-rerun-after-unsure-memory-fix-thread-started-generating.png)


### Generation ready: s7 rerun turn1 ready

Detected 4 ready image like controls; expected at least 4.

![generation ready s7 rerun turn1 ready](screenshots/419-scenario-7-rerun-after-unsure-memory-fix-generation-ready-s7-rerun-turn1-ready.png)


### Turn 1 ready

Four education mood directions generated.

![s7 rerun turn1 generated](screenshots/420-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-turn1-generated.png)


### Turn 1 reaction

Skipped all four images.

![s7 rerun all skipped](screenshots/421-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-all-skipped.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: BL
  - generic: Birch Learn
  - text: Threads
  - button "Birch Learn Directions":
    - generic: Birch Learn Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Birch Learn Directions":
    - generic: BL
    - paragraph: Birch Learn
    - paragraph: education · mood exploration
  - article:
    - generic: Gen 1
    - generic: Birch Learn Image Trace Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip" [active]:
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Not seeing a strong direction?
    - button "show broader alternatives"
    - button "stay closer to brand"
    - button "try a different tone"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Next generation:"
    - generic: explore · 4 images
    - button "Generate 4 images" [disabled]:
      - text: Generate 4 images
- button "Open Next
```

![question shown](screenshots/422-scenario-7-rerun-after-unsure-memory-fix-question-shown.png)


### Turn 1 follow-up

Not seeing a strong direction?

![s7 rerun unsure question](screenshots/423-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-unsure-question.png)


### Turn 1 answer

Selected option: show broader alternatives.

![s7 rerun answer](screenshots/424-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-answer.png)


### Generate Turn 2

Clicked Generate 4 alternatives after all skips.

![s7 rerun turn2 loading](screenshots/425-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-turn2-loading.png)


### Turn 2 ready

Second generation rendered 4 alternatives.

![s7 rerun turn2 generated](screenshots/426-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-turn2-generated.png)


### Turn 2 reaction

Liked one tentative image and skipped the rest.

![s7 rerun tentative like](screenshots/427-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-tentative-like.png)


### Question shown

Observed question panel.

```
- complementary:
  - generic: Trace
  - button "Create Brand":
    - generic: Create Brand
  - generic: Brands
  - generic: BL
  - generic: Birch Learn
  - text: Threads
  - button "Birch Learn Directions":
    - generic: Birch Learn Directions
- main:
  - heading "Images" [level=1]
  - generic "Change OPENAI_DEMO_PROFILE in .env to switch between test and custom settings":
    - generic: test
    - generic: /
    - generic: gpt-4o
    - generic: /
    - generic: gpt-image-2 · low
  - button "New Thread":
    - text: New Thread
  - button "Clear":
    - text: Clear
  - button "Jobs":
    - text: Jobs
  - generic "Birch Learn Directions":
    - generic: BL
    - paragraph: Birch Learn
    - paragraph: education · mood exploration
  - article:
    - generic: Gen 1
    - generic: Birch Learn Image Trace Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 3":
      - img "Image 3"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 4":
      - img "Image 4"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
  - complementary:
    - text: Next question
    - paragraph: Not seeing a strong direction?
    - button "show broader alternatives"
    - button "stay closer to brand"
    - button "try a different tone"
    - textbox "Optional steer, e.g. remove text and make the background warmer"
    - text: "Another option:"
    - generic: explore · 4 images
    - button "Again · 4":
      - text: Again · 4
  - article:
    - generic: Gen 2
    - generic: Image Directions for Birch Learn Mood Exploration
    - generic: 4/4
    - button "Image 1":
      - img "Image 1"
    - button "Like":
    - button "Dislike":
    - button "Skip":
    - button "Use as reference":
    - button "Image 2":
      - img "Image 2"
    - button "Like":
    - button "Dislike":
    - button "Skip":
  
```

![question shown](screenshots/428-scenario-7-rerun-after-unsure-memory-fix-question-shown.png)


### Turn 2 follow-up

What feels closest?

![s7 rerun feels closest question](screenshots/429-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-feels-closest-question.png)


### Turn 2 answer

Selected first reason: closer mood.

![s7 rerun turn2 answered](screenshots/430-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-turn2-answered.png)


### Generate Turn 3

Clicked Generate 4 close variations around the tentative direction.

![s7 rerun turn3 loading](screenshots/431-scenario-7-rerun-after-unsure-memory-fix-s7-rerun-turn3-loading.png)


**Reload Scenario 7 state**
Reloaded after unsure-memory fix to recompute Turn 2 decision preview.


**Reload Scenario 7 state**
Reloaded after unsure-memory fix to recompute Turn 2 decision preview.

![s7 reload decision preview](screenshots/433-s7-reload-decision-preview.png)


**Turn 2 answer after reload**
Selected reason again: Muted color palette.

![s7 fixed turn2 answer](screenshots/434-s7-fixed-turn2-answer.png)


**Generate corrected Turn 3 alternative**
Clicked Again · 4 after the unsure-memory fix.

![s7 fixed turn3 loading](screenshots/435-s7-fixed-turn3-loading.png)

## Final QA Summary

Verified with real test profile calls where practical: GPT-4o for planning/feedback and GPT Image 2 low quality for image generation.

Major bugs found and fixed during the pass:
- Prevented recursive prompt/context growth by storing concise direction prompts instead of expanded social-image prompts.
- Prevented nested four-up image outputs by making the batch image prompt explicitly request separate full-bleed assets.
- Removed base64 image data from GPT-4o planner payloads.
- Limited automatic image-reference uploads to explicit references/convergence instead of every liked parent.
- Fixed single-image like/dislike turns so they use correction/save logic instead of all-liked/all-disliked four-image logic.
- Added macro-memory branches for repeated rejection, split resolution, direct edits, No Brand vague briefs, and skip/unsure exploration.
- Fixed No Brand goal recalibration so applying an empty/default revision still enables generation.

Residual note:
- The final Scenario 7 browser run confirmed the corrected decision preview (`refine · 4 images`) after reload and captured the corrected generation trigger. The browser automation connection timed out while waiting on the last real image batch, but unit tests cover the full intended Scenario 7 decision sequence: all skip -> tentative like -> 4 close variations -> preserve -> 1 refined image.
