"use client";

import { AssistantGuide } from "@/components/AssistantGuide";
import { BrandReadyPanel } from "@/components/brand-wizard/BrandReadyPanel";
import type { Brand, ExplorationThread, TraceNode } from "@/lib/types";

interface BrandHomeProps {
  brand: Brand;
  threads: ExplorationThread[];
  nodes: Record<string, TraceNode>;
  onStart: (brandId: string) => void;
  onSelectThread: (threadId: string) => void;
}

export function BrandHome({
  brand,
  threads,
  nodes,
  onStart,
  onSelectThread
}: BrandHomeProps) {
  return (
    <div className="absolute inset-0 grid grid-cols-[minmax(0,1fr)_312px] bg-white max-[1080px]:grid-cols-1">
      <div className="grid min-h-full place-items-center px-6 py-8">
        <BrandReadyPanel
          brand={brand}
          threads={threads}
          nodes={nodes}
          onStart={onStart}
          onSelectThread={onSelectThread}
        />
      </div>
      <AssistantGuide kind="brandReady" />
    </div>
  );
}
