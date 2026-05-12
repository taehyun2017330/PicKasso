import { ImageIcon, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function SidebarActions({
  galleryOpen,
  wizardOpen,
  onCreateBrand,
  onOpenGallery
}: {
  galleryOpen: boolean;
  wizardOpen: boolean;
  onCreateBrand: () => void;
  onOpenGallery: () => void;
}) {
  return (
    <div className="mb-5 grid gap-2 max-[860px]:grid-cols-1">
      <button
        type="button"
        onClick={onCreateBrand}
        className="inline-flex h-9 items-center justify-start gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-[#202020] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition hover:bg-[#fafafa] max-[860px]:justify-center max-[860px]:px-2"
        aria-pressed={wizardOpen}
      >
        <Plus size={15} />
        <span className="max-[860px]:hidden">Create new brand</span>
      </button>
      <button
        type="button"
        onClick={onOpenGallery}
        className={cn(
          "inline-flex h-8 items-center justify-start gap-2 rounded-lg px-1 text-sm font-medium transition max-[860px]:justify-center max-[860px]:px-2",
          galleryOpen ? "bg-[#dfdfdc] text-[#1f1f1d]" : "text-[#4b4b47] hover:bg-[#e5e5e2]"
        )}
        aria-pressed={galleryOpen}
      >
        <ImageIcon size={15} />
        <span className="max-[860px]:hidden">Gallery</span>
      </button>
    </div>
  );
}
