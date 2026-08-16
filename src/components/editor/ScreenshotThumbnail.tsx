"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScreenshotItem } from "@/lib/store/types";
import { cn, formatPageNumber } from "@/lib/utils";

interface ScreenshotThumbnailProps {
  item: ScreenshotItem;
  index: number;
  active: boolean;
  orientation?: "vertical" | "horizontal";
  onSelect: (event: React.MouseEvent) => void;
  onDelete: () => void;
}

export function ScreenshotThumbnail({
  item,
  index,
  active,
  orientation = "vertical",
  onSelect,
  onDelete,
}: ScreenshotThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative rounded-xl border bg-card p-1.5 shadow-sm transition-all duration-200",
        orientation === "horizontal" ? "w-24 shrink-0" : "w-full",
        active ? "border-primary ring-2 ring-primary/20" : "border-border/80 hover:border-border",
        item.selected && !active && "border-primary/50 bg-primary/5",
        isDragging && "z-20 scale-[1.02] opacity-80"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full overflow-hidden rounded-lg bg-muted"
        aria-label={`Screenshot page ${formatPageNumber(index)}${active ? ", selected" : ""}`}
        aria-current={active}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnailUrl}
          alt={`Screenshot page ${formatPageNumber(index)}`}
          className="aspect-[3/4] w-full object-cover"
          style={{ transform: `rotate(${item.rotation}deg)` }}
          draggable={false}
        />
      </button>
      <div className="mt-1.5 flex items-center justify-between gap-1">
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
          {formatPageNumber(index)}
        </span>
        <div className="flex items-center">
          <button
            type="button"
            className="rounded p-0.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5" />
          </button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Delete page ${formatPageNumber(index)}`}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </div>
  );
}
