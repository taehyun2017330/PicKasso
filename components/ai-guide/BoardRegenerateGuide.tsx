"use client";

import { ArrowRight, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AiGuideLogo } from "@/components/ai-guide/AiGuideLogo";
import { labelsFor, toggleOption } from "@/components/trace/clarifierResult";
import {
  analyzeBoardRegeneration,
  type BoardRegenerationReview,
  type BoardRegenerationVariant
} from "@/lib/ai/guide/boardRegeneration";
import type { FeedbackAnswer, NextGenerationDecision } from "@/lib/feedback/types";
import type { Brand, RuntimeConfig, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BoardRegenerateGuideProps {
  brand: Brand | null;
  node: TraceNode;
  runtimeConfig?: RuntimeConfig | null;
  onClose?: () => void;
  onGenerate: (decision: NextGenerationDecision, answers: FeedbackAnswer[]) => void;
}

export function BoardRegenerateGuide({
  brand,
  node,
  runtimeConfig = null,
  onClose,
  onGenerate
}: BoardRegenerateGuideProps) {
  const variants = useMemo(
    () => node.variants.map(toReviewVariant),
    [node.variants]
  );
  const fallbackReview = useMemo(
    () =>
      analyzeBoardRegeneration({
        brand,
        model: null,
        variants
      }),
    [brand, variants]
  );
  const [review, setReview] = useState<BoardRegenerationReview>(fallbackReview);
  const [reviewStatus, setReviewStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedLabels = labelsFor(review.options, selectedIds);
  const noteText = note.trim();
  const canGenerate = selectedIds.length > 0 || noteText.length > 0;
  const isReviewLoading = reviewStatus === "loading";

  useEffect(() => {
    let alive = true;

    setReview(fallbackReview);
    setReviewStatus("loading");
    setSelectedIds([]);
    setNote("");
    setIsSubmitting(false);

    async function loadReview() {
      try {
        const response = await fetch("/api/ai-guide/board-regeneration-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: brand
              ? {
                  name: brand.name,
                  category: brand.category,
                  targetAudience: brand.targetAudience
                }
              : null,
            variants,
            realMode: runtimeConfig?.realMode
          })
        });

        if (!response.ok) throw new Error("Board review request failed.");
        const payload = (await response.json()) as BoardRegenerationReview;
        if (!alive) return;

        setReview(payload);
        setReviewStatus(payload.source === "openai" ? "ready" : "fallback");
      } catch {
        if (!alive) return;
        setReview(fallbackReview);
        setReviewStatus("fallback");
      }
    }

    loadReview();

    return () => {
      alive = false;
    };
  }, [brand, fallbackReview, runtimeConfig?.realMode, variants]);

  function submit() {
    if (!canGenerate || isSubmitting) return;
    setIsSubmitting(true);

    const avoidText = selectedLabels.length ? `Avoid: ${selectedLabels.join(", ")}.` : null;
    const customText = noteText ? `User feedback: ${noteText}.` : null;
    const promptIntent = [
      "Regenerate the full nine-image board.",
      "Use the current 3x3 board as the rejected board snapshot.",
      `Board snapshot: ${review.snapshot}`,
      avoidText,
      customText,
      "Preserve the first-generation diversity standard as a hard requirement.",
      "Keep the first-board spirit: broad exploration, high visual distance, and nine meaningfully different directions.",
      "Steer away from the rejected qualities while preserving the brand context and avoiding a narrow family of near-duplicates."
    ]
      .filter(Boolean)
      .join(" ");

    onGenerate(
      {
        mode: "regenerate",
        nextOutputCount: 9,
        promptIntent,
        memoryUpdate: [avoidText, customText].filter(Boolean).join(" ") || "Regenerate the full board from avoid feedback."
      },
      [
        {
          stepId: "regenerate-all-feedback",
          optionIds: selectedIds,
          freeText: [selectedLabels.join(", "), noteText].filter(Boolean).join(" ")
        }
      ]
    );
  }

  return (
    <div className="group/ai fixed bottom-5 right-5 z-40 w-[min(430px,calc(100vw-2rem))] rounded-2xl bg-[#151515] p-4 text-white shadow-[0_16px_45px_rgba(0,0,0,0.18)] animate-ai-guide-in max-[1080px]:static max-[1080px]:mt-auto max-[1080px]:w-full">
      <div className="flex items-start gap-2">
        <AiGuideLogo className="h-8 w-8" withStatus />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">AI Guide</p>
          <p className="text-[11px] font-medium uppercase leading-4 tracking-[0.04em] text-white/45">
            Regenerate All
          </p>
        </div>
        {reviewStatus === "loading" ? <Loader2 size={14} className="mt-1 animate-spin text-white/52" /> : null}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-white/54 transition hover:bg-white/10 hover:text-white"
            aria-label="Close regenerate all guide"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {isReviewLoading ? (
        <RegenerateReviewLoading />
      ) : (
        <>
          <p className="mt-4 text-[15px] font-semibold leading-6">What would you change about this board?</p>
          <p className="mt-1 text-sm leading-5 text-white/58">Pick what you agree with, or add your own critique.</p>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/45">My critique</p>
            <div className="flex flex-wrap gap-1.5">
              {review.options.map((option) => {
                const selected = selectedIds.includes(option.id);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedIds((current) => toggleOption(current, option.id, 4))}
                    className={cn(
                      "min-h-8 rounded-full border px-3 text-[12px] font-semibold leading-4 transition",
                      selected
                        ? "border-white bg-white text-[#151515]"
                        : "border-white/14 bg-white/[0.06] text-white/74 hover:border-white/32 hover:bg-white/[0.1] hover:text-white"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Or type what missed..."
            className="mt-3 h-20 w-full resize-none rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-sm leading-5 text-white outline-none transition placeholder:text-white/35 focus:border-white/36 focus:bg-white/[0.08]"
            maxLength={260}
          />

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/45">PicKasso&apos;s critique</p>
            <p className="mt-2 text-sm leading-6 text-white/70">{review.summary}</p>
          </div>

          <p className="mt-2 text-[12px] leading-5 text-white/58">
            I’ll regenerate all nine with the same exploration range, but away from the reasons you mark here.
          </p>

          <button
            type="button"
            onClick={submit}
            disabled={!canGenerate || isSubmitting}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-[#151515] transition hover:bg-[#f0f0ed] disabled:cursor-not-allowed disabled:bg-white/22 disabled:text-white/45"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Regenerate 9 images
            {!isSubmitting ? <ArrowRight size={14} /> : null}
          </button>
        </>
      )}
    </div>
  );
}

function RegenerateReviewLoading() {
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
          <Loader2 size={15} className="animate-spin text-white/72" />
        </span>
        <div>
          <p className="text-[15px] font-semibold leading-5">Reviewing this board</p>
          <p className="mt-1 text-sm leading-5 text-white/55">PicKasso is reading the full 3x3 set before suggesting changes.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <LoadingLine className="w-[92%]" />
        <LoadingLine className="w-[78%]" />
        <LoadingLine className="w-[64%]" />
      </div>
    </div>
  );
}

function LoadingLine({ className }: { className?: string }) {
  return <span className={cn("block h-2 rounded-full bg-white/10", className)} />;
}

function toReviewVariant(variant: TraceNode["variants"][number]): BoardRegenerationVariant {
  return {
    id: variant.id,
    prompt: variant.prompt,
    src: variant.src,
    status: variant.status,
    styleLabel: variant.styleLabel
  };
}
