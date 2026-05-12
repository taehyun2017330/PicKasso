import type { MutableRefObject } from "react";

export type TimerHandle = ReturnType<typeof setTimeout>;
export type IntervalHandle = ReturnType<typeof setInterval>;

export interface NodeTask {
  timers: TimerHandle[];
  intervals: IntervalHandle[];
  controllers: AbortController[];
}

export type NodeTaskMapRef = MutableRefObject<Map<string, NodeTask>>;
