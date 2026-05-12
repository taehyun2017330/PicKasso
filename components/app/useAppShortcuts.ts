"use client";

import { useEffect } from "react";

interface AppShortcutInput {
  onNewThread: () => void;
  onCreateBrand: () => void;
  onEscape: () => void;
}

export function useAppShortcuts({ onNewThread, onCreateBrand, onEscape }: AppShortcutInput) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable === true;

      if (event.key === "Escape") {
        onEscape();
        return;
      }

      if (isTyping) return;
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        onNewThread();
      }
      if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        onCreateBrand();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCreateBrand, onEscape, onNewThread]);
}
