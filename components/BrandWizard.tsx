"use client";

import { ArrowRight, Check, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { AssistantGuide } from "@/components/AssistantGuide";
import { customBakeryBrand } from "@/lib/customBakeryFixture";
import type { Brand, BrandInput } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BrandReadyPanel } from "@/components/brand-wizard/BrandReadyPanel";
import { categoryHints, defaultBrandGoal } from "@/components/brand-wizard/options";
import { useTargetAudienceGuide } from "@/components/brand-wizard/useTargetAudienceGuide";
import { TextButton } from "@/components/ui";

interface BrandWizardProps {
  initialSimulatedBakery?: boolean;
  onCreate: (input: BrandInput) => Brand;
  onClose: () => void;
  onStart: (brandId: string) => void;
}

export function BrandWizard({
  initialSimulatedBakery = false,
  onCreate,
  onClose,
  onStart
}: BrandWizardProps) {
  const [name, setName] = useState(initialSimulatedBakery ? customBakeryBrand.name : "");
  const [category, setCategory] = useState(initialSimulatedBakery ? customBakeryBrand.category : "");
  const [targetAudience, setTargetAudience] = useState(
    initialSimulatedBakery ? customBakeryBrand.targetAudience : ""
  );
  const [createdBrand, setCreatedBrand] = useState<Brand | null>(null);

  useEffect(() => {
    if (!initialSimulatedBakery) return;
    setName(customBakeryBrand.name);
    setCategory(customBakeryBrand.category);
    setTargetAudience(customBakeryBrand.targetAudience);
  }, [initialSimulatedBakery]);

  const canSubmit = name.trim() && category.trim() && targetAudience.trim();
  const guideDraft = { name, category, targetAudience };
  const applyTargetAudience = useCallback((audience: string) => {
    setTargetAudience(audience);
  }, []);
  const targetAudienceGuide = useTargetAudienceGuide({
    name,
    category,
    currentAudience: targetAudience,
    onApply: applyTargetAudience
  });

  function applyCustomBakeryPreset() {
    setName(customBakeryBrand.name);
    setCategory(customBakeryBrand.category);
    setTargetAudience(customBakeryBrand.targetAudience);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    const brand = onCreate({
      name: name.trim(),
      category: category.trim(),
      goal: defaultBrandGoal,
      targetAudience: targetAudience.trim(),
      toneChips: [],
      avoidNotes: ""
    });
    setCreatedBrand(brand);
  }

  if (createdBrand) {
    return (
      <BrandWizardFrame guide={<AssistantGuide kind="brandReady" />}>
        <BrandReadyPanel brand={createdBrand} onClose={onClose} onStart={onStart} />
      </BrandWizardFrame>
    );
  }

  return (
    <BrandWizardFrame
      guide={<AssistantGuide kind="brand" brandDraft={guideDraft} audienceAssist={targetAudienceGuide.assist} />}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[760px] rounded-lg border border-[#d9d9d9] bg-[#ffffff] p-5 shadow-trace"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold">Create Brand</h2>
            <p className="mt-0.5 text-sm text-[#6b6b6b]">A light root profile for visual tracing.</p>
            <button
              type="button"
              onClick={applyCustomBakeryPreset}
              className="mt-3 inline-flex h-8 items-center rounded-md border border-[#d9d9d9] px-2.5 text-xs font-semibold text-[#3e3e3a] transition hover:bg-[#f6f6f3]"
            >
              Use simulated bakery
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#616161] hover:bg-[#f3f3f3]"
            title="Close"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#575757]">Brand name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Luna Bakery"
              className="h-10 w-full rounded-md border border-[#d9d9d9] bg-white px-3 text-sm outline-none transition focus:border-[#9a9a9a]"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#575757]">Category</span>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              list="brand-category-options"
              placeholder="Pick or type a category"
              className="h-10 w-full rounded-md border border-[#d9d9d9] bg-white px-3 text-sm outline-none transition focus:border-[#9a9a9a]"
            />
            <datalist id="brand-category-options">
              {categoryHints.map((hint) => (
                <option key={hint} value={hint} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {categoryHints.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => setCategory(hint)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition",
                category === hint
                  ? "border-[#c7c7c7] bg-[#ececec] text-[#333333]"
                  : "border-[#e0e0e0] bg-white text-[#626262] hover:bg-[#f5f5f5]"
              )}
            >
              {category === hint ? <Check size={13} /> : null}
              {hint}
            </button>
          ))}
        </div>

        <label className="mt-5 block space-y-1.5">
          <span className="text-xs font-medium text-[#575757]">Target audience</span>
          <input
            value={targetAudience}
            onPointerDown={() => targetAudienceGuide.requestSuggestions()}
            onFocus={() => targetAudienceGuide.requestSuggestions()}
            onChange={(event) => setTargetAudience(event.target.value)}
            placeholder="Start typing or use AI Guide"
            className="h-10 w-full rounded-md border border-[#d9d9d9] bg-white px-3 text-sm outline-none transition focus:border-[#9a9a9a]"
          />
        </label>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#e5e5e5] pt-4">
          <TextButton type="submit" disabled={!canSubmit} className="bg-[#191919] text-white hover:bg-[#2b2b2b]">
            Create Brand
            <ArrowRight size={15} />
          </TextButton>
        </div>
      </form>
    </BrandWizardFrame>
  );
}

function BrandWizardFrame({
  children,
  guide
}: {
  children: ReactNode;
  guide: ReactNode;
}) {
  return (
    <div className="absolute inset-0 grid grid-cols-[minmax(0,1fr)_312px] overflow-y-auto bg-white max-[1080px]:grid-cols-1">
      <div className="grid min-h-full place-items-center px-6 py-8">
        {children}
      </div>
      {guide}
    </div>
  );
}
