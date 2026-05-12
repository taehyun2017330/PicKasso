import { resolveImagePromptSituation } from "@/lib/ai/promptOrchestrator";
import type { Brand, ImageBatchGenerationResult, ImageVariant, RuntimeConfig } from "@/lib/types";
import { compactText, nowIso } from "@/lib/utils";
import type { NodeTask } from "@/components/generation/types";
import { useTraceStore } from "@/store/useTraceStore";

interface RunBatchInput {
  nodeId: string;
  attempt: number;
  variants: ImageVariant[];
  title: string;
  category: string;
  brand: Brand | null;
  references: ImageVariant[];
  config: RuntimeConfig;
  task: NodeTask;
}

export function runBatch({
  nodeId,
  attempt,
  variants,
  title,
  category,
  brand,
  references,
  config,
  task
}: RunBatchInput) {
  const store = useTraceStore.getState();
  const jobId = `${nodeId}:batch:${attempt}`;
  const createdAt = nowIso();
  const activeVariants = variants.filter((variant) => variant.status !== "done");
  const outputCount = activeVariants.length;

  if (!activeVariants.length) return;

  store.upsertJob({
    id: jobId,
    nodeId,
    threadId: store.nodes[nodeId]?.threadId ?? "",
    variantId: activeVariants[0]?.id ?? nodeId,
    label: `Generating ${outputCount} image${outputCount === 1 ? "" : "s"}`,
    status: "queued",
    progress: 12,
    etaSeconds: 0,
    indeterminate: true,
    createdAt,
    updatedAt: createdAt
  });

  for (const variant of activeVariants) {
    store.setVariantStatus(variant.id, "queued");
  }

  const starter = setTimeout(() => {
    const latest = useTraceStore.getState().nodes[nodeId];
    if (!latest || latest.attempt !== attempt || latest.status === "cancelled" || latest.status === "error") return;

    for (const variant of activeVariants) {
      useTraceStore.getState().setVariantStatus(variant.id, "running");
    }

    useTraceStore.getState().updateJob(jobId, {
      status: "running",
      progress: 12,
      etaSeconds: 0,
      indeterminate: true
    });

    const execute = async () => {
      const controller = new AbortController();
      task.controllers.push(controller);

      try {
        const current = useTraceStore.getState().nodes[nodeId];
        const traceIntent = current?.userPrompt || title;
        const response = await fetch("/api/trace/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            brand,
            label: title,
            prompt: compactText(traceIntent, 900),
            category,
            seed: `${nodeId}:batch:${attempt}`,
            outputCount,
            variantLabels: activeVariants.map((_, index) => `Image ${index + 1}`),
            variantPrompts: activeVariants.map((variant) =>
              compactText(`${variant.styleLabel}: ${variant.prompt}`, 700)
            ),
            promptSituation: current
              ? resolveImagePromptSituation({
                  mode: current.mode,
                  outputCount: current.outputCount,
                  depth: current.depth,
                  parentVariantCount: current.parentVariantIds.length,
                  activeVariantCount: activeVariants.length,
                  hasExistingVariants: current.variants.length > 0,
                  attempt: current.attempt
                })
              : undefined,
            references,
            runtimeConfig: config
          })
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Batch image request failed.");
        }

        const result = (await response.json()) as ImageBatchGenerationResult;
        const node = useTraceStore.getState().nodes[nodeId];
        if (!node || node.attempt !== attempt || node.status === "cancelled") return;

        activeVariants.forEach((variant, index) => {
          const image = result.images[index];
          if (image?.src) {
            useTraceStore
              .getState()
              .completeVariant(variant.id, image.src, image.prompt || result.prompt, image.styleLabel || `Image ${index + 1}`);
          } else {
            useTraceStore.getState().setVariantStatus(variant.id, "error", "No image returned for this slot.");
          }
        });

        const after = useTraceStore.getState().nodes[nodeId];
        const completed = after?.variants.filter((variant) => variant.status === "done").length ?? 0;
        const expected = after?.variants.length ?? activeVariants.length;

        if (completed < expected) {
          throw new Error(`Image API returned ${completed}/${expected} images.`);
        }

        useTraceStore.getState().updateJob(jobId, {
          status: "done",
          progress: 100,
          etaSeconds: 0,
          indeterminate: false
        });

        if (after?.status === "done") {
          useTraceStore.getState().addToast(`${after.title} ready`);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Image generation failed.";
        for (const variant of activeVariants) {
          const latestVariant = useTraceStore
            .getState()
            .nodes[nodeId]?.variants.find((item) => item.id === variant.id);
          if (latestVariant?.status !== "done") {
            useTraceStore.getState().setVariantStatus(variant.id, "error", message);
          }
        }
        useTraceStore.getState().updateJob(jobId, {
          status: "error",
          progress: 100,
          etaSeconds: 0,
          indeterminate: false,
          error: message
        });
        useTraceStore.getState().setNodeStatus(nodeId, "error", message);
        useTraceStore.getState().addToast(message);
      }
    };

    void execute();
  }, config.realMode ? 120 : 620);

  task.timers.push(starter);
}
