import type { FeedbackAnswer, NextGenerationDecision } from "@/lib/feedback/types";
import type { Brand, ExplorationThread, RuntimeConfig, TraceNode, VariantFeedback } from "@/lib/types";

export interface TraceCanvasProps {
  brands: Brand[];
  threads: ExplorationThread[];
  nodes: Record<string, TraceNode>;
  activeThreadId: string | null;
  runtimeConfig: RuntimeConfig | null;
  selectedVariantIds: string[];
  onSelectThread: (threadId: string) => void;
  onFeedback: (variantId: string, feedback: Omit<VariantFeedback, "createdAt">) => void;
  onToggleReference: (variantId: string) => void;
  onRegenerateVariant: (variantId: string) => void;
  onGenerateNext: (node: TraceNode, decision: NextGenerationDecision, answers: FeedbackAnswer[]) => void;
  onCancel: (nodeId: string) => void;
  onRetry: (nodeId: string) => void;
}

export interface ExplorationLane {
  thread: ExplorationThread;
  brand: Brand | null;
  root: TraceNode | null;
  generations: TraceNode[];
}
