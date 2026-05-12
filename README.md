# PicKasso

A polished demo app for brand-owner image exploration. It combines a clean image workspace, branching trace graph, hot/cold preference memory, mock async image jobs, and server-side wrappers that are ready for real OpenAI image generation.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Mock Mode

The app works without credentials. By default, `DEMO_USE_REAL_OPENAI=false`, so planning is deterministic and images are generated as SVG data URLs. Mock image jobs run in parallel with staggered 8-12 second completion to mirror slower real image generation flows.

State persists to `localStorage`, including brands, threads, nodes, image variants, feedback, and selected references.

## Real OpenAI Mode

Real mode is isolated behind server routes under `/api/trace/*` and `/api/ai-guide/*`; the API key is never exposed to the client bundle.

Create `.env.local`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=
OPENAI_GUIDE_TIMEOUT_MS=6000
DEMO_USE_REAL_OPENAI=true
MOCK_IMAGE_LATENCY_MS=9000
```

Set `OPENAI_BASE_URL=https://us.api.openai.com/v1` if your key requires the US regional OpenAI hostname. Real image turns use one Image API request. Model choices are routed in code at `lib/ai/modelRoutes.ts`, and image output defaults are routed in code at `lib/ai/images/options.ts`, so prompt orchestration, feedback, guide, review, image-generation model assignments, and image output behavior are versioned with the app instead of stored in env. `OPENAI_GUIDE_TIMEOUT_MS` caps small AI guide calls before they fall back locally.

## Product Flow

- Create a lightweight brand profile from the sidebar.
- Start each exploration under a brand folder.
- Each generated exploration board produces nine image variants as visible async jobs.
- Like/dislike/skip variants, then answer contextual GPT-generated or mock reason questions to build hot/cold memory.
- Fork from any variant to narrow into a direction.
- Select 2-4 variants and converge them into a merged child node.
- Regenerate from any completed node without overwriting the trace.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```
