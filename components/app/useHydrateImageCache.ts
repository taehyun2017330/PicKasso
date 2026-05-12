"use client";

import { useEffect, useRef } from "react";

import { loadCachedImageSources } from "@/lib/imageCache";
import type { TraceNode } from "@/lib/types";

export function useHydrateImageCache(
  nodes: Record<string, TraceNode>,
  hydrateVariantSources: (sources: Record<string, string>) => void
) {
  const pendingIds = useRef(new Set<string>());

  useEffect(() => {
    const missingIds = Object.values(nodes)
      .flatMap((node) => node.variants)
      .filter((variant) => variant.status === "done" && !variant.src && !pendingIds.current.has(variant.id))
      .map((variant) => variant.id);

    if (!missingIds.length) return;

    for (const variantId of missingIds) {
      pendingIds.current.add(variantId);
    }

    let cancelled = false;

    loadCachedImageSources(missingIds)
      .then((sources) => {
        if (!cancelled && Object.keys(sources).length) hydrateVariantSources(sources);
      })
      .finally(() => {
        for (const variantId of missingIds) {
          pendingIds.current.delete(variantId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrateVariantSources, nodes]);
}
