"use client";

import { Check, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { AiGuideLogo } from "@/components/ai-guide/AiGuideLogo";
import {
  audienceRefinementHints,
  createAudiencePersonas,
  simulateAudienceResponse,
  type AudiencePersona,
  type AudiencePersonaGenerationOutput,
  type AudienceSimulationResult
} from "@/lib/ai/guide/audienceSimulation";
import type { Brand, RuntimeConfig, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AudienceSimulationPanelProps {
  brand: Brand | null;
  node: TraceNode;
  runtimeConfig: RuntimeConfig | null;
  open: boolean;
  result: AudienceSimulationResult | null;
  selectedVariantIds: string[];
  onClose: () => void;
  onComplete: (result: AudienceSimulationResult) => void;
  onToggleReference: (variantId: string) => void;
}

type SimulationStatus = "idle" | "personas-loading" | "scoring" | "ready";
type SimulationStep = "audience" | "personas";

export function AudienceSimulationPanel({
  brand,
  node,
  runtimeConfig,
  open,
  result,
  selectedVariantIds,
  onClose,
  onComplete,
  onToggleReference
}: AudienceSimulationPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [audience, setAudience] = useState(result?.audience ?? brand?.targetAudience ?? "");
  const [personas, setPersonas] = useState<AudiencePersona[]>(() =>
    createAudiencePersonas({ audience: brand?.targetAudience ?? "", brand })
  );
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [step, setStep] = useState<SimulationStep>("audience");
  const [localResult, setLocalResult] = useState<AudienceSimulationResult | null>(result);
  const [personaSource, setPersonaSource] = useState<"mock" | "openai">(result?.personaSource ?? "mock");
  const [personaModel, setPersonaModel] = useState<string | null>(result?.personaModel ?? null);
  const hints = useMemo(() => audienceRefinementHints(brand), [brand]);
  const readyImages = node.variants.filter((variant) => variant.status === "done" && variant.src);

  const runSimulation = useCallback(async () => {
    setStatus("scoring");

    try {
      const response = await fetch("/api/ai-guide/audience-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand ? {
            name: brand.name,
            category: brand.category,
            targetAudience: brand.targetAudience
          } : null,
          audience,
          personas,
          personaSource,
          personaModel,
          realMode: runtimeConfig?.realMode ?? true,
          variants: node.variants.map((variant) => ({
            id: variant.id,
            src: variant.src,
            prompt: variant.prompt,
            styleLabel: variant.styleLabel,
            status: variant.status
          }))
        })
      });

      if (!response.ok) throw new Error("Audience simulation failed.");

      const nextResult = await response.json() as AudienceSimulationResult;
      setLocalResult(nextResult);
      onComplete(nextResult);
      setStatus("ready");
      window.setTimeout(onClose, 650);
    } catch {
      const nextResult = simulateAudienceResponse({
        brand,
        node,
        audience,
        personas,
        personaSource,
        personaModel,
        scoreSource: "mock"
      });
      setLocalResult(nextResult);
      onComplete(nextResult);
      setStatus("ready");
      window.setTimeout(onClose, 650);
    }
  }, [audience, brand, node, onClose, onComplete, personaModel, personaSource, personas, runtimeConfig]);

  const setAudienceAndPersonas = useCallback((nextAudience: string) => {
    setAudience(nextAudience);
    setPersonas(createAudiencePersonas({ audience: nextAudience, brand }));
    setPersonaSource("mock");
    setPersonaModel(null);
  }, [brand]);

  const updatePersona = useCallback((index: number, field: keyof AudiencePersona, value: string) => {
    setPersonas((current) =>
      current.map((persona, personaIndex) => personaIndex === index ? { ...persona, [field]: value } : persona)
    );
  }, []);

  const confirmAudience = useCallback(async () => {
    const nextAudience = audience.trim();
    if (!nextAudience) return;

    setStatus("personas-loading");

    try {
      const response = await fetch("/api/ai-guide/audience-personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: nextAudience,
          brandName: brand?.name ?? "",
          category: brand?.category ?? "",
          realMode: runtimeConfig?.realMode ?? true
        })
      });

      if (!response.ok) throw new Error("Persona generation failed.");

      const output = await response.json() as AudiencePersonaGenerationOutput;
      const nextPersonas = output.personas.length
        ? output.personas
        : createAudiencePersonas({ audience: nextAudience, brand });

      setPersonas(nextPersonas);
      setPersonaSource(output.source);
      setPersonaModel(output.model);
    } catch {
      setPersonas(createAudiencePersonas({ audience: nextAudience, brand }));
      setPersonaSource("mock");
      setPersonaModel(null);
    }

    setStep("personas");
    setStatus("idle");
  }, [audience, brand, runtimeConfig]);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const nextAudience = result?.audience ?? brand?.targetAudience ?? "";
    setAudience(nextAudience);
    setPersonas(result?.personas ?? createAudiencePersonas({ audience: nextAudience, brand }));
    setStatus("idle");
    setStep("audience");
    setLocalResult(result);
    setPersonaSource(result?.personaSource ?? "mock");
    setPersonaModel(result?.personaModel ?? null);
  }, [brand, brand?.targetAudience, node.id, open, result]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[88] bg-black/16 p-5 text-[#181816] max-[760px]:p-0" role="dialog" aria-modal="true">
      <section className="relative mx-auto grid h-full max-w-[1040px] grid-cols-[minmax(270px,340px)_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#dfdfda] bg-[#fbfbf8] max-[860px]:grid-cols-1">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full text-[#5e5e58] transition hover:bg-[#f0f0ed] hover:text-[#181816]"
          title="Close"
          aria-label="Close audience simulation"
        >
          <X size={18} />
        </button>
        <aside className="border-r border-[#e1e1dc] bg-white px-5 py-5 max-[860px]:border-b max-[860px]:border-r-0">
          <div className="flex items-start gap-3 pr-6">
            <AiGuideLogo className="h-12 w-12" shape="plain" withStatus />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#77776f]">AI Guide</p>
              <h2 className="mt-0.5 text-[21px] font-semibold leading-tight text-[#191917]">Target-user reactions</h2>
              <p className="mt-2 max-w-[250px] text-[13px] leading-5 text-[#6b6b64]">
                Refine the audience first. Personas come after you confirm it.
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-2">
            <StepMarker active={step === "audience"} done={step === "personas"} label="Refine audience" />
            <StepMarker active={step === "personas"} done={status === "ready"} label="Confirm personas" />
          </div>

          <div className="mt-7 border-t border-[#eeeeeb] pt-5">
            <p className="text-[11px] font-semibold uppercase text-[#8a8a82]">Current audience</p>
            <p className="mt-2 text-[13px] leading-5 text-[#3c3c38]">{audience || "No audience set yet."}</p>
          </div>

          <div className="mt-6 border-t border-[#eeeeeb] pt-5">
            {status === "ready" && localResult ? (
              <div className="rounded-lg border border-[#dfe8df] bg-[#f5faf5] px-3 py-3">
                <p className="text-[13px] font-semibold text-[#253d2c]">Analysis added.</p>
                <p className="mt-1 text-[12px] leading-5 text-[#52665a]">
                  Check the board scores, then open an image to read the reaction.
                </p>
              </div>
            ) : (
              <p className="text-[12px] leading-5 text-[#74746d]">
                {step === "audience"
                  ? "AI will shape personas from the confirmed audience."
                  : "Confirm personas to add average scores to the board."}
              </p>
            )}
          </div>
        </aside>

        <main className="min-h-0 overflow-y-auto px-6 py-5 soft-scrollbar">
          {status === "idle" && step === "audience" ? (
            <AudienceRefinement
              audience={audience}
              canConfirm={Boolean(audience.trim())}
              hints={hints}
              onAudienceChange={setAudienceAndPersonas}
              onConfirm={confirmAudience}
            />
          ) : status === "idle" && step === "personas" ? (
            <PersonaSetup
              personas={personas}
              onBack={() => setStep("audience")}
              onConfirm={runSimulation}
              onUpdate={updatePersona}
              canConfirm={Boolean(readyImages.length && audience.trim())}
              isLoading={false}
            />
          ) : status === "personas-loading" ? (
            <LoadingRead title="Generating three personas" />
          ) : status === "scoring" ? (
            <LoadingRead title="Scoring the board" />
          ) : localResult ? (
            <SimulationResults
              result={localResult}
              node={node}
              selectedVariantIds={selectedVariantIds}
              onToggleReference={onToggleReference}
            />
          ) : null}
        </main>
      </section>
    </div>,
    document.body
  );
}

