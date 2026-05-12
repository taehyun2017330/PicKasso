"use client";

import type { ReactNode } from "react";

import { SidebarActions } from "@/components/sidebar/SidebarActions";
import { brandFolders, SidebarFolder } from "@/components/sidebar/SidebarFolder";
import type { Brand, ExplorationThread, TraceNode } from "@/lib/types";

interface SidebarProps {
  brands: Brand[];
  threads: ExplorationThread[];
  nodes: Record<string, TraceNode>;
  activeThreadId: string | null;
  activeBrandId: string | null;
  galleryOpen: boolean;
  wizardOpen: boolean;
  onCreateBrand: () => void;
  onOpenGallery: () => void;
  onSelectBrand: (brandId: string) => void;
  onSelectThread: (threadId: string) => void;
  footer?: ReactNode;
}

export function Sidebar({
  brands,
  threads,
  nodes,
  activeThreadId,
  activeBrandId,
  galleryOpen,
  wizardOpen,
  onCreateBrand,
  onOpenGallery,
  onSelectBrand,
  onSelectThread,
  footer
}: SidebarProps) {
  const folders = brandFolders(brands, threads);

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-[#ddddda] bg-[#efefed] px-3 py-3 text-[#2c2c2a] max-[860px]:w-[76px] max-[860px]:px-2">
      <SidebarLogo />
      <SidebarActions
        galleryOpen={galleryOpen}
        wizardOpen={wizardOpen}
        onCreateBrand={onCreateBrand}
        onOpenGallery={onOpenGallery}
      />

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 soft-scrollbar">
        <div className="mb-3 px-1 text-[12px] text-[#9f9f99] max-[860px]:hidden">Projects</div>
        <div className="space-y-4">
          {folders.map((folder) => (
            <SidebarFolder
              key={folder.id}
              brandId={folder.brandId}
              label={folder.label}
              threads={folder.threads}
              nodes={nodes}
              activeThreadId={activeThreadId}
              activeBrandId={activeBrandId}
              onSelectBrand={onSelectBrand}
              onSelectThread={onSelectThread}
            />
          ))}

          {!brands.length && !threads.length ? <EmptySidebar /> : null}
        </div>
      </div>
      {footer ? <div className="mt-3 px-1 pb-1">{footer}</div> : null}
    </aside>
  );
}

function SidebarLogo() {
  return (
    <div className="mb-5 flex h-11 items-center gap-2.5 px-1">
      <div className="grid h-10 w-10 place-items-center overflow-hidden">
        <img
          src="/mainlogo.png"
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
      <span className="text-[15px] font-semibold text-[#1f1f1d] max-[860px]:hidden">PicKasso</span>
    </div>
  );
}

function EmptySidebar() {
  return (
    <div className="px-2 py-3 text-xs leading-5 text-[#777773] max-[860px]:hidden">
      Create a brand to start exploring.
    </div>
  );
}
