import type { Brand, ExplorationThread, TraceNode } from "@/lib/types";
import type { ExplorationLane } from "@/components/trace/types";

export function buildExplorationLanes(
  brands: Brand[],
  threads: ExplorationThread[],
  nodes: Record<string, TraceNode>
): ExplorationLane[] {
  return [...threads]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((thread) => laneFor(thread, brands, nodes));
}

function laneFor(thread: ExplorationThread, brands: Brand[], nodes: Record<string, TraceNode>): ExplorationLane {
  const threadNodes = Object.values(nodes)
    .filter((node) => node.threadId === thread.id)
    .sort((a, b) => a.depth - b.depth || a.createdAt.localeCompare(b.createdAt));

  return {
    thread,
    brand: brands.find((brand) => brand.id === thread.brandId) ?? null,
    root: threadNodes.find((node) => node.mode === "root") ?? null,
    generations: threadNodes.filter((node) => node.mode !== "root")
  };
}
