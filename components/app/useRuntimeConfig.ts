"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { RuntimeConfig } from "@/lib/types";

const fallbackConfig: RuntimeConfig = {
  realMode: false,
  mockLatencyMs: 3000
};

const overrideKey = "brand-image-trace-runtime-config";

type RuntimeConfigPatch = Partial<
  Pick<RuntimeConfig, "realMode">
>;

function readOverride(): RuntimeConfigPatch {
  try {
    const stored = localStorage.getItem(overrideKey);
    const parsed = stored ? (JSON.parse(stored) as Partial<RuntimeConfig>) : {};
    return {
      ...(typeof parsed.realMode === "boolean" ? { realMode: parsed.realMode } : {})
    };
  } catch {
    return {};
  }
}

function writeOverride(patch: RuntimeConfigPatch) {
  localStorage.setItem(overrideKey, JSON.stringify(patch));
}

export function useRuntimeConfig() {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const baseConfig = useRef<RuntimeConfig | null>(null);
  const overrideConfig = useRef<RuntimeConfigPatch>({});

  useEffect(() => {
    let alive = true;
    fetch("/api/trace/config")
      .then((response) => response.json())
      .then((payload: RuntimeConfig) => {
        if (!alive) return;
        baseConfig.current = payload;
        overrideConfig.current = readOverride();
        setConfig({ ...payload, ...overrideConfig.current });
      })
      .catch(() => {
        if (!alive) return;
        baseConfig.current = fallbackConfig;
        overrideConfig.current = readOverride();
        setConfig({ ...fallbackConfig, ...overrideConfig.current });
      });

    return () => {
      alive = false;
    };
  }, []);

  const updateConfig = useCallback((patch: RuntimeConfigPatch) => {
    overrideConfig.current = { ...overrideConfig.current, ...patch };
    writeOverride(overrideConfig.current);
    setConfig((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const resetConfig = useCallback(() => {
    overrideConfig.current = {};
    localStorage.removeItem(overrideKey);
    setConfig(baseConfig.current ?? fallbackConfig);
  }, []);

  return { config, updateConfig, resetConfig };
}
