import type { RuntimeConfig } from "@/lib/types";
import { getAiModelRoute } from "@/lib/ai/modelRoutes";

export function isRealOpenAIEnabled() {
  return process.env.DEMO_USE_REAL_OPENAI === "true" && Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIImageModel() {
  return getAiModelRoute("imageGeneration").model;
}

export function getMockLatencyMs() {
  const parsed = Number.parseInt(process.env.MOCK_IMAGE_LATENCY_MS || "3000", 10);
  return Number.isFinite(parsed) ? parsed : 3000;
}

export function getOpenAIGuideTimeoutMs() {
  const parsed = Number.parseInt(process.env.OPENAI_GUIDE_TIMEOUT_MS || "6000", 10);
  return Number.isFinite(parsed) ? Math.max(1000, parsed) : 6000;
}

export function getOpenAIRuntimeConfig(): RuntimeConfig {
  return {
    realMode: isRealOpenAIEnabled(),
    mockLatencyMs: getMockLatencyMs()
  };
}
