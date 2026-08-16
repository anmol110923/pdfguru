"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { PdfSettings } from "@/components/editor/PdfSettings";
import { ScreenshotGallery } from "@/components/editor/ScreenshotGallery";
import { useEditorStore } from "@/lib/store/editor-store";

export function MobileEditorLayout() {
  const settings = useEditorStore((state) => state.settings);
  const updateSettings = useEditorStore((state) => state.updateSettings);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1">
        <EditorWorkspace />
      </div>
      <div className="border-t border-border/70 bg-card">
        <ScreenshotGallery orientation="horizontal" />
        <div className="border-t border-border/70 p-3">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" className="w-full" />}>
              <SlidersHorizontal />
              PDF settings
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh]">
              <SheetHeader>
                <SheetTitle>PDF settings</SheetTitle>
              </SheetHeader>
              <PdfSettings settings={settings} onChange={updateSettings} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
