"use client";

import { useCallback, useState } from "react";

import { AppControls } from "@/components/app/AppHeader";
import { useHydrateImageCache } from "@/components/app/useHydrateImageCache";
import { useAppShortcuts } from "@/components/app/useAppShortcuts";
import { useRuntimeConfig } from "@/components/app/useRuntimeConfig";
import { useTraceCommands } from "@/components/app/useTraceCommands";
import { useTraceStoreSnapshot } from "@/components/app/useTraceStoreSnapshot";
import { BrandPicker } from "@/components/BrandPicker";
import { BrandWizard } from "@/components/BrandWizard";
import { BrandHome } from "@/components/BrandHome";
import { EmptyState } from "@/components/EmptyState";
import { GalleryView } from "@/components/GalleryView";
import { GenerationController } from "@/components/GenerationController";
import { Sidebar } from "@/components/Sidebar";
import { Toasts } from "@/components/Toasts";
import { TraceCanvas } from "@/components/TraceCanvas";
import { isCustomBakeryBrand } from "@/lib/customBakeryFixture";
import type { BrandInput } from "@/lib/types";

export function AppShell() {
  const { config, updateConfig, resetConfig } = useRuntimeConfig();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [simulatedBakeryPreset, setSimulatedBakeryPreset] = useState(false);
  const {
    brands,
    threads,
    nodes,
    activeThreadId,
    selectedVariantIds,
    toasts,
    actions
  } = useTraceStoreSnapshot();

  useHydrateImageCache(nodes, actions.hydrateVariantSources);

  const closeOverlays = useCallback(() => {
    setPickerOpen(false);
    setWizardOpen(false);
    setSimulatedBakeryPreset(false);
  }, []);

  const openThreadPicker = useCallback(() => {
    setGalleryOpen(false);
    setPickerOpen(true);
  }, []);
  const openBrandWizard = useCallback(() => {
    setGalleryOpen(false);
    setPickerOpen(false);
    setSimulatedBakeryPreset(false);
    setWizardOpen(true);
  }, []);
  const openGallery = useCallback(() => {
    setPickerOpen(false);
    setWizardOpen(false);
    setActiveBrandId(null);
    actions.setActiveThread(null);
    setGalleryOpen(true);
  }, [actions]);
  const selectThread = useCallback(
    (threadId: string) => {
      setGalleryOpen(false);
      setActiveBrandId(null);
      actions.setActiveThread(threadId);
    },
    [actions]
  );
  const selectBrand = useCallback((brandId: string) => {
    setGalleryOpen(false);
    setPickerOpen(false);
    setWizardOpen(false);
    setActiveBrandId(brandId);
    actions.setActiveThread(null);
  }, [actions]);
  const commands = useTraceCommands({
    nodes,
    selectedVariantIds,
    actions,
    onCloseOverlays: closeOverlays
  });

  useAppShortcuts({
    onNewThread: openThreadPicker,
    onCreateBrand: openBrandWizard,
    onEscape: closeOverlays
  });

  const activeBrand = activeBrandId ? brands.find((brand) => brand.id === activeBrandId) ?? null : null;
  const activeThread = activeThreadId ? threads.find((thread) => thread.id === activeThreadId) ?? null : null;
  const activeThreadBrand = activeThread ? brands.find((brand) => brand.id === activeThread.brandId) ?? null : null;
  const simulatedBakeryActive = Boolean(activeThreadBrand && isCustomBakeryBrand(activeThreadBrand));
  const activeBrandThreads = activeBrand ? threads.filter((thread) => thread.brandId === activeBrand.id) : [];
  const startThread = useCallback(
    (brandId: string) => {
      commands.startThread(brandId);
      setGalleryOpen(false);
      setActiveBrandId(null);
    },
    [commands]
  );
  const useSimulatedBakeryPreset = useCallback(() => {
    resetConfig();
    setSimulatedBakeryPreset(true);
    setGalleryOpen(false);
    setPickerOpen(false);
    setWizardOpen(true);
    setActiveBrandId(null);
    actions.setActiveThread(null);
    actions.addToast("Bakery demo preset loaded");
  }, [actions, resetConfig]);
  const createBrandFromWizard = useCallback(
    (input: BrandInput) => {
      const brand = commands.createBrand(input);
      setSimulatedBakeryPreset(false);
      return brand;
    },
    [commands]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f5] text-[#171717]">
      <Sidebar
        brands={brands}
        threads={threads}
        nodes={nodes}
        activeThreadId={activeThreadId}
        activeBrandId={activeBrandId}
        galleryOpen={galleryOpen}
        wizardOpen={wizardOpen}
        onCreateBrand={openBrandWizard}
        onOpenGallery={openGallery}
        onSelectBrand={selectBrand}
        onSelectThread={selectThread}
        footer={
          <AppControls
            config={config}
            onConfigChange={updateConfig}
            onConfigReset={resetConfig}
            onUseSimulatedBakeryPreset={useSimulatedBakeryPreset}
            simulatedBakeryActive={simulatedBakeryActive}
          />
        }
      />

      <main className="relative min-w-0 flex-1 overflow-hidden bg-[#ffffff]">
        <GenerationController config={config} />

        {wizardOpen ? (
          <BrandWizard
            initialSimulatedBakery={simulatedBakeryPreset}
            onCreate={createBrandFromWizard}
            onClose={() => {
              setSimulatedBakeryPreset(false);
              setWizardOpen(false);
            }}
            onStart={startThread}
          />
        ) : galleryOpen ? (
          <GalleryView
            brands={brands}
            threads={threads}
            nodes={nodes}
          />
        ) : activeBrand ? (
          <BrandHome
            brand={activeBrand}
            threads={activeBrandThreads}
            nodes={nodes}
            onStart={startThread}
            onSelectThread={selectThread}
          />
        ) : threads.length ? (
          <TraceCanvas
            brands={brands}
            threads={threads}
            nodes={nodes}
            activeThreadId={activeThreadId}
            runtimeConfig={config}
            selectedVariantIds={selectedVariantIds}
            onSelectThread={selectThread}
            onFeedback={actions.addFeedback}
            onToggleReference={actions.toggleReferenceVariant}
            onRegenerateVariant={actions.retryVariant}
            onGenerateNext={commands.handleDecision}
            onCancel={actions.cancelNode}
            onRetry={actions.retryNode}
          />
        ) : (
          <EmptyState
            hasBrands={brands.length > 0}
            onCreateBrand={openBrandWizard}
            onStartThread={openThreadPicker}
          />
        )}

        {pickerOpen ? (
          <BrandPicker
            brands={brands}
            onPick={startThread}
            onCreateBrand={() => {
              setPickerOpen(false);
              setWizardOpen(true);
            }}
            onClose={() => setPickerOpen(false)}
          />
        ) : null}

        <Toasts toasts={toasts} onRemove={actions.removeToast} />
      </main>
    </div>
  );
}
