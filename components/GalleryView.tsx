"use client";

import { Maximize2, Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ImagePlaceholder } from "@/components/trace/ImagePlaceholder";
import type { Brand, ExplorationThread, ImageVariant, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GalleryViewProps {
  brands: Brand[];
  threads: ExplorationThread[];
  nodes: Record<string, TraceNode>;
}

interface GalleryImage {
  brandName: string;
  threadTitle: string;
  variant: ImageVariant;
  createdAt: string;
}

const tileSizes = [140, 180, 240, 320, 420];

export function GalleryView({
  brands,
  threads,
  nodes
}: GalleryViewProps) {
  const [sizeIndex, setSizeIndex] = useState(3);
  const images = useMemo(() => collectGalleryImages({ brands, threads, nodes }), [brands, threads, nodes]);
  const tileSize = tileSizes[sizeIndex];

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <main className="h-full overflow-y-auto soft-scrollbar">
        <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-[#eeeeeb] bg-white px-8">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-[#1f1f1f]">Gallery</p>
            <span className="rounded-full bg-[#f2f2ef] px-2.5 py-1 text-xs font-medium text-[#666660]">
              {images.length} images
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-[#dfdfdc] bg-white p-1">
            <button
              type="button"
              onClick={() => setSizeIndex((current) => Math.max(0, current - 1))}
              disabled={sizeIndex === 0}
              className="grid h-7 w-7 place-items-center rounded-md text-[#333333] transition hover:bg-[#f3f3f0] disabled:cursor-not-allowed disabled:opacity-35"
              title="Show more per row"
              aria-label="Show more per row"
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              onClick={() => setSizeIndex((current) => Math.min(tileSizes.length - 1, current + 1))}
              disabled={sizeIndex === tileSizes.length - 1}
              className="grid h-7 w-7 place-items-center rounded-md text-[#333333] transition hover:bg-[#f3f3f0] disabled:cursor-not-allowed disabled:opacity-35"
              title="Show fewer per row"
              aria-label="Show fewer per row"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {images.length ? (
          <div
            className="grid gap-[2px] bg-white p-[2px]"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${tileSize}px, 1fr))` }}
          >
            {images.map((image) => (
              <GalleryTile key={image.variant.id} image={image} />
            ))}
          </div>
        ) : (
          <GalleryEmpty />
        )}
      </main>
    </div>
  );
}

function GalleryTile({ image }: { image: GalleryImage }) {
  const [open, setOpen] = useState(false);
  const label = `${image.brandName} / ${image.threadTitle}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group/gallery relative aspect-square overflow-hidden bg-[#e9e9e7] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#111111]"
        title={label}
        aria-label={`Open ${label}`}
      >
        {image.variant.src ? (
          <img src={image.variant.src} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-150 group-hover/gallery:opacity-100">
          <div className="absolute inset-0 bg-black/[0.08]" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/25" />
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between text-white drop-shadow-[0_3px_9px_rgba(0,0,0,0.85)]">
            <span className="min-w-0 truncate text-[11px] font-semibold">{label}</span>
            <Maximize2 size={14} className="shrink-0" />
          </div>
        </div>
      </button>
      {open ? <GalleryPreview image={image} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function GalleryPreview({
  image,
  onClose
}: {
  image: GalleryImage;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-white p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-5 grid h-9 w-9 place-items-center rounded-full text-[#555555] transition hover:bg-[#efefec] hover:text-[#111111]"
        aria-label="Close gallery image"
      >
        <X size={20} />
      </button>
      <div
        className="grid max-w-[1180px] grid-cols-[minmax(360px,760px)_260px] items-center gap-10 max-[900px]:grid-cols-1"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid place-items-center">
          {image.variant.src ? (
            <img
              src={image.variant.src}
              alt=""
              className="aspect-square max-h-[78vh] max-w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="aspect-square max-h-[78vh] w-[min(78vh,720px)] max-w-full">
              <ImagePlaceholder />
            </div>
          )}
        </div>
        <aside className="text-sm leading-6 text-[#4f4f4a]">
          <p className="font-semibold text-[#171717]">{image.brandName}</p>
          <p>{image.threadTitle}</p>
          <p className={cn("mt-3", image.variant.status === "error" && "text-[#b44a3d]")}>
            {image.variant.status ?? "ready"}
          </p>
        </aside>
      </div>
    </div>
  );
}

function GalleryEmpty() {
  return (
    <div className="grid h-[calc(100vh-122px)] place-items-center">
      <div className="w-[280px] text-center">
        <div className="mx-auto grid h-14 w-14 grid-cols-2 gap-[2px]">
          <span className="bg-[#e9e9e7]" />
          <span className="bg-[#f0f0ed]" />
          <span className="bg-[#f0f0ed]" />
          <span className="bg-[#e9e9e7]" />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#242424]">No images yet.</p>
        <p className="mt-1 text-sm leading-6 text-[#6f6f69]">Generated placeholders and finished images will collect here.</p>
      </div>
    </div>
  );
}

function collectGalleryImages({
  brands,
  threads,
  nodes
}: {
  brands: Brand[];
  threads: ExplorationThread[];
  nodes: Record<string, TraceNode>;
}) {
  const brandById = new Map(brands.map((brand) => [brand.id, brand]));
  const threadById = new Map(threads.map((thread) => [thread.id, thread]));

  return Object.values(nodes)
    .flatMap((node) => {
      const thread = threadById.get(node.threadId);
      const brand = thread ? brandById.get(thread.brandId) : null;

      return node.variants.map((variant) => ({
        brandName: brand?.name ?? "Unassigned brand",
        threadTitle: thread?.title ?? "Untitled exploration",
        variant,
        createdAt: node.createdAt
      }));
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
