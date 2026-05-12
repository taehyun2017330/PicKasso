import type { StoreApi } from "zustand";

import type { FeedbackAnswer, NextGenerationDecision } from "@/lib/feedback/types";
import type {
  Brand,
  BrandInput,
  ExplorationThread,
  GenerationJob,
  OutputCount,
  PlannerOutput,
  ToastMessage,
  TraceMode,
  TraceNode,
  TraceStatus,
  VariantFeedback
} from "@/lib/types";

export interface CreateChildInput {
  threadId: string;
  parentNodeIds: string[];
  parentVariantIds: string[];
  mode: Exclude<TraceMode, "root">;
  userPrompt?: string;
  outputCount?: OutputCount;
}

export interface TraceStoreData {
  brands: Brand[];
  threads: ExplorationThread[];
  nodes: Record<string, TraceNode>;
  activeThreadId: string | null;
  selectedVariantIds: string[];
  jobs: Record<string, GenerationJob>;
  toasts: ToastMessage[];
}

export interface TraceStore extends TraceStoreData {
  createBrand: (input: BrandInput) => Brand;
  startThread: (brandId: string, userPrompt?: string) => { threadId: string; nodeId: string } | null;
  createChildNode: (input: CreateChildInput) => TraceNode;
  setActiveThread: (threadId: string | null) => void;
  setNodePlan: (nodeId: string, plan: PlannerOutput) => void;
  setNodeStatus: (nodeId: string, status: TraceStatus, error?: string) => void;
  setVariantStatus: (variantId: string, status: TraceStatus, error?: string) => void;
  hydrateVariantSources: (sources: Record<string, string>) => void;
  completeVariant: (variantId: string, src: string, prompt: string, styleLabel: string) => void;
  cancelNode: (nodeId: string) => void;
  retryNode: (nodeId: string) => void;
  retryVariant: (variantId: string) => void;
  skipTurn: (nodeId: string, freeText?: string) => void;
  setTurnDecision: (nodeId: string, decision: NextGenerationDecision, answers: FeedbackAnswer[]) => void;
  addFeedback: (variantId: string, feedback: Omit<VariantFeedback, "createdAt">) => void;
  toggleReferenceVariant: (variantId: string) => void;
  clearSelectedVariants: () => void;
  upsertJob: (job: GenerationJob) => void;
  updateJob: (jobId: string, patch: Partial<GenerationJob>) => void;
  clearFinishedJobs: () => void;
  clearDemo: () => void;
  addToast: (message: string) => void;
  removeToast: (toastId: string) => void;
}

export type TraceSet = StoreApi<TraceStore>["setState"];
export type TraceGet = StoreApi<TraceStore>["getState"];
