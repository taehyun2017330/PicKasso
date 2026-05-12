import { Loader2, MousePointer2 } from "lucide-react";
import type { ReactNode } from "react";

import { AiGuideLogo } from "@/components/ai-guide/AiGuideLogo";
import { AudienceSuggestionsCard } from "@/components/ai-guide/AudienceSuggestionsCard";
import type { AudienceAssistViewModel } from "@/components/ai-guide/AudienceSuggestionsCard";
import { BoardRegenerateGuide } from "@/components/ai-guide/BoardRegenerateGuide";
import { CanvasGuideActions } from "@/components/ai-guide/CanvasGuideActions";
import type { AudienceSimulationResult } from "@/lib/ai/guide/audienceSimulation";
import type { FeedbackAnswer, NextGenerationDecision } from "@/lib/feedback/types";
import type { Brand, RuntimeConfig, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

type GuideKind = "empty" | "brand" | "brandReady" | "canvas" | "clarify" | "edit";
type GuideCollapse = "wide" | "narrow" | "never";

interface BrandGuideDraft {
  name: string;
  category: string;
  targetAudience: string;
}

interface AssistantGuideProps {
  kind: GuideKind;
  hasBrands?: boolean;
  isLoading?: boolean;
  brandDraft?: BrandGuideDraft;
  audienceAssist?: AudienceAssistViewModel;
  brand?: Brand | null;
  node?: TraceNode;
  runtimeConfig?: RuntimeConfig | null;
  audienceResult?: AudienceSimulationResult | null;
  selectedVariantIds?: string[];
  regenerateOpen?: boolean;
  collapseAt?: GuideCollapse;
  onAudienceResult?: (result: AudienceSimulationResult) => void;
  onToggleReference?: (variantId: string) => void;
  onCloseRegenerate?: () => void;
  onGenerateRegenerate?: (decision: NextGenerationDecision, answers: FeedbackAnswer[]) => void;
}

export function AssistantGuide({
  kind,
  hasBrands = false,
  isLoading = false,
  brandDraft,
  audienceAssist,
  brand = null,
  node,
  runtimeConfig = null,
  audienceResult = null,
  selectedVariantIds = [],
  regenerateOpen = false,
  collapseAt = "wide",
  onAudienceResult,
  onToggleReference,
  onCloseRegenerate,
  onGenerateRegenerate
}: AssistantGuideProps) {
  const guide = guideFor({ kind, hasBrands, brandDraft });
  const showInsight = kind === "canvas" || kind === "clarify" || kind === "edit";
  const showAudienceAssist = kind === "brand" && audienceAssist && audienceAssist.status !== "idle";
  const showRegenerateGuide =
    regenerateOpen &&
    kind === "canvas" &&
    !isLoading &&
    Boolean(node?.variants.length) &&
    Boolean(onGenerateRegenerate);
  const showCanvasActions =
    kind === "canvas" &&
    !showRegenerateGuide &&
    !isLoading &&
    Boolean(node?.variants.length) &&
    node?.variants.every((variant) => variant.status === "done" && Boolean(variant.src)) &&
    Boolean(onAudienceResult && onToggleReference);
  const collapseClass =
    collapseAt === "never"
      ? ""
      : collapseAt === "narrow"
      ? "max-[760px]:static max-[760px]:h-auto max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:px-6"
      : "max-[1080px]:static max-[1080px]:h-auto max-[1080px]:border-l-0 max-[1080px]:border-t max-[1080px]:px-6";

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen min-w-0 flex-col overflow-y-auto border-l border-[#e7e7e3] bg-white px-5 py-5 soft-scrollbar",
        collapseClass
      )}
    >
      <h2 className="text-[20px] font-semibold leading-tight text-[#191917]">{guide.status}</h2>

      <div className="mt-6">
        <p className="text-[12px] font-semibold text-[#30302d]">On this screen</p>
        <div className="mt-2.5 space-y-2">
          {guide.steps.map((step, index) => (
            <GuideStep key={step} active={index === guide.activeIndex} index={index + 1}>
              {step}
            </GuideStep>
          ))}
        </div>
      </div>

      {showAudienceAssist ? (
        <AudienceSuggestionsCard assist={audienceAssist} />
      ) : showRegenerateGuide && node && onGenerateRegenerate ? (
        <BoardRegenerateGuide
          brand={brand}
          node={node}
          runtimeConfig={runtimeConfig}
          onClose={onCloseRegenerate}
          onGenerate={onGenerateRegenerate}
        />
      ) : showCanvasActions && node && onAudienceResult && onToggleReference ? (
        <CanvasGuideActions
          brand={brand}
          node={node}
          runtimeConfig={runtimeConfig}
          audienceResult={audienceResult}
          selectedVariantIds={selectedVariantIds}
          onAudienceResult={onAudienceResult}
          onToggleReference={onToggleReference}
        />
      ) : (
        <AiInsight
          expanded={showInsight}
          isLoading={isLoading}
          recommendation={guide.recommendation}
          reason={guide.reason}
        />
      )}
    </aside>
  );
}

