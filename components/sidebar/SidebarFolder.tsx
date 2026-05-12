import { Folder, Image as ImageIcon } from "lucide-react";

import { explorationStatus, timeAgo } from "@/components/sidebar/sidebarHelpers";
import type { Brand, ExplorationThread, TraceNode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SidebarFolder({
  brandId,
  label,
  threads,
  nodes,
  activeThreadId,
  activeBrandId,
  onSelectBrand,
  onSelectThread
}: {
  brandId?: string;
  label: string;
  threads: ExplorationThread[];
  nodes: Record<string, TraceNode>;
  activeThreadId: string | null;
  activeBrandId?: string | null;
  onSelectBrand?: (brandId: string) => void;
  onSelectThread: (threadId: string) => void;
}) {
  const active = Boolean(brandId && activeBrandId === brandId);

  return (
    <section>
      <FolderHeader
        label={label}
        active={active}
        onSelect={brandId && onSelectBrand ? () => onSelectBrand(brandId) : undefined}
      />
      <div className="space-y-0.5 max-[860px]:hidden">
        {threads.length ? (
          threads.map((thread) => (
            <ExplorationButton
              key={thread.id}
              thread={thread}
              status={explorationStatus(thread, nodes)}
              active={thread.id === activeThreadId}
              onSelect={onSelectThread}
            />
          ))
        ) : (
          <div className="px-8 py-1.5 text-xs text-[#7c7c77]">No explorations</div>
        )}
      </div>
    </section>
  );
}

export function brandFolders(brands: Brand[], threads: ExplorationThread[]) {
  return brands.map((brand) => ({
    id: brand.id,
    brandId: brand.id,
    label: brand.name,
    threads: threads.filter((thread) => thread.brandId === brand.id)
  }));
}

function FolderHeader({
  label,
  active,
  onSelect
}: {
  label: string;
  active: boolean;
  onSelect?: () => void;
}) {
  const content = (
    <>
      <Folder size={16} strokeWidth={1.7} />
      <span className="truncate max-[860px]:hidden">{label}</span>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "mb-1 flex h-8 w-full items-center gap-2 rounded-lg px-1 text-left text-sm font-medium transition",
          active ? "bg-[#dfdfdc] text-[#1f1f1d]" : "text-[#4b4b47] hover:bg-[#e5e5e2]"
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "mb-1 flex h-8 items-center gap-2 px-1 text-sm font-medium",
        active ? "text-[#1f1f1d]" : "text-[#4b4b47]"
      )}
    >
      {content}
    </div>
  );
}

function ExplorationButton({
  thread,
  status,
  active,
  onSelect
}: {
  thread: ExplorationThread;
  status: "running" | "error" | "done";
  active: boolean;
  onSelect: (threadId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(thread.id)}
      className={cn(
        "group flex h-9 w-full items-center gap-2 px-8 text-left text-sm transition",
        active ? "rounded-lg bg-[#d9d9d6] text-[#1f1f1d]" : "rounded-lg text-[#30302d] hover:bg-[#e5e5e2]"
      )}
      title={thread.title}
    >
      <ImageIcon size={14} className="shrink-0 text-[#5f5f5a]" />
      <span className="min-w-0 flex-1 truncate">{thread.title}</span>
      <span className="text-xs text-[#777773]">{timeAgo(thread.updatedAt)}</span>
      <StatusDot status={status} />
    </button>
  );
}

function StatusDot({ status }: { status: "running" | "error" | "done" }) {
  return (
    <span
      className={cn(
        "h-1.5 w-1.5 shrink-0 rounded-full",
        status === "running" && "bg-[#9c9c95]",
        status === "done" && "bg-[#6f8f76]",
        status === "error" && "bg-[#9c9c95]"
      )}
    />
  );
}
