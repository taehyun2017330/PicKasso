"use client";

import { ArrowRight, Pencil, Waypoints } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { ChipGrid } from "@/components/trace/ChipGrid";
import { buildClarifierResult, toggleOption } from "@/components/trace/clarifierResult";
import { buildTraitOptions, directionOptionsFor } from "@/components/trace/clarifierOptions";
import { toBrandProfile, toFeedbackVariant } from "@/components/trace/feedbackAdapters";
import type { ClarifierMode } from "@/components/trace/modes";
import { SelectionPreview } from "@/components/trace/SelectionPreview";
import type { FeedbackAnswer, NextGenerationDecision } from "@/lib/feedback/types";
import type { Brand, ImageVariant, TraceNode, VariantFeedback } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SelectionClarifierProps {
  brand: Brand | null;
  node: TraceNode;
  selectedVariants: ImageVariant[];
  mode: ClarifierMode;
  onCancel: () => void;
  onFeedback: (variantId: string, feedback: Omit<VariantFeedback, "createdAt">) => void;
  onGenerateNext: (node: TraceNode, decision: NextGenerationDecision, answers: FeedbackAnswer[]) => void;
}

export function SelectionClarifier(props: SelectionClarifierProps) {
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [leanIds, setLeanIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const brandProfile = useMemo(() => toBrandProfile(props.brand), [props.brand]);
  const feedbackVariants = useMemo(
    () => props.selectedVariants.map((variant, index) => toFeedbackVariant(variant, brandProfile, index)),
    [brandProfile, props.selectedVariants]
  );
  const traitOptions = useMemo(
    () =>
      buildTraitOptions({
        mode: props.mode,
        brand: brandProfile,
        variants: feedbackVariants,
        selectedCount: props.selectedVariants.length
      }),
    [brandProfile, feedbackVariants, props.mode, props.selectedVariants.length]
  );
  const directionOptions = useMemo(() => directionOptionsFor(props.mode), [props.mode]);
  const canGenerate = props.selectedVariants.length > 0 && likedIds.length > 0;
  const editTitle = props.selectedVariants.length > 1 ? "Edit selected images" : "Edit this image";
  const title = props.mode === "edit" ? editTitle : "Clarify this direction";
  const actionLabel = props.mode === "edit" ? "Generate 4 edits" : "Generate 9 explorations";
  const steps = useMemo(
    () => [
      {
        title: props.mode === "edit" ? "What should stay intact?" : "What do you like about these?",
        subtitle: props.mode === "edit" ? "Choose what the edit should preserve." : "Pick all that apply.",
        content: (
          <ChipGrid
            options={traitOptions}
            selectedIds={likedIds}
            onToggle={(id) => setLikedIds((current) => toggleOption(current, id))}
          />
        )
      },
      {
        title: props.mode === "edit" ? "What should change?" : "What should the next 9 lean into?",
        subtitle: props.mode === "edit" ? "Choose up to 3 edit targets." : "Choose up to 3 focus areas.",
        content: (
          <ChipGrid
            options={directionOptions}
            selectedIds={leanIds}
            onToggle={(id) => setLeanIds((current) => toggleOption(current, id, 3))}
          />
        )
      },
      {
        title: "Anything else?",
        subtitle: "Optional details, constraints, or a specific direction.",
        content: <NoteField mode={props.mode} note={note} onNote={setNote} />
      }
    ],
    [directionOptions, leanIds, likedIds, note, props.mode, traitOptions]
  );
  const current = steps[step];

  useEffect(() => {
    setReady(false);
    setStep(0);
    const timer = window.setTimeout(() => setReady(true), 520);
    return () => window.clearTimeout(timer);
  }, [props.mode, props.node.id, props.selectedVariants.length]);

  function generate() {
    if (!canGenerate) return;

    const result = buildClarifierResult({
      mode: props.mode,
      node: props.node,
      selectedVariants: props.selectedVariants,
      traitOptions,
      directionOptions,
      likedIds,
      leanIds,
      note
    });

    props.selectedVariants.forEach((variant) => {
      props.onFeedback(variant.id, {
        rating: "like",
        reasonChips: result.likedLabels,
        note: result.noteText
      });
    });

    props.onGenerateNext(props.node, result.decision, result.answers);
  }

  return (
    <div className="mx-auto grid w-full max-w-[900px] items-start gap-5 py-5 min-[920px]:grid-cols-[180px_minmax(0,1fr)]">
      <SelectionPreview
        node={props.node}
        variants={props.selectedVariants}
      />

      <section className="self-start bg-white px-4">
        <ClarifierHeader mode={props.mode} selectedCount={props.selectedVariants.length} title={title} />

        {ready ? (
          <>
            <QuestionStep
              title={current.title}
              subtitle={current.subtitle}
              step={step}
              total={steps.length}
            >
              {current.content}
            </QuestionStep>
            <WizardFooter
              step={step}
              total={steps.length}
              canNext
              canGenerate={canGenerate}
              actionLabel={actionLabel}
              onPrevious={() => {
                if (step === 0) {
                  props.onCancel();
                  return;
                }
                setStep((currentStep) => Math.max(0, currentStep - 1));
              }}
              onNext={() => setStep((currentStep) => Math.min(steps.length - 1, currentStep + 1))}
              onGenerate={generate}
            />
          </>
        ) : (
          <QuestionLoading />
        )}
      </section>
    </div>
  );
}

function ClarifierHeader({
  mode,
  selectedCount,
  title
}: {
  mode: ClarifierMode;
  selectedCount: number;
  title: string;
}) {
  const editSubtitle =
    selectedCount > 1
      ? "The selected images stay as direct references for this edit."
      : "The selected image stays as the direct reference.";

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center">
          {mode === "edit" ? <Pencil size={22} /> : <Waypoints size={23} />}
        </span>
        <div>
          <h2 className="text-[22px] font-medium text-[#1f1f1f]">{title}</h2>
          {mode === "edit" ? (
            <p className="mt-0.5 text-sm leading-5 text-[#737373]">{editSubtitle}</p>
          ) : (
            <p className="mt-0.5 text-sm leading-5 text-[#737373]">The selected images become the reference for the next direction.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionStep({
  children,
  step,
  subtitle,
  title,
  total
}: {
  children: ReactNode;
  step: number;
  subtitle: string;
  title: string;
  total: number;
}) {
  return (
    <div className="min-h-[170px] border-t border-[#eeeeeb] pt-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[17px] font-medium text-[#242424]">{title}</p>
          <p className="mt-0.5 text-sm text-[#737373]">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#f2f2ef] px-2.5 py-1 text-xs font-medium text-[#666660]">
          {step + 1}/{total}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function WizardFooter({
  actionLabel,
  canGenerate,
  canNext,
  onGenerate,
  onNext,
  onPrevious,
  step,
  total
}: {
  actionLabel: string;
  canGenerate: boolean;
  canNext: boolean;
  onGenerate: () => void;
  onNext: () => void;
  onPrevious: () => void;
  step: number;
  total: number;
}) {
  const last = step === total - 1;

  return (
    <div className="mt-5 flex items-center justify-between border-t border-[#eeeeeb] pt-4">
      <button
        type="button"
        onClick={onPrevious}
        className="h-9 rounded-lg px-3 text-sm font-medium text-[#60605a] transition hover:bg-[#f3f3f0]"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={last ? onGenerate : onNext}
        disabled={last ? !canGenerate : !canNext}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition active:scale-[0.995]",
          last
            ? canGenerate
              ? "bg-[#101010] text-white hover:bg-[#2a2a2a]"
              : "cursor-not-allowed bg-[#d1d1cd] text-white"
            : canNext
              ? "bg-[#101010] text-white hover:bg-[#2a2a2a]"
              : "cursor-not-allowed bg-[#d1d1cd] text-white"
        )}
      >
        {last ? actionLabel : "Next"}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function QuestionLoading() {
  return (
    <div className="grid min-h-[190px] place-items-center border-t border-[#eeeeeb]">
      <div className="w-full max-w-[360px]">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#eeeeeb]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#151515]" />
        </div>
        <p className="mt-5 text-sm font-semibold text-[#242421]">Preparing clarifying questions</p>
        <p className="mt-1 text-sm leading-6 text-[#74746e]">The generated questions will appear one at a time.</p>
      </div>
    </div>
  );
}

function NoteField({
  mode,
  note,
  onNote
}: {
  mode: ClarifierMode;
  note: string;
  onNote: (value: string) => void;
}) {
  return (
    <div>
      <textarea
        value={note}
        onChange={(event) => onNote(event.target.value)}
        placeholder={
          mode === "edit"
            ? "Example: keep the crop, remove the headline, make the table warmer."
            : "Share your thoughts..."
        }
        rows={3}
        maxLength={300}
        className="w-full resize-none border border-[#d9d9d9] bg-white px-3 py-3 text-sm outline-none transition placeholder:text-[#9a9a9a] focus:border-[#9f9f9f]"
      />
      <div className="mt-1 text-right text-xs text-[#8a8a8a]">{note.length}/300</div>
    </div>
  );
}
