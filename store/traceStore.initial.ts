import type { TraceStoreData } from "@/store/traceStore.types";

export const initialTraceData: TraceStoreData = {
  brands: [],
  threads: [],
  nodes: {},
  activeThreadId: null,
  selectedVariantIds: [],
  jobs: {},
  toasts: []
};
