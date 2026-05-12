import type { TraceNode } from "@/lib/types";
import type { NodeTask, NodeTaskMapRef } from "@/components/generation/types";

export function ensureTask(nodeId: string, tasks: NodeTaskMapRef) {
  const existing = tasks.current.get(nodeId);
  if (existing) return existing;

  const task: NodeTask = { timers: [], intervals: [], controllers: [] };
  tasks.current.set(nodeId, task);
  return task;
}

export function cancelHandles(nodeId: string, taskMap: Map<string, NodeTask>) {
  const task = taskMap.get(nodeId);
  if (!task) return;

  task.timers.forEach(clearTimeout);
  task.intervals.forEach(clearInterval);
  task.controllers.forEach((controller) => controller.abort());
  taskMap.delete(nodeId);
}

export function isNodeStopped(node: TraceNode | undefined) {
  return !node || node.status === "cancelled" || node.status === "error";
}
