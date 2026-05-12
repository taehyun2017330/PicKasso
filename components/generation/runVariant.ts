import type {
  Brand,
  ImageGenerationResult,
  ImagePromptSituation,
  ImageVariant,
  RuntimeConfig
} from "@/lib/types";
import { clamp, compactText, nowIso } from "@/lib/utils";
import type { NodeTask } from "@/components/generation/types";
import { useTraceStore } from "@/store/useTraceStore";
import { customBakeryVariantFor } from "@/lib/customBakeryFixture";

interface RunVariantInput {
  nodeId: string;
  attempt: number;
  variantId: string;
  label: string;
  prompt: string;
  category: string;
  brand: Brand | null;
  references: ImageVariant[];
  promptSituation: ImagePromptSituation;
  index: number;
  config: RuntimeConfig;
  task: NodeTask;
}

export function runVariant({
  nodeId,
  attempt,
  variantId,
  label,
  prompt,
  category,
  brand,
  references,
  promptSituation,
  index,
  config,
  task
}: RunVariantInput) {
  const customBakeryVariant = customBakeryVariantFor({ brand, promptSituation, index });
  if (customBakeryVariant) {
    runCustomBakeryVariant({
      nodeId,
      attempt,
      variantId,
      task,
      label: customBakeryVariant.styleLabel,
      src: customBakeryVariant.src,
      prompt: customBakeryVariant.prompt,
      latencyMs: customBakeryVariant.latencyMs
    });
    return;
  }

  const store = useTraceStore.getState();
  const mockDuration = config.mockLatencyMs + index * 1000;
  const estimateMs = config.realMode ? 0 : mockDuration;
  const startDelay = config.realMode ? index * 120 : 0;
  const jobId = `${nodeId}:${variantId}:${attempt}`;
  const createdAt = nowIso();

  store.upsertJob({
    id: jobId,
    nodeId,
    threadId: store.nodes[nodeId]?.threadId ?? "",
    variantId,
    label,
    status: "queued",
    progress: config.realMode ? 12 : 1,
    etaSeconds: config.realMode ? 0 : Math.ceil((estimateMs + startDelay) / 1000),
    indeterminate: config.realMode,
    createdAt,
    updatedAt: createdAt
  });
  store.setVariantStatus(variantId, "queued");

  const starter = setTimeout(() => {
    const latest = useTraceStore.getState().nodes[nodeId];
    if (!latest || latest.attempt !== attempt || latest.status === "cancelled" || latest.status === "error") return;

    useTraceStore.getState().setVariantStatus(variantId, "running");
    useTraceStore.getState().updateJob(jobId, {
      status: "running",
      progress: config.realMode ? 12 : 8,
      etaSeconds: config.realMode ? 0 : Math.ceil(estimateMs / 1000),
      indeterminate: config.realMode
    });

    let interval: ReturnType<typeof setInterval> | null = null;
    if (!config.realMode) {
      const progressStart = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - progressStart;
        const progress = clamp(8 + (elapsed / estimateMs) * 88, 8, 96);
        useTraceStore.getState().updateJob(jobId, {
          progress,
          etaSeconds: Math.max(1, Math.ceil((estimateMs - elapsed) / 1000))
        });
      }, 500);
      task.intervals.push(interval);
    }

    const execute = async () => {
      const controller = new AbortController();
      task.controllers.push(controller);

      try {
        const response = await fetch("/api/trace/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            brand,
            label,
            prompt: compactText(prompt, 900),
            category,
            styleIndex: index,
            seed: `${nodeId}:${variantId}:${attempt}`,
            promptSituation,
            references,
            runtimeConfig: config
          })
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Image request failed.");
        }

        const result = (await response.json()) as ImageGenerationResult;
        const current = useTraceStore.getState().nodes[nodeId];
        if (!current || current.attempt !== attempt || current.status === "cancelled") return;

        if (interval) clearInterval(interval);
        useTraceStore.getState().completeVariant(variantId, result.src, result.prompt, result.styleLabel);
        useTraceStore.getState().updateJob(jobId, {
          status: "done",
          progress: 100,
          etaSeconds: 0,
          indeterminate: false
        });

        const after = useTraceStore.getState().nodes[nodeId];
        if (after?.status === "done") {
          useTraceStore.getState().addToast(`${after.title} ready`);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Image generation failed.";
        if (interval) clearInterval(interval);
        useTraceStore.getState().setVariantStatus(variantId, "error", message);
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

    if (config.realMode) {
      void execute();
      return;
    }

    const finishTimer = setTimeout(() => {
      void execute();
    }, estimateMs);
    task.timers.push(finishTimer);
  }, startDelay);

  task.timers.push(starter);
}

function runCustomBakeryVariant({
  attempt,
  label,
  latencyMs,
  nodeId,
  prompt,
  src,
  task,
  variantId
}: {
  attempt: number;
  label: string;
  latencyMs: number;
  nodeId: string;
  prompt: string;
  src: string;
  task: NodeTask;
  variantId: string;
}) {
  const store = useTraceStore.getState();
  const jobId = `${nodeId}:${variantId}:${attempt}`;
  const createdAt = nowIso();

  store.upsertJob({
    id: jobId,
    nodeId,
    threadId: store.nodes[nodeId]?.threadId ?? "",
    variantId,
    label,
    status: "queued",
    progress: 1,
    etaSeconds: Math.ceil(latencyMs / 1000),
    indeterminate: false,
    createdAt,
    updatedAt: createdAt
  });
  store.setVariantStatus(variantId, "queued");

  const starter = setTimeout(() => {
    const latest = useTraceStore.getState().nodes[nodeId];
    if (!latest || latest.attempt !== attempt || latest.status === "cancelled" || latest.status === "error") return;

    useTraceStore.getState().setVariantStatus(variantId, "running");
    useTraceStore.getState().updateJob(jobId, {
      status: "running",
      progress: 8,
      etaSeconds: Math.ceil(latencyMs / 1000),
      indeterminate: false
    });

    const progressStart = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - progressStart;
      const progress = clamp(8 + (elapsed / latencyMs) * 88, 8, 96);
      useTraceStore.getState().updateJob(jobId, {
        progress,
        etaSeconds: Math.max(1, Math.ceil((latencyMs - elapsed) / 1000))
      });
    }, 500);
    task.intervals.push(interval);

    const finishTimer = setTimeout(() => {
      const current = useTraceStore.getState().nodes[nodeId];
      clearInterval(interval);
      if (!current || current.attempt !== attempt || current.status === "cancelled") return;
      useTraceStore.getState().completeVariant(variantId, src, prompt, label);
      useTraceStore.getState().updateJob(jobId, {
        status: "done",
        progress: 100,
        etaSeconds: 0,
        indeterminate: false
      });

      const after = useTraceStore.getState().nodes[nodeId];
      if (after?.status === "done") {
        useTraceStore.getState().addToast(`${after.title} ready`);
      }
    }, latencyMs);
    task.timers.push(finishTimer);
  }, 180);

  task.timers.push(starter);
}
