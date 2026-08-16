"use client";

import { useEffect, useState } from "react";
import { CropEditor } from "@/components/editor/CropEditor";
import { applyTransform } from "@/lib/image-processing";
import type { ScreenshotItem } from "@/lib/store/types";

interface PreviewCanvasProps {
  item: ScreenshotItem | null;
  zoom: number;
  cropMode: boolean;
  onCancelCrop: () => void;
  onConfirmCrop: (crop: ScreenshotItem["crop"]) => void;
}

export function PreviewCanvas({
  item,
  zoom,
  cropMode,
  onCancelCrop,
  onConfirmCrop,
}: PreviewCanvasProps) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a screenshot to preview
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-muted">
      {cropMode ? (
        <CropEditor
          item={item}
          onCancel={onCancelCrop}
          onConfirm={(crop) => onConfirmCrop(crop)}
        />
      ) : (
        <TransformedPreview item={item} zoom={zoom} />
      )}
    </div>
  );
}

function TransformedPreview({ item, zoom }: { item: ScreenshotItem; zoom: number }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    void applyTransform(item).then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob || cancelled) return;
        url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }, "image/jpeg", 0.88);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [item]);

  if (!previewUrl) {
    return <div className="text-sm text-muted-foreground">Loading preview…</div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={previewUrl}
      alt="Selected screenshot preview"
      className="max-h-full max-w-full object-contain shadow-md transition-transform duration-200"
      style={{ transform: `scale(${zoom})` }}
    />
  );
}
