import type { FeedbackAnswer, ImageVariantMetadata, NextGenerationDecision } from "@/lib/feedback/types";

export type { NextGenerationDecision };

export type TraceMode = "root" | "wide" | "narrow" | "regenerate" | "converge" | "custom";

export type TraceStatus = "idle" | "queued" | "running" | "done" | "error" | "cancelled";

export type Rating = "like" | "dislike" | "skip";

export type OutputCount = 1 | 4 | 9;

export type ImagePromptSituation =
  | "first_generation_9"
  | "regenerate_generation_9"
  | "regenerate_single_image"
  | "subsequent_exploration"
  | "edit";

export interface Brand {
  id: string;
  name: string;
  category: string;
  goal: string;
  targetAudience: string;
  toneChips: string[];
  avoidNotes: string;
  monogram: string;
  createdAt: string;
}

export type BrandInput = Omit<Brand, "id" | "monogram" | "createdAt">;

export interface ExplorationThread {
  id: string;
  title: string;
  brandId: string;
  rootNodeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VariantFeedback {
  rating: Rating;
  reasonChips: string[];
  note: string;
  createdAt: string;
}

export interface ImageVariant {
  id: string;
  nodeId: string;
  src: string;
  prompt: string;
  styleLabel: string;
  displayOrder?: number;
  completedAt?: string;
  metadata?: ImageVariantMetadata;
  feedback?: VariantFeedback;
  status?: TraceStatus;
  error?: string;
}

export interface TraceNode {
  id: string;
  threadId: string;
  title: string;
  parentNodeIds: string[];
  parentVariantIds: string[];
  depth: number;
  lane: number;
  outputCount: OutputCount;
  mode: TraceMode;
  status: TraceStatus;
  userPrompt: string;
  plannerSummary: string;
  generatedPrompts: string[];
  variants: ImageVariant[];
  createdAt: string;
  updatedAt: string;
  error?: string;
  attempt: number;
  turnSkipped?: boolean;
  turnFreeText?: string;
  feedbackAnswers?: FeedbackAnswer[];
  decision?: NextGenerationDecision;
}

export interface PlannerDirection {
  label: string;
  prompt: string;
  description?: string;
  why: string;
  divergence: "wide" | "medium" | "narrow";
}

export interface PlannerOutput {
  nodeTitle: string;
  strategy: string;
  traceSummary: string;
  directions: PlannerDirection[];
}

export interface TraceMemory {
  brandSummary: string | null;
  warmSignals: string[];
  coldSignals: string[];
  customSteers: string[];
  promptHistory: string[];
  ancestrySummary: string;
  selectedReferenceSummary: string;
}

export interface PlannerInput {
  brand: Brand | null;
  traceMemory: TraceMemory;
  actionMode: TraceMode;
  selectedVariants: ImageVariant[];
  userPrompt: string;
  seed: string;
  nodeDepth?: number;
  outputCount?: OutputCount;
  runtimeConfig?: RuntimeConfig;
  originatingDecision?: NextGenerationDecision;
}

export interface ImageGenerationInput {
  brand: Brand | null;
  label: string;
  prompt: string;
  category: string;
  styleIndex: number;
  seed: string;
  promptSituation?: ImagePromptSituation;
  references?: ImageVariant[];
  runtimeConfig?: RuntimeConfig;
}

export interface ImageGenerationResult {
  src: string;
  prompt: string;
  styleLabel: string;
  usage?: unknown;
}

export interface ImageBatchGenerationInput {
  brand: Brand | null;
  label: string;
  prompt: string;
  category: string;
  seed: string;
  outputCount: number;
  variantLabels: string[];
  variantPrompts: string[];
  promptSituation?: ImagePromptSituation;
  references?: ImageVariant[];
  runtimeConfig?: RuntimeConfig;
}

export interface ImageBatchGenerationResult {
  images: ImageGenerationResult[];
  prompt: string;
  usage?: unknown;
}

export interface RuntimeConfig {
  realMode: boolean;
  mockLatencyMs: number;
}

export interface GenerationJob {
  id: string;
  nodeId: string;
  threadId: string;
  variantId: string;
  label: string;
  status: TraceStatus;
  progress: number;
  etaSeconds: number;
  indeterminate?: boolean;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
}
