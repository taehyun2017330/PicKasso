"use client";

import { Plus } from "lucide-react";

import { AssistantGuide } from "@/components/AssistantGuide";

interface EmptyStateProps {
  hasBrands: boolean;
  onCreateBrand: () => void;
  onStartThread: () => void;
}

export function EmptyState({ hasBrands, onCreateBrand, onStartThread }: EmptyStateProps) {
  const action = hasBrands ? onStartThread : onCreateBrand;

  return (
    <div className="absolute inset-0 grid grid-cols-[minmax(0,1fr)_312px] bg-white max-[1080px]:grid-cols-1">
      <div className="grid min-h-full place-items-center px-6 py-8">
        <div className="text-center">
          <h1 className="text-[25px] font-semibold text-[#1d1c19]">
            {hasBrands ? "Start a new image direction." : "Start with a brand."}
          </h1>
          <p className="mt-2 text-sm text-[#707070]">
            {hasBrands
              ? "Choose where the next generation board should live."
              : "Start by setting a light brand context to explore different image generations."}
          </p>
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={action}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#191919] px-4 text-sm font-semibold text-white transition hover:bg-[#2b2b2b] active:scale-[0.99]"
            >
              <Plus size={16} />
              {hasBrands ? "New exploration" : "Create Brand"}
            </button>
          </div>
        </div>
      </div>
      <AssistantGuide kind="empty" hasBrands={hasBrands} />
    </div>
  );
}
