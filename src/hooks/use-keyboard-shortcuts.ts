"use client";

import { useEffect } from "react";
import { isTypingTarget } from "@/lib/utils";
import { useEditorStore, useTemporalStore } from "@/lib/store/editor-store";

export function useKeyboardShortcuts(enabled: boolean) {
  const screenshots = useEditorStore((state) => state.screenshots);
  const activeId = useEditorStore((state) => state.activeId);
  const removeIds = useEditorStore((state) => state.removeIds);
  const setActiveId = useEditorStore((state) => state.setActiveId);
  const selectOnly = useEditorStore((state) => state.selectOnly);
  const undo = useTemporalStore((state) => state.undo);
  const redo = useTemporalStore((state) => state.redo);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && activeId) {
        event.preventDefault();
        const selected = screenshots.filter((item) => item.selected).map((item) => item.id);
        removeIds(selected.length ? selected : [activeId]);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (!screenshots.length) return;
        event.preventDefault();
        const index = screenshots.findIndex((item) => item.id === activeId);
        const nextIndex =
          event.key === "ArrowRight"
            ? Math.min(screenshots.length - 1, index + 1)
            : Math.max(0, index - 1);
        const next = screenshots[nextIndex];
        if (next) {
          setActiveId(next.id);
          selectOnly(next.id);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, enabled, redo, removeIds, screenshots, selectOnly, setActiveId, undo]);
}
