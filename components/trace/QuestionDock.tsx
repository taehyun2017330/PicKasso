import { AssistantGuide } from "@/components/AssistantGuide";
import type { AudienceSimulationResult } from "@/lib/ai/guide/audienceSimulation";
import type { FeedbackAnswer, NextGenerationDecision } from "@/lib/feedback/types";
import type { Brand, RuntimeConfig, TraceNode } from "@/lib/types";

interface QuestionDockProps {
  brand: Brand | null;
  node: TraceNode;
  audienceResult: AudienceSimulationResult | null;
  runtimeConfig: RuntimeConfig | null;
  selectedVariantIds: string[];
  isLoading?: boolean;
  regenerateOpen?: boolean;
  onAudienceResult: (result: AudienceSimulationResult) => void;
  onToggleReference: (variantId: string) => void;
  onCloseRegenerate?: () => void;
  onGenerateRegenerate?: (decision: NextGenerationDecision, answers: FeedbackAnswer[]) => void;
}

export function QuestionDock({
  brand,
  node,
  audienceResult,
  runtimeConfig,
  selectedVariantIds,
  isLoading = false,
  regenerateOpen = false,
  onAudienceResult,
  onToggleReference,
  onCloseRegenerate,
  onGenerateRegenerate
}: QuestionDockProps) {
  return (
    <AssistantGuide
      kind="canvas"
      collapseAt="never"
      brand={brand}
      node={node}
      audienceResult={audienceResult}
      runtimeConfig={runtimeConfig}
      selectedVariantIds={selectedVariantIds}
      isLoading={isLoading}
      regenerateOpen={regenerateOpen}
      onAudienceResult={onAudienceResult}
      onToggleReference={onToggleReference}
      onCloseRegenerate={onCloseRegenerate}
      onGenerateRegenerate={onGenerateRegenerate}
    />
  );
}
