"use client";

import { Plus, X } from "lucide-react";

import type { Brand } from "@/lib/types";

interface BrandPickerProps {
  brands: Brand[];
  onPick: (brandId: string) => void;
  onCreateBrand: () => void;
  onClose: () => void;
}

export function BrandPicker({ brands, onPick, onCreateBrand, onClose }: BrandPickerProps) {
  return (
    <div className="absolute left-1/2 top-1/2 z-40 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[#d9d9d9] bg-[#ffffff] p-2 shadow-trace">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div>
          <p className="text-sm font-semibold">New exploration</p>
          <p className="mt-0.5 text-xs text-[#737373]">Place it under a brand folder.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          aria-label="Close"
          className="rounded-md p-1.5 text-[#606060] hover:bg-[#f3f3f3]"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-2 space-y-1">
        {!brands.length ? (
          <button
            type="button"
            onClick={onCreateBrand}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-[#f5f5f5]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md border border-[#d6d6d6] bg-white">
              <Plus size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Create Brand</p>
              <p className="truncate text-xs text-[#737373]">Start with a lightweight root profile</p>
            </div>
          </button>
        ) : null}

        {brands.map((brand) => (
          <button
            type="button"
            key={brand.id}
            onClick={() => onPick(brand.id)}
            className="block w-full rounded-md px-3 py-2 text-left transition hover:bg-[#f5f5f5]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{brand.name}</p>
              <p className="truncate text-xs text-[#737373]">{brand.category} · {brand.targetAudience}</p>
            </div>
          </button>
        ))}

      </div>
    </div>
  );
}
