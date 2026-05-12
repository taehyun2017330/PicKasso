import { useEffect, useRef, useState } from "react";

import type { ExplorationLane } from "@/components/trace/types";

export function useActiveTraceNode(explorations: ExplorationLane[], activeThreadId: string | null) {
  const [nodeByThread, setNodeByThread] = useState<Record<string, string>>({});
  const previousLatestRef = useRef<Record<string, string>>({});
  const fallbackIndex = explorations.length ? 0 : -1;
  const foundIndex = explorations.findIndex((lane) => lane.thread.id === activeThreadId);
  const activeIndex = foundIndex >= 0 ? foundIndex : fallbackIndex;
  const lane = activeIndex >= 0 ? explorations[activeIndex] : null;
  const latestNode = lane?.generations.at(-1) ?? null;
  const node = lane?.generations.find((item) => item.id === nodeByThread[lane.thread.id]) ?? latestNode ?? null;

  useEffect(() => {
    if (!lane || !latestNode) return;

    const previousLatest = previousLatestRef.current[lane.thread.id];
    previousLatestRef.current[lane.thread.id] = latestNode.id;

    setNodeByThread((current) => {
      const currentNodeId = current[lane.thread.id];
      const exists = lane.generations.some((item) => item.id === currentNodeId);
      if (exists && previousLatest === latestNode.id) return current;
      return { ...current, [lane.thread.id]: latestNode.id };
    });
  }, [lane, latestNode]);

  function setNode(nodeId: string) {
    if (!lane) return;
    setNodeByThread((current) => ({ ...current, [lane.thread.id]: nodeId }));
  }

  return { lane, node, latestNode, setNode };
}
