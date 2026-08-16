"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPT_ATTR } from "@/lib/constants";
import { processImageFiles, rejectMessage } from "@/lib/image-processing";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadZoneProps {
  compact?: boolean;
}

export function UploadZone({ compact = false }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addScreenshots = useEditorStore((state) => state.addScreenshots);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setBusy(true);
    try {
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
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload screenshots"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        if (event.dataTransfer.files.length) {
          void handleFiles(event.dataTransfer.files);
        }
      }}
      className={cn(
        "mx-auto w-full max-w-lg cursor-pointer rounded-2xl border border-dashed bg-card px-6 py-10 text-center shadow-sm transition-all duration-200",
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40",
        compact && "max-w-none py-6"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void handleFiles(event.target.files);
        }}
      />
      <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-background">
        {busy ? (
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <ImagePlus className="size-5 text-muted-foreground" aria-hidden />
        )}
      </div>
      <p className="text-base font-semibold tracking-tight">Drop your screenshots here</p>
      <p className="mt-1 text-sm text-muted-foreground">or choose files from your device</p>
      <Button
        className="mt-5"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
      >
        Choose screenshots
      </Button>
      <p className="mt-4 text-xs tracking-wide text-muted-foreground">PNG · JPG · JPEG · WEBP</p>
      <p className="mt-2 text-xs text-muted-foreground">Your files stay on your device.</p>
    </div>
  );
}
