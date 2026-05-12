import { createId, nowIso } from "@/lib/utils";
import { initialTraceData } from "@/store/traceStore.initial";
import type { TraceSet, TraceStore } from "@/store/traceStore.types";
import { clearImageCache } from "@/lib/imageCache";

type JobToastActions = Pick<
  TraceStore,
  "upsertJob" | "updateJob" | "clearFinishedJobs" | "clearDemo" | "addToast" | "removeToast"
>;

export function createJobToastActions(set: TraceSet): JobToastActions {
  return {
    upsertJob: (job) => {
      set((state) => ({
        jobs: {
          ...state.jobs,
          [job.id]: job
        }
      }));
    },

    updateJob: (jobId, patch) => {
      set((state) => {
        const job = state.jobs[jobId];
        if (!job) return state;

        return {
          jobs: {
            ...state.jobs,
            [jobId]: {
              ...job,
              ...patch,
              updatedAt: nowIso()
            }
          }
        };
      });
    },

    clearFinishedJobs: () => {
      set((state) => ({
        jobs: Object.fromEntries(
          Object.entries(state.jobs).filter(([, job]) => job.status === "queued" || job.status === "running")
        )
      }));
    },

    clearDemo: () => {
      void clearImageCache().catch(() => undefined);
      set(initialTraceData);
    },

    addToast: (message) => {
      const toast = { id: createId("toast"), message };
      set((state) => ({ toasts: [...state.toasts, toast].slice(-4) }));
    },

    removeToast: (toastId) => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== toastId) }));
    }
  };
}
