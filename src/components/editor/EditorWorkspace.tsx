"use client";

import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { PreviewCanvas } from "@/components/editor/PreviewCanvas";
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "@/lib/constants";
import { useEditorStore } from "@/lib/store/editor-store";

export function EditorWorkspace() {
  const screenshots = useEditorStore((state) => state.screenshots);
  const activeId = useEditorStore((state) => state.activeId);
  const zoom = useEditorStore((state) => state.zoom);
  const cropMode = useEditorStore((state) => state.cropMode);
  const setZoom = useEditorStore((state) => state.setZoom);
  const setCropMode = useEditorStore((state) => state.setCropMode);
  const rotateIds = useEditorStore((state) => state.rotateIds);
  const resetTransforms = useEditorStore((state) => state.resetTransforms);
  const setCrop = useEditorStore((state) => state.setCrop);
  const item = screenshots.find((shot) => shot.id === activeId) ?? null;

  const ids = item ? [item.id] : [];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <PreviewCanvas
        item={item}
        zoom={zoom}
        cropMode={cropMode}
        onCancelCrop={() => setCropMode(false)}
        onConfirmCrop={(crop) => {
          if (item && crop) setCrop(item.id, crop);
          setCropMode(false);
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <div className="pointer-events-auto">
          <EditorToolbar
            zoom={zoom}
            cropMode={cropMode}
            disabled={!item}
            onZoomOut={() => setZoom(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
            onZoomIn={() => setZoom(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
            onFit={() => setZoom(DEFAULT_ZOOM)}
            onCrop={() => setCropMode(!cropMode)}
            onRotateLeft={() => rotateIds(ids, -1)}
            onRotateRight={() => rotateIds(ids, 1)}
            onReset={() => resetTransforms(ids)}
          />
        </div>
      </div>
    </div>
  );
}