function AiInsight({
  expanded,
  isLoading,
  recommendation,
  reason
}: {
  expanded: boolean;
  isLoading: boolean;
  recommendation: string;
  reason: string;
}) {
  if (!expanded) {
    return (
      <div className="group/ai relative mt-auto w-full">
        <div className="relative flex h-12 w-full items-center gap-2 rounded-xl bg-[#151515] px-3 text-white shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
          <AiGuideLogo className="h-7 w-7" />
          <span className="text-sm font-semibold">AI Guide</span>
          <LoadingDot active={isLoading} />
        </div>
        <AiTooltip />
      </div>
    );
  }

  const displayRecommendation = isLoading ? "Images are being generated." : recommendation;
  const displayReason = isLoading
    ? "A full board usually takes about 1 minute. Keep this page open while the AI finishes the image set."
    : reason;

  return (
    <div className="group/ai relative mt-auto rounded-2xl bg-[#151515] p-4 text-white shadow-[0_16px_45px_rgba(0,0,0,0.18)] animate-ai-guide-in">
      <LoadingDot active={isLoading} corner />
      <div className="flex items-center gap-2">
        <AiGuideLogo className="h-8 w-8" withStatus />
        <p className="text-sm font-semibold">AI Guide</p>
      </div>

      <p className="mt-4 text-[15px] font-semibold leading-6">{displayRecommendation}</p>
      <p className="mt-2 text-sm leading-6 text-white/68">{displayReason}</p>
      <AiTooltip />
    </div>
  );
}

function LoadingDot({
  active,
  corner = false
}: {
  active: boolean;
  corner?: boolean;
}) {
  if (!active) return null;

  return (
    <span
      className={cn(
        "grid h-5 w-5 place-items-center rounded-full bg-white text-[#151515]",
        corner && "absolute right-3 top-3"
      )}
      aria-label="AI guide loading"
    >
      <Loader2 size={12} className="animate-spin" />
    </span>
  );
}

function AiTooltip() {
  return (
    <span className="pointer-events-none absolute bottom-full right-0 mb-2 w-[250px] rounded-md bg-[#1f1f1f] px-3 py-2 text-xs font-medium leading-5 text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-opacity delay-0 duration-150 group-hover/ai:opacity-100 group-hover/ai:delay-500">
      AI analyzes previous context, brand details, and selections to help you explore as a design expert.
    </span>
  );
}

function GuideStep({
  active,
  children,
  index
}: {
  active: boolean;
  children: ReactNode;
  index: number;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-xl p-2.5 text-[13px] leading-5",
        active ? "bg-[#f7f7f4] text-[#20201d]" : "text-[#666660]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
          active ? "bg-[#111111] text-white" : "bg-[#ededeb] text-[#686862]"
        )}
      >
        {active ? <MousePointer2 size={10} /> : index}
      </span>
      <span>{children}</span>
    </div>
  );
}

function guideFor({
  kind,
  hasBrands,
  brandDraft
}: {
  kind: GuideKind;
  hasBrands: boolean;
  brandDraft?: BrandGuideDraft;
}) {
  if (kind === "empty") {
    if (hasBrands) {
      return {
        status: "Setup",
        recommendation: "Choose where this exploration belongs.",
        reason: "Starting from a brand keeps each image thread grouped with the right context.",
        activeIndex: 0,
        steps: ["Start a new exploration.", "Pick the brand folder.", "Open the image board."]
      };
    }

    return {
      status: "Setup",
      recommendation: "Create a brand profile first.",
      reason: "The image board needs a simple brand context before it can generate useful directions.",
      activeIndex: 0,
      steps: ["Open brand setup.", "Add the brand basics.", "Save the profile."]
    };
  }

  if (kind === "brand") {
    const brandStepState = getBrandStepState(brandDraft);

    return {
      status: "Brand setup",
      recommendation: "Keep the profile plain and specific.",
      reason: "The first board uses this as a light constraint, not a locked visual style.",
      activeIndex: brandStepState.activeIndex,
      steps: brandStepState.steps
    };
  }

  if (kind === "brandReady") {
    return {
      status: "Ready",
      recommendation: "Start broad before narrowing.",
      reason: "The first board should give you varied options before you branch into a direction.",
      activeIndex: 0,
      steps: ["Start an exploration for this brand.", "Open any saved thread.", "Return here to keep directions grouped."]
    };
  }

  if (kind === "clarify") {
    return {
      status: "Clarifying",
      recommendation: "Name the reason, not just the image.",
      reason: "The next board improves when it knows what trait should carry forward.",
      activeIndex: 1,
      steps: ["Review the selected set.", "Pick the shared traits.", "Generate the next board."]
    };
  }

  if (kind === "edit") {
    return {
      status: "Editing",
      recommendation: "Separate what stays from what changes.",
      reason: "That keeps the edit targeted while preserving the parts that already work.",
      activeIndex: 1,
      steps: ["Choose what to preserve.", "Choose what to change.", "Generate four edits."]
    };
  }

  return {
    status: "Image board",
    recommendation: "Use this board to compare, inspect, select, and regenerate images.",
    reason: "Grid and Cards help you review the set. The AI Guide is there when you want to turn image feedback into the next move.",
    activeIndex: -1,
    steps: [
      "View the generated images in Grid or Cards.",
      "Open any image to inspect it in detail.",
      "Regenerate a weak image, or regenerate the full board.",
      "Select directions that feel promising.",
      "Use Explore for broader variations in a direction.",
      "Use Confirm & Edit for targeted changes to selected images.",
      "Use AI Guide for any other feedback about the images."
    ]
  };
}

function getBrandStepState(draft?: BrandGuideDraft) {
  const name = draft?.name.trim() ?? "";
  const category = draft?.category.trim() ?? "";
  const audience = draft?.targetAudience.trim() ?? "";

  const hasName = Boolean(name);
  const hasCategory = Boolean(category);
  const hasAudience = Boolean(audience);

  return {
    activeIndex: !hasName ? 0 : !hasCategory ? 1 : !hasAudience ? 2 : 2,
    steps: [
      hasName ? `Name the brand: ${name}` : "Name the brand:",
      hasCategory ? `Category: ${category}` : "Pick the category.",
      hasAudience ? `Audience: ${audience}` : "Choose the target audience."
    ]
  };
}
