"use client";

import { BatchActionsBar } from "@/components/editor/BatchActionsBar";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { PdfSettings } from "@/components/editor/PdfSettings";
import { ScreenshotGallery } from "@/components/editor/ScreenshotGallery";
import { useEditorStore } from "@/lib/store/editor-store";

export function DesktopEditorLayout() {
  const settings = useEditorStore((state) => state.settings);
  const updateSettings = useEditorStore((state) => state.updateSettings);

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border/70 bg-card">
        <ScreenshotGallery />
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="px-4 pt-3">
          <BatchActionsBar />
        </div>
        <EditorWorkspace />
      </section>
      <aside className="flex w-72 shrink-0 flex-col border-l border-border/70 bg-card">
        <PdfSettings settings={settings} onChange={updateSettings} />
      </aside>
    </div>
  );
}
