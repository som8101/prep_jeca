"use client";

import { useExamStore } from "./store";

interface AntiCheatOptions {
  enabled: boolean;
  enforceFullscreen?: boolean;
}

export function setupAntiCheatListeners(options: AntiCheatOptions = { enabled: true }) {
  if (typeof window === "undefined" || !options.enabled) {
    return () => {};
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      const state = useExamStore.getState();
      if (state.status === "ACTIVE") {
        state.triggerWarning("Tab switch detected. Leaving the exam tab is prohibited.");
      }
    }
  };

  const handleWindowBlur = () => {
    // Only trigger if document also lost focus or is hidden
    if (document.hidden) {
      const state = useExamStore.getState();
      if (state.status === "ACTIVE") {
        state.triggerWarning("Window lost focus. Please keep the exam window active.");
      }
    }
  };

  const handleFullscreenChange = () => {
    if (options.enforceFullscreen && !document.fullscreenElement) {
      const state = useExamStore.getState();
      if (state.status === "ACTIVE") {
        state.triggerWarning("Exited full screen mode. Please stay in full screen during the exam.");
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);
  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}

export async function requestExamFullscreen(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      return true;
    }
  } catch {
    // User denied or browser restricted
  }
  return false;
}
