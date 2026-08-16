"use client";

import { useEffect } from "react";
import { processImageFiles, rejectMessage } from "@/lib/image-processing";
import { useEditorStore } from "@/lib/store/editor-store";
import { toast } from "sonner";

export function usePasteUpload(enabled: boolean) {
  const addScreenshots = useEditorStore((state) => state.addScreenshots);

  useEffect(() => {
    if (!enabled) return;

    const onPaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length === 0) return;
      event.preventDefault();
      const { accepted, rejected } = await processImageFiles(files);
      if (accepted.length) {
        addScreenshots(accepted);
        toast.success(
          accepted.length === 1 ? "Added 1 screenshot" : `Added ${accepted.length} screenshots`
        );
      }
      for (const item of rejected) {
        toast.error(rejectMessage(item.reason));
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addScreenshots, enabled]);
}
