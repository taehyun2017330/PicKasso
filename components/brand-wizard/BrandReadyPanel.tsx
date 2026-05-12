import { ArrowRight, Image as ImageIcon, Plus, X } from "lucide-react";

import { explorationStatus, timeAgo } from "@/components/sidebar/sidebarHelpers";
import type { Brand, ExplorationThread, TraceNode } from "@/lib/types";
import { TextButton } from "@/components/ui";
import { cn } from "@/lib/utils";

interface BrandReadyPanelProps {
  brand: Brand;
  threads?: ExplorationThread[];
  nodes?: Record<string, TraceNode>;
  onClose?: () => void;
  onStart: (brandId: string) => void;
  onSelectThread?: (threadId: string) => void;
}

export function BrandReadyPanel({
  brand,
  threads = [],
  nodes = {},
  onClose,
  onStart,
  onSelectThread
}: BrandReadyPanelProps) {
  const hasThreads = threads.length > 0;

  return (
    <div className="w-full max-w-[780px] rounded-lg border border-[#d9d9d9] bg-[#ffffff] p-5 shadow-trace">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#252522]">{brand.name}</p>
          <p className="mt-1 text-xs text-[#777770]">Ready for image exploration.</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#616161] hover:bg-[#f3f3f3]"
            title="Close"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="mt-7">
        <h2 className="text-[22px] font-semibold">Brand ready.</h2>
      </div>

      <div className="mt-7 border-t border-[#e8e8e5] pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#22221f]">Exploration threads</p>
            <p className="mt-0.5 text-xs text-[#777770]">
              {hasThreads ? "Open an existing thread or start a new direction." : "No explorations yet."}
            </p>
          </div>
          <TextButton onClick={() => onStart(brand.id)} className="bg-[#191919] text-white hover:bg-[#2b2b2b]">
            {hasThreads ? "New exploration" : "Start first exploration"}
            {hasThreads ? <Plus size={15} /> : <ArrowRight size={15} />}
          </TextButton>
        </div>

        <div className="mt-4 space-y-1">
          {hasThreads ? (
            threads.map((thread) => (
              <ThreadButton
                key={thread.id}
                thread={thread}
                nodes={nodes}
                onSelect={onSelectThread}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[#d8d8d4] bg-[#fbfbfa] px-4 py-4 text-sm text-[#666660]">
              Start with a broad image board, then branch from the images that show promise.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadButton({
  thread,
  nodes,
  onSelect
}: {
  thread: ExplorationThread;
  nodes: Record<string, TraceNode>;
  onSelect?: (threadId: string) => void;
}) {
  const threadNodes = Object.values(nodes).filter((node) => node.threadId === thread.id && node.mode !== "root");
  const status = explorationStatus(thread, nodes);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(thread.id)}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-[#f4f4f1]"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#deded9] bg-white text-[#3a3a36]">
        <ImageIcon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[#272724]">{thread.title}</span>
        <span className="mt-0.5 block text-xs text-[#777770]">
          {threadNodes.length} layer{threadNodes.length === 1 ? "" : "s"} · updated {timeAgo(thread.updatedAt)}
        </span>
      </span>
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          status === "done" && "bg-[#6f8f76]",
          status === "running" && "bg-[#a8a8a0]",
          status === "error" && "bg-[#9c9c95]"
        )}
      />
    </button>
  );
}
