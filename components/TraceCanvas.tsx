"use client";

import { useEffect, useMemo, useState } from "react";

import { AssistantGuide } from "@/components/AssistantGuide";
import { BoardToolbar } from "@/components/trace/BoardToolbar";
import { buildExplorationLanes } from "@/components/trace/explorationLayout";
import { EditWorkbench } from "@/components/trace/EditWorkbench";
import type { ClarifierMode } from "@/components/trace/modes";
import { QuestionDock } from "@/components/trace/QuestionDock";
import { SelectionClarifier } from "@/components/trace/SelectionClarifier";
import type { TraceCanvasProps } from "@/components/trace/types";
import { useActiveTraceNode } from "@/components/trace/useActiveTraceNode";
import { type BoardViewMode, TraceNodeCard } from "@/components/TraceNodeCard";
import type { AudienceSimulationResult } from "@/lib/ai/guide/audienceSimulation";
import type { FeedbackAnswer, NextGenerationDecision } from "@/lib/feedback/types";
import type { Brand, ImageVariant, TraceNode } from "@/lib/types";

export function TraceCanvas(props: TraceCanvasProps) {
  const explorations = useMemo(
    () => buildExplorationLanes(props.brands, props.threads, props.nodes),
    [props.brands, props.nodes, props.threads]
  );
  const { lane, node, latestNode } = useActiveTraceNode(explorations, props.activeThreadId);
  const [mode, setMode] = useState<ClarifierMode | null>(null);
  const selected = node?.variants.filter((variant) => props.selectedVariantIds.includes(variant.id)) ?? [];

  useEffect(() => setMode(null), [lane?.thread.id, latestNode?.id]);
  useEffect(() => {
    if (!selected.length) setMode(null);
  }, [selected.length]);

  if (!lane || !node) return null;

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div className="h-full min-w-0">
        <main className="h-full min-w-0 overflow-y-auto overflow-x-hidden soft-scrollbar">
          <CanvasBody
            {...props}
            laneBrand={lane.brand}
            node={node}
            selected={selected}
            mode={mode}
            onExplore={() => setMode("explore")}
            onEdit={() => setMode("edit")}
            onCloseMode={() => setMode(null)}
          />
        </main>
      </div>
    </div>
  );
}

function CanvasBody({
  laneBrand,
  node,
  selected,
  mode,
  onExplore,
  onEdit,
  onCloseMode,
  ...props
}: Pick<
  TraceCanvasProps,
  | "selectedVariantIds"
  | "runtimeConfig"
  | "onFeedback"
  | "onToggleReference"
  | "onRegenerateVariant"
  | "onGenerateNext"
  | "onCancel"
  | "onRetry"
> & {
  laneBrand: Brand | null;
  node: TraceNode;
  selected: ImageVariant[];
  mode: ClarifierMode | null;
  onExplore: () => void;
  onEdit: () => void;
  onCloseMode: () => void;
}) {
  const [viewMode, setViewMode] = useState<BoardViewMode>("grid");
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [audienceResultsByNode, setAudienceResultsByNode] = useState<Record<string, AudienceSimulationResult>>({});
  const isLoading = node.status === "queued" || node.status === "running";
  const audienceResult = audienceResultsByNode[node.id] ?? null;

  useEffect(() => setViewMode("grid"), [node.id]);
  useEffect(() => setRegenerateOpen(false), [node.id, mode]);
  useEffect(() => {
    if (isLoading || !node.variants.length) setRegenerateOpen(false);
  }, [isLoading, node.variants.length]);
  useEffect(() => {
    if (!isLoading) return;
    setAudienceResultsByNode((current) => {
      if (!current[node.id]) return current;
      const next = { ...current };
      delete next[node.id];
      return next;
    });
  }, [isLoading, node.id]);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      if (mode || event.key !== "Tab") return;

      event.preventDefault();
      setViewMode((current) => (current === "grid" ? "cards" : "grid"));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode]);

  function handleGenerateRegenerate(decision: NextGenerationDecision, answers: FeedbackAnswer[]) {
    setRegenerateOpen(false);
    props.onGenerateNext(node, decision, answers);
  }

  if (mode) {
    const guideKind = mode === "edit" ? "edit" : "clarify";

    return (
      <div className="grid min-h-full grid-cols-[minmax(0,1fr)_312px] bg-white max-[1080px]:grid-cols-1">
        <div className="flex items-start justify-center px-4 pb-10 pt-10">
          <SelectionClarifier
            brand={laneBrand}
            node={node}
            selectedVariants={selected}
            mode={mode}
            onCancel={onCloseMode}
            onFeedback={props.onFeedback}
            onGenerateNext={props.onGenerateNext}
          />
        </div>
        <AssistantGuide kind={guideKind} isLoading={isLoading} />
      </div>
    );
  }

  if (node.mode === "custom") {
    return (
      <div className="grid min-h-full grid-cols-[minmax(0,1fr)_312px] bg-white max-[1080px]:grid-cols-1">
        <div className="px-4 pb-10 pt-10">
          <EditWorkbench
            node={node}
            selectedVariantIds={props.selectedVariantIds}
            onToggleReference={props.onToggleReference}
            onRegenerateVariant={props.onRegenerateVariant}
          />
        </div>
        <AssistantGuide kind="edit" isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="trace-canvas-responsive-grid grid h-full min-h-0 bg-white">
      <div className="flex h-full min-h-0 justify-center overflow-hidden px-4 py-[clamp(0.75rem,3dvh,3.5rem)] min-[1200px]:px-8">
        <div className="flex h-full min-h-0 w-full max-w-[840px] flex-col">
          <BoardToolbar
            selectedCount={selected.length}
            canEdit={selected.length > 0}
            canRegenerate={!isLoading && node.variants.length > 0}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExplore={onExplore}
            onEdit={onEdit}
            onRegenerate={() => setRegenerateOpen(true)}
          />
          <div className="min-h-0 flex-1">
            <TraceNodeCard
              node={node}
              audienceResult={audienceResult}
              selectedVariantIds={props.selectedVariantIds}
              viewMode={viewMode}
              fitToViewport
              onToggleReference={props.onToggleReference}
              onRegenerateVariant={props.onRegenerateVariant}
            />
          </div>
        </div>
      </div>
      <QuestionDock
        brand={laneBrand}
        node={node}
        audienceResult={audienceResult}
        runtimeConfig={props.runtimeConfig}
        selectedVariantIds={props.selectedVariantIds}
        isLoading={isLoading}
        regenerateOpen={regenerateOpen}
        onAudienceResult={(result) =>
          setAudienceResultsByNode((current) => ({
            ...current,
            [node.id]: result
          }))
        }
        onToggleReference={props.onToggleReference}
        onCloseRegenerate={() => setRegenerateOpen(false)}
        onGenerateRegenerate={handleGenerateRegenerate}
      />
    </div>
  );
}
