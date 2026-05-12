"use client";

import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { RuntimeConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

type RuntimeConfigPatch = Partial<
  Pick<RuntimeConfig, "realMode">
>;

const defaultRuntimeConfig: RuntimeConfig = {
  realMode: false,
  mockLatencyMs: 3000
};

interface AppControlsProps {
  config: RuntimeConfig | null;
  onConfigChange: (patch: RuntimeConfigPatch) => void;
  onConfigReset: () => void;
  onUseSimulatedBakeryPreset: () => void;
  simulatedBakeryActive: boolean;
}

export function AppControls({
  config,
  onConfigChange,
  onConfigReset,
  onUseSimulatedBakeryPreset,
  simulatedBakeryActive
}: AppControlsProps) {
  const effectiveConfig = config ?? defaultRuntimeConfig;

  return (
    <div className="flex items-center gap-2">
      <AccountButton />
      <ModelSwitcher
        config={effectiveConfig}
        onChange={onConfigChange}
        onReset={onConfigReset}
        onUseSimulatedBakeryPreset={onUseSimulatedBakeryPreset}
        simulatedBakeryActive={simulatedBakeryActive}
      />
    </div>
  );
}

function AccountButton() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="grid h-8 w-8 place-items-center rounded-full border border-[#d9d9d4] bg-[#171717] text-[11px] font-semibold text-white transition hover:bg-[#2a2a2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
        title="Participant 1"
        aria-label="Participant 1 account"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        P1
      </button>
      {open ? <AccountMenu /> : null}
    </div>
  );
}

function AccountMenu() {
  return (
    <div
      className="fixed bottom-16 left-4 z-50 w-[260px] rounded-lg border border-[#d9d9d9] bg-white p-2 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.14)]"
      role="menu"
    >
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#171717] text-[12px] font-semibold text-white">
          P1
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#20201d]">Participant 1</p>
          <p className="truncate text-xs text-[#74746e]">participant1@example.com</p>
        </div>
      </div>
      <div className="mt-1 border-t border-[#eeeeeb] pt-1">
        <AccountRow label="Account settings" value="Placeholder" />
        <AccountRow label="Plan" value="Prototype" />
        <AccountRow label="Workspace" value="Local demo" />
      </div>
    </div>
  );
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="flex h-9 w-full items-center justify-between rounded-md px-2 text-left transition hover:bg-[#f5f5f2]"
      role="menuitem"
    >
      <span className="text-xs font-medium text-[#333330]">{label}</span>
      <span className="text-xs text-[#7b7b75]">{value}</span>
    </button>
  );
}

interface ModelSwitcherProps {
  config: RuntimeConfig;
  onChange: (patch: RuntimeConfigPatch) => void;
  onReset: () => void;
  onUseSimulatedBakeryPreset: () => void;
  simulatedBakeryActive: boolean;
}

function ModelSwitcher({
  config,
  onChange,
  onReset,
  onUseSimulatedBakeryPreset,
  simulatedBakeryActive
}: ModelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function useSimulatedBakeryPreset() {
    onUseSimulatedBakeryPreset();
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="grid h-8 w-8 place-items-center text-[#333333] transition hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
        title="Settings"
        aria-label="Settings"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Settings size={15} />
      </button>

      {open ? (
        <div
          className="fixed bottom-16 left-4 z-50 w-[330px] rounded-lg border border-[#d9d9d9] bg-white p-2 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.14)]"
          role="menu"
        >
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase text-[#737373]">Runtime</div>
          <div className="grid grid-cols-2 gap-1">
            <ChipOption active={!config.realMode && !simulatedBakeryActive} onClick={() => onChange({ realMode: false })}>
              Mock
            </ChipOption>
            <ChipOption active={config.realMode} onClick={() => onChange({ realMode: true })}>
              Real
            </ChipOption>
          </div>

          <button
            type="button"
            onClick={useSimulatedBakeryPreset}
            className={cn(
              "mt-1 flex h-9 w-full items-center justify-center rounded-md border px-2 text-xs font-semibold transition",
              simulatedBakeryActive
                ? "border-[#191919] bg-[#191919] text-white"
                : "border-[#d9d9d9] bg-white text-[#3f3f3a] hover:bg-[#f5f5f5]"
            )}
          >
            Bakery demo preset
          </button>

          <div className="mt-3 flex items-center justify-between border-t border-[#ececec] px-2 pt-2 text-xs text-[#737373]">
            <span>Applies to new turns.</span>
            <button type="button" onClick={onReset} className="font-medium text-[#242424] hover:underline">
              Reset runtime
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChipOption({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 items-center justify-center rounded-md border px-2 text-xs font-medium transition",
        active ? "border-[#191919] bg-[#191919] text-white" : "border-[#d9d9d9] bg-white text-[#4a4a4a] hover:bg-[#f5f5f5]"
      )}
    >
      {children}
    </button>
  );
}
