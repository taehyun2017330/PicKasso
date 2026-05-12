"use client";

import { Check, Loader2, RotateCcw, Undo2 } from "lucide-react";

import type { TargetAudienceSuggestion } from "@/lib/ai/guide/types";
import { cn } from "@/lib/utils";

export type AudienceAssistStatus = "idle" | "loading" | "ready" | "applied" | "error";

export interface AudienceAssistViewModel {
  status: AudienceAssistStatus;
  suggestions: TargetAudienceSuggestion[];
  selectedAudience?: string;
  model?: string | null;
  error?: string;
  onSelect: (suggestion: TargetAudienceSuggestion) => void;
  onReroll: () => void;
  onUndo: () => void;
}

export function AudienceSuggestionsCard({ assist }: { assist: AudienceAssistViewModel }) {
  const isLoading = assist.status === "loading";
  const isApplied = assist.status === "applied";
  const isError = assist.status === "error";

  return (
    <div className="mt-auto rounded-xl bg-[#151515] p-3 text-white shadow-[0_16px_45px_rgba(0,0,0,0.18)] animate-ai-guide-in">
      <div className="flex items-center gap-2">
        <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white">
          <img src="/ai-guide-logo.png" alt="" className="h-full w-full object-cover" draggable={false} />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-[#151515] bg-[#66b37a]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-4">AI Guide</p>
          <p className="text-[11px] leading-4 text-white/56">
            {isLoading ? "Finding audience options" : isApplied ? "Audience applied" : "Target audience suggestions"}
          </p>
        </div>
        {assist.status === "ready" || isError ? (
          <button
            type="button"
            onClick={assist.onReroll}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-white/12 px-2 text-[11px] font-semibold text-white/78 transition hover:border-white/28 hover:bg-white/[0.08]"
            title="Reroll target audiences"
          >
            <RotateCcw size={11} />
            Reroll
          </button>
        ) : null}
      </div>

      {isLoading ? <AudienceLoading /> : null}

      {assist.status === "ready" ? (
        <div className="mt-3 space-y-1.5">
          {assist.suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => assist.onSelect(suggestion)}
              className="w-full rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-2 text-left transition hover:border-white/28 hover:bg-white/[0.1]"
            >
              <span className="block text-[13px] font-semibold leading-4">{suggestion.audience}</span>
            </button>
          ))}
        </div>
      ) : null}

      {isApplied ? (
        <div className="mt-3 rounded-md border border-[#6ea97b]/35 bg-[#66b37a]/12 px-2.5 py-2.5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#66b37a] text-[#111111]">
              <Check size={11} />
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-4">AI entered the audience.</p>
              <p className="mt-1 text-[11px] leading-4 text-white/62">{assist.selectedAudience}</p>
              <button
                type="button"
                onClick={assist.onUndo}
                className="mt-2 inline-flex h-7 items-center gap-1 rounded-md border border-white/14 px-2 text-[11px] font-semibold text-white/78 transition hover:border-white/30 hover:bg-white/[0.08]"
                title="Undo AI audience"
              >
                <Undo2 size={11} />
                Undo
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isError ? (
        <div className="mt-3 rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-2.5 text-[13px] leading-5 text-white/72">
          {assist.error || "Audience suggestions are unavailable right now."}
        </div>
      ) : null}
    </div>
  );
}

function AudienceLoading() {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 text-[13px] font-semibold">
        <Loader2 size={13} className="animate-spin" />
        Reading the brand context
      </div>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "h-9 rounded-md border border-white/10 bg-white/[0.06]",
            index === 1 && "w-[92%]",
            index === 2 && "w-[78%]"
          )}
        />
      ))}
    </div>
  );
}
