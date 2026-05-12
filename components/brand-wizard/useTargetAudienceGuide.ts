"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { AudienceAssistStatus, AudienceAssistViewModel } from "@/components/ai-guide/AudienceSuggestionsCard";
import type { TargetAudienceSuggestion, TargetAudienceSuggestionOutput } from "@/lib/ai/guide/types";

interface UseTargetAudienceGuideInput {
  name: string;
  category: string;
  currentAudience: string;
  onApply: (audience: string) => void;
}

export function useTargetAudienceGuide({
  name,
  category,
  currentAudience,
  onApply
}: UseTargetAudienceGuideInput) {
  const requested = useRef(false);
  const latestRequestId = useRef(0);
  const rerollKey = useRef(0);
  const [status, setStatus] = useState<AudienceAssistStatus>("idle");
  const [suggestions, setSuggestions] = useState<TargetAudienceSuggestion[]>([]);
  const [selectedAudience, setSelectedAudience] = useState("");
  const [previousAudience, setPreviousAudience] = useState("");
  const [error, setError] = useState("");
  const [model, setModel] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    async ({ force = false, audienceOverride }: { force?: boolean; audienceOverride?: string } = {}) => {
      if (requested.current && !force) return;
      const requestId = latestRequestId.current + 1;
      latestRequestId.current = requestId;
      requested.current = true;
      setStatus("loading");
      setError("");
      setSelectedAudience("");

      try {
        const response = await fetch("/api/ai-guide/target-audience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName: name,
            category,
            currentAudience: audienceOverride ?? currentAudience,
            rerollKey: rerollKey.current
          })
        });

        if (!response.ok) throw new Error("Audience suggestions are unavailable right now.");

        const output = (await response.json()) as TargetAudienceSuggestionOutput;
        if (requestId !== latestRequestId.current) return;
        setSuggestions(output.suggestions);
        setModel(output.model);
        setStatus(output.suggestions.length ? "ready" : "error");
        if (!output.suggestions.length) setError("Audience suggestions are unavailable right now.");
      } catch (requestError) {
        if (requestId !== latestRequestId.current) return;
        setStatus("error");
        setError(requestError instanceof Error ? requestError.message : "Audience suggestions are unavailable right now.");
      }
    },
    [category, currentAudience, name]
  );

  const requestSuggestions = useCallback(() => {
    void fetchSuggestions();
  }, [fetchSuggestions]);

  const rerollSuggestions = useCallback(() => {
    rerollKey.current += 1;
    void fetchSuggestions({ force: true });
  }, [fetchSuggestions]);

  const selectSuggestion = useCallback(
    (suggestion: TargetAudienceSuggestion) => {
      setPreviousAudience(currentAudience);
      onApply(suggestion.audience);
      setSelectedAudience(suggestion.audience);
      setStatus("applied");
    },
    [currentAudience, onApply]
  );

  const undoSuggestion = useCallback(() => {
    onApply(previousAudience);
    setSelectedAudience("");
    setStatus(suggestions.length ? "ready" : "idle");
  }, [onApply, previousAudience, suggestions.length]);

  const reroll = useCallback(
    () => {
      rerollSuggestions();
    },
    [rerollSuggestions]
  );

  const assist = useMemo<AudienceAssistViewModel>(
    () => ({
      status,
      suggestions,
      selectedAudience,
      error,
      model,
      onSelect: selectSuggestion,
      onReroll: reroll,
      onUndo: undoSuggestion
    }),
    [error, model, reroll, selectedAudience, selectSuggestion, status, suggestions, undoSuggestion]
  );

  return { assist, requestSuggestions };
}
