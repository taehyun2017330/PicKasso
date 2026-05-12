"use client";

import { useEffect, useMemo, useRef } from "react";

import { runNode } from "@/components/generation/runNode";
import { cancelHandles } from "@/components/generation/taskRegistry";
import type { NodeTask } from "@/components/generation/types";
import type { RuntimeConfig } from "@/lib/types";
import { useTraceStore } from "@/store/useTraceStore";

interface GenerationControllerProps {
  config: RuntimeConfig | null;
}

export function GenerationController({ config }: GenerationControllerProps) {
  const nodeSignal = useTraceStore((state) =>
    Object.values(state.nodes)
      .map((node) => `${node.id}:${node.status}:${node.attempt}:${node.variants.length}`)
      .join("|")
  );
  const startedRuns = useRef(new Set<string>());
  const tasks = useRef(new Map<string, NodeTask>());

  const configKey = useMemo(
    () =>
      config
        ? `${config.realMode}:${config.mockLatencyMs}`
        : "none",
    [config]
  );

  useEffect(() => {
    if (!config) return;

    const state = useTraceStore.getState();
    for (const node of Object.values(state.nodes)) {
      if (node.mode === "root") continue;
      if (node.status !== "queued" && node.status !== "running") continue;

      const key = `${node.id}:${node.attempt}`;
      if (startedRuns.current.has(key)) continue;
      startedRuns.current.add(key);
      void runNode(node.id, node.attempt, config, tasks);
    }

    for (const node of Object.values(state.nodes)) {
      if (node.status === "cancelled" || node.status === "error" || node.status === "done") {
        cancelHandles(node.id, tasks.current);
      }
    }
  }, [nodeSignal, config, configKey]);

  return null;
}
