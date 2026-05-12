import type { ExplorationThread, TraceNode } from "@/lib/types";

export function explorationStatus(thread: ExplorationThread, nodes: Record<string, TraceNode>) {
  const threadNodes = Object.values(nodes).filter((node) => node.threadId === thread.id);
  if (threadNodes.some((node) => node.status === "running" || node.status === "queued")) return "running";
  if (threadNodes.some((node) => node.status === "error")) return "error";
  return "done";
}

export function timeAgo(value: string) {
  const created = new Date(value).getTime();
  const diff = Math.max(0, Date.now() - created);
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "now";
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}
