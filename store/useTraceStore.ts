"use client";

import { create } from "zustand";

import { createBrandThreadActions } from "@/store/actions/brandThreadActions";
import { createJobToastActions } from "@/store/actions/jobToastActions";
import { createNodeLifecycleActions } from "@/store/actions/nodeLifecycleActions";
import { createSelectionFeedbackActions } from "@/store/actions/selectionFeedbackActions";
import { initialTraceData } from "@/store/traceStore.initial";
import type { TraceStore } from "@/store/traceStore.types";

export const useTraceStore = create<TraceStore>()((set, get) => ({
  ...initialTraceData,
  ...createBrandThreadActions(set, get),
  ...createNodeLifecycleActions(set),
  ...createSelectionFeedbackActions(set, get),
  ...createJobToastActions(set)
}));
