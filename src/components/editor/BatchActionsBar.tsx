"use client";

import { Copy, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store/editor-store";
import { toast } from "sonner";

export function BatchActionsBar() {
  const screenshots = useEditorStore((state) => state.screenshots);
  const removeIds = useEditorStore((state) => state.removeIds);
  const rotateIds = useEditorStore((state) => state.rotateIds);
  const duplicateIds = useEditorStore((state) => state.duplicateIds);
  const applyCropToIds = useEditorStore((state) => state.applyCropToIds);
  const activeId = useEditorStore((state) => state.activeId);
  const selected = screenshots.filter((item) => item.selected);
  if (selected.length < 2) return null;

  const ids = selected.map((item) => item.id);
  const active = screenshots.find((item) => item.id === activeId);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm">
      <span className="mr-auto text-muted-foreground">{selected.length} selected</span>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Rotate selected left"
        onClick={() => rotateIds(ids, -1)}
      >
        <RotateCcw />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          duplicateIds(ids);
          toast.success("Duplicated selected pages");
        }}
      >
        <Copy />
        Duplicate
      </Button>
      {active?.crop ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            applyCropToIds(ids, active.crop!);
            toast.success("Crop applied to selected pages");
          }}
        >
          Apply crop
        </Button>
      ) : null}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          removeIds(ids);
          toast("Selected pages removed");
        }}
      >
        <Trash2 />
        Delete
      </Button>
    </div>
  );
}
