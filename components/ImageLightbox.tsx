"use client";

import { Download, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { ImagePlaceholder } from "@/components/trace/ImagePlaceholder";
import { describePromptForUser } from "@/lib/ai/promptOrchestrator";
import type { AudienceReaction } from "@/lib/ai/guide/audienceSimulation";
import type { ImageVariant } from "@/lib/types";

interface ImageLightboxProps {
  variant: ImageVariant;
  audienceReaction?: AudienceReaction;
  onClose: () => void;
  onRegenerateVariant: (variantId: string) => void;
}

export function ImageLightbox({ variant, audienceReaction, onClose, onRegenerateVariant }: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(audienceReaction?.personaReactions?.[0]?.personaId ?? null);
  const busy = variant.status === "queued" || variant.status === "running";
  const canDownload = Boolean(variant.src);
  const placeholderPrompt = variant.prompt.startsWith("Image prompt placeholder");
  const placeholderTitle = /^[A-I]$/.test(variant.styleLabel);
  const title = placeholderTitle ? "Pending image" : variant.styleLabel;
  const description = placeholderPrompt
    ? "Description will appear after generation."
    : variant.metadata?.visualSummary || describePromptForUser(variant.prompt, variant.styleLabel);
  const prompt = placeholderPrompt ? "" : variant.prompt;
  const personaReactions = audienceReaction?.personaReactions ?? [];
  const selectedPersonaReaction =
    personaReactions.find((reaction) => reaction.personaId === selectedPersonaId) ?? personaReactions[0] ?? null;

  const closePreview = useCallback(() => {
    setVisible(false);
    window.setTimeout(onClose, 0);
  }, [onClose]);

  useEffect(() => {
    setMounted(true);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePreview();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreview]);

  useEffect(() => {
    setSelectedPersonaId(audienceReaction?.personaReactions?.[0]?.personaId ?? null);
  }, [audienceReaction?.variantId, audienceReaction?.personaReactions]);

  const content = (
    <div
      className="fixed inset-0 z-[90] bg-[#fbfbfa] text-[#171717]"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={closePreview}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) event.preventDefault();
      }}
    >
      <button
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          closePreview();
        }}
        className="fixed right-6 top-6 z-[92] grid h-10 w-10 place-items-center rounded-full text-[#555555] transition hover:bg-[#efefec] hover:text-[#111111]"
        title="Close preview"
        aria-label="Close preview"
      >
        <X size={22} />
      </button>

      <div
        className="grid h-full grid-cols-[minmax(420px,58vw)_minmax(280px,420px)] items-center gap-12 px-10 py-16 max-[980px]:grid-cols-1 max-[980px]:overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid place-items-center">
          {variant.src ? (
            <img
              src={variant.src}
              alt={variant.styleLabel}
              className="aspect-square max-h-[78vh] w-auto max-w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="aspect-square max-h-[78vh] w-[min(78vh,720px)] max-w-full overflow-hidden">
              <ImagePlaceholder />
            </div>
          )}
        </div>

        <aside className="max-w-[420px]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8a8a84]">Image preview</p>
          <h2 className="mt-3 text-[22px] font-semibold leading-tight text-[#1f1f1f]">{title}</h2>

          {audienceReaction ? (
            <div className="mt-6 rounded-lg border border-[#deded8] bg-white px-3 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold text-[#30302d]">Average audience score</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#575750]">{audienceReaction.reaction}</p>
                </div>
                <span className="grid h-11 min-w-11 place-items-center rounded-md bg-[#171717] px-2 text-[18px] font-semibold text-white">
                  {audienceReaction.score}
                </span>
              </div>
              <p className="mt-3 border-t border-[#efefec] pt-3 text-[13px] leading-5 text-[#4b4b45]">
                {audienceReaction.reason}
              </p>
              {personaReactions.length ? (
                <div className="mt-4 border-t border-[#efefec] pt-3">
                  <p className="text-[12px] font-semibold text-[#30302d]">Persona reactions</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {personaReactions.map((reaction) => {
                      const selected = reaction.personaId === selectedPersonaReaction?.personaId;

                      return (
                        <button
                          key={reaction.personaId}
                          type="button"
                          onClick={() => setSelectedPersonaId(reaction.personaId)}
                          className={selected
                            ? "inline-flex h-8 items-center gap-2 rounded-md bg-[#171717] px-2.5 text-[12px] font-semibold text-white"
                            : "inline-flex h-8 items-center gap-2 rounded-md border border-[#d9d9d4] bg-white px-2.5 text-[12px] font-semibold text-[#33332f] transition hover:bg-[#f5f5f1]"
                          }
                        >
                          <span>{reaction.personaName}</span>
                          <span className="opacity-70">{reaction.score}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedPersonaReaction ? (
                    <div className="mt-3 rounded-md bg-[#f7f7f4] px-3 py-2.5">
                      <p className="text-[12px] font-semibold text-[#30302d]">
                        {selectedPersonaReaction.personaName} · {selectedPersonaReaction.role}
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-[#4b4b45]">{selectedPersonaReaction.reaction}</p>
                      <p className="mt-1 text-[12px] leading-5 text-[#74746d]">{selectedPersonaReaction.reason}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a8a84]">Description</p>
            <p className="mt-2 text-[15px] leading-7 text-[#2f2f2c]">{description}</p>
          </div>

          {prompt ? (
            <details className="mt-5 rounded-lg border border-[#e4e4df] bg-white px-3 py-2.5">
              <summary className="cursor-pointer text-[12px] font-semibold text-[#55554f]">Image prompt</summary>
              <p className="mt-2 text-[12px] leading-5 text-[#73736c]">{prompt}</p>
            </details>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#8a8a84]">
            <span>quality: medium</span>
            <span>size: 1024x1024</span>
            <span>status: {variant.status ?? "ready"}</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <PreviewAction disabled={!canDownload} label="Download" onClick={() => downloadImage(variant)}>
              <Download size={15} />
            </PreviewAction>
            <PreviewAction disabled={busy} label="Regenerate" onClick={() => onRegenerateVariant(variant.id)}>
              <RefreshCw size={15} />
            </PreviewAction>
          </div>
        </aside>
      </div>
    </div>
  );

  return mounted && visible ? createPortal(content, document.body) : null;
}

function PreviewAction({
  children,
  disabled = false,
  label,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9d9d4] bg-white px-3 text-sm font-semibold text-[#242420] transition hover:bg-[#f4f4f1] disabled:cursor-not-allowed disabled:opacity-40"
      title={label}
      aria-label={label}
    >
      {children}
      {label}
    </button>
  );
}

function downloadImage(variant: ImageVariant) {
  if (!variant.src) return;

  const link = document.createElement("a");
  link.href = variant.src;
  link.download = `${variant.styleLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "image"}.png`;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