function StepMarker({
  active,
  done,
  label
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-[12px]", active ? "text-[#191917]" : "text-[#8a8a82]")}>
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold",
          done ? "bg-[#171717] text-white" : active ? "bg-[#ededeb] text-[#191917]" : "bg-transparent text-[#9a9a92]"
        )}
      >
        {done ? <Check size={11} /> : null}
      </span>
      <span className={cn(active && "font-semibold")}>{label}</span>
    </div>
  );
}

function AudienceRefinement({
  audience,
  canConfirm,
  hints,
  onAudienceChange,
  onConfirm
}: {
  audience: string;
  canConfirm: boolean;
  hints: string[];
  onAudienceChange: (audience: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="max-w-[660px] pr-10">
      <h3 className="text-[24px] font-semibold leading-tight text-[#191917]">Tighten who should react first.</h3>
      <p className="mt-2 max-w-[600px] text-[13px] leading-5 text-[#686862]">
        Make the audience specific enough that the simulated people can judge the images with a real buying moment in mind.
      </p>

      <label className="mt-7 block" htmlFor="audience-simulation-input">
        <span className="text-[11px] font-semibold uppercase text-[#77776f]">Target audience</span>
        <textarea
          id="audience-simulation-input"
          value={audience}
          onChange={(event) => onAudienceChange(event.target.value)}
          className="mt-2 h-[86px] w-full resize-none border-0 border-b border-[#cfcfca] bg-transparent px-0 py-2 text-[20px] font-semibold leading-7 text-[#20201d] outline-none transition placeholder:text-[#aaa9a2] focus:border-[#171717]"
          placeholder="Describe who should react."
        />
      </label>

      <div className="mt-7 grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
        <div>
          <p className="text-[12px] font-semibold text-[#30302d]">AI suggestions</p>
          <div className="mt-2 divide-y divide-[#e7e7e2]">
            {hints.map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => onAudienceChange(hint)}
                className="flex w-full items-start gap-2 py-2.5 text-left text-[13px] leading-5 text-[#3d3d38] transition hover:text-[#111111]"
              >
                <Plus size={13} className="mt-1 shrink-0" />
                <span>{hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-l border-[#e3e3de] pl-5 max-md:border-l-0 max-md:border-t max-md:pl-0 max-md:pt-4">
          <p className="text-[12px] font-semibold text-[#30302d]">Better definition</p>
          <p className="mt-2 text-[12px] leading-5 text-[#707068]">
            Add the buying moment, visual taste, and decision filter. Example: premium coffee buyers choosing a quick morning drink.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-end border-t border-[#e7e7e2] pt-5">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onConfirm}
          disabled={!canConfirm}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#171717] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2a2a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Check size={15} />
          Confirm audience
        </button>
      </div>
    </div>
  );
}

function PersonaSetup({
  canConfirm,
  isLoading,
  onBack,
  onConfirm,
  personas,
  onUpdate
}: {
  canConfirm: boolean;
  isLoading: boolean;
  onBack: () => void;
  onConfirm: () => void;
  personas: AudiencePersona[];
  onUpdate: (index: number, field: keyof AudiencePersona, value: string) => void;
}) {
  return (
    <div className="flex min-h-full max-w-[740px] flex-col pr-10 max-[760px]:pr-0">
      <div>
        <p className="text-[12px] font-semibold uppercase text-[#77776f]">Persona simulation</p>
        <h3 className="mt-2 max-w-[620px] text-[24px] font-semibold leading-tight text-[#191917]">
          Review the three people before they score.
        </h3>
        <p className="mt-2 max-w-[600px] text-[13px] leading-5 text-[#686862]">
          Edit only what feels off. The averaged persona score will appear on the main grid.
        </p>
      </div>

      <div className="mt-6 divide-y divide-[#deded8]">
        {personas.map((persona, index) => (
          <article key={persona.id} className="py-5 first:pt-0">
            <div className="grid grid-cols-[minmax(0,1fr)_190px] gap-6 max-[720px]:grid-cols-1">
              <label>
                <span className="text-[11px] font-semibold uppercase text-[#77776f]">Person</span>
                <input
                  value={persona.name}
                  onChange={(event) => onUpdate(index, "name", event.target.value)}
                  className="mt-1 w-full border-0 bg-transparent p-0 text-[18px] font-semibold leading-7 text-[#242420] outline-none transition focus:text-[#000000]"
                />
              </label>
              <label>
                <span className="text-[11px] font-semibold uppercase text-[#77776f]">Lens</span>
                <input
                  value={persona.role}
                  onChange={(event) => onUpdate(index, "role", event.target.value)}
                  className="mt-1 w-full border-0 bg-transparent p-0 text-[13px] leading-6 text-[#4a4a44] outline-none transition focus:text-[#000000]"
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-[11px] font-semibold uppercase text-[#77776f]">Buying context</span>
              <textarea
                value={persona.context}
                onChange={(event) => onUpdate(index, "context", event.target.value)}
                className="mt-1 h-[48px] w-full resize-none border-0 bg-transparent p-0 text-[13px] leading-5 text-[#3f3f39] outline-none transition focus:text-[#111111]"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-[11px] font-semibold uppercase text-[#77776f]">Scores for</span>
              <input
                value={persona.priority}
                onChange={(event) => onUpdate(index, "priority", event.target.value)}
                className="mt-1 w-full border-0 bg-transparent p-0 text-[13px] leading-6 text-[#3f3f39] outline-none transition focus:text-[#111111]"
              />
            </label>
          </article>
        ))}
      </div>

      <div className="sticky bottom-0 mt-auto flex items-center justify-between gap-3 border-t border-[#e7e7e2] bg-[#fbfbf8]/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center rounded-md px-1 text-[13px] font-semibold text-[#55554f] transition hover:text-[#171717]"
        >
          Previous
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onConfirm}
          disabled={!canConfirm || isLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#171717] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2a2a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {isLoading ? "Scoring board" : "Confirm personas"}
        </button>
      </div>
    </div>
  );
}

function LoadingRead({ title }: { title: string }) {
  return (
    <div className="grid min-h-full place-items-center">
      <div className="w-full max-w-[420px] rounded-xl border border-[#e3e3dd] bg-white p-5">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-[#22221f]">
          <Loader2 size={16} className="animate-spin" />
          {title}
        </div>
        <div className="mt-5 space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className={cn("h-10 rounded-md bg-[#eeeeea]", item === 1 && "w-[88%]", item === 2 && "w-[72%]", item === 3 && "w-[94%]")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SimulationResults({
  result,
  node,
  selectedVariantIds,
  onToggleReference
}: {
  result: AudienceSimulationResult;
  node: TraceNode;
  selectedVariantIds: string[];
  onToggleReference: (variantId: string) => void;
}) {
  return (
    <div>
      <h3 className="max-w-[640px] text-[24px] font-semibold leading-tight text-[#191917]">{result.summary}</h3>

      <div className="mt-6 grid gap-3">
        {result.rankings.map((reaction, rank) => {
          const variant = node.variants.find((item) => item.id === reaction.variantId);
          const selected = selectedVariantIds.includes(reaction.variantId);

          return (
            <article key={reaction.variantId} className="grid grid-cols-[112px_minmax(0,1fr)_88px] gap-4 rounded-lg border border-[#deded8] bg-white p-3 max-[720px]:grid-cols-[88px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-md bg-[#e9e9e4]">
                {variant?.src ? (
                  <img src={variant.src} alt={variant.styleLabel} className="aspect-square w-full object-cover" draggable={false} />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#efefeb] px-2 py-1 text-[11px] font-semibold text-[#55554f]">#{rank + 1}</span>
                  <p className="text-[14px] font-semibold text-[#22221f]">Image {reaction.imageNumber}: {reaction.label}</p>
                </div>
                <p className="mt-2 text-[13px] leading-5 text-[#3f3f39]">{reaction.reaction}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#7a7a72]">{reaction.reason}</p>
                <button
                  type="button"
                  onClick={() => onToggleReference(reaction.variantId)}
                  className={cn(
                    "mt-3 inline-flex h-8 items-center rounded-md border px-3 text-[12px] font-semibold transition",
                    selected
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#d9d9d4] bg-white text-[#33332f] hover:bg-[#f5f5f1]"
                  )}
                >
                  {selected ? "Selected" : "Select"}
                </button>
              </div>
              <div className="grid place-items-center rounded-md bg-[#f5f5f1] max-[720px]:hidden">
                <span className="text-[24px] font-semibold text-[#191917]">{reaction.score}</span>
                <span className="text-[11px] font-semibold uppercase text-[#77776f]">fit</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
