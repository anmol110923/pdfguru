"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { detectAutoCrop } from "@/lib/image-processing";
import type { CropRect, ScreenshotItem } from "@/lib/store/types";
import { toast } from "sonner";

interface CropEditorProps {
  item: ScreenshotItem;
  onCancel: () => void;
  onConfirm: (crop: CropRect) => void;
}

export function CropEditor({ item, onCancel, onConfirm }: CropEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(item.crop);
  const [detecting, setDetecting] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area) => {
    setArea(croppedArea);
  }, []);

  const confirm = () => {
    if (!area) return;
    onConfirm(area);
  };

  const autoCrop = async () => {
    setDetecting(true);
    try {
      const detected = await detectAutoCrop(item);
      if (!detected) {
        toast("Couldn't detect borders — try manual crop");
        return;
      }
      onConfirm(detected);
      toast.success("Borders removed");
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-neutral-900/95">
      <div className="relative min-h-0 flex-1">
        <Cropper
          image={item.originalUrl}
          crop={crop}
          zoom={zoom}
          rotation={item.rotation}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-neutral-950 px-3 py-2">
        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            disabled={detecting}
            onClick={() => void autoCrop()}
          >
            Auto Crop
          </Button>
          <Button onClick={confirm}>Apply crop</Button>
        </div>
      </div>
    </div>
  );
}
