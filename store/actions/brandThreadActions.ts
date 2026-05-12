import type { Brand, ExplorationThread, TraceNode } from "@/lib/types";
import { createId, findVariantWithNode, makeMonogram, nowIso } from "@/lib/utils";
import {
  buildThreadTitle,
  getChildren,
  newRootNode,
  nodeTitleForMode
} from "@/store/traceStore.helpers";
import type { TraceGet, TraceSet, TraceStore } from "@/store/traceStore.types";

type BrandThreadActions = Pick<TraceStore, "createBrand" | "startThread" | "createChildNode" | "setActiveThread">;

export function createBrandThreadActions(set: TraceSet, get: TraceGet): BrandThreadActions {
  return {
    createBrand: (input) => {
      const brand: Brand = {
        ...input,
        id: createId("brand"),
        monogram: makeMonogram(input.name),
        createdAt: nowIso()
      };

      set((state) => ({ brands: [brand, ...state.brands] }));
      get().addToast(`${brand.name} added`);
      return brand;
    },

    startThread: (brandId, userPrompt = "") => {
      const brand = get().brands.find((item) => item.id === brandId);
      if (!brand) {
        get().addToast("Create or choose a brand first");
        return null;
      }

      const threadId = createId("thread");
      const root = newRootNode(threadId, brand);
      const at = nowIso();
      const firstNodeId = createId("node");
      const thread: ExplorationThread = {
        id: threadId,
        title: buildThreadTitle(brand, userPrompt),
        brandId: brand.id,
        rootNodeId: root.id,
        createdAt: at,
        updatedAt: at
      };
      const firstNode: TraceNode = {
        id: firstNodeId,
        threadId,
        title: "First Directions",
        parentNodeIds: [root.id],
        parentVariantIds: [],
        depth: 1,
        lane: 0,
        outputCount: 9,
        mode: "wide",
        status: "queued",
        userPrompt,
        plannerSummary: "",
        generatedPrompts: [],
        variants: [],
        createdAt: at,
        updatedAt: at,
        attempt: 0
      };

      set((state) => ({
        threads: [...state.threads, thread],
        nodes: {
          ...state.nodes,
          [root.id]: root,
          [firstNode.id]: firstNode
        },
        activeThreadId: threadId
      }));

      return { threadId, nodeId: firstNode.id };
    },

    createChildNode: ({ threadId, parentNodeIds, parentVariantIds, mode, userPrompt = "", outputCount = 9 }) => {
      const state = get();
      const parents = parentNodeIds.map((id) => state.nodes[id]).filter(Boolean);
      const primaryParent = parents[0];
      const firstSelected = parentVariantIds[0] ? findVariantWithNode(state.nodes, parentVariantIds[0])?.variant : null;
      const depth = parents.length ? Math.max(...parents.map((node) => node.depth)) + 1 : 1;
      const lane =
        mode === "converge" && parents.length
          ? parents.reduce((total, node) => total + node.lane, 0) / parents.length
          : primaryParent
            ? primaryParent.lane + Math.max(0, getChildren(state.nodes, primaryParent.id, threadId).length - 1) * 0.78
            : 0;
      const at = nowIso();
      const nodeId = createId("node");
      const node: TraceNode = {
        id: nodeId,
        threadId,
        title: nodeTitleForMode(mode, firstSelected),
        parentNodeIds,
        parentVariantIds,
        depth,
        lane,
        outputCount,
        mode,
        status: "queued",
        userPrompt,
        plannerSummary: "",
        generatedPrompts: [],
        variants: [],
        createdAt: at,
        updatedAt: at,
        attempt: 0
      };

      set((current) => ({
        nodes: { ...current.nodes, [node.id]: node },
        threads: current.threads.map((thread) =>
          thread.id === threadId ? { ...thread, updatedAt: at, title: thread.title } : thread
        ),
        activeThreadId: threadId
      }));

      return node;
    },

    setActiveThread: (threadId) => set({ activeThreadId: threadId })
  };
}
