// store/useViewModeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "list" | "grid" | "report";

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      viewMode: "grid", // 초기값
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: "global-view-mode", // localStorage key
    },
  ),
);
