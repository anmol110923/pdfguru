"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/editor/EmptyState";
import { ExportProgress } from "@/components/editor/ExportProgress";
import { SuccessScreen } from "@/components/editor/SuccessScreen";
import { DesktopEditorLayout } from "@/components/layout/DesktopEditorLayout";
import { MobileEditorLayout } from "@/components/layout/MobileEditorLayout";
import { Navbar } from "@/components/layout/Navbar";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { usePasteUpload } from "@/hooks/use-paste-upload";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { createDemoScreenshots } from "@/lib/demo-data";
import { generatePdf, downloadBlob } from "@/lib/pdf";
import { useEditorStore } from "@/lib/store/editor-store";
import { slugifyFilename } from "@/lib/utils";
import { toast } from "sonner";

export function EditorPage() {
  const searchParams = useSearchParams();
  const screenshots = useEditorStore((state) => state.screenshots);
  const settings = useEditorStore((state) => state.settings);
  const exportStatus = useEditorStore((state) => state.exportStatus);
  const exportProgress = useEditorStore((state) => state.exportProgress);
  const exportMessage = useEditorStore((state) => state.exportMessage);
  const pdfBlob = useEditorStore((state) => state.pdfBlob);
  const addScreenshots = useEditorStore((state) => state.addScreenshots);
  const setExportState = useEditorStore((state) => state.setExportState);
  const createAnother = useEditorStore((state) => state.createAnother);
  const startOver = useEditorStore((state) => state.startOver);
  const [demoLoaded, setDemoLoaded] = useState(false);

  const isDesktop = useIsDesktop();
  const hasPages = screenshots.length > 0;
  const exporting = exportStatus === "preparing" || exportStatus === "generating";
  const ready = exportStatus === "ready" && pdfBlob;

  usePasteUpload(!ready);
  useKeyboardShortcuts(hasPages && !ready && !exporting);

  useEffect(() => {
    if (searchParams.get("demo") !== "true" || demoLoaded || hasPages) return;
    let cancelled = false;
    void createDemoScreenshots()
      .then((items) => {
        if (cancelled) return;
        addScreenshots(items);
        setDemoLoaded(true);
        toast.success("Loaded demo screenshots");
      })
      .catch(() => {
        toast.error("Couldn't load demo screenshots.");
      });
    return () => {
      cancelled = true;
    };
  }, [addScreenshots, demoLoaded, hasPages, searchParams]);

  const exportPdf = async () => {
    if (!screenshots.length) {
      toast.error("Add at least one screenshot first.");
      return;
    }
    if (!settings.title.trim()) {
      toast.error("Add a document title before exporting.");
      return;
    }
    setExportState({
      exportStatus: "preparing",
      exportProgress: 0,
      exportMessage: `Preparing ${screenshots.length} pages...`,
      exportError: null,
    });
    try {
      const blob = await generatePdf(screenshots, settings, (progress) => {
        const percent = Math.round((progress.current / Math.max(progress.total, 1)) * 100);
        setExportState({
          exportStatus: progress.phase,
          exportProgress: percent,
          exportMessage:
            progress.phase === "preparing"
              ? `Preparing ${progress.total} pages...`
              : "Generating PDF...",
        });
      });
      setExportState({
        exportStatus: "ready",
        exportProgress: 100,
        exportMessage: "Your PDF is ready",
        pdfBlob: blob,
      });
    } catch {
      setExportState({
        exportStatus: "error",
        exportError: "Something went wrong generating your PDF. Please try again.",
        exportMessage: "",
      });
      toast.error("Something went wrong generating your PDF. Please try again.");
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Navbar
        variant="editor"
        title={settings.title}
        pageCount={screenshots.length}
        onExport={() => void exportPdf()}
        exportDisabled={!hasPages || exporting}
        exporting={exporting}
      />
      {ready && pdfBlob ? (
        <SuccessScreen
          title={settings.title}
          pageCount={screenshots.length + (settings.coverPage ? 1 : 0)}
          onDownload={() => downloadBlob(pdfBlob, slugifyFilename(settings.title))}
          onCreateAnother={createAnother}
          onStartOver={startOver}
        />
      ) : hasPages ? (
        <>
          {isDesktop ? <DesktopEditorLayout /> : <MobileEditorLayout />}
        </>
      ) : (
        <EmptyState />
      )}
      <ExportProgress status={exportStatus} message={exportMessage} progress={exportProgress} />
    </div>
  );
}
