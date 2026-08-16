import { create, useStore } from "zustand";
import { temporal } from "zundo";
import { defaultPdfSettings, type CropRect, type ExportStatus, type PdfSettings, type Rotation, type ScreenshotItem } from "@/lib/store/types";
import { nextRotation, revokeItemUrls } from "@/lib/image-processing";
import { DEFAULT_ZOOM } from "@/lib/constants";

interface EditorState {
  screenshots: ScreenshotItem[];
  activeId: string | null;
  settings: PdfSettings;
  zoom: number;
  cropMode: boolean;
  exportStatus: ExportStatus;
  exportProgress: number;
  exportMessage: string;
  exportError: string | null;
  pdfBlob: Blob | null;
  addScreenshots: (items: ScreenshotItem[]) => void;
  removeIds: (ids: string[]) => void;
  duplicateIds: (ids: string[]) => void;
  reorder: (orderedIds: string[]) => void;
  setActiveId: (id: string | null) => void;
  toggleSelected: (id: string, additive?: boolean) => void;
  selectOnly: (id: string) => void;
  selectIds: (ids: string[]) => void;
  clearSelection: () => void;
  rotateIds: (ids: string[], direction: 1 | -1) => void;
  setCrop: (id: string, crop: CropRect | null) => void;
  applyCropToIds: (ids: string[], crop: CropRect) => void;
  resetTransforms: (ids: string[]) => void;
  updateSettings: (patch: Partial<PdfSettings>) => void;
  setZoom: (zoom: number) => void;
  setCropMode: (value: boolean) => void;
  setExportState: (patch: Partial<Pick<EditorState, "exportStatus" | "exportProgress" | "exportMessage" | "exportError" | "pdfBlob">>) => void;
  createAnother: () => void;
  startOver: () => void;
}

function revokeAll(items: ScreenshotItem[]) {
  for (const item of items) revokeItemUrls(item);
}

export const useEditorStore = create<EditorState>()(
  temporal(
    (set, get) => ({
      screenshots: [],
      activeId: null,
      settings: defaultPdfSettings,
      zoom: DEFAULT_ZOOM,
      cropMode: false,
      exportStatus: "idle",
      exportProgress: 0,
      exportMessage: "",
      exportError: null,
      pdfBlob: null,
      addScreenshots: (items) => {
        set((state) => {
          const screenshots = [...state.screenshots, ...items];
          return {
            screenshots,
            activeId: state.activeId ?? items[0]?.id ?? null,
          };
        });
      },
      removeIds: (ids) => {
        const idSet = new Set(ids);
        set((state) => {
          const remaining = state.screenshots.filter((item) => !idSet.has(item.id));
          const activeId = remaining.some((item) => item.id === state.activeId)
            ? state.activeId
            : remaining[0]?.id ?? null;
          return { screenshots: remaining, activeId, cropMode: false };
        });
      },
      duplicateIds: (ids) => {
        const idSet = new Set(ids);
        set((state) => {
          const next: ScreenshotItem[] = [];
          for (const item of state.screenshots) {
            next.push(item);
            if (idSet.has(item.id)) {
              next.push({
                ...item,
                id: crypto.randomUUID(),
                originalUrl: URL.createObjectURL(item.file),
                thumbnailUrl: item.thumbnailUrl,
                selected: false,
              });
            }
          }
          return { screenshots: next };
        });
      },
      reorder: (orderedIds) => {
        set((state) => {
          const map = new Map(state.screenshots.map((item) => [item.id, item]));
          const screenshots = orderedIds
            .map((id) => map.get(id))
            .filter((item): item is ScreenshotItem => Boolean(item));
          return { screenshots };
        });
      },
      setActiveId: (id) => set({ activeId: id, cropMode: false }),
      toggleSelected: (id, additive = false) => {
        set((state) => ({
          screenshots: state.screenshots.map((item) => {
            if (item.id === id) return { ...item, selected: !item.selected };
            if (!additive) return { ...item, selected: false };
            return item;
          }),
          activeId: id,
        }));
      },
      selectOnly: (id) => {
        set((state) => ({
          screenshots: state.screenshots.map((item) => ({
            ...item,
            selected: item.id === id,
          })),
          activeId: id,
          cropMode: false,
        }));
      },
      selectIds: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
          screenshots: state.screenshots.map((item) => ({
            ...item,
            selected: idSet.has(item.id),
          })),
        }));
      },
      clearSelection: () => {
        set((state) => ({
          screenshots: state.screenshots.map((item) => ({ ...item, selected: false })),
        }));
      },
      rotateIds: (ids, direction) => {
        const idSet = new Set(ids);
        set((state) => ({
          screenshots: state.screenshots.map((item) =>
            idSet.has(item.id)
              ? { ...item, rotation: nextRotation(item.rotation, direction) }
              : item
          ),
        }));
      },
      setCrop: (id, crop) => {
        set((state) => ({
          screenshots: state.screenshots.map((item) =>
            item.id === id ? { ...item, crop } : item
          ),
        }));
      },
      applyCropToIds: (ids, crop) => {
        const idSet = new Set(ids);
        set((state) => ({
          screenshots: state.screenshots.map((item) =>
            idSet.has(item.id) ? { ...item, crop } : item
          ),
        }));
      },
      resetTransforms: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
          screenshots: state.screenshots.map((item) =>
            idSet.has(item.id) ? { ...item, crop: null, rotation: 0 as Rotation } : item
          ),
        }));
      },
      updateSettings: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }));
      },
      setZoom: (zoom) => set({ zoom }),
      setCropMode: (value) => set({ cropMode: value }),
      setExportState: (patch) => set(patch),
      createAnother: () => {
        set({
          exportStatus: "idle",
          exportProgress: 0,
          exportMessage: "",
          exportError: null,
          pdfBlob: null,
        });
      },
      startOver: () => {
        revokeAll(get().screenshots);
        set({
          screenshots: [],
          activeId: null,
          settings: defaultPdfSettings,
          zoom: DEFAULT_ZOOM,
          cropMode: false,
          exportStatus: "idle",
          exportProgress: 0,
          exportMessage: "",
          exportError: null,
          pdfBlob: null,
        });
      },
    }),
    {
      limit: 40,
      partialize: (state) => ({ screenshots: state.screenshots, activeId: state.activeId }),
    }
  )
);

type TemporalState = {
  undo: () => void;
  redo: () => void;
  pastStates: unknown[];
  futureStates: unknown[];
};

export function useTemporalStore<T>(selector: (state: TemporalState) => T) {
  return useStore(useEditorStore.temporal, selector);
}
